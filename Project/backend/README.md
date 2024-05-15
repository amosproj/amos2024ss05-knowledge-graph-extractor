# Knowledge Graphe Masters (AMOS SS 2024)

This is AMOS Project SS2024 of a knowledge graph creation from data-sources.

---

## Features 🚀

- **Document upload (PDFs)**
- **Knowledge Graph Creation** from the uploaded document.
- **Graph Data** with nodes & edges to be used for visualization.

## Included Packages and Tools 🛠️

- **Pytest**: Testing framework
- **Pytest Sugar**: A pytest plugin for a better look
- **FastAPI**: Python Webframework to serve the application

## Requirements 📋

- Docker & Docker Compose
- Python 3.11 or higher
- Make (optional for shortcuts)

---

## Getting Started 🏁

1. **Clone the repository:**

```bash
git clone https://github.com/amosproj/amos2024ss05-knowledge-graph-extractor.git
```

2. **Change directory into the project:**

```bash
cd Project/backend
```

3. **Copy the `.env.example` file to `.env` and update the values as needed:**

---

## Initial Setup ⚙️

### Development Prerequisites

1. **Create a virtual environment:**

```bash
python -m venv venv
```

2. **Activate the virtual environment:**

```bash
source venv/bin/activate
```

3. **(Optional) Install the development requirements specific to your IDE for enhanced functionality and support.**

```bash
pip install -r codebase/requirements.txt
```

4. **Build the image and run the container:**

- If buildkit is not enabled, enable it and build the image:

```bash
DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1 docker-compose -f docker-compose.yml up --build -d
```

- If buildkit is enabled, build the image:

```bash
docker-compose -f docker-compose.yml up --build -d
```

- Or, use the shortcut:

```bash
make build-dev
```

## You can now access the application at http://localhost:8000. The development environment allows for immediate reflection of code changes.

## Shortcuts 🔑

This project includes several shortcuts to streamline the development process:


- **Run the linter:**

```bash
make lint
```

- **Run the formatter:**

```bash
make format
```

- **Run the tests:**

```bash
make test
```


- **Build and run dev environment:**

```bash
make build-dev
```

---
