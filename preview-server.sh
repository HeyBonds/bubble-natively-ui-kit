#!/bin/bash

# Preview Server for Bubble Components
# Starts a local HTTP server and opens the preview in your browser

PORT=8000
PREVIEW_URL="http://localhost:$PORT/preview/index.html"

echo "🚀 Starting preview server on port $PORT..."
echo "📱 Preview URL: $PREVIEW_URL"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Open browser after a short delay
(sleep 2 && open "$PREVIEW_URL") &

# Start Python HTTP server
python3 -m http.server $PORT
