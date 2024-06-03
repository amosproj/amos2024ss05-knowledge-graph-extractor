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
> [!IMPORTANT]
> Ensure you have Docker and Python 3.11 or higher installed before proceeding with the setup.

### Development Prerequisites

1. **Create a virtual environment:**

```bash
python -m venv venv
```

2. **Activate the virtual environment:**

```bash
source venv/bin/activate
```

3. **Install the development requirements specific to your IDE for enhanced functionality and support:**

```bash
pip install -r Project/backend/codebase/requirements.txt
```

### Build the image and run the Container:

- If buildkit is not enabled, enable it and build the image:

```bash
DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1 docker-compose -f Project/backend/docker-compose.yml up --build -d
```

- If buildkit is enabled, build the image:

```bash
docker-compose -f Project/backend/docker-compose.yml up --build -d
```
### Start Frontend server: 
1. Navigate to the frontend directory:

```bash
cd Project/frontend
```

2. Install the frontend dependencies:

```bash
npm install 
```

3. Build the frontend:

```bash
npm run dev
```
--- 
> [!NOTE]
> Alternatively, you can use the Makefile to run the Container and the frontend server from the ```Project directory```:
-  Start the Container and the Frontend Server:
 ```bash
    make build-dev
```
Only start the Frontend Server:
```bash
make frontend-build-dev
```
Only start the Container:
```bash
make backend-build-dev
```
*For detailed instructions, see the [Getting Started Guide](https://github.com/amosproj/amos2024ss05-knowledge-graph-extractor/wiki/Getting-Started-%F0%9F%8F%81).*


> You can now access the application at [http://localhost:8000](http://localhost:8000. The development environment allows for immediate reflection of code changes.

