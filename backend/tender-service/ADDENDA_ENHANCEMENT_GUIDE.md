# Addenda & Amendments Enhancement Guide

## Current State
The frontend **AddendaTab** component is now fully implemented and ready to display amendments. The UI matches your design mockup and displays:
- Amendment number, date, and type badge
- Title and description
- New closing date (if updated)
- Document section with download button
- Important compliance notice

## Backend Enhancements Needed

### 1. **Add Document Support for Amendments** (Optional but Recommended)

Currently, amendments and documents are separate. To display documents with each amendment, follow these steps:

#### a) Update Database Schema
Add a new migration file: `V3__add_amendment_documents.sql`

```sql
-- Create relationship table between amendments and documents
CREATE TABLE tender_amendment_documents (
    id BIGSERIAL PRIMARY KEY,
    amendment_id BIGINT NOT NULL,
    document_id BIGINT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (amendment_id) REFERENCES tender_amendments(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES tender_documents(id) ON DELETE CASCADE,
    UNIQUE(amendment_id, document_id)
);

CREATE INDEX idx_amendment_documents_amendment_id ON tender_amendment_documents(amendment_id);
```

#### b) Update JPA Entity: TenderAmendment
```java
@Entity
@Table(name = "tender_amendments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenderAmendment {
    // ... existing fields ...
    
    @ManyToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinTable(
        name = "tender_amendment_documents",
        joinColumns = @JoinColumn(name = "amendment_id"),
        inverseJoinColumns = @JoinColumn(name = "document_id")
    )
    private List<TenderDocument> documents = new ArrayList<>();
}
```

#### c) Update DTO: TenderAmendmentDTO
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenderAmendmentDTO {
    private Long id;
    private Integer amendmentNumber;
    private String title;
    private String description;
    private LocalDateTime newClosingDate;
    private LocalDateTime createdAt;
    private List<TenderDocumentDTO> documents;  // NEW FIELD
}
```

#### d) Update Service: TenderServiceImpl
```java
private TenderAmendmentDTO mapAmendment(TenderAmendment a) {
    List<TenderDocumentDTO> documentDTOs = a.getDocuments() != null 
        ? a.getDocuments().stream()
            .map(this::mapDocument)
            .collect(Collectors.toList())
        : new ArrayList<>();
        
    return TenderAmendmentDTO.builder()
            .id(a.getId())
            .amendmentNumber(a.getAmendmentNumber())
            .title(a.getTitle())
            .description(a.getDescription())
            .newClosingDate(a.getNewClosingDate())
            .createdAt(a.getCreatedAt())
            .documents(documentDTOs)  // NEW
            .build();
}
```

### 2. **Update Frontend Component** (After Backend Enhancement)

Once documents are returned in the API response, update `AddendaTab.tsx`:

```typescript
interface Amendment {
  id: number;
  amendmentNumber: number;
  title: string;
  description: string;
  newClosingDate?: string;
  createdAt: string;
  documents?: Array<{     // NEW
    id: number;
    documentName: string;
    documentType: string;
    downloadUrl: string;
  }>;
}

// Update the documents section in the component:
{amendment.documents && amendment.documents.length > 0 ? (
  <div className="space-y-2">
    {amendment.documents.map((doc, docIndex) => (
      <div key={docIndex} className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-100 rounded">
        <div className="w-10 h-10 flex items-center justify-center bg-yellow-400 rounded">
          {/* Document icon */}
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900 text-sm">{doc.documentName}</p>
          <p className="text-xs text-gray-500">{doc.documentType}</p>
        </div>
        <a href={doc.downloadUrl} download className="flex items-center gap-2 text-amber-600 hover:text-amber-700">
          Download
        </a>
      </div>
    ))}
  </div>
) : (
  /* Current placeholder */
)}
```

## Current Implementation Status

✅ **Frontend - COMPLETE**
- AddendaTab component fully implemented
- Displays amendments with proper styling
- Shows new closing dates, descriptions, and compliance notices
- Responsive design matching the mockup

⚠️ **Backend - PARTIALLY COMPLETE**
- Amendment data is fetched and returned correctly
- Document relationship not yet implemented (optional enhancement)
- To add documents: Follow steps 1a-1d above

## Testing Checklist

- [ ] Frontend receives amendment data from backend API
- [ ] AddendaTab renders without errors
- [ ] Amendment number formatting displays correctly (001, 002, etc.)
- [ ] Date formatting works across different browsers
- [ ] Empty state displays when no amendments exist
- [ ] Important notice displays correctly
- [ ] Responsive layout works on mobile/tablet
- [ ] Optional: Document download links work (after backend enhancement)

## API Response Example

**Current:**
```json
{
  "id": 1,
  "amendmentNumber": 1,
  "title": "Revised Technical Specifications - HVAC",
  "description": "Updated energy efficiency requirements. Minimum SEER rating increased from 14 to 16.",
  "newClosingDate": "2024-12-05T17:00:00",
  "createdAt": "2024-12-05T10:30:00"
}
```

**Future (with documents):**
```json
{
  "id": 1,
  "amendmentNumber": 1,
  "title": "Revised Technical Specifications - HVAC",
  "description": "Updated energy efficiency requirements. Minimum SEER rating increased from 14 to 16.",
  "newClosingDate": "2024-12-05T17:00:00",
  "createdAt": "2024-12-05T10:30:00",
  "documents": [
    {
      "id": 101,
      "documentName": "addendum-001-hvac.pdf",
      "documentType": "PDF",
      "downloadUrl": "https://s3.amazonaws.com/tenderease/documents/addendum-001-hvac.pdf"
    }
  ]
}
```

## Notes
- The frontend component is production-ready
- Backend enhancement is optional but recommended for better UX
- All date formatting handles null values gracefully
- Component supports both empty and populated states
