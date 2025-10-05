--changeset nikguscode:recreate-table-stand
DROP TABLE stand;

CREATE TABLE stand (
  id UUID PRIMARY KEY,
  employee_id UUID NOT NULL,
  name VARCHAR(120) NOT NULL,
  activity_type VARCHAR(120) NOT NULL,
  creating_date_time timestamptz NOT NULL,
  end_date_time timestamptz NOT NULL
);