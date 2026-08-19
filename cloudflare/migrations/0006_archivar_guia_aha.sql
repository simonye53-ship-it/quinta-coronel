-- Retiro reversible: la guía AHA se conserva en R2/D1, pero queda fuera del
-- catálogo, la búsqueda documental y el dataset visual activo.
UPDATE manuals
SET status = 'archived', updated_at = CURRENT_TIMESTAMP
WHERE id = 'guia-ace-rcp-2020';
