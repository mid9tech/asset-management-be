-- Drop the existing view if it exists
DROP VIEW IF EXISTS asset_report;

-- Create the new view with fields cast to integer
CREATE VIEW asset_report AS
SELECT
  c."categoryName" AS "category_name",
  COUNT(a.id)::int AS "total",
  SUM(CASE WHEN a."state" = 'ASSIGNED' THEN 1 ELSE 0 END)::int AS "assigned",
  SUM(CASE WHEN a."state" = 'AVAILABLE' THEN 1 ELSE 0 END)::int AS "available",
  SUM(CASE WHEN a."state" = 'NOT_AVAILABLE' THEN 1 ELSE 0 END)::int AS "not_available",
  SUM(CASE WHEN a."state" = 'WAITING_FOR_RECYCLING' THEN 1 ELSE 0 END)::int AS "waiting_for_recycling",
  SUM(CASE WHEN a."state" = 'RECYCLED' THEN 1 ELSE 0 END)::int AS "recycled"
FROM
  "Asset" a
JOIN
  "Category" c ON a."categoryId" = c."id"
GROUP BY
  c."categoryName";
