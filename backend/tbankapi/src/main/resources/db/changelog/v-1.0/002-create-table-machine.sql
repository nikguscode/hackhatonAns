--changeset nikguscode:create-table-machine
CREATE TABLE machine (
  id UUID PRIMARY KEY,
  token VARCHAR NOT NULL,
  type VARCHAR
);