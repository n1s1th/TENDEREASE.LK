# TenderEase E-Procurement System

Government e-procurement platform built with Spring Boot microservices architecture.

## Architecture

- **Microservices**: 12+ independent services
- **API Gateway**: Spring Cloud Gateway
- **Service Discovery**: Eureka Server
- **Authentication**: Keycloak (OAuth 2.0)
- **Message Queue**: RabbitMQ
- **Caching**: Redis
- **Database**: PostgreSQL
- **File Storage**: AWS S3

## Services

| Service | Port | Description |
|---------|------|-------------|
| Eureka Server | 8761 | Service Discovery |
| API Gateway | 8000 | API Gateway |
| User Service | 8081 | User management |
| Tender Service | 8082 | Tender management |
| Bid Service | 8083 | Bid submission |
| Evaluation Service | 8084 | Bid evaluation |
| Workflow Service | 8085 | Approval workflows |
| Contract Service | 8086 | Contract management |
| Payment Service | 8087 | Financial transactions |
| Document Service | 8088 | Document management |
| Notification Service | 8089 | Notifications |
| Clarification Service | 8090 | Q&A |
| Appeal Service | 8091 | Appeals |
| Reporting Service | 8092 | Analytics |

## Prerequisites

- Java 21
- Maven 3.9+
- Docker & Docker Compose
- PostgreSQL 15+
- Keycloak
- RabbitMQ
- Redis

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/tenderease-backend.git
   cd tenderease-backend
   ```
2. **Start infrastructure**
   ```bash
   docker-compose up -d postgres redis rabbitmq keycloak
   ```
3. **Build all services**
   ```bash
   ./scripts/build-all.sh
   ```
4. **Run services**
   ```bash
   # Start Eureka Server
   cd eureka-server && mvn spring-boot:run &
   
   # Start API Gateway
   cd api-gateway && mvn spring-boot:run &
   
   # Start microservices
   cd user-service && mvn spring-boot:run &
   # ... other services
   ```

## Development

### Project Structure
```
tenderease-backend/
├── common-library/        # Shared code
├── eureka-server/         # Service discovery
├── api-gateway/           # API gateway
├── [service-name]/        # Microservices
└── infrastructure/        # Docker configs
```

### Git Workflow
1. Pull latest from main: `git pull origin main`
2. Create feature branch: `git checkout -b feature/your-service-name`
3. Develop your service
4. Commit and push: `git commit -m "Add [feature]"`
5. Create PR to dev branch

### Testing
```bash
# Run all tests
./scripts/run-tests.sh

# Test specific service
cd user-service
mvn test
```

### Building Docker Images
```bash
./scripts/docker-build.sh
```

## Contributing
See CONTRIBUTING.md

## License
MIT License
