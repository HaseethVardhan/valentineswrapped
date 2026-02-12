-- Enable pgcrypto extension (usually already enabled on Supabase)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to hash a password using bcrypt
CREATE OR REPLACE FUNCTION hash_password(raw_password TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN crypt(raw_password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify a password against a stored hash for a given wrapped slug
CREATE OR REPLACE FUNCTION verify_wrapped_password(wrapped_slug TEXT, raw_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    stored_hash TEXT;
BEGIN
    SELECT password_hash INTO stored_hash
    FROM wrappeds
    WHERE slug = wrapped_slug;

    IF stored_hash IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Legacy support: If not a bcrypt hash (doesn't start with $2), compare as plaintext
    IF left(stored_hash, 2) != '$2' THEN
        RETURN stored_hash = raw_password;
    END IF;

    RETURN stored_hash = crypt(raw_password, stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
