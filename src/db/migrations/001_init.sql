CREATE TYPE ACCOUNT_STATUS AS ENUM ('ACTIVE', 'BLOCKED', 'PENDING', 'RESETTING_PASSWORD', 'DELETED');

CREATE TABLE IF NOT EXISTS accounts (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    address TEXT UNIQUE CHECK (address <> '' AND char_length(address) = 42),
    activated_on_chain BOOLEAN NOT NULL DEFAULT FALSE,
    activated_on_ussd BOOLEAN NOT NULL DEFAULT FALSE,
    language TEXT NOT NULL,
    password TEXT,
    phone_number TEXT UNIQUE NOT NULL CHECK (phone_number <> '' AND char_length(phone_number) = 13),
    pin_attempts INT NOT NULL DEFAULT 2,
    status ACCOUNT_STATUS NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "sessions" (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ext_id TEXT UNIQUE CHECK (ext_id <> ''),
    inputs TEXT[] NOT NULL,
    machine_state TEXT NOT NULL CHECK (machine_state <> ''),
    phone_number TEXT NOT NULL CHECK (phone_number <> '' AND char_length(phone_number) = 13),
    responses TEXT[] NOT NULL,
    service_code TEXT NOT NULL CHECK (service_code <> ''),
    version INT NOT NULL CHECK (version >= 1),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE TASK_TYPE AS ENUM ('REGISTER', 'TRANSFER', 'QUERY_BALANCE');

CREATE TABLE IF NOT EXISTS custodial_tasks (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    address TEXT NOT NULL CHECK (address <> '' AND char_length(address) = 42),
    task_reference TEXT NOT NULL UNIQUE,
    task_type TASK_TYPE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
---- create above / drop below ----

DROP TYPE IF EXISTS ACCOUNT_STATUS;
DROP TYPE IF EXISTS TASK_TYPE;
DROP TABLE IF EXISTS custodial_tasks;
DROP TABLE IF EXISTS ussd_sessions;
DROP TABLE IF EXISTS accounts;