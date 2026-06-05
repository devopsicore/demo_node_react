# Node.js + React Docker Deployment

A complete Docker deployment setup for a Node.js backend and React frontend application.

## Project Structure

```
Demo_node_react_project/
├── backend/
│   ├── Dockerfile          # Docker configuration for Node.js backend
│   ├── .dockerignore       # Files to exclude from Docker build
│   ├── package.json        # Backend dependencies
│   └── server.js           # Express server
├── frontend/
│   ├── Dockerfile          # Multi-stage Docker configuration for React with nginx
│   ├── .dockerignore       # Files to exclude from Docker build
│   ├── nginx.conf          # Nginx configuration for frontend container
│   ├── package.json        # Frontend dependencies
│   ├── public/
│   │   └── index.html      # HTML template
│   └── src/
│       ├── App.js          # Main React component
│       ├── App.css         # Component styles
│       ├── index.js        # React entry point
│       └── index.css       # Global styles
├── docker-compose.yml      # Docker Compose orchestration
├── nginx-host-config.conf  # Host nginx configuration template
└── README.md              # This file
```

## Prerequisites

Before running this Docker deployment, ensure you have:

1. **Docker Desktop** installed and running
   - Download from: https://www.docker.com/products/docker-desktop
   - Verify installation: `docker --version`

2. **Docker Compose** (included with Docker Desktop)
   - Verify installation: `docker-compose --version`

## How It Works

### Architecture

```
🌍 INTERNET / USER
       │
       ▼
┌────────────────────────┐
│   HOST NGINX           │
│ (Reverse Proxy Layer)  │
└──────────┬─────────────┘
           │
   ┌───────┼───────┐
   │               │
   ▼               ▼
┌─────────┐   ┌─────────┐
│ FRONTEND│   │ BACKEND │
│ Docker  │   │ Docker  │
│ :3000   │   │ :5000   │
└─────────┘   └────┬────┘
                  │
                  ▼
            ┌─────────┐
│   POSTGRES     │
│   Docker       │
│   :5435        │
└────────────────┘
```

- **Backend**: Node.js with Express running on port 5000 (Docker)
- **Frontend**: React app built and served by nginx in Docker container on port 3000
- **PostgreSQL**: PostgreSQL 15 database running on port 5435 (Docker)
- **Host Nginx**: Reverse proxy that routes requests to Docker containers
- **Network**: All services communicate via Docker bridge network
- **Communication**: Host nginx proxies / to frontend (port 3000) and /api/ to backend (port 5000)

### Docker Configuration

1. **Backend Dockerfile**:
   - Uses Node.js 18 Alpine image
   - Installs production dependencies
   - Exposes port 5000
   - Runs `npm start`

2. **Frontend Dockerfile** (Multi-stage build):
   - Stage 1: Builds React app using Node.js
   - Stage 2: Serves built app with Nginx Alpine
   - Optimized for production (smaller image size)

3. **Docker Compose**:
   - Orchestrates all three services (backend, frontend, postgres)
   - Creates a shared network
   - Maps ports: 3000 (frontend), 5000 (backend), 5435 (postgres)
   - Handles service dependencies
   - Creates a volume for PostgreSQL data persistence

## How to Run

### Step 1: Navigate to Project Directory

```bash
cd f:\Karthi\Demo_node_react_project
```

### Step 2: Build and Start Docker Containers

Run the following command to build images and start all services:

```bash
docker-compose up --build -d
```

This command will:
- Build Docker images for backend and frontend
- Pull PostgreSQL image
- Start all three containers (frontend, backend, postgres)

### Step 3: Configure Host Nginx

Copy the nginx configuration to your host nginx:

```bash
sudo cp nginx-host-config.conf /etc/nginx/sites-available/demo-emd.apps.org.in.conf
sudo ln -s /etc/nginx/sites-available/demo-emd.apps.org.in.conf /etc/nginx/sites-enabled/
```

Test and reload nginx:
```bash
sudo nginx -t
sudo nginx -s reload
```

### Step 4: Access the Application

Once the containers are running and nginx is configured, access:

- **Frontend**: http://demo-emd.apps.org.in (proxied to Docker container)
- **Backend API**: http://demo-emd.apps.org.in/api (proxied to Docker container)
- **Backend Health Check**: http://demo-emd.apps.org.in/api/health
- **Backend Data Endpoint**: http://demo-emd.apps.org.in/api/data
- **PostgreSQL**: localhost:5435 (user: emd_user, password: emd_password, database: emd_demo)

### Step 6: Stop the Application

To stop the containers, press `Ctrl+C` in the terminal where Docker Compose is running.

To stop and remove containers, networks, and images:

```bash
docker-compose down
```

To also remove volumes:

```bash
docker-compose down -v
```

## Additional Docker Compose Commands

### Run in Detached Mode (Background)

```bash
docker-compose up -d --build
```

### View Running Containers

```bash
docker-compose ps
```

### View Logs

```bash
# View all logs
docker-compose logs

# View backend logs only
docker-compose logs backend

# View frontend logs only
docker-compose logs frontend

# View postgres logs only
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f
```

### Restart Services

```bash
docker-compose restart
```

### Rebuild Specific Service

```bash
docker-compose build backend
docker-compose up -d backend
```

## Will This Work?

**Yes, this will work** if you have Docker Desktop properly installed and running. Here's why:

### ✅ What Makes This Work:

1. **Standard Docker Images**: Uses official Node.js, Nginx, and PostgreSQL images from Docker Hub
2. **Proper Port Mapping**: Frontend (3000), Backend (5000), and PostgreSQL (5435) are mapped correctly
3. **Service Discovery**: Backend uses "postgres" as hostname (Docker DNS resolves this)
4. **Multi-stage Build**: Frontend uses optimized multi-stage build for production
5. **Bridge Network**: All services are on the same Docker network for communication
6. **CORS Enabled**: Backend has CORS middleware to allow frontend requests
7. **Data Persistence**: PostgreSQL uses Docker volume for data persistence
8. **Host Nginx**: Host nginx acts as reverse proxy to Docker containers

### ⚠️ Potential Issues and Solutions:

1. **Port Already in Use**
   - **Error**: `Bind for 0.0.0.0:5000 failed: port is already allocated`
   - **Solution**: Change port mapping in `docker-compose.yml` or stop the conflicting service

2. **Docker Not Running**
   - **Error**: `Cannot connect to the Docker daemon`
   - **Solution**: Start Docker Desktop application

3. **Build Failures**
   - **Error**: npm install fails during build
   - **Solution**: Check internet connection, Docker Hub accessibility

4. **Frontend Can't Reach Backend**
   - **Error**: Network error when fetching from backend
   - **Solution**: Ensure both services are on the same network (configured in docker-compose.yml)

## Testing the Deployment

### Test Backend API

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test data endpoint
curl http://localhost:5000/api/data
```

### Test PostgreSQL Connection

```bash
# Connect to PostgreSQL using docker exec
docker exec -it postgres-db psql -U postgres -d myapp

# Or use psql from your machine if installed
psql -h localhost -p 5432 -U postgres -d myapp
```

Once connected, you can run SQL commands:
```sql
\l                    # List databases
\dt                   # List tables
\q                    # Quit
```

### Test Frontend

Open your browser and navigate to:
- http://demo-emd.apps.org.in

You should see:
- A React application displaying "React + Node Docker Demo"
- Data fetched from the backend API (list of items)
- No console errors related to API calls

## Development vs Production

### Development Mode

For development with hot-reload, you can modify the Dockerfiles to mount volumes:

```yaml
# Add to docker-compose.yml services
volumes:
  - ./backend:/app
  - ./frontend/src:/app/src
```

### Production Mode

The current setup is optimized for production:
- Backend uses `--production` flag for npm install
- Frontend uses multi-stage build with Nginx
- No development dependencies included in final images

## Troubleshooting

### Container Won't Start

```bash
# Check container status
docker-compose ps

# Check logs for errors
docker-compose logs [service-name]
```

### Rebuild from Scratch

```bash
# Stop and remove all containers, networks, and images
docker-compose down --rmi all -v

# Rebuild and start
docker-compose up --build
```

### Clear Docker Cache

```bash
# Remove unused images
docker image prune -a

# Remove unused containers
docker container prune

# Remove unused volumes
docker volume prune
```

## Security Considerations

For production deployment, consider:

1. **Environment Variables**: Use `.env` file for sensitive data
2. **HTTPS**: Add SSL/TLS certificates
3. **Rate Limiting**: Implement rate limiting on API endpoints
4. **Authentication**: Add JWT or session-based authentication
5. **Database**: PostgreSQL is included with proper credentials (change for production)
6. **Image Scanning**: Scan Docker images for vulnerabilities

## GitLab CI/CD Pipeline

This project includes a simple GitLab CI/CD pipeline that pulls code from GitLab and deploys containers using Docker Compose.

### Pipeline Configuration

The `.gitlab-ci.yml` file contains a single deploy stage that:
- Pulls the latest code from GitLab
- Stops existing containers
- Builds and starts all services using docker-compose
- Displays running containers

### Pipeline Triggers

- **On push to `main`**: Automatically builds and deploys
- **On push to `develop`**: Automatically builds and deploys

### GitLab Runner Requirements

The GitLab runner must have:
- Docker installed
- Docker Compose installed
- Docker-in-Docker (dind) service enabled

### Setting Up GitLab Runner

1. **Install GitLab Runner** on your server:
   ```bash
   curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
   sudo apt-get install gitlab-runner
   ```

2. **Register the runner** with your GitLab project:
   ```bash
   sudo gitlab-runner register
   ```
   - Enter your GitLab instance URL
   - Enter the project registration token
   - Choose docker as executor
   - Use default image: docker:24.0.5

3. **Configure the runner** to use Docker-in-Docker:
   Edit `/etc/gitlab-runner/config.toml`:
   ```toml
   [[runners]]
     executor = "docker"
     [runners.docker]
       privileged = true
       disable_cache = false
       volumes = ["/cache"]
       extra_hosts = ["host.docker.internal:host-gateway"]
   ```

4. **Restart GitLab Runner**:
   ```bash
   sudo gitlab-runner restart
   ```

5. **Install Docker Compose** on the runner:
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

### Viewing Pipeline Status

1. Go to your GitLab project
2. Click "CI/CD" > "Pipelines"
3. View pipeline status and logs

### Troubleshooting CI/CD

**Pipeline fails with "docker-compose not found"**:
- Ensure Docker Compose is installed on the GitLab runner
- Verify the runner has proper permissions

**Build fails with "permission denied"**:
- Check GitLab runner permissions
- Ensure runner is configured with privileged mode

**Containers not starting**:
- Check pipeline logs for errors
- Verify docker-compose.yml syntax
- Ensure ports are not already in use

## Next Steps

To extend this project:

1. Implement authentication
2. Add database migrations/seeds
3. Add environment variable configuration
4. Set up CI/CD pipeline (✅ Done)
5. Deploy to cloud (AWS, Azure, GCP)
6. Add monitoring and logging

## Summary

This Docker deployment provides:
- ✅ Complete Node.js + React + PostgreSQL setup
- ✅ Production-ready Docker configuration
- ✅ Easy deployment with single command
- ✅ Proper service orchestration
- ✅ Optimized multi-stage builds
- ✅ Persistent database storage with volumes
- ✅ Clear documentation and troubleshooting

**To run**: `docker-compose up --build`

**To access**: http://localhost (after configuring host nginx)
