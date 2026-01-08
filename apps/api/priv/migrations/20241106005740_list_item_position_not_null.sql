WITH ranked_items AS (
  SELECT
    id,
    list_id,
    ROW_NUMBER() OVER (PARTITION BY list_id ORDER BY created_at) AS row_num
  FROM
    list_items
)
UPDATE list_items
SET position = ranked_items.row_num
FROM ranked_items
WHERE list_items.id = ranked_items.id;

ALTER TABLE "list_items" ALTER COLUMN "position" SET NOT NULL;


CREATE OR REPLACE FUNCTION set_position()
RETURNS TRIGGER AS $$
BEGIN
  NEW.position := COALESCE((SELECT MAX(position) FROM list_items WHERE list_id = NEW.list_id), 0) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_position
BEFORE INSERT ON list_items
FOR EACH ROW
EXECUTE FUNCTION set_position();