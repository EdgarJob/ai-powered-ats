#!/bin/bash

echo "Starting Firebase emulators..."

# Check if firebase-tools is installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI not found. Installing firebase-tools globally..."
    npm install -g firebase-tools
fi

# Start the emulators
firebase emulators:start --only auth,firestore,storage --project demo-ai-powered-ats 