# Deployment Guide for DigitalOcean

This guide covers deploying the Offshore Logistics Application to DigitalOcean using App Platform or Docker-based deployments.

## Prerequisites

- DigitalOcean account
- Git repository (GitHub, GitLab, or Bitbucket)
- Domain name (optional, for custom domains)

## Deployment Options

### Option 1: DigitalOcean App Platform (Recommended)

DigitalOcean App Platform is a Platform-as-a-Service (PaaS) that automatically builds and deploys your application.

#### Setup Steps

1. **Prepare your repository**
   - Ensure all code is committed and pushed to your Git repository
   - The `app.yaml` file in the root directory is configured for App Platform
   - Alternative: `app.yaml.buildpacks` uses buildpacks instead of Dockerfiles (simpler)

2. **Create App on DigitalOcean**
   - Log in to [DigitalOcean Control Panel](https://cloud.digitalocean.com)
   - Navigate to **Apps** → **Create App**
   - Connect your Git repository
   - **Important**: If you see "No components detected":
     - Option A: Use the App Platform UI to manually configure components
       - For backend: Set source directory to `backend`, use Node.js buildpack
       - For frontend: Set source directory to `frontend`, use Node.js buildpack
     - Option B: Copy `app.yaml.buildpacks` to `app.yaml` (uses buildpacks instead of Dockerfiles)
     - Option C: Ensure `app.yaml` is in the repository root (not just in `.do/` directory)

3. **Configure Environment Variables**
   In the App Platform dashboard, set the following environment variables:

   **Backend Service:**
   - `JWT_SECRET`: Generate a strong random string (e.g., `openssl rand -hex 32`)
   - Database connection variables are automatically set from the database service

   **Frontend Service:**
   - `VITE_API_URL`: Will be automatically set to the backend service URL

4. **Database Setup**
   - The `app.yaml` includes a PostgreSQL database with PostGIS
   - After deployment, run migrations:
     ```bash
     # Connect to your app via console or SSH
     cd backend
     npm run migrate
     ```

5. **Deploy**
   - Click **Create Resources** in the App Platform dashboard
   - DigitalOcean will build and deploy your application
   - Monitor the deployment logs for any issues

#### Post-Deployment

1. **Run Database Migrations**
   ```bash
   # Use DigitalOcean App Platform console or connect via SSH
   npm run migrate
   ```

2. **Verify Deployment**
   - Check backend health: `https://your-backend-url.ondigitalocean.app/health`
   - Access frontend: `https://your-frontend-url.ondigitalocean.app`

### Option 2: Docker Deployment on Droplets

Deploy using Docker on DigitalOcean Droplets for more control.

#### Setup Steps

1. **Create a Droplet**
   - Create a new Droplet (Ubuntu 22.04 LTS recommended)
   - Minimum size: 2GB RAM, 1 vCPU (4GB+ recommended for production)
   - Enable Docker one-click app or install Docker manually

2. **Install Docker and Docker Compose**
   ```bash
   # SSH into your droplet
   ssh root@your-droplet-ip

   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh

   # Install Docker Compose
   apt-get update
   apt-get install docker-compose-plugin
   ```

3. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/offshore-logistics-app.git
   cd offshore-logistics-app
   ```

4. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your production values
   ```

5. **Set up Database**
   - Option A: Use DigitalOcean Managed Database
     - Create a PostgreSQL database in DigitalOcean
     - Update `.env` with database connection details
     - Remove `postgres` service from `docker-compose.yml`

   - Option B: Use Docker PostgreSQL
     - Keep `postgres` service in `docker-compose.yml`
     - Database will be created automatically

6. **Build and Start Services**
   ```bash
   docker compose build
   docker compose up -d
   ```

7. **Run Database Migrations**
   ```bash
   docker compose exec backend npm run migrate
   ```

8. **Set up Reverse Proxy (Optional)**
   Install Nginx for SSL/TLS termination:
   ```bash
   apt-get install nginx certbot python3-certbot-nginx
   ```

   Configure Nginx to proxy to your services (backend on :3001, frontend on :80)

9. **Set up SSL Certificate**
   ```bash
   certbot --nginx -d yourdomain.com
   ```

#### Production Considerations

- **Use Managed Database**: DigitalOcean Managed Databases provide automatic backups and high availability
- **Enable Firewall**: Configure UFW or DigitalOcean Cloud Firewalls
- **Set up Monitoring**: Use DigitalOcean Monitoring or external services
- **Configure Backups**: Set up automated backups for your database
- **Use Load Balancer**: For high availability, use DigitalOcean Load Balancers

### Option 3: Kubernetes (Advanced)

For production at scale, deploy to DigitalOcean Kubernetes.

1. Create a Kubernetes cluster in DigitalOcean
2. Build and push Docker images to DigitalOcean Container Registry
3. Deploy using Kubernetes manifests (not included, but can be created on request)

## Environment Variables

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3001` |
| `DB_HOST` | Database host | `localhost` or managed DB host |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `prio_logistics` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `secure-password` |
| `JWT_SECRET` | JWT signing secret | `random-hex-string` |

### Frontend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3001` or production URL |
| `NODE_ENV` | Environment mode | `production` |

## Database Migrations

After deployment, run database migrations:

```bash
# For Docker deployment
docker compose exec backend npm run migrate

# For App Platform
# Use the App Platform console or connect via SSH
```

## Health Checks

- **Backend**: `GET /health` - Returns `{ status: 'ok', timestamp: '...' }`
- **Frontend**: `GET /health` - Returns `200 OK`

## Monitoring

### App Platform
- Built-in monitoring and logs in DigitalOcean dashboard
- Set up alerts for service health

### Docker Deployment
- Use `docker compose logs -f` to monitor logs
- Set up external monitoring (e.g., UptimeRobot, Pingdom)

## Troubleshooting

### "No components detected" Error

If DigitalOcean App Platform shows "No components detected", try these solutions:

1. **Verify app.yaml location**
   - Ensure `app.yaml` exists in the repository root
   - DigitalOcean looks for `app.yaml` in the root directory

2. **Check source directories**
   - Verify `backend/package.json` exists
   - Verify `frontend/package.json` exists
   - App Platform needs these files to detect Node.js components

3. **Use buildpacks instead of Dockerfiles**
   - Copy `app.yaml.buildpacks` to `app.yaml`
   - Buildpacks are simpler and more reliable for App Platform
   - Dockerfiles require proper `dockerfile_path` configuration

4. **Manual component configuration**
   - In App Platform UI, manually add components
   - Set source directory: `backend` for backend service
   - Set source directory: `frontend` for frontend service
   - App Platform will auto-detect Node.js from `package.json`

5. **Verify Dockerfile paths** (if using Dockerfiles)
   - `dockerfile_path` should be relative to `source_dir`
   - Example: `source_dir: backend`, `dockerfile_path: Dockerfile`

### Backend Issues

1. **Database Connection Errors**
   - Verify database credentials in environment variables
   - Check database is accessible from your deployment
   - For managed databases, verify firewall rules

2. **Port Conflicts**
   - Ensure port 3001 is available
   - Check firewall rules allow traffic on port 3001

### Frontend Issues

1. **API Connection Errors**
   - Verify `VITE_API_URL` is set correctly
   - Check CORS settings in backend
   - Ensure backend is accessible from frontend

2. **Build Errors**
   - Check Node.js version (requires 18+)
   - Verify all dependencies are installed
   - Check build logs for specific errors

### Database Issues

1. **PostGIS Extension**
   - Ensure PostGIS is installed: `CREATE EXTENSION postgis;`
   - Verify database user has necessary permissions

2. **Migration Errors**
   - Check database connection
   - Verify database user has CREATE/ALTER permissions
   - Review migration logs

## Security Checklist

- [ ] Change default database passwords
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable database backups
- [ ] Use environment variables for secrets
- [ ] Regularly update dependencies
- [ ] Monitor logs for suspicious activity

## Scaling

### App Platform
- Adjust instance sizes in App Platform dashboard
- Enable auto-scaling based on traffic

### Docker Deployment
- Use Docker Swarm or Kubernetes for orchestration
- Set up load balancer for multiple instances
- Use managed database for high availability

## Backup and Recovery

### Database Backups
- **Managed Database**: Automatic daily backups (configurable)
- **Docker PostgreSQL**: Set up cron job for `pg_dump`

### Application Backups
- Use Git for code versioning
- Store environment variables securely
- Document deployment procedures

## Support

For issues or questions:
1. Check application logs
2. Review DigitalOcean documentation
3. Check project documentation in `README.md`
4. Review API documentation in `backend/API_IMPLEMENTATION.md`
