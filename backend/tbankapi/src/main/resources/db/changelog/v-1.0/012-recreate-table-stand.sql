--changeset nikguscode:recreate-table-stand-with-enum

DROP TABLE IF EXISTS stand;

CREATE TABLE stand (
  id UUID PRIMARY KEY,
  name VARCHAR(120) NOT NULL,

  activity_type ACTIVITY_TYPE NOT NULL,

  start_date_time timestamptz NOT NULL,
  end_date_time timestamptz NOT NULL
);