-- Create conversion tracking tables
-- Run this script to set up the database schema for conversion tracking

-- Conversion runs table
CREATE TABLE IF NOT EXISTS conversion_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES data_contracts(id),
    user_id TEXT NOT NULL,
    run_type TEXT NOT NULL CHECK (run_type IN ('manual', 'api', 'scheduled', 'batch')),
    status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration INTEGER, -- in milliseconds
    
    -- Configuration
    source_format TEXT NOT NULL,
    target_format TEXT NOT NULL,
    conversion_options JSONB DEFAULT '{}',
    
    -- Metrics
    total_files INTEGER DEFAULT 0,
    processed_files INTEGER DEFAULT 0,
    failed_files INTEGER DEFAULT 0,
    total_size_bytes BIGINT DEFAULT 0,
    processed_size_bytes BIGINT DEFAULT 0,
    
    -- Results
    success_rate DECIMAL(5,2) DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    warning_count INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    tags TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversion files table
CREATE TABLE IF NOT EXISTS conversion_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES conversion_runs(id) ON DELETE CASCADE,
    file_type TEXT NOT NULL CHECK (file_type IN ('input', 'output', 'intermediate', 'log')),
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    checksum TEXT,
    
    -- Processing info
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
    processed_at TIMESTAMPTZ,
    processing_duration INTEGER, -- in milliseconds
    
    -- File metadata
    schema JSONB,
    row_count INTEGER,
    column_count INTEGER,
    quality JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversion errors table
CREATE TABLE IF NOT EXISTS conversion_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES conversion_runs(id) ON DELETE CASCADE,
    file_id UUID REFERENCES conversion_files(id) ON DELETE CASCADE,
    error_type TEXT NOT NULL CHECK (error_type IN ('validation', 'transformation', 'system', 'network', 'timeout', 'memory')),
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'error', 'warning', 'info')),
    
    -- Error details
    error_code TEXT NOT NULL,
    message TEXT NOT NULL,
    stack_trace TEXT,
    context JSONB,
    
    -- Location info
    step TEXT,
    line_number INTEGER,
    column_number INTEGER,
    field_name TEXT,
    
    -- Resolution
    is_resolved BOOLEAN DEFAULT FALSE,
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversion logs table
CREATE TABLE IF NOT EXISTS conversion_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES conversion_runs(id) ON DELETE CASCADE,
    file_id UUID REFERENCES conversion_files(id) ON DELETE CASCADE,
    level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),
    category TEXT NOT NULL CHECK (category IN ('system', 'validation', 'transformation', 'performance', 'user')),
    
    message TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Performance metrics
    memory_usage BIGINT,
    cpu_usage DECIMAL(5,2),
    duration INTEGER,
    
    -- Context
    step TEXT,
    component TEXT,
    user_id TEXT
);

-- Conversion metrics table
CREATE TABLE IF NOT EXISTS conversion_metrics (
    run_id UUID PRIMARY KEY REFERENCES conversion_runs(id) ON DELETE CASCADE,
    
    -- Performance metrics
    total_duration INTEGER NOT NULL,
    avg_file_processing_time INTEGER NOT NULL,
    peak_memory_usage BIGINT NOT NULL,
    avg_cpu_usage DECIMAL(5,2) NOT NULL,
    
    -- Throughput metrics
    files_per_second DECIMAL(10,2) NOT NULL,
    bytes_per_second BIGINT NOT NULL,
    rows_per_second BIGINT,
    
    -- Quality metrics
    data_quality_score DECIMAL(5,2) NOT NULL,
    validation_errors INTEGER DEFAULT 0,
    transformation_warnings INTEGER DEFAULT 0,
    
    -- Resource usage
    disk_space_used BIGINT NOT NULL,
    network_bytes_transferred BIGINT NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversion_runs_status ON conversion_runs(status);
CREATE INDEX IF NOT EXISTS idx_conversion_runs_user_id ON conversion_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_runs_started_at ON conversion_runs(started_at);
CREATE INDEX IF NOT EXISTS idx_conversion_runs_project_id ON conversion_runs(project_id);

CREATE INDEX IF NOT EXISTS idx_conversion_files_run_id ON conversion_files(run_id);
CREATE INDEX IF NOT EXISTS idx_conversion_files_type ON conversion_files(file_type);
CREATE INDEX IF NOT EXISTS idx_conversion_files_status ON conversion_files(status);

CREATE INDEX IF NOT EXISTS idx_conversion_errors_run_id ON conversion_errors(run_id);
CREATE INDEX IF NOT EXISTS idx_conversion_errors_severity ON conversion_errors(severity);
CREATE INDEX IF NOT EXISTS idx_conversion_errors_type ON conversion_errors(error_type);

CREATE INDEX IF NOT EXISTS idx_conversion_logs_run_id ON conversion_logs(run_id);
CREATE INDEX IF NOT EXISTS idx_conversion_logs_level ON conversion_logs(level);
CREATE INDEX IF NOT EXISTS idx_conversion_logs_timestamp ON conversion_logs(timestamp);

-- Create function to increment error count
CREATE OR REPLACE FUNCTION increment_error_count(run_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE conversion_runs 
    SET error_count = error_count + 1,
        updated_at = NOW()
    WHERE id = run_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update run metrics
CREATE OR REPLACE FUNCTION update_run_metrics(run_id UUID)
RETURNS VOID AS $$
DECLARE
    total_files INTEGER;
    processed_files INTEGER;
    failed_files INTEGER;
    success_rate DECIMAL(5,2);
BEGIN
    -- Calculate file counts
    SELECT COUNT(*) INTO total_files
    FROM conversion_files 
    WHERE run_id = update_run_metrics.run_id AND file_type = 'input';
    
    SELECT COUNT(*) INTO processed_files
    FROM conversion_files 
    WHERE run_id = update_run_metrics.run_id 
    AND file_type = 'input' 
    AND status IN ('completed', 'failed');
    
    SELECT COUNT(*) INTO failed_files
    FROM conversion_files 
    WHERE run_id = update_run_metrics.run_id 
    AND file_type = 'input' 
    AND status = 'failed';
    
    -- Calculate success rate
    IF total_files > 0 THEN
        success_rate := ((total_files - failed_files)::DECIMAL / total_files) * 100;
    ELSE
        success_rate := 0;
    END IF;
    
    -- Update the run
    UPDATE conversion_runs 
    SET total_files = update_run_metrics.total_files,
        processed_files = update_run_metrics.processed_files,
        failed_files = update_run_metrics.failed_files,
        success_rate = update_run_metrics.success_rate,
        updated_at = NOW()
    WHERE id = run_id;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update metrics
CREATE OR REPLACE FUNCTION trigger_update_run_metrics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_run_metrics(NEW.run_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_metrics_on_file_change
    AFTER INSERT OR UPDATE ON conversion_files
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_run_metrics();

-- Enable Row Level Security (optional)
ALTER TABLE conversion_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your authentication system)
CREATE POLICY "Users can view their own runs" ON conversion_runs
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own runs" ON conversion_runs
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own runs" ON conversion_runs
    FOR UPDATE USING (user_id = auth.uid()::text);

-- Similar policies for other tables
CREATE POLICY "Users can view files from their runs" ON conversion_files
    FOR SELECT USING (
        run_id IN (
            SELECT id FROM conversion_runs WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert files to their runs" ON conversion_files
    FOR INSERT WITH CHECK (
        run_id IN (
            SELECT id FROM conversion_runs WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can view errors from their runs" ON conversion_errors
    FOR SELECT USING (
        run_id IN (
            SELECT id FROM conversion_runs WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert errors to their runs" ON conversion_errors
    FOR INSERT WITH CHECK (
        run_id IN (
            SELECT id FROM conversion_runs WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can view logs from their runs" ON conversion_logs
    FOR SELECT USING (
        run_id IN (
            SELECT id FROM conversion_runs WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert logs to their runs" ON conversion_logs
    FOR INSERT WITH CHECK (
        run_id IN (
            SELECT id FROM conversion_runs WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can view metrics from their runs" ON conversion_metrics
    FOR SELECT USING (
        run_id IN (
            SELECT id FROM conversion_runs WHERE user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert metrics for their runs" ON conversion_metrics
    FOR INSERT WITH CHECK (
        run_id IN (
            SELECT id FROM conversion_runs WHERE user_id = auth.uid()::text
        )
    );
