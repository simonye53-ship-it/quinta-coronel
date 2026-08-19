ALTER TABLE manuals ADD COLUMN cms_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_manuals_cms_key
  ON manuals(cms_key)
  WHERE cms_key IS NOT NULL;

UPDATE manuals
SET cms_key = 'gre2024'
WHERE id = 'gre-2024';

UPDATE manuals
SET cms_key = 'gasesCombustibles'
WHERE id = 'control-gases-combustibles';
