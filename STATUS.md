# Project Status

## ✅ Completed

### Backend
- GraphQL API (NestJS) with `Task` type and CRUD resolvers (`createTask`, `tasks`, `updateTask`, `deleteTask`).
- MongoDB integration via Mongoose.
- RabbitMQ event publishing using `amqplib` / `amqp-connection-manager`.
- JSON logging middleware to stdout.

### DevOps - Docker
- Multi-stage `Dockerfile` for backend (build + production).
- `docker-compose.yml` orchestrating backend, MongoDB, Redis, RabbitMQ.
- Env vars configured (`MONGODB_URI`, `REDIS_HOST`, `REDIS_PORT`, `RABBITMQ_URL`, `PORT`).
- Basic end-to-end tested via `curl` queries and mutations.

## 🔄 In Progress

### Backend
- Redis caching layer for `tasks` query (cache TTL).

### Logging & Visualization
- Filebeat/Logstash setup for harvesting JSON logs.
- Kibana dashboard JSON and import instructions.

## 🚧 To Do

### Frontend
- Scaffold Next.js + React app.
- Apollo Client setup.
- Pages/components for list/add/edit/delete tasks.
- SCSS styling and real-time updates (subscriptions/polling).

### DevOps - Docker Compose
- Add `.dockerignore`.

### Production Deployment
- Kubernetes manifests (Deployments, Services, ConfigMaps, Secrets).
- Helm chart under `/charts/todo-app` with values and templates.

### Documentation
- Update `README.md`:
  - Getting started with Docker Compose.
  - Dockerization rationale.
  - Helm install commands.
  - Kibana access and dashboard import.
  - Placeholder screenshots.

---
_Last updated: 2025-04-18_
