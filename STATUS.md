# Project Status

## Completed

### Backend
- GraphQL API (NestJS) with `Task` type and CRUD resolvers (`createTask`, `tasks`, `updateTask`, `deleteTask`).
- MongoDB integration via Mongoose.
- RabbitMQ event publishing using `amqplib` / `amqp-connection-manager`.
- JSON logging middleware to stdout.
- CORS enabled for frontend origin 
- Cache rehydration of DateTime for GraphQLISODateTime 

### DevOps - Docker
- Multi-stage `Dockerfile` for backend (build + production).
- `docker-compose.yml` orchestrating backend, MongoDB, Redis, RabbitMQ.
- Env vars configured (`MONGODB_URI`, `REDIS_HOST`, `REDIS_PORT`, `RABBITMQ_URL`, `PORT`).
- Basic end-to-end tested via `curl` queries and mutations.

### Frontend
- Next.js + React scaffold with Apollo Client integration, CRUD UI (list, add, update, delete), SCSS styling, real-time polling/subscriptions 
- Frontend `.gitignore` added 

## In Progress

### Logging & Visualization
- Kibana dashboard JSON created; import via init container currently failing due to readiness loop issues.

## To Do

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
_Last updated: 2025-04-18T18:53:43+03:00_
