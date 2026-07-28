-- Migration: Add invoice_items table and enhance invoice schema
-- Date: 2025-12-08
-- Description: Adds invoice_items table for line items and updates invoice schema

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  item_code TEXT,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL DEFAULT 0,
  discount INTEGER DEFAULT 0,
  tax_rate INTEGER DEFAULT 0,
  line_total INTEGER NOT NULL,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for invoice_items
CREATE INDEX IF NOT EXISTS invoice_item_invoice_id_idx ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS invoice_item_sort_order_idx ON invoice_items(sort_order);

-- Add comment
COMMENT ON TABLE invoice_items IS 'Line items for invoices with detailed pricing and tax information';
