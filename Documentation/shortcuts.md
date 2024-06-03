# Shortcuts 🔑

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

