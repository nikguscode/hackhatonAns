--changeset nikguscode:create-table-employee
DROP TABLE employee;

CREATE TABLE employee (
  id UUID PRIMARY KEY,
  stand_id UUID NOT NULL,
  machine_id UUID,
  login VARCHAR NOT NULL,
  password VARCHAR NOT NULL,
  first_name VARCHAR NOT NULL,
  second_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL
);