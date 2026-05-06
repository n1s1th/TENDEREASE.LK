# Officer Registration Service

> Part of the TenderEase E-Procurement System (`user-service` module)  
> **Developer:** Tamasha | **Phase:** Phase 1 - Sprint 2 | **Port:** 8081

---

## 📋 Overview

The Officer Registration Service handles the complete lifecycle of procurement officer registrations on the TenderEase platform. It provides:

- **Public registration** form submission
- **Input validation** with multiple error collection
- **Reference ID generation** (`OFF-YYYY-XXXXXX`)
- **Error support ID generation** (`ERR-REG-YYYY-XXXXXX`)
- **Status management** (PENDING → APPROVED / REJECTED)
- **Event-driven** notifications via RabbitMQ
- **Redis caching** for officer lookups
- **Audit trail** for all registration events

---

## 🏗️ Architecture

```
Controller (REST API)
    ↓
Service Layer (Business Logic + Validation)
    ↓
Repository Layer (JPA / PostgreSQL)
    ↓
Event Publisher (RabbitMQ)
    ↓
Cache (Redis, 10 min TTL)
```

---

## 📡 API Endpoints

### 🔓 Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/officers/register` | Submit officer registration form |

### 🔒 Admin Endpoints (ROLE_ADMIN)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/officers` | List all officers (paginated) |
| `GET` | `/api/officers/{id}` | Get officer by UUID |
| `GET` | `/api/officers/reference/{referenceId}` | Get officer by reference ID |
| `POST` | `/api/officers/{id}/approve` | Approve officer registration |
| `POST` | `/api/officers/{id}/reject?reason=...` | Reject officer registration |

---

## 📝 Registration Request

```json
POST /api/officers/register
Content-Type: application/json

{
  "procuringEntityType": "Government Department",
  "headDesignation": "Director",
  "organizationName": "Ministry of Finance",
  "address": {
    "country": "Sri Lanka",
    "streetLine1": "No 1 Main St",
    "streetLine2": "",
    "city": "Colombo",
    "province": "Western",
    "postalCode": "00100"
  },
  "personalLandPhone": "0112345678",
  "officialEmail": "officer@gov.lk",
  "businessRegistrationNumber": "BR-2026-001234",
  "vatRegistrationNumber": "VAT-2026-001234",
  "liaisonOfficer": {
    "title": "Mr",
    "name": "John Doe",
    "designation": "Senior Officer",
    "nic": "123456789V",
    "mobile": "+94771234567",
    "email": "john@gov.lk"
  },
  "termsAccepted": true
}
```

### ✅ Success Response (201)

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "referenceId": "OFF-2026-000123"
  }
}
```

### ❌ Failure Response (400)

```json
{
  "success": false,
  "message": "Registration failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    "Email already registered",
    "NIC format incorrect"
  ],
  "supportId": "ERR-REG-2026-000456"
}
```

---

## ✅ Validation Rules

| Field | Rule |
|-------|------|
| `procuringEntityType` | Required |
| `headDesignation` | Required |
| `address.country` | Required |
| `personalLandPhone` | Required |
| `officialEmail` | Required, valid email, **unique** |
| `liaisonOfficer.title` | Required |
| `liaisonOfficer.name` | Required |
| `liaisonOfficer.nic` | Required, **Sri Lankan format** (9 digits + V/X or 12 digits), **unique** |
| `liaisonOfficer.mobile` | Required, valid phone format |
| `liaisonOfficer.email` | Required, valid email |
| `termsAccepted` | Must be `true` |

---

## 🗄️ Database Schema

### `officers` Table
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `procuring_entity_type` | VARCHAR | NOT NULL |
| `head_designation` | VARCHAR | NOT NULL |
| `organization_name` | VARCHAR | |
| `country` | VARCHAR | |
| `street_line_1` | VARCHAR | |
| `street_line_2` | VARCHAR | |
| `city` | VARCHAR | |
| `province` | VARCHAR | |
| `postal_code` | VARCHAR | |
| `personal_land_phone` | VARCHAR | NOT NULL |
| `official_email` | VARCHAR | NOT NULL, UNIQUE |
| `business_registration_number` | VARCHAR | |
| `vat_registration_number` | VARCHAR | |
| `registration_reference` | VARCHAR | UNIQUE |
| `status` | VARCHAR | NOT NULL, CHECK (PENDING/APPROVED/REJECTED) |
| `keycloak_user_id` | VARCHAR | |
| `terms_accepted` | BOOLEAN | |

### `liaison_officers` Table
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `officer_id` | UUID | FK → officers, NOT NULL |
| `title` | VARCHAR | NOT NULL |
| `name` | VARCHAR | NOT NULL |
| `designation` | VARCHAR | |
| `nic` | VARCHAR | NOT NULL, UNIQUE |
| `mobile` | VARCHAR | NOT NULL |
| `email` | VARCHAR | NOT NULL |

### `registration_audits` Table
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `reference_id` | VARCHAR | |
| `status` | VARCHAR | NOT NULL |
| `error_message` | TEXT | |
| `support_id` | VARCHAR | |
| `action` | VARCHAR | NOT NULL |

---

## 🐰 RabbitMQ Events

### Published Events

| Event | Exchange | Routing Key |
|-------|----------|-------------|
| Officer Registered | `officer.exchange` | `officer.registered` |
| Officer Approved | `officer.exchange` | `officer.approved` |
| Officer Rejected | `officer.exchange` | `officer.rejected` |

### Consumed Events

| Event | Queue | Source |
|-------|-------|--------|
| User Created | `user.created.queue` | Auth Service (Keycloak) |

---

## 🚀 Setup Instructions

### Prerequisites
- Java 21
- PostgreSQL 15+
- Redis 7+
- RabbitMQ 3+
- Maven 3.9+

### 1. Start Infrastructure

```bash
cd backend
docker-compose up -d postgres redis rabbitmq
```

### 2. Build & Run

```bash
cd backend/user-service
mvn clean install
mvn spring-boot:run
```

### 3. Access Swagger UI

```
http://localhost:8081/swagger-ui.html
```

---

## 🧪 Testing

### Run Unit Tests
```bash
cd backend/user-service
mvn test
```

### Run Specific Tests
```bash
# Service tests only
mvn test -Dtest=OfficerRegistrationServiceTest

# Controller tests only
mvn test -Dtest=OfficerRegistrationControllerTest
```

### Test Coverage
```bash
mvn jacoco:report
# Report at: target/site/jacoco/index.html
```

---

## 📁 File Structure

```
user-service/src/main/java/lk/tenderease/user/
├── config/
│   ├── OfficerRabbitMQConfig.java      # RabbitMQ exchange/queue declarations
│   ├── OfficerSecurityConfig.java      # Security config (public register endpoint)
│   └── RestTemplateConfig.java         # REST client config
├── controller/
│   ├── OfficerRegistrationController.java  # Officer REST endpoints
│   └── VendorRegistrationController.java   # Vendor endpoints (existing)
├── dto/
│   ├── request/
│   │   ├── AddressDTO.java
│   │   ├── CreateOfficerRegistrationRequest.java
│   │   └── LiaisonOfficerDTO.java
│   └── response/
│       ├── OfficerProfileResponse.java
│       ├── OfficerRegistrationFailureResponse.java
│       └── OfficerRegistrationSuccessResponse.java
├── entity/
│   ├── Address.java                    # Embeddable address
│   ├── LiaisonOfficer.java           # Liaison officer entity
│   ├── Officer.java                    # Main officer entity
│   └── RegistrationAudit.java        # Audit trail entity
├── enums/
│   └── OfficerStatus.java            # PENDING, APPROVED, REJECTED
├── event/
│   ├── OfficerEvent.java             # Event DTO
│   ├── OfficerEventPublisher.java    # RabbitMQ publisher
│   └── UserCreatedEventListener.java # Keycloak event listener
├── exception/
│   ├── InvalidNICException.java
│   ├── InvalidOfficerStatusException.java
│   ├── OfficerAlreadyExistsException.java
│   ├── OfficerExceptionHandler.java
│   ├── OfficerNotFoundException.java
│   └── OfficerRegistrationException.java
├── repository/
│   ├── LiaisonOfficerRepository.java
│   ├── OfficerRepository.java
│   └── RegistrationAuditRepository.java
├── service/
│   ├── OfficerRegistrationService.java      # Interface
│   └── impl/
│       └── OfficerRegistrationServiceImpl.java  # Implementation
└── util/
    └── ReferenceIdGenerator.java      # OFF-YYYY-XXXXXX generator
```

---

## 🔗 Integration Points

| Service | Integration Type | Purpose |
|---------|------------------|---------|
| Keycloak | REST/Event | User account creation, role assignment |
| Notification Service | RabbitMQ | Email notifications |
| Audit Service | RabbitMQ | Audit log publishing |
| Document Service | REST | Officer document management |

---

## 📊 Caching Strategy

| Cache Key | Value | TTL |
|-----------|-------|-----|
| `officers::{referenceId}` | Officer profile | 10 minutes |

Cache is evicted on approve/reject operations.
