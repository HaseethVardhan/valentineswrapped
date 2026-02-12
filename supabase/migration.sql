-- Drop old pages table (data migrated into wrappeds.data)
DROP TABLE IF EXISTS pages;

-- Alter wrappeds table to add JSONB data column
ALTER TABLE wrappeds
  ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{"pages": []}'::jsonb;

-- Migrate existing page data into wrappeds.data (if pages table still exists)
-- Run this BEFORE dropping pages if you have existing data:
-- UPDATE wrappeds w SET data = jsonb_build_object(
--   'pages', COALESCE((
--     SELECT jsonb_agg(
--       jsonb_build_object(
--         'id', p.id,
--         'type', p.type,
--         'order', p.order,
--         'content', p.content,
--         'theme', p.theme
--       ) ORDER BY p.order
--     )
--     FROM pages p WHERE p.wrapped_id = w.id
--   ), '[]'::jsonb)
-- );
