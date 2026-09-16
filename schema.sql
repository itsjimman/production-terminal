-- ITSJIMMAN Production Terminal — D1 schema
-- Mirrors app/models.py exactly (table/column names match SQLAlchemy defaults).

CREATE TABLE team_member (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(120) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    username VARCHAR(80) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    avatar_data TEXT,
    last_login_at DATETIME
);

CREATE TABLE production (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client VARCHAR(160) NOT NULL,
    shoot_name VARCHAR(200) NOT NULL,
    type VARCHAR(60) NOT NULL DEFAULT 'Campaign - Photography',
    status VARCHAR(30) NOT NULL DEFAULT 'Inquiry',
    shoot_date DATE,
    shoot_time_start VARCHAR(5),
    shoot_time_end VARCHAR(5),
    budget INTEGER,
    production_hours INTEGER,
    looks_skus VARCHAR(200),
    frame_count INTEGER,
    videos VARCHAR(200),
    location VARCHAR(200),
    drive_link VARCHAR(500),
    brief_link VARCHAR(500),
    rundown_link VARCHAR(500),
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE production_crew (
    production_id INTEGER NOT NULL REFERENCES production(id) ON DELETE CASCADE,
    team_member_id INTEGER NOT NULL REFERENCES team_member(id) ON DELETE CASCADE,
    PRIMARY KEY (production_id, team_member_id)
);

CREATE TABLE task (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(240) NOT NULL,
    production_id INTEGER REFERENCES production(id) ON DELETE SET NULL,
    created_by_id INTEGER REFERENCES team_member(id) ON DELETE SET NULL,
    due_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'To Do',
    priority VARCHAR(10) NOT NULL DEFAULT 'Normal',
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_assignee (
    task_id INTEGER NOT NULL REFERENCES task(id) ON DELETE CASCADE,
    team_member_id INTEGER NOT NULL REFERENCES team_member(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, team_member_id)
);

CREATE TABLE subtask (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES task(id) ON DELETE CASCADE,
    text VARCHAR(300) NOT NULL,
    done BOOLEAN NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE expense (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    production_id INTEGER NOT NULL REFERENCES production(id) ON DELETE CASCADE,
    description VARCHAR(300) NOT NULL,
    category VARCHAR(60) NOT NULL DEFAULT 'Other',
    brand VARCHAR(120),
    amount INTEGER NOT NULL DEFAULT 0,
    date DATE,
    paid_by_id INTEGER REFERENCES team_member(id) ON DELETE SET NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'Unpaid',
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_pro_item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    production_id INTEGER NOT NULL REFERENCES production(id) ON DELETE CASCADE,
    media_type VARCHAR(10) NOT NULL DEFAULT 'Photo',
    stage VARCHAR(30) NOT NULL DEFAULT 'Selections',
    frames_per_batch INTEGER,
    videos_per_batch INTEGER,
    deadline DATE,
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id INTEGER REFERENCES team_member(id) ON DELETE SET NULL,
    actor_name VARCHAR(120) NOT NULL,
    action VARCHAR(20) NOT NULL,
    entity_type VARCHAR(40) NOT NULL,
    entity_label VARCHAR(240) NOT NULL,
    detail VARCHAR(300),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_task_production_id ON task(production_id);
CREATE INDEX ix_expense_production_id ON expense(production_id);
CREATE INDEX ix_post_pro_item_production_id ON post_pro_item(production_id);
CREATE INDEX ix_subtask_task_id ON subtask(task_id);
