#!/bin/zsh
cd "/Users/sloth/Documents/New project/information_brainstorming" || exit 1
PYTHONPYCACHEPREFIX=/tmp/pythoncache python3 server.py &
SERVER_PID=$!
sleep 2
open "http://127.0.0.1:8000"
wait "$SERVER_PID"
