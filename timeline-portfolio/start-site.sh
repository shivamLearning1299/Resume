#!/bin/bash
cd "$(dirname "$0")"
PORT=8138
lsof -ti:$PORT >/dev/null 2>&1 && { open http://127.0.0.1:$PORT/index.html; exit 0; }
nohup python3 -m http.server $PORT --bind 0.0.0.0 >/tmp/pf-server.log 2>&1 &
sleep 1
open http://127.0.0.1:$PORT/index.html
