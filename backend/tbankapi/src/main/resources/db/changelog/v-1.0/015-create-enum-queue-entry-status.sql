-- changeset nikguscode:create-enum-queue-entry-status

CREATE TYPE queue_entry_status AS ENUM (
    'WAITING',
    'ACTIVE',
    'FINISHED',
    'MOVED_TO_EXTRA'
);