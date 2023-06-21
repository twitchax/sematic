-- migrate:up

ALTER TABLE resolutions ADD COLUMN organization_id REFERENCES organizations(id);
ALTER TABLE runs ADD COLUMN organization_id REFERENCES organizations(id);
ALTER TABLE metric_labels ADD COLUMN organization_id REFERENCES organizations(id);
ALTER TABLE artifacts ADD COLUMN organization_id REFERENCES organizations(id);

-- migrate:down

-- TODO #302: implement sustainable way to upgrade sqlite3 DBs
-- ALTER TABLE resolutions DROP COLUMN organization_id;
-- ALTER TABLE runs DROP COLUMN organization_id;
-- ALTER TABLE metric_labels DROP COLUMN organization_id;
-- ALTER TABLE artifacts DROP COLUMN organization_id;
