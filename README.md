# Knowledge Graph Masters (AMOS SS 2024)



![AMOS_Banner ](https://github.com/amosproj/amos2024ss05-knowledge-graph-extractor/assets/75223225/ea785a68-b484-43a0-ad36-fe79fbb47943)

<b>Project Mission:</b> The mission of this project is to create a MVP for the knowledge graph generation in order to visually see clusters of information and how they're linked. The knowledge graph will include a basic search function to query information.

<b>Core functionality</b>: ingesting user document(s), processing the data and extracting relationship entities through the use of LLMs, building and storing the knowledge graph, an interactive visual representation of the knowledge graph, and a basic search function for entities in the knowledge graph.

## Navigation

- [Overview](#overview)
- [Getting Started 🏁](#getting-started-)
- [Shortcuts 🔑](#shortcuts-)
- [Product Overview](#product-overview)

## Overview

#### Features 🚀

- Document upload (PDFs)
- Knowledge Graph Creation from the uploaded document
- Graph Data with nodes & edges for visualization

#### Included Packages and Tools 🛠️

- Pytest
- Pytest Sugar
- FastAPI

#### Requirements 📋

- Docker & Docker Compose
- Python 3.11 or higher
- Make (optional for shortcuts)

## Getting Started 🏁

1. **Setup:**
    - Clone the repository and change into the project directory
    - Copy the `.env.example` file to `.env` and update the values as needed

2. **Run the application:**
    - Create and activate a virtual environment
    - Install the development requirements
    - Build the Docker image and run the container

*For detailed instructions, see the [Getting Started Guide](Documentation/getting-started.md).*

## Shortcuts 🔑

- Build and run the development environment: `make build-dev`
- Stop the development environment: `make stop-dev`
- Start components separately: `make frontend-build-dev` or `make backend-build-dev`
- Run backend tests: `make backend-tests`
- Show help: `make help`

*For detailed instructions, see the [Shortcuts Guide](Documentation/shortcuts.md).*

## Product Overview

Visual tool to generate knowledge graphs from documents, showing core concepts and their relationships.

### Supported Document Formats

- PDF

### Uploading a PDF

- Drag and drop the document or click the "Browse" button to select the document from your computer.

### Generating a Knowledge Graph

- Click the “Generate Graph” button to create a knowledge graph from the uploaded document.

* For details see the [User-Documentation](https://github.com/amosproj/amos2024ss05-knowledge-graph-extractor/wiki/User-Documentation)
