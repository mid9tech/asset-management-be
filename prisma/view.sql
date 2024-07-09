-- Drop the existing view if it exists
DROP VIEW IF EXISTS asset_report_hcm;

-- Create the new view with fields cast to integer
CREATE VIEW asset_report_hcm AS
SELECT
  c."categoryName" AS "category_name",
  COUNT(a.id)::int AS "total",
  SUM(CASE WHEN a."state" = 'ASSIGNED' THEN 1 ELSE 0 END)::int AS "assigned",
  SUM(CASE WHEN a."state" = 'AVAILABLE' THEN 1 ELSE 0 END)::int AS "available",
  SUM(CASE WHEN a."state" = 'NOT_AVAILABLE' THEN 1 ELSE 0 END)::int AS "not_available",
  SUM(CASE WHEN a."state" = 'WAITING_FOR_RECYCLING' THEN 1 ELSE 0 END)::int AS "waiting_for_recycling",
  SUM(CASE WHEN a."state" = 'RECYCLED' THEN 1 ELSE 0 END)::int AS "recycled"
FROM
  "Category" c
LEFT JOIN
  "Asset" a ON a."categoryId" = c."id" AND a."location" = 'HCM'
GROUP BY
  c."categoryName";

-- Drop the existing view if it exists
DROP VIEW IF EXISTS asset_report_hn;

-- Create the new view with fields cast to integer
CREATE VIEW asset_report_hn AS
SELECT
  c."categoryName" AS "category_name",
  COUNT(a.id)::int AS "total",
  SUM(CASE WHEN a."state" = 'ASSIGNED' THEN 1 ELSE 0 END)::int AS "assigned",
  SUM(CASE WHEN a."state" = 'AVAILABLE' THEN 1 ELSE 0 END)::int AS "available",
  SUM(CASE WHEN a."state" = 'NOT_AVAILABLE' THEN 1 ELSE 0 END)::int AS "not_available",
  SUM(CASE WHEN a."state" = 'WAITING_FOR_RECYCLING' THEN 1 ELSE 0 END)::int AS "waiting_for_recycling",
  SUM(CASE WHEN a."state" = 'RECYCLED' THEN 1 ELSE 0 END)::int AS "recycled"
FROM
  "Category" c
LEFT JOIN
  "Asset" a ON a."categoryId" = c."id" AND a."location" = 'HN'
GROUP BY
  c."categoryName";

-- Drop the existing view if it exists
DROP VIEW IF EXISTS asset_report_dn;

-- Create the new view with fields cast to integer
CREATE VIEW asset_report_dn AS
SELECT
  c."categoryName" AS "category_name",
  COUNT(a.id)::int AS "total",
  SUM(CASE WHEN a."state" = 'ASSIGNED' THEN 1 ELSE 0 END)::int AS "assigned",
  SUM(CASE WHEN a."state" = 'AVAILABLE' THEN 1 ELSE 0 END)::int AS "available",
  SUM(CASE WHEN a."state" = 'NOT_AVAILABLE' THEN 1 ELSE 0 END)::int AS "not_available",
  SUM(CASE WHEN a."state" = 'WAITING_FOR_RECYCLING' THEN 1 ELSE 0 END)::int AS "waiting_for_recycling",
  SUM(CASE WHEN a."state" = 'RECYCLED' THEN 1 ELSE 0 END)::int AS "recycled"
FROM
  "Category" c
LEFT JOIN
  "Asset" a ON a."categoryId" = c."id" AND a."location" = 'DN'
GROUP BY
  c."categoryName";
