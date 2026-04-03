#!/bin/bash
# SWACHH-AI Edge AI setup script for Raspberry Pi

echo "🚀 Starting SWACHH-AI Edge AI Setup for Raspberry Pi..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# Install necessary system dependencies for OpenCV and TFLite
echo "🛠️ Installing dependencies (libcamera, libatlas, python3-venv)..."
sudo apt-get install -y python3-venv python3-pip libatlas-base-dev libcamera-dev libcap-dev v4l-utils

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
else
    echo "🐍 Virtual environment already exists."
fi

# Activate venv and install python packages
echo "📥 Installing Python requirements..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install tflite-runtime

echo "✅ Setup complete! You can now run the edge AI using:"
echo "   cd /home/pi/swachh-ai/edge_ai"
echo "   source venv/bin/activate"
echo "   python main.py"
