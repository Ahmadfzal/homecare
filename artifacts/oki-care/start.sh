#!/bin/bash
cd /home/runner/workspace/artifacts/oki-care
echo "Installing npm dependencies..."
npm install --legacy-peer-deps
echo "Starting Oki HomeCare server..."
npm run dev
