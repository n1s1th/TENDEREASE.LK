# Database Schema - TenderEase.LK

This directory contains the database schema definitions for the TenderEase.LK tender management system.

## Contents

- **`schema.sql`** - Core database schema (Tender, CPV, Documents, Users)
- **`clarifcation_and_addenda/schema.sql`** - Clarification & Addenda module schema
- **`SCHEMA_DOCUMENTATION.md`** - Comprehensive schema documentation
- **`ER_DIAGRAM.md`** - Entity-relationship diagram documentation

## Quick Start

### Prerequisites

- PostgreSQL 16+
- Docker and Docker Compose (recommended)

### Setup Instructions

#### Using Docker Compose

1. Start the database:
```bash
docker compose up -d db
```

2. Apply the core schema:
```bash
docker compose exec -T db psql -U postgres -d tenderease < database/schema.sql
```

3. Apply the clarification module schema:
```bash
docker compose exec -T db psql -U postgres -d tenderease < database/clarifcation_and_addenda/schema.sql
```

4. Verify the setup:
```bash
docker compose exec -T db psql -U postgres -d tenderease -c "\dt"
```

#### Using Local PostgreSQL

1. Create the database:
```bash
createdb -U postgres tenderease
```

2. Apply the schemas:
```bash
psql -U postgres -d tenderease -f database/schema.sql
psql -U postgres -d tenderease -f database/clarifcation_and_addenda/schema.sql
```

## Schema Overview

### Core Entities

1. **User Management**
   - `User` - Base authentication table
   - `Vendor` - Vendor/Supplier profiles
   - `Officer` - Procurement officer profiles

2. **CPV Classification**
   - `CPV_Code` - Common Procurement Vocabulary hierarchy

3. **Tender Management**
   - `Tender` - Core tender entity
   - `Tender_CPV` - Tender-CPV mapping (many-to-many)
   - `Tender_Status_History` - Status change audit trail

4. **Document Management**
   - `Document` - Core document entity with versioning
   - `Document_Version_History` - Version snapshots
   - `Document_Access_Log` - Access audit trail

### Module Schemas

#### Clarification & Addenda Module
- `Clarification` - Vendor questions
- `Clarification_Reply` - Officer answers
- `Addendum` - Tender amendments
- `Addendum_Version` - Amendment history
- `Notification` - System notifications
- `Audit_Log` - General audit trail

### Database Statistics

- **Total Tables**: 16 (10 core + 6 module)
- **Total Views**: 3
- **Total Indexes**: 40+
- **Total Constraints**: 47+
- **Sample Data**: 34 CPV codes (Level 1 divisions)

## Schema Features

### 1. Tender Status Lifecycle

Complete status management from draft to completion:
```
DRAFT → PENDING_APPROVAL → APPROVED → PUBLISHED → 
CLARIFICATION → SUBMISSION_CLOSED → UNDER_EVALUATION → 
AWARDED → COMPLETED
```

Also supports: `CANCELLED`, `SUSPENDED`

### 2. CPV Hierarchy (5 Levels)

Hierarchical classification system:
- Level 1: Division (e.g., 45000000-7 - Construction work)
- Level 2: Group
- Level 3: Class
- Level 4: Category
- Level 5: Subcategory

### 3. Document Versioning

Full version control for tender documents:
- Version chain via parent-child relationships
- SHA-256 hash for integrity
- Complete version history
- Access audit logging

### 4. Audit Trails

Complete audit capability:
- Tender status changes tracked
- Document access logged
- All modifications timestamped
- Officer accountability maintained

## Database Design Principles

### Normalization

The schema adheres to **Third Normal Form (3NF)**:

- **1NF**: All attributes contain atomic values
- **2NF**: No partial dependencies
- **3NF**: No transitive dependencies

### Design Patterns

1. **Role-Based Inheritance** (User → Vendor/Officer)
2. **Self-Referencing Hierarchy** (CPV_Code, Document)
3. **Audit Trail Pattern** (Status history, Access logs)
4. **Soft Delete Pattern** (Is_Active, Is_Archived flags)
5. **Versioning Pattern** (Version numbers, parent references)

### Data Integrity

- UUID primary keys throughout
- Foreign key constraints with appropriate cascade rules
- Check constraints for business rules
- Unique constraints where needed
- Automatic timestamp updates via triggers

## Views

### 1. `v_active_tenders`
Lists currently active tenders (published, before deadline)

### 2. `v_tender_documents`
Shows all active documents with tender information

### 3. `v_cpv_hierarchy`
Recursive view showing complete CPV classification paths

## Performance Optimization

### Indexes

Strategic indexing for common queries:
- Foreign keys indexed
- Status fields indexed
- Date fields indexed for range queries
- Composite indexes for multi-column queries

### Query Tips

```sql
-- Efficient: Uses index on status
SELECT * FROM tender WHERE status = 'PUBLISHED';

-- Efficient: Uses index on submission_deadline
SELECT * FROM tender WHERE submission_deadline > NOW();

-- Efficient: Uses view with pre-optimized query
SELECT * FROM v_active_tenders;
```

## Sample Queries

### Get Active Tenders
```sql
SELECT * FROM v_active_tenders
ORDER BY publication_date DESC;
```

### Get Tender with All Documents
```sql
SELECT * FROM v_tender_documents
WHERE tender_reference = 'TEND-2024-001'
ORDER BY document_type, version_number DESC;
```

### Get CPV Hierarchy Path
```sql
SELECT * FROM v_cpv_hierarchy
WHERE cpv_code = '45000000-7';
```

### Get Tender Status History
```sql
SELECT 
    tsh.*,
    o.full_name as changed_by_name
FROM tender_status_history tsh
JOIN officer o ON tsh.changed_by = o.officer_id
WHERE tender_id = :tender_id
ORDER BY changed_at DESC;
```

### Get Document Version Chain
```sql
WITH RECURSIVE doc_versions AS (
    SELECT * FROM document WHERE document_id = :id
    UNION ALL
    SELECT d.* 
    FROM document d
    JOIN doc_versions dv ON d.document_id = dv.parent_document_id
)
SELECT * FROM doc_versions
ORDER BY version_number DESC;
```

## Schema Maintenance

### Backup

```bash
# Backup entire database
docker compose exec -T db pg_dump -U postgres tenderease > backup.sql

# Backup schema only
docker compose exec -T db pg_dump -U postgres -s tenderease > schema_backup.sql
```

### Restore

```bash
# Restore from backup
docker compose exec -T db psql -U postgres -d tenderease < backup.sql
```

### Migrations

For schema updates:
1. Never modify base schema files
2. Create migration scripts with timestamps
3. Test on staging first
4. Use transactions for all DDL
5. Document all changes

## Security Considerations

1. **Authentication**: Password hashing (bcrypt/argon2)
2. **Authorization**: Role-based access control
3. **Audit Trail**: Complete change history
4. **Data Integrity**: SHA-256 file hashing
5. **Soft Delete**: No data loss

## Integration

### With Clarification Module

The core schema integrates seamlessly:
- Foreign key references to Tender, Vendor, Officer
- Shared notification system
- Coordinated status management

### Future Modules

The schema is designed for extension:
- Bid Submission Module
- Evaluation Module
- Contract Management Module
- Reporting & Analytics Module

## Documentation

For detailed information, see:

- **[SCHEMA_DOCUMENTATION.md](./SCHEMA_DOCUMENTATION.md)** - Complete schema reference
- **[ER_DIAGRAM.md](./ER_DIAGRAM.md)** - Entity relationships and diagrams
- **[Lucid Diagram](https://lucid.app/lucidchart/11dbc4b2-2532-493f-8d60-ea68b4419bc6/edit)** - Interactive ER diagram

## Troubleshooting

### Connection Issues

```bash
# Check if database is running
docker compose ps

# View database logs
docker compose logs db

# Restart database
docker compose restart db
```

### Schema Issues

```bash
# Check for errors
docker compose exec -T db psql -U postgres -d tenderease -c "\dt"

# Drop and recreate database (WARNING: destroys all data)
docker compose exec -T db psql -U postgres -c "DROP DATABASE IF EXISTS tenderease;"
docker compose exec -T db psql -U postgres -c "CREATE DATABASE tenderease;"
```

### Performance Issues

```bash
# Check table sizes
docker compose exec -T db psql -U postgres -d tenderease -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"

# Check index usage
docker compose exec -T db psql -U postgres -d tenderease -c "
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
"
```

## Contributing

When contributing to the schema:

1. Follow naming conventions (PascalCase for tables, snake_case for columns)
2. Document all changes
3. Test with sample data
4. Update ER diagram
5. Update documentation

## Version History

- **v1.0** (2024-02-16) - Initial core schema with Tender, CPV, Documents

## Support

For issues or questions:
- Review documentation in this directory
- Check existing issues on GitHub
- Contact the development team

---

**Last Updated**: 2024-02-16  
**Schema Version**: 1.0  
**Database**: PostgreSQL 16+
