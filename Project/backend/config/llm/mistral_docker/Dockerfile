# Base image
FROM ubuntu

# Install necessary dependencies
RUN apt-get update && \
    apt-get install -y curl python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Install Ollama (assuming there's an install script or method)
RUN curl -fsSL https://ollama.com/install.sh | sh

# Set the working directory
WORKDIR /root

# Copy the application code
COPY . /root