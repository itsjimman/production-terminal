from flask import Flask
from sqlalchemy import event, inspect, text
from sqlalchemy.engine import Engine

from .config import Config
from .constants import TEAM_DEFAULT
from .models import db, TeamMember

# Additive-only column migrations. Never remove or rewrite an entry here —
# this only ever ADDS columns to an existing table, so past data is never
# touched. (No Alembic in this project; this is the lightweight equivalent
# for a single small SQLite file.)
NEW_COLUMNS = {
    "production": [
        ("production_hours", "INTEGER"),
        ("looks_skus", "VARCHAR(200)"),
        ("frame_count", "INTEGER"),
        ("videos", "VARCHAR(200)"),
        ("location", "VARCHAR(200)"),
        ("shoot_time_start", "VARCHAR(5)"),
        ("shoot_time_end", "VARCHAR(5)"),
    ],
    "task": [
        ("created_by_id", "INTEGER"),
    ],
    "team_member": [
        ("username", "VARCHAR(80)"),
        ("password_hash", "VARCHAR(255)"),
        ("role", "VARCHAR(20) DEFAULT 'member'"),
        ("avatar_data", "TEXT"),
        ("last_login_at", "DATETIME"),
    ],
    "expense": [
        ("brand", "VARCHAR(120)"),
    ],
}


def _migrate_add_columns(app):
    inspector = inspect(db.engine)
    for table, columns in NEW_COLUMNS.items():
        if table not in inspector.get_table_names():
            continue  # db.create_all() will make it fresh, with these columns already
        existing = {c["name"] for c in inspector.get_columns(table)}
        for name, coltype in columns:
            if name not in existing:
                db.session.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {coltype}"))
    db.session.execute(text(
        "CREATE UNIQUE INDEX IF NOT EXISTS ix_team_member_username ON team_member(username)"
    ))
    db.session.commit()


def _migrate_data(app):
    """One-time data fixes, each guarded so it only ever runs once (safe to
    leave in permanently — becomes a no-op after the first successful run)."""
    inspector = inspect(db.engine)
    if "production" in inspector.get_table_names():
        db.session.execute(text(
            "UPDATE production SET status='Pre-Production' WHERE status='Scheduled'"
        ))
    # Task assignment used to be a single assignee_id column; now it's the
    # task_assignee many-to-many table. Copy old single assignments across
    # exactly once — guarded on the junction table being empty, so removing
    # someone's only assignment later never gets "revived" by a later deploy.
    if "task_assignee" in inspector.get_table_names() and "task" in inspector.get_table_names():
        task_cols = {c["name"] for c in inspector.get_columns("task")}
        if "assignee_id" in task_cols:
            count = db.session.execute(text("SELECT COUNT(*) FROM task_assignee")).scalar()
            if count == 0:
                db.session.execute(text(
                    "INSERT INTO task_assignee (task_id, team_member_id) "
                    "SELECT id, assignee_id FROM task WHERE assignee_id IS NOT NULL"
                ))
    db.session.commit()


def _bootstrap_super_admin(app):
    """Runs at most once: creates the first Super Admin account. Once ANY
    super_admin exists, this is a no-op forever — it will never overwrite
    a password someone has since changed."""
    if TeamMember.query.filter_by(role="super_admin").count() > 0:
        return
    admin = TeamMember.query.filter(
        db.func.lower(TeamMember.name) == "jimman"
    ).first()
    if not admin:
        admin = TeamMember(name="Jimman")
        db.session.add(admin)
    admin.username = "Jimman"
    admin.role = "super_admin"
    admin.set_password("production")
    db.session.commit()


def create_app(config_class=Config):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config_class)

    db.init_app(app)

    if app.config["SQLALCHEMY_DATABASE_URI"].startswith("sqlite"):
        @event.listens_for(Engine, "connect")
        def _enable_sqlite_fk(dbapi_connection, connection_record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

    from .auth import bp as auth_bp
    from .views import bp as views_bp
    from .api import bp as api_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(views_bp)
    app.register_blueprint(api_bp, url_prefix="/api")

    with app.app_context():
        db.create_all()
        _migrate_add_columns(app)
        _migrate_data(app)
        if TeamMember.query.count() == 0:
            for name in TEAM_DEFAULT:
                db.session.add(TeamMember(name=name))
            db.session.commit()
        _bootstrap_super_admin(app)

    return app
