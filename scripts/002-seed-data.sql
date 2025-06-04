-- Seed data for development and testing
-- Run this after the initial schema

-- Insert sample users
INSERT INTO users (id, email, name, role, status) VALUES
('user-1', 'admin@company.com', 'System Administrator', 'admin', 'active'),
('user-2', 'john.smith@company.com', 'John Smith', 'data_steward', 'active'),
('user-3', 'sarah.johnson@company.com', 'Sarah Johnson', 'analyst', 'active'),
('user-4', 'mike.wilson@company.com', 'Mike Wilson', 'analyst', 'active');

-- Insert sample data contracts
INSERT INTO data_contracts (
    id, title, version, description, owner, contact_email, 
    models, status, created_by
) VALUES
(
    'customer-data-v1',
    'Customer Data Contract',
    '1.0.0',
    'Customer information from CRM system',
    'Data Team',
    'john.smith@company.com',
    JSON_OBJECT(
        'customer', JSON_OBJECT(
            'type', 'table',
            'description', 'Customer master data',
            'fields', JSON_OBJECT(
                'id', JSON_OBJECT(
                    'type', 'integer',
                    'description', 'Unique customer identifier',
                    'required', true,
                    'unique', true
                ),
                'email', JSON_OBJECT(
                    'type', 'string',
                    'description', 'Customer email address',
                    'required', true,
                    'format', 'email',
                    'pii', true,
                    'classification', 'confidential'
                ),
                'name', JSON_OBJECT(
                    'type', 'string',
                    'description', 'Customer full name',
                    'required', true,
                    'pii', true,
                    'classification', 'confidential'
                ),
                'created_at', JSON_OBJECT(
                    'type', 'timestamp',
                    'description', 'Account creation timestamp',
                    'required', true
                )
            )
        )
    ),
    'active',
    'user-2'
),
(
    'product-catalog-v1',
    'Product Catalog Contract',
    '1.0.0',
    'Product information for e-commerce platform',
    'Product Team',
    'sarah.johnson@company.com',
    JSON_OBJECT(
        'product', JSON_OBJECT(
            'type', 'table',
            'description', 'Product catalog data',
            'fields', JSON_OBJECT(
                'product_id', JSON_OBJECT(
                    'type', 'string',
                    'description', 'Unique product identifier',
                    'required', true,
                    'unique', true
                ),
                'name', JSON_OBJECT(
                    'type', 'string',
                    'description', 'Product name',
                    'required', true
                ),
                'price', JSON_OBJECT(
                    'type', 'decimal',
                    'description', 'Product price',
                    'required', true
                ),
                'category', JSON_OBJECT(
                    'type', 'string',
                    'description', 'Product category',
                    'required', false
                )
            )
        )
    ),
    'active',
    'user-3'
);

-- Insert sample mapping project
INSERT INTO mapping_projects (
    id, name, description, source_contract_id, target_contract_id,
    status, created_by
) VALUES
(
    'project-1',
    'Customer Data Migration',
    'Migrate customer data from legacy CRM to new system',
    'customer-data-v1',
    'customer-data-v1',
    'draft',
    'user-2'
);

-- Insert sample LDQ entries
INSERT INTO data_queue (
    reqid, filename, file_type, app_name, sftp_user, country_code,
    customer_id, file_size, status
) VALUES
('req-001', 'customer_data.csv', 'in', 'PEXI_IN', 'user1', 'US', 'CUST001', 2097152, 'completed'),
('req-002', 'product_export.xml', 'out', 'G2_OUT', 'user2', 'GB', 'CUST002', 1572864, 'pending'),
('req-003', 'financial_report.xlsx', 'in', 'SAP_EXPORT', 'user1', 'DE', 'CUST003', 5452595, 'processing');
