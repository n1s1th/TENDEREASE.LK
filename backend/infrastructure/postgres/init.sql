-- Create databases for each service
CREATE DATABASE tenderease_user_db;
CREATE DATABASE tenderease_tender_db;
CREATE DATABASE tenderease_bid_db;
CREATE DATABASE tenderease_evaluation_db;
CREATE DATABASE tenderease_workflow_db;
CREATE DATABASE tenderease_contract_db;
CREATE DATABASE tenderease_payment_db;
CREATE DATABASE tenderease_document_db;
CREATE DATABASE tenderease_notification_db;
CREATE DATABASE tenderease_officer_dashboard_db;
CREATE DATABASE tenderease_clarification_db;
CREATE DATABASE tenderease_qa_db;
CREATE DATABASE tenderease_appeal_db;
CREATE DATABASE tenderease_reporting_db;
CREATE DATABASE keycloak;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE tenderease_user_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE tenderease_tender_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE tenderease_bid_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE tenderease_evaluation_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE tenderease_workflow_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE tenderease_contract_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE tenderease_payment_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE tenderease_document_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE tenderease_notification_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE tenderease_officer_dashboard_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE tenderease_clarification_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE tenderease_qa_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE tenderease_appeal_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE tenderease_reporting_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE keycloak TO postgres;
