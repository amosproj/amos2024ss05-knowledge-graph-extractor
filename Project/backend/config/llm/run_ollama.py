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