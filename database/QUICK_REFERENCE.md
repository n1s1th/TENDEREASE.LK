# Quick Reference Guide - TenderEase.LK Database Schema

A quick reference for developers working with the TenderEase.LK database.

## 🚀 Quick Start

```bash
# Start database
docker compose up -d db

# Apply schema
docker compose exec -T db psql -U postgres -d tenderease < database/schema.sql
docker compose exec -T db psql -U postgres -d tenderease < database/clarifcation_and_addenda/schema.sql

# Connect to database
docker compose exec db psql -U postgres -d tenderease
```

## 📋 Core Tables at a Glance

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **User** | Authentication | Email, Password_Hash, Role |
| **Vendor** | Supplier profiles | Company_Name, Registration_Number |
| **Officer** | Procurement staff | Full_Name, Employee_ID, Department |
| **CPV_Code** | Classification codes | CPV_Code, Description, Level |
| **Tender** | Core tender entity | Tender_Reference, Title, Status |
| **Document** | File management | File_Name, File_Hash, Version_Number |

## 🔄 Tender Status Flow

```
DRAFT → PENDING_APPROVAL → APPROVED → PUBLISHED → 
CLARIFICATION → SUBMISSION_CLOSED → UNDER_EVALUATION → 
AWARDED → COMPLETED
```

## 🌲 CPV Hierarchy Levels

1. **Division** (XX000000-Y) - e.g., 45000000-7 (Construction)
2. **Group** (XXX00000-Y)
3. **Class** (XXXX0000-Y)
4. **Category** (XXXXX000-Y)
5. **Subcategory** (XXXXXXXX-Y)

## 📄 Document Types

```sql
'TENDER_NOTICE', 'TECHNICAL_SPECIFICATION', 'BID_DOCUMENT',
'TERMS_CONDITIONS', 'CLARIFICATION', 'ADDENDUM',
'EVALUATION_REPORT', 'AWARD_NOTICE', 'CONTRACT', 'OTHER'
```

## 🔍 Common Queries

### Get Active Tenders
```sql
SELECT * FROM v_active_tenders 
ORDER BY publication_date DESC;
```

### Get Tender by Reference
```sql
SELECT t.*, cpv.cpv_code, cpv.description as cpv_desc
FROM tender t
JOIN cpv_code cpv ON t.primary_cpv_id = cpv.cpv_id
WHERE t.tender_reference = 'TEND-2024-001';
```

### Get Tender Documents
```sql
SELECT * FROM v_tender_documents 
WHERE tender_reference = 'TEND-2024-001'
ORDER BY document_type, version_number DESC;
```

### Get CPV Hierarchy
```sql
SELECT * FROM v_cpv_hierarchy 
WHERE cpv_code LIKE '45%'
ORDER BY path;
```

### Get Document Version History
```sql
WITH RECURSIVE versions AS (
    SELECT * FROM document WHERE document_id = :id
    UNION ALL
    SELECT d.* FROM document d
    JOIN versions v ON d.document_id = v.parent_document_id
)
SELECT * FROM versions ORDER BY version_number DESC;
```

### Get Tender Status History
```sql
SELECT 
    tsh.*,
    o.full_name as officer_name
FROM tender_status_history tsh
JOIN officer o ON tsh.changed_by = o.officer_id
WHERE tender_id = :tender_id
ORDER BY changed_at DESC;
```

### Search Tenders by CPV
```sql
SELECT DISTINCT t.*
FROM tender t
JOIN tender_cpv tc ON t.tender_id = tc.tender_id
JOIN cpv_code cpv ON tc.cpv_id = cpv.cpv_id
WHERE cpv.cpv_code LIKE '72%'  -- IT services
AND t.status = 'PUBLISHED';
```

## 📝 Data Insertion Examples

### Create a User (Vendor)
```sql
-- Insert base user
INSERT INTO "User" (email, password_hash, role, is_verified)
VALUES ('vendor@example.com', '$2a$...', 'VENDOR', true)
RETURNING user_id;

-- Insert vendor profile
INSERT INTO Vendor (user_id, company_name, registration_number, 
                    contact_person, phone_number)
VALUES (:user_id, 'ABC Company Ltd', 'REG-12345', 
        'John Doe', '+94771234567');
```

### Create a User (Officer)
```sql
-- Insert base user
INSERT INTO "User" (email, password_hash, role, is_verified)
VALUES ('officer@gov.lk', '$2a$...', 'PROCUREMENT_OFFICER', true)
RETURNING user_id;

-- Insert officer profile
INSERT INTO Officer (user_id, full_name, employee_id, 
                     department, position)
VALUES (:user_id, 'Jane Smith', 'EMP-001', 
        'Procurement', 'Senior Officer');
```

### Create a Tender
```sql
INSERT INTO Tender (
    tender_reference, title, description,
    procurement_method, procurement_entity,
    status, primary_cpv_id, estimated_value,
    submission_deadline, created_by
)
VALUES (
    'TEND-2024-001',
    'Supply of IT Equipment',
    'Procurement of desktop computers and accessories',
    'OPEN_TENDER',
    'Ministry of Technology',
    'DRAFT',
    (SELECT cpv_id FROM cpv_code WHERE cpv_code = '30000000-9'),
    5000000.00,
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    :officer_id
);
```

### Add Document to Tender
```sql
INSERT INTO Document (
    tender_id, document_type, title,
    file_name, file_path, file_size, file_type,
    file_hash, version_number, uploaded_by
)
VALUES (
    :tender_id,
    'TENDER_NOTICE',
    'Official Tender Notice',
    'notice.pdf',
    '/uploads/tenders/2024/notice.pdf',
    524288,  -- 512 KB
    'application/pdf',
    'abc123...',  -- SHA-256 hash
    1,
    :officer_id
);
```

### Update Tender Status
```sql
-- Update tender status
UPDATE tender 
SET status = 'PUBLISHED', 
    publication_date = CURRENT_TIMESTAMP
WHERE tender_id = :tender_id;

-- Record status change
INSERT INTO tender_status_history (
    tender_id, previous_status, new_status,
    changed_by, change_reason
)
VALUES (
    :tender_id, 'APPROVED', 'PUBLISHED',
    :officer_id, 'Approved by management'
);
```

## 🔐 Security Best Practices

### Password Hashing
```sql
-- Use bcrypt or argon2 (handled in application layer)
-- Never store plain text passwords
INSERT INTO "User" (email, password_hash, role)
VALUES ('user@example.com', '$2a$10$...', 'VENDOR');
```

### File Integrity
```sql
-- Always compute SHA-256 hash (in application layer)
-- Verify on retrieval
SELECT file_hash FROM document WHERE document_id = :id;
```

### Access Control
```sql
-- Check user role before operations
SELECT role FROM "User" WHERE user_id = :user_id;

-- Log document access
INSERT INTO document_access_log (
    document_id, accessed_by, access_type, ip_address
)
VALUES (:doc_id, :user_id, 'DOWNLOAD', :ip_address);
```

## 🛠️ Useful Maintenance Queries

### Check Table Sizes
```sql
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;
```

### Check Index Usage
```sql
SELECT 
    tablename,
    indexname,
    idx_scan as times_used
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC
LIMIT 10;
```

### Count Records by Table
```sql
SELECT 
    'User' as table_name, COUNT(*) as count FROM "User"
UNION ALL
SELECT 'Vendor', COUNT(*) FROM vendor
UNION ALL
SELECT 'Officer', COUNT(*) FROM officer
UNION ALL
SELECT 'Tender', COUNT(*) FROM tender
UNION ALL
SELECT 'Document', COUNT(*) FROM document
UNION ALL
SELECT 'CPV_Code', COUNT(*) FROM cpv_code;
```

### Find Unused Indexes
```sql
SELECT 
    schemaname, 
    tablename, 
    indexname, 
    idx_scan
FROM pg_stat_user_indexes 
WHERE idx_scan = 0
AND schemaname = 'public';
```

## 🎯 Performance Tips

### Use Indexes Wisely
```sql
-- Good: Uses index on status
SELECT * FROM tender WHERE status = 'PUBLISHED';

-- Good: Uses index on dates
SELECT * FROM tender 
WHERE submission_deadline > CURRENT_TIMESTAMP;

-- Avoid: Function on indexed column
-- Bad: LOWER(email) breaks index
-- Good: Use CITEXT type instead
```

### Use Views for Complex Queries
```sql
-- Pre-optimized view
SELECT * FROM v_active_tenders;

-- Better than joining manually every time
```

### Batch Operations
```sql
-- Good: Single insert with multiple values
INSERT INTO tender_cpv (tender_id, cpv_id) VALUES
    (:tender_id, :cpv_id_1),
    (:tender_id, :cpv_id_2),
    (:tender_id, :cpv_id_3);

-- Avoid: Multiple single inserts in loop
```

## 🧪 Testing Queries

### Validate Foreign Keys
```sql
-- Check orphaned vendors
SELECT v.* FROM vendor v
LEFT JOIN "User" u ON v.user_id = u.user_id
WHERE u.user_id IS NULL;

-- Check orphaned tenders
SELECT t.* FROM tender t
LEFT JOIN officer o ON t.created_by = o.officer_id
WHERE o.officer_id IS NULL;
```

### Validate Data Integrity
```sql
-- Check duplicate emails
SELECT email, COUNT(*) 
FROM "User" 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Check invalid CPV codes
SELECT * FROM cpv_code 
WHERE cpv_code !~ '^[0-9]{8}-[0-9]$';

-- Check deadline logic
SELECT * FROM tender 
WHERE clarification_deadline >= submission_deadline;
```

## 📚 Related Documentation

- **[schema.sql](./schema.sql)** - Core database schema
- **[SCHEMA_DOCUMENTATION.md](./SCHEMA_DOCUMENTATION.md)** - Complete reference
- **[ER_DIAGRAM.md](./ER_DIAGRAM.md)** - Entity relationships
- **[README.md](./README.md)** - Setup and usage guide
- **[DESIGN_SUMMARY.md](./DESIGN_SUMMARY.md)** - Design decisions

## 🐛 Troubleshooting

### Connection Refused
```bash
# Check if database is running
docker compose ps

# Restart database
docker compose restart db
```

### Schema Errors
```bash
# Check for syntax errors
docker compose exec -T db psql -U postgres -d tenderease < database/schema.sql

# View error details
docker compose logs db
```

### Performance Issues
```bash
# Run VACUUM
docker compose exec db psql -U postgres -d tenderease -c "VACUUM ANALYZE;"

# Update statistics
docker compose exec db psql -U postgres -d tenderease -c "ANALYZE;"
```

## 💡 Development Tips

1. **Always use transactions** for multi-statement operations
2. **Check constraints** before inserting data
3. **Use prepared statements** to prevent SQL injection
4. **Log all status changes** to maintain audit trail
5. **Verify file hashes** on document upload/download
6. **Use views** for common query patterns
7. **Index foreign keys** for join performance
8. **Validate dates** before insertion (deadlines)
9. **Soft delete** instead of hard delete
10. **Document all schema changes** in migration scripts

## 🔗 Quick Links

- Lucid ER Diagram: https://lucid.app/lucidchart/11dbc4b2-2532-493f-8d60-ea68b4419bc6/edit
- PostgreSQL 16 Docs: https://www.postgresql.org/docs/16/
- CPV Codes Reference: https://ec.europa.eu/growth/single-market/public-procurement/digital/e-procurement/cpv_en

---

**Version**: 1.0  
**Last Updated**: 2024-02-16  
**For**: Developers working with TenderEase.LK database
