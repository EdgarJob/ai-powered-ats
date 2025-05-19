#!/bin/bash

# Port to check
PORT=5173

echo "Checking if any process is using port $PORT..."

# Find process using the port and get its PID
PID=$(lsof -i :$PORT -t)

if [ -n "$PID" ]; then
  echo "Process $PID is using port $PORT. Killing it..."
  kill -9 $PID
  echo "Port $PORT is now available for use."
else
  echo "No process is using port $PORT."
  echo "Port $PORT is now available for use."
fi 