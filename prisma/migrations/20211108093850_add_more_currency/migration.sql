-- Default values
INSERT INTO currency_master (code, "name", status) VALUES('VNDC', 'VNDC', 1);
INSERT INTO currency_master (code, "name", status) VALUES('BAMI', 'BAMI', 1);
INSERT INTO currency_master (code, "name", status) VALUES('KAI', 'KARDIA', 1);
UPDATE currency_master SET status = 0, updated_at = current_timestamp where code = 'BTC';

-- Create index
CREATE INDEX IF NOT EXISTS "cashback_transaction.idx_receiver_id" ON cashback_transaction USING btree (receiver_id);
