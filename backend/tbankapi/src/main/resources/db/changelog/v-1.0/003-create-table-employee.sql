--changeset nikguscode:create-table-employee
CREATE TABLE employee (
  id UUID PRIMARY KEY,
  machine_id UUID,
  first_name VARCHAR NOT NULL,
  second_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL
);