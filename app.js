const keywordInput = document.querySelector("#keywordInput");
const toneSelect = document.querySelector("#toneSelect");
const formatSelect = document.querySelector("#formatSelect");
const generateButton = document.querySelector("#generateButton");
const saveCurrentButton = document.querySelector("#saveCurrentButton");
const saveStatus = document.querySelector("#saveStatus");
const savedLibrary = document.querySelector("#savedLibrary");
const results = document.querySelector("#results");
const cardTemplate = document.querySelector("#cardTemplate");
const tagButtons = document.querySelectorAll(".tag-button");
const STORAGE_KEY = "story-stimulus-saved-items";

let latestResultState = null;
let storageMode = "local";

const issuePatterns = [
  {
    match: ["딥페이크", "ai", "인공지능", "가짜영상", "합성"],
    phenomenon: [
      "기술이 진실보다 더 빠르게 퍼질 때, 개인은 자기 얼굴의 소유권을 잃는다.",
      "플랫폼이 사실 검증보다 확산 속도를 우선할 때 피해 회복은 늘 뒤늦다.",
    ],
    incidents: [
      "피해자가 증명 책임까지 떠안는 구조",
      "가해보다 구경꾼의 확산 참여가 더 큰 상처를 남기는 상황",
    ],
    interviewAngles: [
      "디지털 성범죄 피해자 지원 단체",
      "콘텐츠 검수 담당자 혹은 플랫폼 정책 담당자",
      "기술 윤리 연구자와 청소년 보호 현장",
    ],
    philosophy: [
      "나는 내 얼굴과 목소리를 어디까지 소유하는가?",
      "진실은 사실 자체인가, 아니면 사회가 믿는 합의인가?",
    ],
    paradoxes: ["증거가 넘칠수록 오히려 진실을 믿지 않게 되는 역설"],
    motifs: ["복제된 얼굴", "삭제되지 않는 흔적", "의심이 일상이 된 공동체"],
  },
  {
    match: ["고독사", "은둔", "외로움", "독거", "1인가구"],
    phenomenon: [
      "연결 수단은 많아졌지만 돌봄은 제도 밖으로 밀려난다.",
      "도시 안에서 누군가의 부재가 가장 늦게 발견되는 시대다.",
    ],
    incidents: [
      "사후에야 관계가 역추적되는 삶",
      "복지 행정의 기준에는 걸리지 않지만 실제로는 무너져 있는 사람들",
    ],
    interviewAngles: [
      "유품 정리사 혹은 사회복지 현장 실무자",
      "장기간 고립 경험 당사자",
      "이웃 관계 회복을 시도하는 지역 커뮤니티 운영자",
    ],
    philosophy: [
      "존재는 타인에게 발견될 때 비로소 사회 안에 남는가?",
      "존엄은 생전의 선택인가, 사후의 대우인가?",
    ],
    paradoxes: ["사생활 보호를 존중할수록 구조 신호를 놓칠 수 있다는 역설"],
    motifs: ["닫힌 문", "쌓이는 택배", "늦게 도착한 안부"],
  },
  {
    match: ["입시", "교육", "수능", "학원", "경쟁"],
    phenomenon: [
      "능력주의가 공정을 약속하지만 출발선의 차이를 지운다.",
      "미래를 위한 준비가 현재의 삶을 잠식하는 구조가 반복된다.",
    ],
    incidents: [
      "가족 전체가 한 사람의 시험을 중심으로 재편되는 생활",
      "성적이 관계와 존엄의 척도로 오해되는 순간",
    ],
    interviewAngles: [
      "N수생 혹은 재수학원 생활 경험자",
      "입시 코디네이터나 학교 상담 교사",
      "지방과 수도권 교육 격차를 겪는 학생과 학부모",
    ],
    philosophy: [
      "경쟁은 성장의 장치인가, 인간을 줄 세우는 서사인가?",
      "꿈은 스스로 선택한 것인가, 주입된 희망인가?",
    ],
    paradoxes: ["모두가 공정을 원하지만 더 많은 사교육이 선택되는 역설"],
    motifs: ["새벽 첫차", "성적표", "불 꺼지지 않는 독서실"],
  },
  {
    match: ["배달", "플랫폼노동", "라이더", "노동", "긱"],
    phenomenon: [
      "편리함의 비용이 보이지 않는 위험 노동으로 전가된다.",
      "알고리즘은 중립적으로 보이지만 인간을 더 교체 가능한 존재로 만든다.",
    ],
    incidents: [
      "고객의 별점 하나가 생계 전체를 흔드는 구조",
      "사고 위험이 개인 책임으로만 처리되는 플랫폼 노동 현실",
    ],
    interviewAngles: [
      "라이더 혹은 대리기사",
      "플랫폼 운영 구조를 연구하는 노동 연구자",
      "편리함을 소비하는 고객의 자기 합리화",
    ],
    philosophy: [
      "자유 계약은 정말 자유로운가?",
      "효율이 인간의 안전보다 앞설 때 사회는 무엇을 잃는가?",
    ],
    paradoxes: ["더 빠른 서비스를 원할수록 더 많은 사람이 위험해지는 역설"],
    motifs: ["비 오는 도로", "알림음", "멈추지 못하는 이동"],
  },
  {
    match: ["지역소멸", "지방", "청년유출", "인구감소"],
    phenomenon: [
      "한 지역이 사라진다는 건 지도가 아니라 기억과 언어가 지워지는 일이다.",
      "기회가 수도권에 집중될수록 떠나는 선택은 더 개인 책임처럼 보인다.",
    ],
    incidents: [
      "학교와 병원과 가게가 순서대로 사라지는 마을",
      "남아 있는 사람과 떠난 사람 사이의 죄책감과 분노",
    ],
    interviewAngles: [
      "귀향 청년 혹은 지방 소도시 자영업자",
      "지방 행정 담당자와 지역 재생 기획자",
      "폐교, 폐역, 빈집을 기억하는 노년층",
    ],
    philosophy: [
      "떠나는 자유와 남겨지는 책임 중 무엇이 더 무거운가?",
      "공동체는 사람 수로 유지되는가, 기억으로 유지되는가?",
    ],
    paradoxes: ["살리려는 정책이 오히려 지역의 고유성을 관광 상품으로 소비하는 역설"],
    motifs: ["폐역", "빈집", "축제만 남은 거리"],
  },
  {
    match: ["돌봄", "간병", "요양", "부양", "보호자"],
    phenomenon: [
      "돌봄은 필수 노동이지만 늘 개인의 사랑과 희생으로 위장된다.",
      "누군가를 살리는 시간이 돌보는 사람의 삶을 갉아먹는 구조가 존재한다.",
    ],
    incidents: [
      "가족이 보호자이자 노동자이자 죄책감의 수용자가 되는 상황",
      "감정적 헌신이 제도 공백을 메우는 현실",
    ],
    interviewAngles: [
      "가족 간병 경험자",
      "요양보호사 혹은 돌봄 정책 연구자",
      "돌봄 휴직 제도의 사각지대를 겪는 직장인",
    ],
    philosophy: [
      "사랑은 어디까지 의무가 될 수 있는가?",
      "돌봄은 사적인 미덕인가, 사회가 나눠야 할 책임인가?",
    ],
    paradoxes: ["가장 중요한 노동일수록 가장 쉽게 당연시되는 역설"],
    motifs: ["병실 의자", "깊은 밤 호출벨", "쉼 없는 루틴"],
  },
];

const toneDescriptors = {
  balanced: "현실의 복잡성을 유지하면서 인간적인 균형감을 살리는 방향",
  dark: "붕괴와 상실, 제도적 폭력을 더 날카롭게 드러내는 방향",
  hopeful: "상처를 외면하지 않되 연대와 회복 가능성을 끝까지 탐색하는 방향",
  satirical: "사회 시스템의 모순을 건조하고 날카롭게 비트는 방향",
  thriller: "위험과 추적, 비밀과 폭로의 리듬을 강화하는 방향",
};

const formatDescriptors = {
  feature: "장편영화 구조에 어울리게 중심 갈등과 감정선의 압축도가 중요합니다.",
  series: "시리즈 구조에 맞게 여러 인물과 제도 층위를 병렬적으로 확장할 수 있습니다.",
  short: "단편영화라면 하나의 상징적 상황과 강한 정서적 전환을 노리는 편이 좋습니다.",
  play: "연극/실험극이라면 공간의 제한을 활용해 대사와 관계 긴장을 밀도 있게 세울 수 있습니다.",
};

function findPattern(keyword) {
  const normalized = keyword.toLowerCase();

  for (const pattern of issuePatterns) {
    if (pattern.match.some((entry) => normalized.includes(entry.toLowerCase()))) {
      return pattern;
    }
  }

  return {
    phenomenon: [
      `${keyword}은(는) 개인의 문제가 아니라 구조적 환경과 감정의 충돌 속에서 읽을 수 있습니다.`,
      `${keyword}을(를) 둘러싼 담론은 늘 누가 말할 권리를 갖는지의 문제와 연결됩니다.`,
    ],
    incidents: [
      `${keyword}이(가) 일상으로 침투했을 때 가장 먼저 무너지는 관계는 무엇인지 탐색`,
      `${keyword}을(를) 해결하려는 제도가 오히려 새로운 소외를 만드는 상황`,
    ],
    interviewAngles: [
      `${keyword}의 현장 당사자`,
      `${keyword}를 연구하거나 기록하는 전문가`,
      `${keyword}을(를) 소비하거나 방관하는 주변인`,
    ],
    philosophy: [
      `${keyword} 앞에서 개인의 자유와 공동체의 책임은 어떻게 다시 나뉘는가?`,
      `${keyword}은(는) 진보의 결과인가, 실패의 징후인가?`,
    ],
    paradoxes: [`${keyword}을(를) 해결하려는 행동이 또 다른 문제를 낳는 역설`],
    motifs: [`${keyword}과 연결된 상징적 공간`, "침묵", "반복되는 일상적 제스처"],
  };
}

function buildExamples(keyword, pattern) {
  return [
    `${keyword} 관련 탐사 기사: 제도와 현실의 간극을 드러내는 사건 사례를 수집`,
    `${keyword} 당사자 인터뷰: 감정 언어와 생존 방식, 침묵의 이유를 기록`,
    `${keyword} 철학 메모: ${pattern.philosophy[0]}`,
    `${keyword} 역설 메모: ${pattern.paradoxes[0]}`,
  ];
}

function buildStorySeeds(keyword, pattern, tone, format) {
  return [
    `${keyword}의 피해자이지만 동시에 체제를 유지하는 가담자이기도 한 인물`,
    `${keyword}을(를) 막아야 하는 직업을 가졌지만 사적으로는 그 시스템에 의존하는 인물`,
    `${keyword} 때문에 멀어진 두 사람이 뜻밖의 사건으로 다시 묶이는 구조`,
    `${keyword}을(를) 둘러싼 진실이 공개될수록 모두가 조금씩 불편해지는 이야기`,
  ].map((seed) => `${seed} (${toneDescriptors[tone]} / ${formatDescriptors[format]})`);
}

function buildLogline(keyword, pattern, tone, format) {
  const toneFlavor = {
    balanced: "감정과 구조를 함께 바라보는",
    dark: "비극적 진실을 파고드는",
    hopeful: "회복 가능성을 끝까지 붙드는",
    satirical: "모순을 서늘하게 비트는",
    thriller: "숨겨진 위험을 추적하는",
  };

  const formatFlavor = {
    feature: "장편 서사",
    series: "시리즈 서사",
    short: "단편 서사",
    play: "밀실형 극 서사",
  };

  return `${keyword}을(를) 둘러싼 사회적 균열 속에서, 한 인물이 ${pattern.philosophy[0].replace(
    "?",
    ""
  )}라는 질문과 정면으로 부딪히는 ${toneFlavor[tone]} ${formatFlavor[format]}.`;
}

function buildDebateQuestions(keyword, pattern) {
  return [
    `이 이야기는 ${keyword}의 피해를 보여줄 것인가, 아니면 시스템의 공모 구조를 드러낼 것인가?`,
    `주인공은 ${keyword}을(를) 극복하는 사람이어야 할까, 아니면 그 안에서 타협하는 사람이어야 할까?`,
    `${keyword}을(를) 뉴스가 아니라 드라마로 바꾸려면 가장 개인적인 감정은 무엇이어야 할까?`,
    `${pattern.philosophy[1]}`,
  ];
}

function buildCards(keyword, tone, format) {
  const pattern = findPattern(keyword);
  const examples = buildExamples(keyword, pattern);
  const storySeeds = buildStorySeeds(keyword, pattern, tone, format);
  const logline = buildLogline(keyword, pattern, tone, format);
  const debateQuestions = buildDebateQuestions(keyword, pattern);

  return [
    {
      kicker: "Keyword Lens",
      title: `"${keyword}"을 바라보는 현재적 관점`,
      body: toList(pattern.phenomenon),
      span: "feature",
    },
    {
      kicker: "News Hooks",
      title: "기사와 사건으로 확장해볼 지점",
      body: toList(pattern.incidents),
    },
    {
      kicker: "Interview Angles",
      title: "인터뷰하면 좋은 목소리들",
      body: toList(pattern.interviewAngles),
    },
    {
      kicker: "Philosophy",
      title: "주제를 깊게 만드는 질문과 역설",
      body: toList([...pattern.philosophy, ...pattern.paradoxes]),
    },
    {
      kicker: "Source Board",
      title: "자료 조사 보드 초안",
      body: toList(examples),
    },
    {
      kicker: "Story Seeds",
      title: "이야기 주제가 될 만한 출발점",
      body: toList(storySeeds),
      span: "feature",
    },
    {
      kicker: "Logline",
      title: "지금 바로 써볼 수 있는 한 줄 주제",
      body: `<p>${logline}</p><p>${formatDescriptors[format]}</p>`,
      span: "feature",
    },
    {
      kicker: "Brainstorm",
      title: "같이 파고들면 좋은 질문들",
      body: toList(debateQuestions),
      span: "full",
    },
  ];
}

function toList(items) {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function getSavedItems() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function setSavedItems(items) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

async function detectStorageMode() {
  try {
    const response = await fetch("/api/storage-status");
    if (!response.ok) {
      return "local";
    }

    const payload = await response.json();
    return payload.mode === "supabase" ? "supabase" : "local";
  } catch (error) {
    return "local";
  }
}

async function fetchRemoteSavedItems() {
  const response = await fetch("/api/saved");

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "온라인 보관함을 불러오지 못했습니다.");
  }

  const payload = await response.json();
  return payload.items || [];
}

async function createRemoteSavedItem(item) {
  const response = await fetch("/api/saved", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "온라인 저장에 실패했습니다.");
  }

  const payload = await response.json();
  return payload.item;
}

async function deleteRemoteSavedItem(savedId) {
  const response = await fetch(`/api/saved?id=${encodeURIComponent(savedId)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "온라인 삭제에 실패했습니다.");
  }
}

function summarizeSavedItem(item) {
  const philosophy = item.cards.find((card) => card.kicker === "Philosophy");
  if (!philosophy) {
    return `${item.keyword} 관련 자료를 저장한 기록입니다.`;
  }

  const text = philosophy.body
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.slice(0, 100) + (text.length > 100 ? "..." : "");
}

async function renderSavedLibrary() {
  let items = [];

  if (storageMode === "supabase") {
    try {
      items = await fetchRemoteSavedItems();
    } catch (error) {
      savedLibrary.innerHTML = `
        <div class="empty-library">
          온라인 보관함을 불러오지 못했습니다. ${escapeHtml(error.message || "")}
        </div>
      `;
      return;
    }
  } else {
    items = getSavedItems();
  }

  if (!items.length) {
    savedLibrary.innerHTML = `
      <div class="empty-library">
        ${
          storageMode === "supabase"
            ? '아직 온라인 보관함에 저장된 자료가 없습니다. 마음에 드는 결과를 찾으면 "지금 결과 저장하기"를 눌러보세요.'
            : '아직 저장된 자료가 없습니다. 지금은 이 브라우저 안에만 저장됩니다.'
        }
      </div>
    `;
    return;
  }

  savedLibrary.innerHTML = items
    .map(
      (item) => `
        <article class="saved-item" data-saved-id="${item.id}">
          <h3>${escapeHtml(item.keyword)}</h3>
          <p class="saved-meta">${escapeHtml(item.savedAtLabel)} · 뉴스 ${item.newsItems.length}개 저장</p>
          <p>${escapeHtml(summarizeSavedItem(item))}</p>
          <div class="saved-actions">
            <button class="mini-button" data-action="open" data-saved-id="${item.id}">다시 열기</button>
            <button class="mini-button" data-action="delete" data-saved-id="${item.id}">삭제</button>
          </div>
        </article>
      `
    )
    .join("");
}

function buildSavedSnapshot(keyword, cards, newsItems) {
  const now = new Date();
  const randomId = Math.random().toString(36).slice(2, 8);
  const snapshot = {
    id: `${Date.now()}-${randomId}`,
    keyword,
    tone: toneSelect.value,
    format: formatSelect.value,
    savedAt: now.toISOString(),
    savedAtLabel: now.toLocaleString("ko-KR"),
    cards,
    newsItems,
  };

  snapshot.summary = summarizeSavedItem(snapshot);
  return snapshot;
}

function updateSaveStatus(message) {
  saveStatus.textContent = message;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildNewsCard(state) {
  if (state.status === "loading") {
    return {
      kicker: "Live News",
      title: "실제 뉴스를 불러오는 중",
      body: "<p>잠시만 기다리면 현재 키워드와 관련된 뉴스 제목들을 가져옵니다.</p>",
      span: "full",
    };
  }

  if (state.status === "error") {
    return {
      kicker: "Live News",
      title: "뉴스를 가져오지 못했습니다",
      body: `<p>${escapeHtml(state.message)}</p><p>인터넷 연결이나 서버 실행 상태를 확인한 뒤 다시 시도해보세요.</p>`,
      span: "full",
    };
  }

  if (!state.items.length) {
    return {
      kicker: "Live News",
      title: "지금 찾은 뉴스가 없습니다",
      body: "<p>키워드를 조금 더 넓게 바꾸거나 비슷한 표현으로 다시 검색해보세요.</p>",
      span: "full",
    };
  }

  const itemsMarkup = state.items
    .map((item) => {
      const publishedLabel = item.publishedAt ? `${escapeHtml(item.publishedAt)} 발행` : "발행일 정보 없음";
      const sourceLabel = item.source ? escapeHtml(item.source) : "출처 정보 없음";

      return `
        <article class="news-item">
          <h3><a class="news-link" href="${escapeHtml(item.link)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a></h3>
          <p class="news-meta">${sourceLabel} · ${publishedLabel}</p>
          <p>${escapeHtml(item.summary)}</p>
        </article>
      `;
    })
    .join("");

  return {
    kicker: "Live News",
    title: "실제 뉴스에서 가져온 참고 기사",
    body: `<div class="news-list">${itemsMarkup}</div>`,
    span: "full",
  };
}

function buildCardsForDisplay(savedState) {
  return [buildNewsCard({ status: "ready", items: savedState.newsItems }), ...savedState.cards];
}

function renderCards(cards) {
  results.innerHTML = "";

  cards.forEach((card, index) => {
    const fragment = cardTemplate.content.cloneNode(true);
    const article = fragment.querySelector(".card");
    const kicker = fragment.querySelector(".card-kicker");
    const title = fragment.querySelector(".card-title");
    const body = fragment.querySelector(".card-body");

    kicker.textContent = card.kicker;
    title.textContent = card.title;
    body.innerHTML = card.body;

    if (card.span) {
      article.classList.add(card.span);
    }

    article.style.animationDelay = `${index * 60}ms`;
    results.appendChild(fragment);
  });
}

async function fetchNews(keyword) {
  const response = await fetch(`/api/news?q=${encodeURIComponent(keyword)}`);

  if (!response.ok) {
    throw new Error("뉴스 서버가 응답하지 않았습니다.");
  }

  return response.json();
}

async function generateIdeas() {
  const keyword = keywordInput.value.trim();

  if (!keyword) {
    renderCards([
      {
        kicker: "Start Here",
        title: "먼저 키워드를 넣어주세요",
        body: "<p>예: 딥페이크, 고독사, 지역소멸, 입시 경쟁, 돌봄 노동</p>",
        span: "full",
      },
    ]);
    return;
  }

  const baseCards = buildCards(keyword, toneSelect.value, formatSelect.value);
  renderCards([buildNewsCard({ status: "loading", items: [] }), ...baseCards]);
  latestResultState = {
    keyword,
    tone: toneSelect.value,
    format: formatSelect.value,
    cards: baseCards,
    newsItems: [],
  };

  try {
    const newsData = await fetchNews(keyword);
    latestResultState = {
      keyword,
      tone: toneSelect.value,
      format: formatSelect.value,
      cards: baseCards,
      newsItems: newsData.items || [],
    };

    renderCards([
      buildNewsCard({
        status: "ready",
        items: newsData.items || [],
      }),
      ...baseCards,
    ]);
  } catch (error) {
    latestResultState = {
      keyword,
      tone: toneSelect.value,
      format: formatSelect.value,
      cards: baseCards,
      newsItems: [],
    };

    renderCards([
      buildNewsCard({
        status: "error",
        items: [],
        message: error.message || "알 수 없는 오류가 발생했습니다.",
      }),
      ...baseCards,
    ]);
  }
}

async function saveCurrentResult() {
  if (!latestResultState) {
    updateSaveStatus("먼저 키워드를 검색해서 저장할 결과를 만들어주세요.");
    return;
  }

  const snapshot = buildSavedSnapshot(
    latestResultState.keyword,
    latestResultState.cards,
    latestResultState.newsItems
  );

  if (storageMode === "supabase") {
    try {
      await createRemoteSavedItem(snapshot);
      await renderSavedLibrary();
      updateSaveStatus(`"${latestResultState.keyword}" 자료를 온라인 보관함에 저장했습니다.`);
    } catch (error) {
      updateSaveStatus(error.message || "온라인 저장에 실패했습니다.");
    }
    return;
  }

  const items = getSavedItems();
  items.unshift(snapshot);
  setSavedItems(items.slice(0, 20));
  await renderSavedLibrary();
  updateSaveStatus(`"${latestResultState.keyword}" 자료를 이 브라우저 보관함에 저장했습니다.`);
}

async function openSavedItem(savedId) {
  const sourceItems = storageMode === "supabase" ? await fetchRemoteSavedItems() : getSavedItems();
  const item = sourceItems.find((entry) => entry.id === savedId);

  if (!item) {
    updateSaveStatus("저장된 자료를 찾지 못했습니다.");
    return;
  }

  keywordInput.value = item.keyword;
  toneSelect.value = item.tone;
  formatSelect.value = item.format;
  latestResultState = {
    keyword: item.keyword,
    tone: item.tone,
    format: item.format,
    cards: item.cards,
    newsItems: item.newsItems,
  };
  renderCards(buildCardsForDisplay(item));
  updateSaveStatus(`"${item.keyword}" 저장본을 다시 열었습니다.`);
  window.scrollTo({ top: savedLibrary.offsetTop, behavior: "smooth" });
}

async function deleteSavedItem(savedId) {
  if (storageMode === "supabase") {
    try {
      await deleteRemoteSavedItem(savedId);
      await renderSavedLibrary();
      updateSaveStatus("온라인 보관함에서 삭제했습니다.");
    } catch (error) {
      updateSaveStatus(error.message || "삭제에 실패했습니다.");
    }
    return;
  }

  const items = getSavedItems();
  const nextItems = items.filter((entry) => entry.id !== savedId);
  setSavedItems(nextItems);
  await renderSavedLibrary();
  updateSaveStatus("선택한 저장 자료를 삭제했습니다.");
}

generateButton.addEventListener("click", generateIdeas);
saveCurrentButton.addEventListener("click", saveCurrentResult);

keywordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    generateIdeas();
  }
});

tagButtons.forEach((button) => {
  button.addEventListener("click", () => {
    keywordInput.value = button.dataset.keyword;
    generateIdeas();
  });
});

savedLibrary.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const { action, savedId } = button.dataset;

  if (action === "open") {
    openSavedItem(savedId);
  }

  if (action === "delete") {
    deleteSavedItem(savedId);
  }
});

async function initializeApp() {
  storageMode = await detectStorageMode();

  if (storageMode === "supabase") {
    updateSaveStatus("온라인 보관함이 연결되었습니다. 어떤 기기에서든 같은 URL로 같은 저장함을 볼 수 있습니다.");
  } else {
    updateSaveStatus("Supabase 연결 전이라 지금은 이 브라우저 안에만 저장됩니다.");
  }

  keywordInput.value = "딥페이크";
  await renderSavedLibrary();
  await generateIdeas();
}

initializeApp();
