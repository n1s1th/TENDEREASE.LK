# TenderEase Addenda Integration - Complete Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js + React)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                     │
│  page.tsx (Tender Detail Page)                                    │
│  ├─ Fetches: getTenderById(), getAddenda(), etc.                │
│  ├─ Passes data to: TabsWrapper                                 │
│  └─ HTTP Call: GET /api/tenders/{id}/addenda                   │
│                                                                     │
│  TabsWrapper.tsx (Tab Controller)                               │
│  ├─ Manages active tab state                                    │
│  ├─ Routes: "Addenda" → AddendaTab component                   │
│  └─ Passes: data.addenda (Array of amendments)                │
│                                                                     │
│  AddendaTab.tsx ✨ (NEW - FULLY IMPLEMENTED)                    │
│  ├─ Receives: amendments[], newClosingDate, description, etc.  │
│  ├─ Displays:                                                   │
│  │  ├─ Amendment number (Addendum 001, 002, etc.)            │
│  │  ├─ Created date (formatted: "MMM d, yyyy")                │
│  │  ├─ Type badge (Mandatory)                                 │
│  │  ├─ Title & description                                    │
│  │  ├─ New closing date alert (if updated)                   │
│  │  ├─ Document section with download                        │
│  │  └─ Compliance notice                                      │
│  └─ Handles: Empty states, date formatting, responsive layout │
│                                                                     │
└─────────────────────────────────────────────────────────────────┘
         │
         │ HTTP/REST
         ├─ URL: http://localhost:8082/api/tenders/{id}/addenda
         ├─ Method: GET
         └─ Headers: Authorization, Content-Type
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND (Spring Boot - Microservices)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                     │
│  TenderController.java (API Layer)                              │
│  ├─ Endpoint: GET /{id}/addenda                                │
│  ├─ Path Variable: id (Tender UUID)                            │
│  ├─ Calls: tenderService.getAddenda(id)                        │
│  └─ Returns: List<TenderAmendmentDTO>                          │
│                                                                     │
│  TenderService.java (Business Logic)                            │
│  ├─ Method: getAddenda(UUID tenderId)                          │
│  ├─ Tasks:                                                      │
│  │  ├─ Query: amendmentRepository.findByTenderIdOrderByCreatedAtDesc()
│  │  ├─ Map: Each TenderAmendment → TenderAmendmentDTO         │
│  │  └─ Return: List<TenderAmendmentDTO>                       │
│  │                                                              │
│  └─ Helper: mapAmendment(TenderAmendment)                      │
│     └─ Extracts: id, number, title, description, dates        │
│                                                                     │
│  TenderAmendmentRepository.java (Data Access)                  │
│  └─ Query: findByTenderIdOrderByCreatedAtDesc(UUID)            │
│                                                                     │
│  TenderAmendment.java (JPA Entity)                              │
│  ├─ Fields:                                                     │
│  │  ├─ id                                                      │
│  │  ├─ amendmentNumber                                        │
│  │  ├─ title                                                  │
│  │  ├─ description (TEXT)                                     │
│  │  ├─ version                                                │
│  │  ├─ previousClosingDate                                    │
│  │  ├─ newClosingDate                                         │
│  │  ├─ createdAt                                              │
│  │  └─ tender (ManyToOne relationship)                        │
│  │                                                              │
│  └─ Table: tender_amendments (Flyway migration)                │
│                                                                     │
│  TenderAmendmentDTO.java (Response DTO)                        │
│  ├─ Fields:                                                     │
│  │  ├─ Long id                                                │
│  │  ├─ Integer amendmentNumber                                │
│  │  ├─ String title                                           │
│  │  ├─ String description                                     │
│  │  ├─ LocalDateTime newClosingDate                           │
│  │  ├─ LocalDateTime createdAt                                │
│  │  └─ [Optional] List<TenderDocumentDTO> documents           │
│  │                                                              │
│  └─ Serialized to: JSON response                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────┘
         │
         │ JPA/Hibernate ORM
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  DATABASE (PostgreSQL)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Table: tender_amendments                                        │
│  ├─ id (Long) - PK                                             │
│  ├─ tender_id (UUID) - FK → tenders.id                         │
│  ├─ amendment_number (Integer)                                 │
│  ├─ title (VARCHAR)                                            │
│  ├─ description (TEXT)                                         │
│  ├─ version (Integer)                                          │
│  ├─ previous_closing_date (TIMESTAMP)                          │
│  ├─ new_closing_date (TIMESTAMP)                               │
│  └─ created_at (TIMESTAMP)                                     │
│                                                                     │
│  Sample Data:                                                    │
│  ├─ Addendum 001: "Revised Technical Specifications - HVAC"   │
│  ├─ Addendum 002: "Budget Update - Ministry of Infrastructure" │
│  └─ Addendum 003: "Timeline Extension - 3 Days"               │
│                                                                     │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Sequence

```
1. USER ACTION
   └─ User navigates to tender detail page
      └─ URL: /tenders/{tender-id}

2. FRONTEND DATA FETCH (page.tsx)
   └─ getTenderById() + getAddenda() + others (parallel)
      └─ HTTP: GET /api/tenders/{id}/addenda
         └─ Authorization: Bearer {token}

3. BACKEND REQUEST HANDLING (TenderController)
   └─ @GetMapping("/{id}/addenda")
      └─ Call: tenderService.getAddenda(id)

4. SERVICE LAYER (TenderService)
   └─ Query database for amendments
      └─ amendmentRepository.findByTenderIdOrderByCreatedAtDesc()

5. DATABASE QUERY
   └─ SELECT * FROM tender_amendments
      WHERE tender_id = {UUID}
      ORDER BY created_at DESC

6. MAPPING & SERIALIZATION
   └─ Convert TenderAmendment → TenderAmendmentDTO
      └─ MapStruct/Builder pattern
         └─ Extract: id, number, title, description, dates

7. RESPONSE
   └─ Return: List<TenderAmendmentDTO>
      └─ Content-Type: application/json
         └─ Status: 200 OK

8. FRONTEND CONSUMPTION (TabsWrapper)
   └─ Receive JSON array
      └─ Parse into Amendment[] interface
         └─ Pass to AddendaTab component

9. RENDERING (AddendaTab.tsx)
   └─ Map amendments array
      └─ Render each amendment card with:
         ├─ Amendment number & date
         ├─ Type badge
         ├─ Title & description
         ├─ Closing date (if updated)
         ├─ Document section
         └─ Important notice

10. UI DISPLAY
    └─ User sees formatted addenda list
       └─ Can read details & download documents
```

## Request/Response Example

### HTTP Request
```
GET /api/tenders/550e8400-e29b-41d4-a716-446655440000/addenda HTTP/1.1
Host: localhost:8082
Authorization: Bearer eyJhbGc...
Content-Type: application/json
```

### HTTP Response
```json
[
  {
    "id": 1,
    "amendmentNumber": 1,
    "title": "Revised Technical Specifications - HVAC",
    "description": "Updated energy efficiency requirements. Minimum SEER rating increased from 14 to 16.",
    "newClosingDate": "2024-12-05T17:00:00",
    "createdAt": "2024-12-05T10:30:00"
  },
  {
    "id": 2,
    "amendmentNumber": 2,
    "title": "Budget Adjustment",
    "description": "Estimated budget revised to Rs.5,000,000",
    "newClosingDate": null,
    "createdAt": "2024-12-06T14:15:00"
  },
  {
    "id": 3,
    "amendmentNumber": 3,
    "title": "Timeline Extension",
    "description": "Closing date extended by 3 days due to public holidays",
    "newClosingDate": "2024-12-10T17:00:00",
    "createdAt": "2024-12-07T09:00:00"
  }
]
```

## Component Props & Types

### AddendaTab Interface
```typescript
interface Amendment {
  id: number;
  amendmentNumber: number;
  title: string;
  description: string;
  newClosingDate?: string;  // ISO 8601 format
  createdAt: string;         // ISO 8601 format
}

interface AddendaTabProps {
  addenda?: Amendment[];
}
```

## Features Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Backend API Endpoint | ✅ Complete | GET `/api/tenders/{id}/addenda` |
| Database Schema | ✅ Complete | tender_amendments table with all fields |
| Service Layer | ✅ Complete | TenderService.getAddenda() implemented |
| DTO Mapping | ✅ Complete | TenderAmendmentDTO properly mapped |
| Frontend Service | ✅ Complete | getAddenda() function in tender.service.ts |
| Data Fetching | ✅ Complete | Page.tsx fetches addenda in parallel |
| Component Display | ✅ Complete | AddendaTab fully renders amendments |
| Styling & Layout | ✅ Complete | Tailwind CSS, responsive, matches mockup |
| Empty State | ✅ Complete | Shows message when no amendments exist |
| Date Formatting | ✅ Complete | Native JS date formatting (no external deps) |
| Document Support | ⏳ Optional | Enhancement guide provided for future impl |

## Quick Start Guide

### Testing the Integration

1. **Backend Running?**
   ```bash
   cd backend/tender-service
   mvn spring-boot:run
   # Should be available at localhost:8082
   ```

2. **Frontend Running?**
   ```bash
   cd frontend
   npm run dev
   # Should be available at localhost:3000
   ```

3. **View Tender Detail**
   ```
   http://localhost:3000/tenders/{tender-id}
   ```

4. **Check Addenda Tab**
   - Click "Addenda" tab in the tender detail page
   - Should see amendments displayed with all details
   - If no amendments: empty state message shows

### Debugging Tips

- **No amendments showing?**
  - Check browser console for network errors
  - Verify backend API endpoint: `GET http://localhost:8082/api/tenders/{id}/addenda`
  - Check database: `SELECT * FROM tender_amendments WHERE tender_id = '{uuid}'`

- **Styling issues?**
  - Verify Tailwind CSS is compiled
  - Check component CSS classes

- **Date formatting wrong?**
  - Check browser timezone
  - Verify ISO 8601 format from backend

## Future Enhancements

1. **Document Support** (Recommended)
   - Add ManyToMany relationship: TenderAmendment ↔ TenderDocument
   - Include documents in API response
   - Enable actual file downloads

2. **Acknowledgment Feature**
   - Allow vendors to acknowledge amendments
   - Track acknowledgment status in bid submission

3. **Amendment History**
   - Track who created the amendment
   - Show modification history

4. **Filtering & Search**
   - Filter by amendment type
   - Search by keyword

5. **Bulk Amendment Operations**
   - Apply amendments to multiple tenders
   - Amendment templates

## Files Modified/Created

### Created
- ✨ [AddendaTab.tsx](./components/tender/tabs/AddendaTab.tsx) - NEW Component
- 📋 [ADDENDA_ENHANCEMENT_GUIDE.md](./backend/tender-service/ADDENDA_ENHANCEMENT_GUIDE.md) - NEW

### Modified
- ✅ [tender.service.ts](./services/tender.service.ts) - Already had getAddenda()
- ✅ [TenderController.java](./backend/tender-service/...) - Already had endpoint
- ✅ [TenderService.java](./backend/tender-service/...) - Already implemented

### Existing (No Changes Needed)
- Database schema (Flyway migrations)
- Backend entities and repositories
- Frontend service layer
