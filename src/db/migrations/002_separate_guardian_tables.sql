CREATE TABLE IF NOT EXISTS system_guardians (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    phone_number TEXT NOT NULL CHECK (phone_number <> '' AND char_length(phone_number) = 13),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);