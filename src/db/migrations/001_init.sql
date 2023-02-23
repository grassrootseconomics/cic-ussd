CREATE TYPE ACCOUNT_STATUS AS ENUM ('ACTIVE', 'BLOCKED', 'PENDING', 'RESETTING_PASSWORD', 'DELETED');

CREATE TABLE IF NOT EXISTS accounts (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    blockchain_address TEXT UNIQUE CHECK (blockchain_address <> '' AND char_length(blockchain_address) = 42),
    phone_number TEXT UNIQUE NOT NULL CHECK (phone_number <> '' AND char_length(phone_number) = 13),
    preferred_language TEXT NOT NULL,
    activated_on_chain BOOLEAN NOT NULL DEFAULT FALSE,
    activated_on_ussd BOOLEAN NOT NULL DEFAULT FALSE,
    password TEXT,
    status ACCOUNT_STATUS NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ussd_sessions (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    phone_number TEXT NOT NULL CHECK (phone_number <> '' AND char_length(phone_number) = 13),
    session_id TEXT NOT NULL CHECK (session_id <> ''),
    service_code TEXT NOT NULL CHECK (service_code <> ''),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE TASK_TYPE AS ENUM ('CREATE_ACCOUNT', 'TRANSFER', 'BALANCE_QUERY');

CREATE TABLE IF NOT EXISTS custodial_tasks (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    blockchain_address TEXT NOT NULL CHECK (blockchain_address <> '' AND char_length(blockchain_address) = 42),
    task_type TASK_TYPE NOT NULL,
    task_reference TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

---- create above / drop below ----

DROP TYPE IF EXISTS ACCOUNT_STATUS;
DROP TYPE IF EXISTS TASK_TYPE;
DROP TABLE IF EXISTS custodialTasks;
DROP TABLE IF EXISTS ussdSessions;
DROP TABLE IF EXISTS accounts;