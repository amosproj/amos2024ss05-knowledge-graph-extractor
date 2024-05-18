# 🎉 Ollama and Mistral Model Locally

Get up and running with large language models (LLM) effortlessly!

## 🚀 Quick Start Guide

### 🖥️ macOS

[Download Ollama for macOS](https://ollama.com/download/mac)

### 🖥️ Windows

[Download Ollama for Windows](https://ollama.com/download/windows)

### 🐧 Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 🛠️ Run Ollama Locally

Check the Ollama version:

```bash
ollama -v
```

### 📦 Extract and Run Mistral

Pull the Mistral model:

```bash
ollama pull mistral
```

Run the Mistral model:

```bash
ollama run mistral
```

### 🌐 Run on a Server

To run Ollama in server mode:

```bash
ollama serve &
```

---

## 🐋 Docker Image for Mistral

### 📄 Dockerfile

```dockerfile
# Use Ubuntu image for Mistral
FROM ubuntu:latest

# Update apt to satisfy dependencies
RUN apt-get update

# Add pip and python to take prompt as an input
RUN apt-get install -y curl python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Install Ollama in the Docker image to run Mistral model
RUN curl -fsSL https://ollama.com/install.sh | sh

# Set working directory and copy necessary files from the current folder to Docker container
WORKDIR /root
COPY . /root
```
### 📄 Run ollama in the docker Image

```dockerfile
# Start Ollama serve and pull Mistral model
RUN ollama serve &
RUN ollama pull mistral  # To pull the model from Ollama

# To run Mistral model in the container
CMD ["ollama", "run", "mistral"]
```
### 📝 Alternative way to run ollama using python script in docker Image

```dockerfile
CMD ["python3", "python_script.py"]
```

### 📝 Python Script to Run Mistral

```python
import os
import subprocess
import time

def run_command(command):
    process = subprocess.Popen(command, shell=True)
    process.wait()

# Start the Ollama server
run_command("ollama serve &")
time.sleep(10)
input("Press enter to start serve...")

# Check if the model exists
if not os.path.isdir("/root/.ollama/models/blob"):
    run_command("ollama pull mistral")

# Run the model
run_command("ollama run mistral")
```

---

## 🛠️ Docker Operations

### 🏗️ Build Docker Image

```bash
docker build -t mistral .
```

### 📂 Volume Mounting to Store Data Locally

```bash
docker run -it -v local/path/to/folder/:/root/.ollama mistral
```

### 🌐 Volume Mounting and Port Mapping

```bash
docker run -it -p 11434:11434 -v ./knowledge-graph-extractor/Project/backend/config/llm/root:/root/.ollama mistral
```

### 🐚 Run Image in Docker Container Bash

```bash
docker run -it mistral bash
```

---

## 🛠️ Docker Container Operations

### 🏗️ Build Docker Container with Port Mapping and Volume Mounting

```bash
docker run -it -p 11434:11434 -v /home/yash/knowledge-graph-extractor/Project/backend/config/llm/root:/root/.ollama mistral
```

### 🐚 Run Docker Container Bash

```bash
docker exec -it <container_name> bash
```

---

## 🛠️ Additional Docker Container Operations

### 🔍 Identify the Parent Process ID (PPID)

```bash
pstree -p | grep [your_process_name]
```

### 💀 Kill Any PID Running in Parent Process

```bash
sudo kill -9 [parent_PID]
```

### 💀 Kill All PIDs at a Time

```bash
sudo pkill [container_name]
```

### 🐞 Start Container in Debug Mode

```bash
docker run -it --rm --entrypoint sh [container_name]
```

### 🛠️ Modify Any Service in Ollama

You can change any service or add new services for Ollama. For example, you can change the location to store the Mistral model after pulling or set new environment variables.

Edit the service file:

```bash
sudo nano /etc/systemd/system/ollama.service
```

Example service file:

```plaintext
[Unit]
Description=Ollama Service
After=network-online.target

[Service]
ExecStart=/usr/local/bin/ollama serve
User=ollama
Group=ollama
Restart=always
RestartSec=3
Environment="PATH=.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin"

[Install]
WantedBy=default.target
```

---

Feel free to customize this `README.md` further to better fit your project and audience! 🚀😊