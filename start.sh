#!/bin/bash
# Start the todo app (both backend and frontend)
echo "Starting THE DAILY TASK..."

# Start backend
cd backend
if command -v uv &>/dev/null; then
  uv run uvicorn main:app --reload --port 8000 &
else
  python3 -m uvicorn main:app --reload --port 8000 &
fi
BACKEND_PID=$!
cd ..

# Start frontend
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✓ Backend: http://localhost:8000"
echo "✓ Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait and cleanup
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
