#!/bin/bash
cd "$(dirname "$0")/backend"
echo "🚀 AlltagsHilfe App startet..."
echo "   API:      http://localhost:8000"
echo "   Frontend: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo "   Admin:    admin@alltagshilfe.de / Admin2025!"
echo ""
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
