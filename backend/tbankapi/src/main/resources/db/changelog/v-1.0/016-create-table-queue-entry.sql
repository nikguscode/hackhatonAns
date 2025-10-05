--changeset nikguscode:create-table-queue-entry

CREATE TABLE queue_entry (
    id UUID PRIMARY KEY,
    stand_id UUID NOT NULL,
    machine_id UUID,
    queued_at timestamptz NOT NULL DEFAULT NOW(),
    session_start timestamptz,
    session_end timestamptz,
    status queue_entry_status NOT NULL DEFAULT 'WAITING',
    people_ahead INT NOT NULL DEFAULT 0
);