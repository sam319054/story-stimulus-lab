from __future__ import annotations

import html
import json
import os
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime
from email.utils import parsedate_to_datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_PORT = 8000
DEFAULT_HOST = "0.0.0.0"
SUPABASE_TABLE = os.environ.get("SUPABASE_TABLE", "saved_items")


def clean_text(value: str) -> str:
    text = html.unescape(value or "")
    text = re.sub(r"<[^>]+>", " ", text)
    text = text.replace("\n", " ").replace("\r", " ").strip()
    return " ".join(text.split())


def format_date(value: str) -> str:
    if not value:
        return ""

    try:
        parsed = parsedate_to_datetime(value)
    except (TypeError, ValueError, IndexError):
        return clean_text(value)

    if parsed.tzinfo is None:
        return parsed.strftime("%Y-%m-%d %H:%M")

    return parsed.astimezone().strftime("%Y-%m-%d %H:%M")


def parse_rss(xml_text: str) -> list[dict[str, str]]:
    root = ET.fromstring(xml_text)
    items: list[dict[str, str]] = []

    for item in root.findall("./channel/item")[:6]:
        title = clean_text(item.findtext("title", default="제목 없음"))
        link = clean_text(item.findtext("link", default=""))
        source = clean_text(item.findtext("source", default=""))
        published_at = format_date(item.findtext("pubDate", default=""))
        description = clean_text(item.findtext("description", default=""))

        if not description:
            description = "요약이 없어 제목 중심으로 참고하면 좋습니다."

        items.append(
            {
                "title": title,
                "link": link,
                "source": source,
                "publishedAt": published_at,
                "summary": description,
            }
        )

    return items


def build_query_terms(query: str) -> list[str]:
    collapsed = " ".join(query.split()).strip().lower()
    if not collapsed:
        return []

    terms = [collapsed]
    terms.extend(part for part in collapsed.split(" ") if len(part) > 1)
    unique_terms: list[str] = []

    for term in terms:
        if term not in unique_terms:
            unique_terms.append(term)

    return unique_terms


def score_news_item(item: dict[str, str], query_terms: list[str]) -> int:
    haystack = " ".join(
        [
            item.get("title", ""),
            item.get("summary", ""),
            item.get("source", ""),
        ]
    ).lower()

    score = 0
    for index, term in enumerate(query_terms):
        if term in haystack:
            weight = 8 if index == 0 else 3
            score += weight
            if term in item.get("title", "").lower():
                score += weight * 2

    return score


def filter_news_items(query: str, items: list[dict[str, str]]) -> list[dict[str, str]]:
    query_terms = build_query_terms(query)
    if not query_terms:
        return items

    scored_items: list[tuple[int, dict[str, str]]] = []
    for item in items:
        score = score_news_item(item, query_terms)
        scored_items.append((score, item))

    matched_items = [item for score, item in scored_items if score > 0]
    if matched_items:
        matched_items.sort(key=lambda entry: score_news_item(entry, query_terms), reverse=True)
        return matched_items[:6]

    return items[:6]


def get_supabase_config() -> tuple[str, str]:
    base_url = os.environ.get("SUPABASE_URL", "").strip().rstrip("/")
    secret_key = os.environ.get("SUPABASE_SECRET_KEY", "").strip()
    return base_url, secret_key


def get_supabase_status() -> dict[str, str | bool]:
    base_url, secret_key = get_supabase_config()

    if not base_url or not secret_key:
        return {
            "mode": "local",
            "configured": False,
            "ready": False,
            "error": "Supabase 환경 변수가 비어 있습니다.",
        }

    parsed = urllib.parse.urlparse(base_url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return {
            "mode": "local",
            "configured": True,
            "ready": False,
            "error": "SUPABASE_URL 값이 올바른 주소가 아닙니다.",
        }

    return {
        "mode": "supabase",
        "configured": True,
        "ready": True,
        "error": "",
    }


def is_supabase_ready() -> bool:
    return bool(get_supabase_status()["ready"])


def supabase_request(method: str, path: str, payload: dict | list | None = None) -> list | dict | None:
    base_url, secret_key = get_supabase_config()

    if not is_supabase_ready():
        raise RuntimeError(str(get_supabase_status()["error"]))

    data = None
    headers = {
        "apikey": secret_key,
        "Accept": "application/json",
    }

    if payload is not None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json"
        headers["Prefer"] = "return=representation"

    request = urllib.request.Request(
        f"{base_url}{path}",
        data=data,
        headers=headers,
        method=method,
    )

    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            body = response.read().decode("utf-8", errors="replace").strip()
            if not body:
                return None
            return json.loads(body)
    except HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Supabase 요청 실패: {error.code} {detail}") from error


def list_saved_items() -> list[dict]:
    query = urllib.parse.urlencode(
        {
            "select": "id,keyword,tone,format,saved_at,saved_at_label,summary,cards,news_items",
            "order": "saved_at.desc",
            "limit": "20",
        }
    )
    response = supabase_request("GET", f"/rest/v1/{SUPABASE_TABLE}?{query}")
    return response if isinstance(response, list) else []


def create_saved_item(item: dict) -> dict:
    response = supabase_request("POST", f"/rest/v1/{SUPABASE_TABLE}", [item])
    if isinstance(response, list) and response:
        return response[0]
    return item


def delete_saved_item(saved_id: str) -> None:
    filter_query = urllib.parse.urlencode({"id": f"eq.{saved_id}"})
    supabase_request("DELETE", f"/rest/v1/{SUPABASE_TABLE}?{filter_query}")


def serialize_saved_item(row: dict) -> dict:
    return {
        "id": row.get("id", ""),
        "keyword": row.get("keyword", ""),
        "tone": row.get("tone", ""),
        "format": row.get("format", ""),
        "savedAt": row.get("saved_at", ""),
        "savedAtLabel": row.get("saved_at_label", ""),
        "summary": row.get("summary", ""),
        "cards": row.get("cards", []),
        "newsItems": row.get("news_items", []),
    }


def fetch_google_news(query: str) -> list[dict[str, str]]:
    encoded_query = urllib.parse.quote(query)
    feed_url = (
        "https://news.google.com/rss/search"
        f"?q={encoded_query}&hl=ko&gl=KR&ceid=KR:ko"
    )

    request = urllib.request.Request(
        feed_url,
        headers={
            "User-Agent": "Mozilla/5.0 StoryStimulusLab/1.0",
            "Accept": "application/rss+xml, application/xml, text/xml",
        },
    )

    with urllib.request.urlopen(request, timeout=12) as response:
        xml_text = response.read().decode("utf-8", errors="replace")

    return filter_news_items(query, parse_rss(xml_text))


class AppHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def do_GET(self) -> None:
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == "/api/health":
            self.send_json({"ok": True})
            return

        if parsed.path == "/api/storage-status":
            self.send_json(get_supabase_status())
            return

        if parsed.path == "/api/news":
            self.handle_news(parsed.query)
            return

        if parsed.path == "/api/saved":
            self.handle_saved_list()
            return

        super().do_GET()

    def do_POST(self) -> None:
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == "/api/saved":
            self.handle_saved_create()
            return

        self.send_json({"error": "지원하지 않는 요청입니다."}, status=404)

    def do_DELETE(self) -> None:
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == "/api/saved":
            self.handle_saved_delete(parsed.query)
            return

        self.send_json({"error": "지원하지 않는 요청입니다."}, status=404)

    def handle_news(self, query_string: str) -> None:
        params = urllib.parse.parse_qs(query_string)
        query = params.get("q", [""])[0].strip()

        if not query:
            self.send_json({"items": [], "error": "검색어가 비어 있습니다."}, status=400)
            return

        try:
            items = fetch_google_news(query)
            payload = {
                "query": query,
                "count": len(items),
                "fetchedAt": datetime.now().astimezone().isoformat(),
                "items": items,
            }
            self.send_json(payload)
        except Exception as error:  # noqa: BLE001
            self.send_json(
                {
                    "items": [],
                    "error": f"뉴스를 가져오는 중 문제가 생겼습니다: {error}",
                },
                status=502,
            )

    def handle_saved_list(self) -> None:
        if not is_supabase_ready():
            self.send_json(
                {
                    "items": [],
                    "error": str(get_supabase_status()["error"]),
                },
                status=503,
            )
            return

        try:
            items = [serialize_saved_item(item) for item in list_saved_items()]
            self.send_json({"items": items})
        except Exception as error:  # noqa: BLE001
            self.send_json({"items": [], "error": str(error)}, status=502)

    def handle_saved_create(self) -> None:
        if not is_supabase_ready():
            self.send_json(
                {
                    "error": str(get_supabase_status()["error"]),
                },
                status=503,
            )
            return

        try:
            payload = self.read_json_body()
            saved_item = {
                "id": clean_text(payload.get("id", "")),
                "keyword": clean_text(payload.get("keyword", "")),
                "tone": clean_text(payload.get("tone", "")),
                "format": clean_text(payload.get("format", "")),
                "saved_at": clean_text(payload.get("savedAt", "")),
                "saved_at_label": clean_text(payload.get("savedAtLabel", "")),
                "summary": clean_text(payload.get("summary", "")),
                "cards": payload.get("cards", []),
                "news_items": payload.get("newsItems", []),
            }

            if not saved_item["id"] or not saved_item["keyword"]:
                self.send_json({"error": "저장할 데이터가 올바르지 않습니다."}, status=400)
                return

            created = serialize_saved_item(create_saved_item(saved_item))
            self.send_json({"item": created}, status=201)
        except Exception as error:  # noqa: BLE001
            self.send_json({"error": str(error)}, status=502)

    def handle_saved_delete(self, query_string: str) -> None:
        if not is_supabase_ready():
            self.send_json(
                {
                    "error": str(get_supabase_status()["error"]),
                },
                status=503,
            )
            return

        params = urllib.parse.parse_qs(query_string)
        saved_id = params.get("id", [""])[0].strip()

        if not saved_id:
            self.send_json({"error": "삭제할 id가 없습니다."}, status=400)
            return

        try:
            delete_saved_item(saved_id)
            self.send_json({"ok": True})
        except Exception as error:  # noqa: BLE001
            self.send_json({"error": str(error)}, status=502)

    def read_json_body(self) -> dict:
        content_length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(content_length).decode("utf-8", errors="replace")
        return json.loads(raw_body) if raw_body else {}

    def send_json(self, payload: dict, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main() -> None:
    host = os.environ.get("HOST", DEFAULT_HOST)
    port = int(os.environ.get("PORT", str(DEFAULT_PORT)))
    server = ThreadingHTTPServer((host, port), AppHandler)
    print("")
    print("Story Stimulus Lab 서버가 실행되었습니다.")
    print(f"브라우저에서 http://{host}:{port} 를 열어주세요.")
    print("종료하려면 이 창에서 Control + C 를 누르세요.")
    print("")
    server.serve_forever()


if __name__ == "__main__":
    main()
