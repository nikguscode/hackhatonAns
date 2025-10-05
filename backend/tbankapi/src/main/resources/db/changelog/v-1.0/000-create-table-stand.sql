--changeset nikguscode:create-table-stand
CREATE TABLE stand (
  id UUID PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  volunteer_full_name VARCHAR(120) NOT NULL,
  activity_type VARCHAR(120) NOT NULL,
  stand_date timestamptz NOT NULL
);