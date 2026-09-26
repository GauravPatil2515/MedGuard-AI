-- Supabase / PostgreSQL Migration: Medication Risk Flags
-- -------------------------------------------------------------
-- Creates table to persist deep risk analysis results (DDI interactions,
-- adverse events/side effects, conditions, and clinical review flags)
-- generated downstream of OCR and risk_pipeline.py.

CREATE TABLE IF NOT EXISTS medication_risk_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id TEXT,
    patient_id TEXT,
    raw_ocr_text TEXT,
    drugs JSONB DEFAULT '[]'::jsonb,
    conditions JSONB DEFAULT '[]'::jsonb,
    interactions JSONB DEFAULT '[]'::jsonb,
    side_effects JSONB DEFAULT '[]'::jsonb,
    needs_review BOOLEAN DEFAULT FALSE,
    max_severity TEXT DEFAULT 'SAFE', -- 'SAFE', 'Minor', 'Moderate', 'Major'
    disclaimer TEXT DEFAULT 'AI-generated, not a substitute for professional medical advice.',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for fast queries by patient or prescription
CREATE INDEX IF NOT EXISTS idx_medication_risk_flags_patient ON medication_risk_flags(patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_risk_flags_needs_review ON medication_risk_flags(needs_review);
CREATE INDEX IF NOT EXISTS idx_medication_risk_flags_created_at ON medication_risk_flags(created_at DESC);

-- Optional Row Level Security (RLS) policies
ALTER TABLE medication_risk_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to authenticated users" 
ON medication_risk_flags FOR SELECT 
USING (true);

CREATE POLICY "Allow insert access to service role and authenticated users" 
ON medication_risk_flags FOR INSERT 
WITH CHECK (true);
