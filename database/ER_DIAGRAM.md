# Entity Relationship Diagram - TenderEase.LK Core Schema

## Interactive Diagram

The complete ER diagram is available on Lucid:
- **View/Edit**: https://lucid.app/lucidchart/11dbc4b2-2532-493f-8d60-ea68b4419bc6/edit

## Text-Based ER Diagram

### Core Entities and Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER MANAGEMENT                              │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────┐
    │       User           │
    ├──────────────────────┤
    │ PK User_ID           │
    │    Email (UNIQUE)    │
    │    Password_Hash     │
    │    Role              │
    │    Is_Active         │
    │    Is_Verified       │
    │    Last_Login        │
    │    Created_At        │
    │    Updated_At        │
    └──────────┬───────────┘
               │
               │ extends (1:1)
      ┌────────┴────────┐
      │                 │
      ▼                 ▼
┌─────────────┐   ┌──────────────┐
│   Vendor    │   │   Officer    │
├─────────────┤   ├──────────────┤
│ PK VendorID │   │ PK Officer_ID│
│ FK User_ID  │   │ FK User_ID   │
│    Company  │   │    Full_Name │
│    Reg_Num  │   │    Emp_ID    │
│    Contact  │   │    Department│
│    Phone    │   │    Position  │
│    Address  │   │    Authority │
│    Blacklist│   │    Phone     │
└─────┬───────┘   └──────┬───────┘
      │                  │
      │                  │ creates (1:N)
      │                  │ approves (1:N)
      │                  │
      │           ┌──────▼──────────────────────┐
      │           │                              │

┌─────────────────────────────────────────────────────────────────────┐
│                    CPV CLASSIFICATION                                │
└─────────────────────────────────────────────────────────────────────┘

              ┌──────────────────────┐
              │      CPV_Code        │
              ├──────────────────────┤
              │ PK CPV_ID            │
              │    CPV_Code (UNIQUE) │
              │    Description       │
              │    Level (1-5)       │
              │ FK Parent_CPV_ID ────┐
              │    Is_Active         │ │ self-referencing
              │    Created_At        │ │ hierarchy
              └──────────┬───────────┘ │
                         └─────────────┘
                               │
                               │ classifies (N:M via Tender_CPV)
                               │

┌─────────────────────────────────────────────────────────────────────┐
│                      TENDER MANAGEMENT                               │
└─────────────────────────────────────────────────────────────────────┘

                    ┌────────────────────────────┐
                    │         Tender             │
                    ├────────────────────────────┤
                    │ PK Tender_Id               │
                    │    Tender_Reference (UQ)   │
                    │    Title                   │
                    │    Description             │
                    │    Procurement_Method      │
                    │    Procurement_Entity      │
                    │    Status                  │
                    │ FK Primary_CPV_ID          │
                    │    Estimated_Value         │
                    │    Currency                │
                    │    Budget_Code             │
                    │    Publication_Date        │
                    │    Submission_Deadline     │
                    │    Clarification_Deadline  │
                    │    Opening_Date            │
                    │    Bid_Security_Amount     │
                    │    Bid_Validity_Days       │
                    │    Contract_Duration_Days  │
                    │    Eligibility_Criteria    │
                    │    Evaluation_Criteria     │
                    │    Technical_Requirements  │
                    │ FK Created_By (Officer)    │
                    │ FK Approved_By (Officer)   │
                    │    Is_Published            │
                    │    Is_Urgent               │
                    │    Created_At              │
                    │    Updated_At              │
                    └────────────┬───────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
            │                    │                    │
            ▼                    ▼                    ▼
    ┌───────────────┐   ┌──────────────┐   ┌─────────────────┐
    │  Tender_CPV   │   │   Document   │   │ Tender_Status   │
    │  (Junction)   │   │              │   │    History      │
    ├───────────────┤   ├──────────────┤   ├─────────────────┤
    │ PK Mapping_ID │   │ PK Doc_ID    │   │ PK History_ID   │
    │ FK Tender_Id  │   │ FK Tender_Id │   │ FK Tender_Id    │
    │ FK CPV_ID     │   │    Doc_Type  │   │    Prev_Status  │
    │    Is_Primary │   │    Title     │   │    New_Status   │
    │    Created_At │   │    File_Name │   │ FK Changed_By   │
    └───────────────┘   │    File_Path │   │    Change_Reason│
                        │    File_Size │   │    Changed_At   │
                        │    File_Type │   └─────────────────┘
                        │    File_Hash │
                        │    Version_# │
                        │    Is_Latest │
                        │ FK Parent_ID │───┐
                        │    Is_Public │   │ self-ref
                        │ FK Upload_By │   │ versioning
                        │    Is_Active │   │
                        │    Created_At│   │
                        └──────┬───────┘   │
                               └───────────┘
                               │
                  ┌────────────┴────────────┐
                  │                         │
                  ▼                         ▼
        ┌──────────────────┐      ┌─────────────────┐
        │ Document_Version │      │ Document_Access │
        │     History      │      │      Log        │
        ├──────────────────┤      ├─────────────────┤
        │ PK Version_ID    │      │ PK Access_ID    │
        │ FK Document_ID   │      │ FK Document_ID  │
        │    Version_#     │      │ FK Accessed_By  │
        │    File_Path     │      │    Access_Type  │
        │    File_Hash     │      │    IP_Address   │
        │    File_Size     │      │    User_Agent   │
        │    Change_Desc   │      │    Accessed_At  │
        │ FK Created_By    │      └─────────────────┘
        │    Created_At    │
        └──────────────────┘

```

## Detailed Relationship Matrix

| Parent Entity | Child Entity | Relationship Type | Cardinality | Foreign Key | Cascade Rule |
|--------------|--------------|-------------------|-------------|-------------|--------------|
| User | Vendor | Extension | 1:1 | User_ID | CASCADE |
| User | Officer | Extension | 1:1 | User_ID | CASCADE |
| Officer | Tender | Creation | 1:N | Created_By | RESTRICT |
| Officer | Tender | Approval | 1:N | Approved_By | SET NULL |
| CPV_Code | CPV_Code | Hierarchy | 1:N | Parent_CPV_ID | SET NULL |
| CPV_Code | Tender | Classification | 1:N | Primary_CPV_ID | RESTRICT |
| Tender | Tender_CPV | Mapping | 1:N | Tender_Id | CASCADE |
| CPV_Code | Tender_CPV | Mapping | 1:N | CPV_ID | CASCADE |
| Tender | Document | Ownership | 1:N | Tender_Id | CASCADE |
| Document | Document | Versioning | 1:N | Parent_Document_ID | SET NULL |
| Officer | Document | Upload | 1:N | Uploaded_By | RESTRICT |
| Tender | Tender_Status_History | Audit | 1:N | Tender_Id | CASCADE |
| Officer | Tender_Status_History | Action | 1:N | Changed_By | RESTRICT |
| Document | Document_Version_History | History | 1:N | Document_ID | CASCADE |
| Officer | Document_Version_History | Creation | 1:N | Created_By | RESTRICT |
| Document | Document_Access_Log | Audit | 1:N | Document_ID | CASCADE |
| User | Document_Access_Log | Access | 1:N | Accessed_By | CASCADE |

## Entity Attribute Details

### User
- **Primary Key**: User_ID (UUID)
- **Unique Keys**: Email
- **Indexes**: Email, Role, Is_Active
- **Constraints**: Email format validation
- **Triggers**: Auto-update Updated_At

### Vendor
- **Primary Key**: VendorID (UUID)
- **Foreign Keys**: User_ID → User
- **Unique Keys**: User_ID, Registration_Number
- **Indexes**: User_ID, Company_Name, Registration_Number, Is_Blacklisted
- **Triggers**: Auto-update Updated_At

### Officer
- **Primary Key**: Officer_ID (UUID)
- **Foreign Keys**: User_ID → User
- **Unique Keys**: User_ID, Employee_ID
- **Indexes**: User_ID, Employee_ID, Department
- **Triggers**: Auto-update Updated_At

### CPV_Code
- **Primary Key**: CPV_ID (UUID)
- **Foreign Keys**: Parent_CPV_ID → CPV_Code (self)
- **Unique Keys**: CPV_Code
- **Indexes**: CPV_Code, Parent_CPV_ID, Level, Is_Active
- **Constraints**: Level (1-5), CPV format validation
- **Special**: Recursive hierarchy

### Tender
- **Primary Key**: Tender_Id (UUID)
- **Foreign Keys**: 
  - Primary_CPV_ID → CPV_Code
  - Created_By → Officer
  - Approved_By → Officer
- **Unique Keys**: Tender_Reference
- **Indexes**: Multiple (reference, status, CPV, dates, etc.)
- **Constraints**: 
  - Submission > Creation date
  - Clarification < Submission date
  - Positive values
  - Currency code length
- **Triggers**: Auto-update Updated_At

### Tender_CPV
- **Primary Key**: Mapping_ID (UUID)
- **Foreign Keys**: 
  - Tender_Id → Tender
  - CPV_ID → CPV_Code
- **Unique Keys**: (Tender_Id, CPV_ID) composite
- **Indexes**: Tender_Id, CPV_ID, (Tender_Id, Is_Primary)

### Tender_Status_History
- **Primary Key**: History_ID (UUID)
- **Foreign Keys**:
  - Tender_Id → Tender
  - Changed_By → Officer
- **Indexes**: Tender_Id, Changed_At

### Document
- **Primary Key**: Document_ID (UUID)
- **Foreign Keys**:
  - Tender_Id → Tender
  - Parent_Document_ID → Document (self)
  - Uploaded_By → Officer
- **Indexes**: Multiple (tender, type, uploaded_by, latest, etc.)
- **Constraints**: Positive file size, positive version
- **Triggers**: Auto-update Updated_At
- **Special**: Version chain via self-reference

### Document_Version_History
- **Primary Key**: Version_History_ID (UUID)
- **Foreign Keys**:
  - Document_ID → Document
  - Created_By → Officer
- **Unique Keys**: (Document_ID, Version_Number) composite
- **Indexes**: Document_ID, (Document_ID, Version_Number)

### Document_Access_Log
- **Primary Key**: Access_Log_ID (UUID)
- **Foreign Keys**:
  - Document_ID → Document
  - Accessed_By → User
- **Indexes**: Document_ID, Accessed_By, Accessed_At
- **Constraints**: Access_Type in ('VIEW', 'DOWNLOAD')

## Status Flow Diagram

### Tender Status State Machine

```
╔════════════════════════════════════════════════════════════════╗
║                    TENDER LIFECYCLE                             ║
╚════════════════════════════════════════════════════════════════╝

    ┌──────────┐
    │  DRAFT   │ ◄──── Created by Officer
    └────┬─────┘
         │ Submit for approval
         ▼
    ┌──────────┐       Reject
    │ PENDING  ├──────────────────┐
    │ APPROVAL │                  │
    └────┬─────┘                  │
         │ Approve                │
         ▼                        │
    ┌──────────┐                  │
    │ APPROVED │                  │
    └────┬─────┘                  │
         │ Schedule & Publish     │
         ▼                        │
    ┌──────────┐                  │
    │PUBLISHED │ ◄────────────────┘
    └────┬──┬──┘
         │  │
         │  │ Start clarification period
         │  ▼
         │ ┌──────────────┐
         │ │CLARIFICATION │
         │ └──────┬───────┘
         │        │
         │ ◄──────┘
         │
         │ Deadline passes
         ▼
    ┌──────────────┐
    │ SUBMISSION   │
    │   CLOSED     │
    └──────┬───────┘
           │ Begin evaluation
           ▼
    ┌──────────────┐
    │    UNDER     │
    │  EVALUATION  │
    └──────┬───────┘
           │ Select winner
           ▼
    ┌──────────────┐
    │   AWARDED    │
    └──────┬───────┘
           │ Contract signed
           ▼
    ┌──────────────┐
    │  COMPLETED   │ (Terminal State)
    └──────────────┘

    Special States:
    
    ┌──────────┐
    │SUSPENDED │ ◄── Temporary pause (from PUBLISHED)
    └────┬─────┘
         │ Resume
         └──► PUBLISHED
    
    ┌──────────┐
    │CANCELLED │ ◄── Terminal state (from multiple states)
    └──────────┘
```

## CPV Hierarchy Example

### Level Structure with Examples

```
Level 1: DIVISION (XX000000-Y)
│
├─ 45000000-7: Construction work
│  │
│  └─ Level 2: GROUP (XXX00000-Y)
│     │
│     ├─ 45200000-9: Works for complete or part construction
│     │  │
│     │  └─ Level 3: CLASS (XXXX0000-Y)
│     │     │
│     │     ├─ 45210000-2: Building construction work
│     │     │  │
│     │     │  └─ Level 4: CATEGORY (XXXXX000-Y)
│     │     │     │
│     │     │     ├─ 45211000-9: Building construction work for housing
│     │     │     │  │
│     │     │     │  └─ Level 5: SUBCATEGORY (XXXXXXXX-Y)
│     │     │     │     │
│     │     │     │     ├─ 45211100-0: Housing development work
│     │     │     │     ├─ 45211200-1: Multistorey building work
│     │     │     │     └─ 45211300-2: Individual housing construction work
│     │     │     │
│     │     │     └─ 45212000-6: School building construction work
│     │     │
│     │     └─ 45220000-5: Engineering and construction works
│     │
│     └─ 45300000-0: Building installation work
│
└─ 72000000-5: IT services
   │
   └─ Level 2: GROUP (XXX00000-Y)
      │
      ├─ 72200000-7: Software programming
      │  │
      │  └─ Level 3: CLASS (XXXX0000-Y)
      │     │
      │     └─ 72210000-0: Programming services
      │        │
      │        └─ Level 4: CATEGORY (XXXXX000-Y)
      │           │
      │           └─ 72211000-7: Software development
      │              │
      │              └─ Level 5: SUBCATEGORY (XXXXXXXX-Y)
      │                 │
      │                 ├─ 72211100-8: Custom software
      │                 └─ 72211200-9: Package software
      │
      └─ 72300000-8: Data services
```

## Document Version Chain Example

### Version Relationship

```
Document Lifecycle for "Technical Specifications.pdf"

┌─────────────────────────────────────────────────┐
│ Version 1 (Initial)                             │
│ ─────────────────────────────────────────────── │
│ Document_ID: doc-123                            │
│ Parent_Document_ID: NULL                        │
│ Version_Number: 1                               │
│ Is_Latest_Version: FALSE                        │
│ File_Hash: abc123...                            │
│ Created_At: 2024-01-01                          │
└────────────┬────────────────────────────────────┘
             │
             │ Amendment needed (Addendum issued)
             │
             ▼
┌─────────────────────────────────────────────────┐
│ Version 2 (Revised)                             │
│ ─────────────────────────────────────────────── │
│ Document_ID: doc-456                            │
│ Parent_Document_ID: doc-123 ◄──────┐            │
│ Version_Number: 2               │            │
│ Is_Latest_Version: FALSE            │            │
│ File_Hash: def456...                │            │
│ Created_At: 2024-01-15              │            │
└────────────┬────────────────────────┼────────────┘
             │                        │
             │ Further corrections    │ Version chain
             │                        │ via Parent_ID
             ▼                        │
┌─────────────────────────────────────┼────────────┐
│ Version 3 (Final)                   │            │
│ ─────────────────────────────────── │            │
│ Document_ID: doc-789                │            │
│ Parent_Document_ID: doc-456 ◄───────┘            │
│ Version_Number: 3                               │
│ Is_Latest_Version: TRUE ◄── Current version     │
│ File_Hash: ghi789...                            │
│ Created_At: 2024-01-20                          │
└─────────────────────────────────────────────────┘

Each version maintains:
- Complete file metadata
- SHA-256 hash for integrity
- Parent reference for history
- Latest flag for current version

Version History snapshots stored separately in:
Document_Version_History table
```

## Database Schema Statistics

### Table Count by Category

- **User Management**: 3 tables (User, Vendor, Officer)
- **CPV Classification**: 1 table (CPV_Code)
- **Tender Management**: 3 tables (Tender, Tender_CPV, Tender_Status_History)
- **Document Management**: 3 tables (Document, Document_Version_History, Document_Access_Log)

**Total Core Tables**: 10

### Relationship Count

- **1:1 Relationships**: 2 (User→Vendor, User→Officer)
- **1:N Relationships**: 13
- **N:M Relationships**: 1 (Tender↔CPV via junction table)
- **Self-referencing**: 2 (CPV_Code, Document)

**Total Relationships**: 18

### Index Count

- **Primary Key Indexes**: 10 (automatic)
- **Foreign Key Indexes**: 13
- **Search Optimization Indexes**: 15
- **Composite Indexes**: 2

**Total Indexes**: 40

### Constraint Count

- **Primary Keys**: 10
- **Foreign Keys**: 18
- **Unique Constraints**: 8
- **Check Constraints**: 11

**Total Constraints**: 47

## Integration Points

### With Clarification & Addenda Module

```
Clarification Module References:
├─ Tender(Tender_Id) ◄── FK from Clarification
├─ Vendor(VendorID) ◄── FK from Clarification
├─ Officer(Officer_ID) ◄── FK from Clarification_Reply
└─ Officer(Officer_ID) ◄── FK from Addendum

Document Module Integration:
├─ Document.Document_Type includes 'CLARIFICATION'
├─ Document.Document_Type includes 'ADDENDUM'
└─ Tender.Status includes 'CLARIFICATION' state
```

### Future Module Integration Points

```
Planned Integration:
├─ Bid Submission Module
│  ├─ References Tender
│  ├─ References Vendor
│  └─ Uses Document for bid files
│
├─ Evaluation Module
│  ├─ References Tender
│  ├─ References Officer (evaluators)
│  └─ Uses Document for reports
│
└─ Contract Module
   ├─ References Tender (awarded)
   ├─ References Vendor (winner)
   └─ Uses Document for contracts
```

## Diagram Update Instructions

When updating the ER diagram in Lucid:

1. **Access the diagram**: Use the URL provided at the top of this document
2. **Maintain consistency**: 
   - Use the same color scheme for entity types
   - Keep relationship lines clear and labeled
   - Update legend if adding new entity types
3. **Document changes**: 
   - Update version number in diagram
   - Add date of last modification
   - Note significant changes in diagram notes
4. **Export**: 
   - Export as PDF to `docs/diagrams/er/`
   - Export as PNG for quick reference
5. **Update documentation**:
   - Update this file if structure changes
   - Update SCHEMA_DOCUMENTATION.md if needed

## Visualization Legend

### Entity Type Colors (for Lucid diagram)

- **Blue**: User Management entities
- **Green**: CPV Classification
- **Orange**: Tender entities
- **Purple**: Document entities
- **Yellow**: Audit/History entities

### Relationship Line Styles

- **Solid line**: Strong relationship (CASCADE)
- **Dashed line**: Weak relationship (SET NULL)
- **Dotted line**: Self-referencing relationship
- **Double line**: Mandatory relationship (NOT NULL FK)

### Cardinality Notation

- **1**: One (exactly one)
- **0..1**: Zero or one (optional)
- **1..***: One or more (mandatory, multiple)
- **0..***: Zero or more (optional, multiple)
- **N**: Many

---

**Diagram Version**: 1.0  
**Last Updated**: 2024-02-16  
**Schema Version**: 1.0  
**Lucid Diagram**: https://lucid.app/lucidchart/11dbc4b2-2532-493f-8d60-ea68b4419bc6/edit
