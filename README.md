# Knowledge Graph Masters (AMOS SS 2024) - Root Project



![AMOS_Banner ](https://github.com/amosproj/amos2024ss05-knowledge-graph-extractor/assets/75223225/ea785a68-b484-43a0-ad36-fe79fbb47943)

<b>Project Mission:</b> The mission of this project is to create a MVP for the knowledge graph generation in order to visually see clusters of information and how they're linked. The knowledge graph will include a basic search function to query information.

<b>Core functionality</b>: ingesting user document(s), processing the data and extracting relationship entities through the use of LLMs, building and storing the knowledge graph, an interactive visual representation of the knowledge graph, and a basic search function for entities in the knowledge graph.





## Features 🚀

- **Document upload (PDFs)**
- **Knowledge Graph Creation** from the uploaded document.
- **Graph Data** with nodes & edges for visualization.

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

## Shortcuts 🔑

This project includes several shortcuts to streamline the development process:

### Starting the Development Environment from the root directory


To Build and run the development environment (backend and frontend an the same time), you can run the following command in the root directory of the project:

```bash
make build-dev
```

**To Stop the development environment (frontend and backend):**

Press `Ctrl + C` to stop the npm server and run the following command:

```bash
make stop-dev
```

### Separately Starting the Components

If you want to start the components separately.

You can use the prefix `make backend-<command>`/` make frontend-<command>` for the separate backend and frontend commands or by navigating to the respective directories and running the Makefile commands.



 **Start only the frontend:**

```bash
make frontend-build-dev
```

**Example to start the backend separately:**

```bash
make backend-build-dev
```

  **Run a backend command:**

```bash
make backend-<command>
```

  >Example: To run the tests in the backend:

  ```bash
  make backend-tests
  ```

**Or navigate to the backend directory and run the command:**

```bash
cd Project/backend
make build-dev
```

**Example to start the frontend separately:**

```bash
cd Project/frontend
make start-dev
```

### Show help:
You can allwas run the following command to see the available commands:



```bash
make help
```

