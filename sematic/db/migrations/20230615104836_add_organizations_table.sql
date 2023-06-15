-- migrate:up
CREATE TABLE IF NOT EXISTS organizations (
    id character(32) NOT NULL,
    name TEXT NOT NULL,
    namespace TEXT,
    created_at TIMESTAMP WITH time zone NOT NULL,
    updated_at TIMESTAMP WITH time zone NOT NULL,

    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS organizations_users (
    organization_id character(32) NOT NULL,
    user_id character(32) NOT NULL,
    admin BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH time zone NOT NULL,
    updated_at TIMESTAMP WITH time zone NOT NULL,

    PRIMARY KEY (organization_id, user_id),

    FOREIGN KEY(organization_id) REFERENCES organizations (id),
    FOREIGN KEY(user_id) REFERENCES users (id)
);

INSERT INTO organizations (id, name, namespace, created_at, updated_at)
SELECT id, email, NULL, created_at, created_at
FROM users;

INSERT INTO organizations_users (organization_id, user_id, admin, created_at, updated_at)
SELECT id, id, True, created_at, created_at
FROM users;

-- migrate:down
DROP TABLE IF EXISTS organizations_users;

DROP TABLE IF EXISTS organizations;
