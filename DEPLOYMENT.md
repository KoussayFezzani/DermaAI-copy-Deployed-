# DermaAI Deployment & Infrastructure Guide

This guide covers deployment instructions for DermaAI, specifying containerized orchestration with Docker Compose (Nginx reverse proxy, Gunicorn WSGI, and MongoDB) targeted for cloud Virtual Private Servers (VPS) such as AWS EC2, DigitalOcean, Hetzner, or GCP Compute Engine.

---

## 1. Resource Requirements & Constraints

| Component | Minimum Specification | Recommended Specification | Notes |
| :--- | :--- | :--- | :--- |
| **CPU** | 2 vCPUs | 4 vCPUs | Model inference & Qwen assistant token streaming run on CPU by default |
| **RAM** | 4 GB | 8 GB | Xception model (~250MB weights) + Qwen2.5-0.5B (~1GB FP16) + OS overhead |
| **Disk Storage** | 10 GB SSD | 25 GB SSD | Docker images, model weights, dependencies, and persistent uploads |
| **GPU** | Optional | NVIDIA T4 / RTX 3060 (4GB+ VRAM) | Acceleration speeds up assistant token streaming from ~10 tok/s to ~60 tok/s |

---

## 2. Docker Compose Deployment (Recommended for VPS / Self-Hosted)

The repository provides full container orchestration in [`docker-compose.yml`](../docker-compose.yml) comprising:
- **`dermaai_frontend`**: Nginx web server serving Vite SPA production build on Port 80.
- **`dermaai_backend`**: Gunicorn WSGI multi-worker container on Port 5000.
- **`dermaai_mongodb`**: Official MongoDB 7 container with persistent volume.

### Steps:
1. Ensure Docker & Docker Compose are installed on the target server.
2. Clone repository and set up environment:
   ```bash
   git clone <repo-url>
   cd DermaAI-master
   ```
3. Set your production secrets in `backend/.env`:
   ```bash
   JWT_SECRET_KEY=your-cryptographically-random-secret-key-32-chars
   CORS_ORIGINS=https://yourdomain.com,http://localhost
   ```
4. Build and start services:
   ```bash
   docker compose up -d --build
   ```
5. Check health:
   ```bash
   curl -f http://localhost:5000/api/health
   # Returns: {"database":"connected","status":"ok"}
   ```

---

## 3. Cloud Platform Deployment (PaaS: Render / Railway)

### A. Managed MongoDB
Use **MongoDB Atlas** (Free M0 or Dedicated M10):
- Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- Get the connection string: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/skin_lesion_db?retryWrites=true&w=majority`.
- Add `MONGO_URI` to your backend environment settings.

### B. Backend (Render / Railway / Fly.io)
- **Environment**: Docker or Python 3.11.
- **Build Command**: `pip install -r requirements.txt gunicorn`
- **Start Command**: `gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 app:create_app()`
- **Environment Variables**:
  - `MONGO_URI`: Your MongoDB Atlas URI.
  - `JWT_SECRET_KEY`: Long random string.
  - `CORS_ORIGINS`: URL of your deployed frontend (e.g. `https://dermaai.vercel.app`).
  - `FLASK_ENV`: `production`
  - `FLASK_DEBUG`: `0`

### C. Frontend (Vercel / Cloudflare Pages / Netlify)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: Your deployed backend URL (e.g. `https://dermaai-api.onrender.com`).

---

## 4. Production Security & Privacy Checklist
- [x] JWT secret key is loaded exclusively from environment variables.
- [x] CORS origins are strictly whitelisted to the production frontend domain.
- [x] File upload headers, extensions, and magic bytes are validated before processing.
- [x] Upload directory has controlled access permissions.
- [x] Medical images are served only to authenticated owners or administrators.
- [x] Global exception handlers suppress raw stack traces and internal errors.
- [x] Low confidence predictions are flagged as uncertain instead of providing a false negative normal diagnosis.
