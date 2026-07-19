-- PostgreSQL requires newly-added enum values to commit before a later migration uses them.
ALTER TYPE notification_delivery_status ADD VALUE IF NOT EXISTS 'queued';
ALTER TYPE notification_delivery_status ADD VALUE IF NOT EXISTS 'retrying';
