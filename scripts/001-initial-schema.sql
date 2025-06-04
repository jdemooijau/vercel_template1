-- Database schema for data mapping platform
-- Run this script to create the initial database structure

-- Data Contracts table
CREATE TABLE IF NOT EXISTS data_contracts (
    id VARCHAR(255) PRIMARY KEY,
    specification_version VARCHAR(50) NOT NULL DEFAULT '0.9.3',
    title VARCHAR(500) NOT NULL,
    version VARCHAR(100) NOT NULL,
    description TEXT,
    owner VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_url VARCHAR(500),
    tags JSON,
    servers JSON,
    terms JSON,
    models JSON NOT NULL,
    service_level JSON,
    quality_metrics JSON,
    pricing_info JSON,
    collaboration_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    status ENUM('draft', 'active', 'deprecated', 'archived') DEFAULT 'draft'
);

-- Mapping Projects table
CREATE TABLE IF NOT EXISTS mapping_projects (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    source_contract_id VARCHAR(255),
    target_contract_id VARCHAR(255),
    status ENUM('draft', 'in_progress', 'completed', 'failed', 'archived') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    metadata JSON,
    FOREIGN KEY (source_contract_id) REFERENCES data_contracts(id) ON DELETE SET NULL,
    FOREIGN KEY (target_contract_id) REFERENCES data_contracts(id) ON DELETE SET NULL
);

-- File Uploads table
CREATE TABLE IF NOT EXISTS file_uploads (
    id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    filename VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    file_type ENUM('source_document', 'target_document', 'source_sample', 'target_sample') NOT NULL,
    mime_type VARCHAR(255),
    file_size BIGINT,
    file_path VARCHAR(1000),
    upload_status ENUM('uploading', 'completed', 'failed', 'processing') DEFAULT 'uploading',
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(255) NOT NULL,
    FOREIGN KEY (project_id) REFERENCES mapping_projects(id) ON DELETE CASCADE
);

-- Mapping Rules table
CREATE TABLE IF NOT EXISTS mapping_rules (
    id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    source_field VARCHAR(500) NOT NULL,
    target_field VARCHAR(500) NOT NULL,
    transformation TEXT,
    confidence_score DECIMAL(5,2) DEFAULT 0.00,
    status ENUM('suggested', 'confirmed', 'modified', 'rejected') DEFAULT 'suggested',
    validation_status ENUM('valid', 'invalid', 'warning', 'pending') DEFAULT 'pending',
    validation_message TEXT,
    source_contract_field JSON,
    target_contract_field JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    modified_by VARCHAR(255),
    FOREIGN KEY (project_id) REFERENCES mapping_projects(id) ON DELETE CASCADE
);

-- Validation Results table
CREATE TABLE IF NOT EXISTS validation_results (
    id VARCHAR(255) PRIMARY KEY,
    rule_id VARCHAR(255) NOT NULL,
    project_id VARCHAR(255) NOT NULL,
    is_valid BOOLEAN NOT NULL,
    severity ENUM('error', 'warning', 'info') NOT NULL,
    message TEXT NOT NULL,
    suggestion TEXT,
    validator_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rule_id) REFERENCES mapping_rules(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES mapping_projects(id) ON DELETE CASCADE
);

-- Contract Enrichments table
CREATE TABLE IF NOT EXISTS contract_enrichments (
    id VARCHAR(255) PRIMARY KEY,
    contract_id VARCHAR(255) NOT NULL,
    enrichment_type ENUM('quality', 'pricing', 'collaboration', 'sla', 'lineage') NOT NULL,
    source ENUM('ai_analysis', 'user_input', 'system_monitoring', 'external_api') NOT NULL,
    confidence_score DECIMAL(5,2) DEFAULT 0.00,
    data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    FOREIGN KEY (contract_id) REFERENCES data_contracts(id) ON DELETE CASCADE
);

-- Data Queue (LDQ) table
CREATE TABLE IF NOT EXISTS data_queue (
    reqid VARCHAR(255) PRIMARY KEY,
    filename VARCHAR(500) NOT NULL,
    file_type ENUM('in', 'out') NOT NULL,
    app_name VARCHAR(255) NOT NULL,
    sftp_user VARCHAR(255),
    country_code VARCHAR(10),
    customer_id VARCHAR(255),
    ident1 VARCHAR(255),
    ident2 VARCHAR(255),
    file_size BIGINT,
    file_path VARCHAR(1000),
    status ENUM('pending', 'processing', 'completed', 'failed', 'archived') DEFAULT 'pending',
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    error_message TEXT
);

-- Transformation Jobs table
CREATE TABLE IF NOT EXISTS transformation_jobs (
    id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    source_file_id VARCHAR(255),
    ldq_file_id VARCHAR(255),
    status ENUM('queued', 'running', 'completed', 'failed', 'cancelled') DEFAULT 'queued',
    total_records BIGINT DEFAULT 0,
    processed_records BIGINT DEFAULT 0,
    successful_records BIGINT DEFAULT 0,
    failed_records BIGINT DEFAULT 0,
    warnings JSON,
    error_message TEXT,
    output_file_path VARCHAR(1000),
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    FOREIGN KEY (project_id) REFERENCES mapping_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (source_file_id) REFERENCES file_uploads(id) ON DELETE SET NULL,
    FOREIGN KEY (ldq_file_id) REFERENCES data_queue(reqid) ON DELETE SET NULL
);

-- Users table (basic user management)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'data_steward', 'analyst', 'viewer') DEFAULT 'analyst',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Audit Log table
CREATE TABLE IF NOT EXISTS audit_log (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_mapping_projects_status ON mapping_projects(status);
CREATE INDEX idx_mapping_projects_created_by ON mapping_projects(created_by);
CREATE INDEX idx_mapping_rules_project_id ON mapping_rules(project_id);
CREATE INDEX idx_mapping_rules_status ON mapping_rules(status);
CREATE INDEX idx_file_uploads_project_id ON file_uploads(project_id);
CREATE INDEX idx_data_queue_status ON data_queue(status);
CREATE INDEX idx_data_queue_app_name ON data_queue(app_name);
CREATE INDEX idx_transformation_jobs_status ON transformation_jobs(status);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
