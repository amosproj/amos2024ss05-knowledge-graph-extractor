# Getting Started 🏁

1. **Clone the repository:**

```bash
git clone https://github.com/amosproj/amos2024ss05-knowledge-graph-extractor.git
```

2. **Change directory into the project:**

```bash
cd amos2024ss05-knowledge-graph-extractor
```

3. **Copy the `.env.example` file to `.env` and update the values as needed:**

```bash
cp Project/backend/.env.example Project/backend/.env
```

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

1. **Install the development requirements specific to your IDE for enhanced functionality and support:**

```bash
pip install -r Project/backend/codebase/requirements.txt
```

4. **Build the image and run the container:**

- If buildkit is not enabled, enable it and build the image:

```bash
DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1 docker-compose -f Project/backend/docker-compose.yml up --build -d
```

- If buildkit is enabled, build the image:

```bash
docker-compose -f Project/backend/docker-compose.yml up --build -d
```

- Or, use the shortcut:

```bash
make build-dev
```

> You can now access the application at [http://localhost:8000](http://localhost:8000). The development environment allows for immediate reflection of code changes.

Next [Step](shortcuts.md)
