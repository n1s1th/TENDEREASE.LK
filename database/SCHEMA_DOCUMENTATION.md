# TenderEase.LK - Core Database Schema Documentation

## Overview

This document provides comprehensive documentation for the TenderEase.LK core database schema, which implements a complete tender management system with support for tender lifecycle management, document versioning, and CPV (Common Procurement Vocabulary) classification.

## Database Information

- **Database Management System**: PostgreSQL 16+
- **Schema Version**: 1.0
- **Normalization Level**: Third Normal Form (3NF)
- **Character Set**: UTF-8
- **Timezone**: UTC for all timestamps

## Table of Contents

1. [Core Entities](#core-entities)
2. [Tender Status Lifecycle](#tender-status-lifecycle)
3. [CPV Hierarchy](#cpv-hierarchy)
4. [Document Versioning](#document-versioning)
5. [Normalization & Design Principles](#normalization--design-principles)
6. [Entity Relationship Diagram](#entity-relationship-diagram)
7. [Indexes & Performance](#indexes--performance)

## Core Entities

### 1. User Management

#### 1.1 User Table
**Purpose**: Base authentication and user management table

**Key Attributes**:
- `User_ID` (PK): Unique user identifier (UUID)
- `Email`: Case-insensitive unique email address
- `Password_Hash`: Secure password storage (bcrypt/argon2)
- `Role`: User role (VENDOR, PROCUREMENT_OFFICER, ADMIN, EVALUATOR, APPROVER)
- `Is_Active`: Account activation status
- `Is_Verified`: Email verification status

**Design Rationale**: 
- Uses CITEXT for case-insensitive email comparison
- Email format validation via CHECK constraint
- Supports multiple user types through role-based access control

#### 1.2 Vendor Table
**Purpose**: Extended profile information for vendor/supplier accounts

**Key Attributes**:
- `VendorID` (PK): Unique vendor identifier
- `User_ID` (FK): Links to User table
- `Company_Name`: Legal company name
- `Registration_Number`: Unique business registration number
- `Is_Blacklisted`: Blacklist status flag

**Design Rationale**:
- Separates authentication from business logic (User vs Vendor)
- Maintains vendor-specific information
- Supports vendor blacklisting with reason tracking

#### 1.3 Officer Table
**Purpose**: Extended profile information for procurement officers

**Key Attributes**:
- `Officer_ID` (PK): Unique officer identifier
- `User_ID` (FK): Links to User table
- `Employee_ID`: Unique employee identifier
- `Department`: Organizational department
- `Authority_Level`: Authorization level for tender operations

**Design Rationale**:
- Separates authentication from officer profile
- Tracks organizational hierarchy
- Supports authority-based permissions

### 2. CPV (Common Procurement Vocabulary)

#### 2.1 CPV_Code Table
**Purpose**: Hierarchical classification system for goods, services, and works

**Structure**:
- **Level 1 (Division)**: 2-digit classification (e.g., 45 = Construction work)
- **Level 2 (Group)**: 3-digit classification
- **Level 3 (Class)**: 4-digit classification
- **Level 4 (Category)**: 5-digit classification
- **Level 5 (Subcategory)**: 8-digit classification with check digit

**Key Attributes**:
- `CPV_ID` (PK): Unique CPV identifier
- `CPV_Code`: Standard CPV code format (XXXXXXXX-Y)
- `Description`: Human-readable description
- `Level`: Hierarchy level (1-5)
- `Parent_CPV_ID` (FK): Self-referencing hierarchy

**Design Rationale**:
- Self-referencing foreign key enables hierarchical structure
- Format validation ensures CPV code compliance
- Active flag supports deprecation without data loss
- Recursive view (`v_cpv_hierarchy`) provides full path navigation

**Example CPV Codes**:
- `45000000-7`: Construction work (Division)
- `72000000-5`: IT services (Division)
- `30000000-9`: Office and computing machinery (Division)

### 3. Tender Entity

#### 3.1 Tender Table
**Purpose**: Core entity representing procurement opportunities

**Status Lifecycle** (See detailed section below):
```
DRAFT → PENDING_APPROVAL → APPROVED → PUBLISHED → CLARIFICATION → 
SUBMISSION_CLOSED → UNDER_EVALUATION → AWARDED → COMPLETED
```

**Key Attributes**:
- `Tender_Id` (PK): Unique tender identifier
- `Tender_Reference`: Human-readable unique reference number
- `Title`: Tender title (max 500 chars)
- `Description`: Detailed tender description
- `Status`: Current tender status (enum)
- `Procurement_Method`: Method of procurement (enum)
- `Primary_CPV_ID` (FK): Primary classification code
- `Estimated_Value`: Budget estimate
- `Submission_Deadline`: Bid submission cutoff
- `Clarification_Deadline`: Questions cutoff
- `Created_By` (FK): Creating officer
- `Approved_By` (FK): Approving officer

**Business Rules (CHECK Constraints)**:
1. `Submission_Deadline` must be after `Created_At`
2. `Clarification_Deadline` must be before `Submission_Deadline`
3. `Estimated_Value` must be positive when specified
4. `Currency` must be 3-character ISO code
5. `Bid_Validity_Days` must be positive

**Design Rationale**:
- Comprehensive timeline management with multiple date fields
- Flexible financial tracking with currency support
- Officer accountability through created/approved tracking
- Boolean flags for operational status (published, urgent, late submission)

#### 3.2 Tender_CPV Table
**Purpose**: Many-to-many mapping for multiple CPV codes per tender

**Key Attributes**:
- `Mapping_ID` (PK): Unique mapping identifier
- `Tender_Id` (FK): References tender
- `CPV_ID` (FK): References CPV code
- `Is_Primary`: Marks primary classification

**Design Rationale**:
- Supports tenders with multiple classifications
- Primary flag identifies main category
- Enables flexible search by multiple CPV codes

#### 3.3 Tender_Status_History Table
**Purpose**: Audit trail for tender status changes

**Key Attributes**:
- `History_ID` (PK): Unique history record
- `Tender_Id` (FK): References tender
- `Previous_Status`: Status before change
- `New_Status`: Status after change
- `Changed_By` (FK): Officer making change
- `Change_Reason`: Explanation for change
- `Changed_At`: Timestamp of change

**Design Rationale**:
- Complete audit trail for compliance
- Tracks who, when, why for all status changes
- Enables status timeline reconstruction

### 4. Document Management

#### 4.1 Document Table
**Purpose**: Core document entity with full versioning support

**Key Attributes**:
- `Document_ID` (PK): Unique document identifier
- `Tender_Id` (FK): Associated tender
- `Document_Type`: Type of document (enum)
- `Title`: Document title
- `File_Name`: Original file name
- `File_Path`: Storage location
- `File_Size`: File size in bytes
- `File_Type`: MIME type
- `File_Hash`: SHA-256 hash for integrity
- `Version_Number`: Current version
- `Is_Latest_Version`: Latest version flag
- `Parent_Document_ID` (FK): Previous version reference
- `Is_Public`: Public access flag
- `Uploaded_By` (FK): Uploading officer

**Document Types**:
- `TENDER_NOTICE`: Official tender announcement
- `TECHNICAL_SPECIFICATION`: Technical requirements
- `BID_DOCUMENT`: Bid submission forms
- `TERMS_CONDITIONS`: Legal terms
- `CLARIFICATION`: Response to vendor questions
- `ADDENDUM`: Tender modifications
- `EVALUATION_REPORT`: Bid evaluation results
- `AWARD_NOTICE`: Contract award notification
- `CONTRACT`: Final contract document
- `OTHER`: Miscellaneous documents

**Design Rationale**:
- SHA-256 hashing ensures document integrity
- Version chain through self-referencing FK
- Access control through public/authentication flags
- File metadata for proper handling
- Archive capability without deletion

#### 4.2 Document_Version_History Table
**Purpose**: Historical snapshot of document versions

**Key Attributes**:
- `Version_History_ID` (PK): Unique version record
- `Document_ID` (FK): Parent document
- `Version_Number`: Version identifier
- `File_Path`: Historical file location
- `File_Hash`: Historical file hash
- `Change_Description`: Version change notes
- `Created_By` (FK): Version creator

**Design Rationale**:
- Maintains complete version history
- Unique constraint on (Document_ID, Version_Number)
- Enables rollback and comparison
- Tracks change rationale

#### 4.3 Document_Access_Log Table
**Purpose**: Audit trail for document access

**Key Attributes**:
- `Access_Log_ID` (PK): Unique log entry
- `Document_ID` (FK): Accessed document
- `Accessed_By` (FK): User accessing document
- `Access_Type`: VIEW or DOWNLOAD
- `IP_Address`: Client IP address
- `User_Agent`: Browser/client information
- `Accessed_At`: Access timestamp

**Design Rationale**:
- Complete access audit trail
- Security monitoring capability
- Usage analytics support
- Compliance tracking

## Tender Status Lifecycle

### Status Definitions

1. **DRAFT**
   - Initial tender creation state
   - Editable by creator
   - Not visible to vendors
   - **Transitions to**: PENDING_APPROVAL

2. **PENDING_APPROVAL**
   - Submitted for management review
   - Read-only for creator
   - Requires approval by authorized officer
   - **Transitions to**: APPROVED, DRAFT (rejected)

3. **APPROVED**
   - Approved by management
   - Ready for publication
   - Scheduling possible
   - **Transitions to**: PUBLISHED

4. **PUBLISHED**
   - Live and visible to vendors
   - Accepting bid submissions
   - Limited modifications (requires addendum)
   - **Transitions to**: CLARIFICATION, SUBMISSION_CLOSED, CANCELLED, SUSPENDED

5. **CLARIFICATION**
   - Active clarification period
   - Vendors can submit questions
   - Officers provide answers
   - **Transitions to**: PUBLISHED, SUBMISSION_CLOSED

6. **SUBMISSION_CLOSED**
   - Bid submission deadline passed
   - No new submissions accepted
   - Preparing for evaluation
   - **Transitions to**: UNDER_EVALUATION

7. **UNDER_EVALUATION**
   - Bids being evaluated
   - Evaluation committee active
   - Confidential process
   - **Transitions to**: AWARDED

8. **AWARDED**
   - Winner selected
   - Contract being prepared
   - Award notice published
   - **Transitions to**: COMPLETED

9. **CANCELLED**
   - Tender cancelled
   - Terminal state
   - Reason required
   - **Transitions to**: None

10. **SUSPENDED**
    - Temporarily paused
    - Investigation or correction needed
    - **Transitions to**: PUBLISHED, CANCELLED

11. **COMPLETED**
    - Contract finalized
    - Terminal state (success)
    - **Transitions to**: None

### State Transition Rules

```
                            ┌─────────────┐
                            │    DRAFT    │
                            └──────┬──────┘
                                   │
                            ┌──────▼──────┐
                     ┌──────┤   PENDING   ├──────┐
                     │      │  APPROVAL   │      │
                     │      └──────┬──────┘      │
                     │             │             │
                     │      ┌──────▼──────┐      │
                     │      │  APPROVED   │      │
                     │      └──────┬──────┘      │
                     │             │             │
                     │      ┌──────▼──────┐      │
                     │      │ PUBLISHED   │      │
                     │      └──┬───┬───┬──┘      │
                     │         │   │   │         │
                     │    ┌────▼┐  │  ┌▼────┐    │
                     │    │CLARI│  │  │SUSP │    │
                     │    │FICAT│  │  │ENDED│    │
                     │    │ION  │  │  └─┬───┘    │
                     │    └────┬┘  │    │        │
                     │         │   │    │        │
                     │      ┌──▼───▼┐   │        │
                     │      │SUBMIS │   │        │
                     │      │CLOSED │   │        │
                     │      └───┬───┘   │        │
                     │          │       │        │
                     │      ┌───▼────┐  │        │
                     │      │ UNDER  │  │        │
                     │      │ EVAL   │  │        │
                     │      └───┬────┘  │        │
                     │          │       │        │
                     │      ┌───▼────┐  │        │
                     │      │AWARDED │  │        │
                     │      └───┬────┘  │        │
                     │          │       │        │
                     │      ┌───▼────┐  │        │
                     │      │COMPLET │  │        │
                     │      │  ED    │  │        │
                     │      └────────┘  │        │
                     │                  │        │
                     │      ┌───────────▼┐       │
                     └──────►  CANCELLED ◄───────┘
                            └────────────┘
```

## CPV Hierarchy

### Hierarchy Levels

The CPV classification system uses a 5-level hierarchy:

**Example: IT Services Classification**

```
Level 1 (Division): 72000000-5 - IT services
    │
    ├── Level 2 (Group): 72100000-6 - Hardware consultancy services
    │   │
    │   ├── Level 3 (Class): 72110000-9 - Consultancy services
    │   │   │
    │   │   └── Level 4 (Category): 72111000-6 - Computer audit services
    │   │
    │   └── Level 3 (Class): 72120000-2 - Configuration services
    │
    └── Level 2 (Group): 72200000-7 - Software programming services
        │
        └── Level 3 (Class): 72210000-0 - Programming services
            │
            └── Level 4 (Category): 72211000-7 - Software development
                │
                └── Level 5 (Subcategory): 72211100-8 - Custom software
```

### Querying CPV Hierarchy

The schema includes a recursive view `v_cpv_hierarchy` for easy navigation:

```sql
-- Get full hierarchy path for any CPV code
SELECT * FROM v_cpv_hierarchy 
WHERE CPV_Code = '72211100-8';

-- Result includes:
-- Path: 72000000-5 > 72200000-7 > 72210000-0 > 72211000-7 > 72211100-8
-- Full_Path: IT services > Software programming > ... > Custom software
```

## Document Versioning

### Versioning Strategy

The schema implements a complete document versioning system:

1. **Version Chain**: Documents link to previous versions via `Parent_Document_ID`
2. **Version Numbers**: Sequential integer versioning (1, 2, 3, ...)
3. **Latest Flag**: `Is_Latest_Version` marks current version
4. **Version History**: Separate table maintains complete history

### Example Version Lifecycle

```
Document Created (Version 1)
    │
    │ (Amendment needed)
    │
    ├── New Document Created (Version 2)
    │   │   - Parent_Document_ID → Version 1
    │   │   - Is_Latest_Version = TRUE
    │   │   - Version 1: Is_Latest_Version = FALSE
    │   │
    │   └── History Entry Created
    │       - Snapshot of Version 2
    │       - Change_Description provided
    │
    └── (Further amendments...)
        │
        └── New Document Created (Version 3)
            - Parent_Document_ID → Version 2
            - Is_Latest_Version = TRUE
            - Version 2: Is_Latest_Version = FALSE
```

### Retrieving Document History

```sql
-- Get all versions of a document
WITH RECURSIVE doc_versions AS (
    -- Start with latest version
    SELECT * FROM Document WHERE Document_ID = :id
    UNION ALL
    -- Get previous versions
    SELECT d.* FROM Document d
    JOIN doc_versions dv ON d.Document_ID = dv.Parent_Document_ID
)
SELECT * FROM doc_versions
ORDER BY Version_Number DESC;
```

## Normalization & Design Principles

### Third Normal Form (3NF) Compliance

#### 1NF (First Normal Form)
✅ All attributes contain atomic values
✅ No repeating groups
✅ Each column contains only one value

**Example**: 
- Phone numbers stored as single values, not comma-separated lists
- Multiple CPV codes handled via junction table, not array

#### 2NF (Second Normal Form)
✅ All non-key attributes fully depend on the primary key
✅ No partial dependencies

**Example**:
- Vendor table: All attributes depend on VendorID
- Tender table: All attributes depend on Tender_Id
- No composite keys with partial dependencies

#### 3NF (Third Normal Form)
✅ No transitive dependencies
✅ All non-key attributes depend only on the primary key

**Example**:
- CPV_Code separate table (not embedded in Tender)
- User authentication separate from Vendor/Officer profiles
- Document metadata separate from Tender

### Design Patterns Applied

#### 1. **Role-Based Inheritance** (User → Vendor/Officer)
- Base User table for common attributes
- Specialized tables for role-specific attributes
- Single point of authentication

#### 2. **Self-Referencing Hierarchy** (CPV_Code, Document)
- Parent-child relationships in same table
- Recursive queries for tree traversal
- Flexible depth levels

#### 3. **Audit Trail Pattern**
- Status history tables
- Access log tables
- Timestamp tracking on all tables

#### 4. **Soft Delete Pattern**
- `Is_Active` flags instead of DELETE
- `Is_Archived` for document retention
- Maintains referential integrity

#### 5. **Versioning Pattern**
- Version numbers with latest flag
- Parent reference for history chain
- Separate history table for snapshots

### Database Constraints

#### Primary Keys
- All tables use UUID primary keys
- Generated via `gen_random_uuid()`
- No sequential ID exposure

#### Foreign Keys
- All relationships enforced
- Appropriate CASCADE/RESTRICT/SET NULL
- Referential integrity maintained

#### Check Constraints
- Email format validation
- CPV code format validation
- Date logic validation
- Positive value validation
- Currency code validation

#### Unique Constraints
- Email uniqueness
- Registration number uniqueness
- Tender reference uniqueness
- CPV code uniqueness
- Composite uniqueness (Tender_CPV)

## Entity Relationship Diagram

### Core Relationships

```
┌──────────┐
│   User   │
└─────┬────┘
      │ 1:1
      ├──────────┐
      │          │
   ┌──▼───┐   ┌─▼──────┐
   │Vendor│   │Officer │
   └──┬───┘   └───┬────┘
      │           │
      │ N        │ N
      │           │
      │     ┌─────▼──────┐
      │     │   Tender   │
      │     └─────┬──────┘
      │           │
      │           │ N:M (via Tender_CPV)
      │           │
      │     ┌─────▼──────┐
      │     │  CPV_Code  │
      │     └─────┬──────┘
      │           │ self-ref
      │           │
      │     ┌─────▼──────┐
      │     │  Document  │
      │     └─────┬──────┘
      │           │
      │           │ 1:N
      │           │
      │     ┌─────▼──────────────┐
      │     │ Doc_Version_History│
      │     └────────────────────┘
      │           │ 1:N
      │     ┌─────▼──────────────┐
      │     │ Doc_Access_Log     │
      └─────►────────────────────┘
               (Accessed_By)

Additional Relationships:
- Tender_Status_History → Tender (N:1)
- Clarification → Tender, Vendor (via separate schema)
- Addendum → Tender (via separate schema)
```

### Cardinality Summary

| Relationship | Type | Description |
|-------------|------|-------------|
| User → Vendor | 1:1 | One user can be one vendor |
| User → Officer | 1:1 | One user can be one officer |
| Officer → Tender (Created_By) | 1:N | Officer creates many tenders |
| Officer → Tender (Approved_By) | 1:N | Officer approves many tenders |
| Tender → CPV_Code | N:M | Tender has multiple CPV codes |
| CPV_Code → CPV_Code | 1:N | Hierarchical parent-child |
| Tender → Document | 1:N | Tender has many documents |
| Document → Document | 1:N | Version chain |
| Document → Doc_Version_History | 1:N | Document has version snapshots |
| User → Doc_Access_Log | 1:N | User accesses many documents |

## Indexes & Performance

### Index Strategy

#### 1. **Primary Key Indexes** (Automatic)
- All tables have UUID primary keys
- Automatically indexed by PostgreSQL

#### 2. **Foreign Key Indexes**
Every foreign key column is indexed:
- `idx_vendor_user`, `idx_officer_user`
- `idx_tender_cpv`, `idx_tender_created_by`
- `idx_document_tender`, `idx_document_uploaded_by`

#### 3. **Query Optimization Indexes**
Common query patterns indexed:
- Status filtering: `idx_tender_status`
- Date range queries: `idx_tender_publication_date`, `idx_tender_submission_deadline`
- Vendor searches: `idx_vendor_company`, `idx_vendor_registration`
- Document searches: `idx_document_type`, `idx_document_latest`

#### 4. **Composite Indexes**
For multi-column queries:
- `idx_tender_cpv_primary (Tender_Id, Is_Primary)`
- `idx_doc_version_number (Document_ID, Version_Number)`

### Query Performance Tips

1. **Use indexed columns in WHERE clauses**
   ```sql
   -- Good (uses index)
   SELECT * FROM Tender WHERE Status = 'PUBLISHED';
   
   -- Good (uses index)
   SELECT * FROM Tender WHERE Submission_Deadline > NOW();
   ```

2. **Leverage composite indexes**
   ```sql
   -- Uses composite index efficiently
   SELECT * FROM Tender_CPV 
   WHERE Tender_Id = :id AND Is_Primary = TRUE;
   ```

3. **Use views for complex queries**
   ```sql
   -- Pre-optimized view
   SELECT * FROM v_active_tenders;
   ```

4. **Avoid function calls on indexed columns**
   ```sql
   -- Bad (index not used)
   SELECT * FROM "User" WHERE LOWER(Email) = 'test@example.com';
   
   -- Good (uses CITEXT index)
   SELECT * FROM "User" WHERE Email = 'test@example.com';
   ```

### Expected Query Performance

Based on indexed design:

| Query Type | Expected Performance |
|-----------|---------------------|
| Single tender by ID | < 1ms |
| Tenders by status | < 10ms (1000s records) |
| Active tenders view | < 20ms |
| CPV hierarchy query | < 50ms (recursive) |
| Document version history | < 10ms |
| User authentication | < 5ms |

## Views & Helper Queries

### 1. Active Tenders View (`v_active_tenders`)
Returns currently active tenders with key information:
- Published or in clarification
- Not past deadline
- Includes CPV and officer information

### 2. Tender Documents View (`v_tender_documents`)
Lists all active documents with tender information:
- Document metadata
- Version information
- Access control flags

### 3. CPV Hierarchy View (`v_cpv_hierarchy`)
Recursive view showing complete CPV paths:
- Full code path
- Full description path
- All active codes

## Security Considerations

### 1. **Authentication**
- Password hashing (bcrypt/argon2 recommended)
- Email verification required
- Account activation control

### 2. **Authorization**
- Role-based access control (RBAC)
- Officer authority levels
- Document access flags

### 3. **Audit Trail**
- All status changes logged
- Document access logged
- Officer accountability tracked

### 4. **Data Integrity**
- SHA-256 file hashing
- Foreign key constraints
- Check constraints for business rules

### 5. **Data Protection**
- Soft delete (no data loss)
- Version history (no overwrite)
- Blacklist with reason (accountability)

## Integration with Clarification & Addenda Module

The core schema integrates seamlessly with the existing Clarification & Addenda module:

1. **Foreign Key References**:
   - Clarification table references `Tender(Tender_Id)`
   - Clarification table references `Vendor(VendorID)`
   - Clarification_Reply references `Officer(Officer_ID)`
   - Addendum references `Tender(Tender_Id)` and `Officer(Officer_ID)`

2. **Status Coordination**:
   - Tender status includes `CLARIFICATION` for active Q&A period
   - Document types include `CLARIFICATION` and `ADDENDUM`

3. **Notification Integration**:
   - Notification table references core entities
   - Audit_Log tracks changes across all modules

## Maintenance & Operations

### Database Initialization

1. Run core schema first: `database/schema.sql`
2. Run module schemas: `database/clarifcation_and_addenda/schema.sql`
3. Order matters due to foreign key dependencies

### Schema Updates

When updating schema:
1. Create migration scripts (never modify base schema)
2. Test on staging environment
3. Backup production before applying
4. Use transactions for all DDL

### Regular Maintenance

1. **Vacuum**: Run weekly for performance
2. **Analyze**: Update statistics after bulk operations
3. **Index Maintenance**: Monitor slow queries
4. **Archive**: Move old completed tenders periodically

### Monitoring Queries

```sql
-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Check slow queries (requires pg_stat_statements)
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## Future Enhancements

### Potential Extensions

1. **Bid Submission Module**
   - Bid table with vendor submissions
   - Technical and financial evaluation tables
   - Score calculation and ranking

2. **Contract Management Module**
   - Contract table extending awarded tenders
   - Performance tracking
   - Payment milestones

3. **Vendor Performance Module**
   - Performance ratings
   - Delivery history
   - Quality scores

4. **Advanced Analytics Module**
   - Tender statistics
   - Vendor analytics
   - Budget tracking

5. **Multi-tenancy Support**
   - Organization table
   - Tenant isolation
   - Cross-organization procurement

## Conclusion

The TenderEase.LK core database schema provides a robust foundation for a complete tender management system. Key features include:

- ✅ Complete tender lifecycle management
- ✅ Hierarchical CPV classification
- ✅ Full document versioning
- ✅ Comprehensive audit trails
- ✅ Third normal form (3NF) compliance
- ✅ Performance-optimized with strategic indexes
- ✅ Security-first design
- ✅ Integration-ready with existing modules

The schema is designed for scalability, maintainability, and compliance with public procurement best practices.

---

**Document Version**: 1.0  
**Last Updated**: 2024-02-16  
**Schema Version**: 1.0  
**Contact**: Development Team - TenderEase.LK
