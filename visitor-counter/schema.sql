CREATE TABLE IF NOT EXISTS visitor (
  fingerprint TEXT NOT NULL PRIMARY KEY
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS visitor_count (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  total INTEGER NOT NULL CHECK (total >= 0)
);

INSERT INTO visitor_count (id, total)
VALUES (1, 0)
ON CONFLICT DO NOTHING;

CREATE TRIGGER IF NOT EXISTS increment_visitor_count
AFTER INSERT ON visitor
BEGIN
  UPDATE visitor_count SET total = total + 1 WHERE id = 1;
END;
