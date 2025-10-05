--changeset nikguscode:recreate-table-machine

DROP TABLE IF EXISTS machine CASCADE;

CREATE TABLE machine (
    id UUID PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    registration_date_time timestamptz NOT NULL,
    expiration_date_time timestamptz NOT NULL
);