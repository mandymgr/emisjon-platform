-- Create emissions table
CREATE TABLE IF NOT EXISTS emissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    presentation_material TEXT,
    shares_before INTEGER NOT NULL DEFAULT 0,
    new_shares_offered INTEGER NOT NULL,
    shares_after INTEGER GENERATED ALWAYS AS (shares_before + new_shares_offered) STORED,
    price_per_share DECIMAL(10, 2) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PREVIEW' CHECK (status IN ('PREVIEW', 'ACTIVE', 'COMPLETED', 'FINALIZED')),
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Create index for status for faster queries
CREATE INDEX idx_emissions_status ON emissions(status);

-- Create index for date range queries
CREATE INDEX idx_emissions_dates ON emissions(start_date, end_date);

-- Create trigger to update updated_at on row update
CREATE TRIGGER update_emissions_updated_at
AFTER UPDATE ON emissions
FOR EACH ROW
BEGIN
    UPDATE emissions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;