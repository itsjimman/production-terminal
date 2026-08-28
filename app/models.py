from datetime import datetime, date

from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

db = SQLAlchemy()

production_crew = db.Table(
    "production_crew",
    db.Column("production_id", db.Integer, db.ForeignKey("production.id", ondelete="CASCADE"), primary_key=True),
    db.Column("team_member_id", db.Integer, db.ForeignKey("team_member.id", ondelete="CASCADE"), primary_key=True),
)


class TeamMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Login is optional per team member — someone added as crew via a free-text
    # field has no account until a Super Admin explicitly grants one.
    username = db.Column(db.String(80), unique=True, nullable=True)
    password_hash = db.Column(db.String(255), nullable=True)
    role = db.Column(db.String(20), nullable=False, default="member")  # "member" | "super_admin"
    avatar_data = db.Column(db.Text, nullable=True)  # small data: URI (JPEG, resized server-side)
    last_login_at = db.Column(db.DateTime, nullable=True)

    def set_password(self, password):
        # Explicit method: Werkzeug's default ("scrypt") needs hashlib.scrypt,
        # which isn't available on every Python build (e.g. LibreSSL-linked
        # Python on macOS) — pbkdf2:sha256 works everywhere.
        self.password_hash = generate_password_hash(password, method="pbkdf2:sha256")

    def check_password(self, password):
        return bool(self.password_hash) and check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "hasLogin": bool(self.username)}

    def to_admin_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "username": self.username,
            "role": self.role,
            "hasLogin": bool(self.username),
            "lastLoginAt": self.last_login_at.isoformat() if self.last_login_at else None,
        }

    def to_profile_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "username": self.username,
            "role": self.role,
            "avatar": self.avatar_data,
        }


class Production(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client = db.Column(db.String(160), nullable=False)
    shoot_name = db.Column(db.String(200), nullable=False)
    type = db.Column(db.String(60), nullable=False, default="Campaign - Photography")
    status = db.Column(db.String(30), nullable=False, default="Inquiry")
    shoot_date = db.Column(db.Date, nullable=True)
    shoot_time_start = db.Column(db.String(5), nullable=True)  # "HH:MM", 24h
    shoot_time_end = db.Column(db.String(5), nullable=True)  # "HH:MM", 24h
    budget = db.Column(db.Integer, nullable=True)
    production_hours = db.Column(db.Integer, nullable=True)
    looks_skus = db.Column(db.String(200), nullable=True)
    frame_count = db.Column(db.Integer, nullable=True)
    videos = db.Column(db.String(200), nullable=True)
    location = db.Column(db.String(200), nullable=True)
    drive_link = db.Column(db.String(500), nullable=True)
    brief_link = db.Column(db.String(500), nullable=True)
    rundown_link = db.Column(db.String(500), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    crew = db.relationship("TeamMember", secondary=production_crew, lazy="joined")
    tasks = db.relationship("Task", backref="production", passive_deletes=True)
    expenses = db.relationship("Expense", backref="production", cascade="all, delete-orphan", passive_deletes=True)

    def to_dict(self, include_children=False):
        out = {
            "id": self.id,
            "client": self.client,
            "shootName": self.shoot_name,
            "type": self.type,
            "status": self.status,
            "shootDate": self.shoot_date.isoformat() if self.shoot_date else None,
            "shootTimeStart": self.shoot_time_start,
            "shootTimeEnd": self.shoot_time_end,
            "budget": self.budget,
            "productionHours": self.production_hours,
            "looksSkus": self.looks_skus,
            "frameCount": self.frame_count,
            "videos": self.videos,
            "location": self.location,
            "crew": [c.name for c in self.crew],
            "driveLink": self.drive_link,
            "briefLink": self.brief_link,
            "rundownLink": self.rundown_link,
            "notes": self.notes,
            "createdAt": self.created_at.isoformat(),
            "updatedAt": self.updated_at.isoformat(),
        }
        if include_children:
            out["expenseTotal"] = sum(e.amount for e in self.expenses)
            out["expenseUnpaid"] = sum(e.amount for e in self.expenses if e.status == "Unpaid")
            out["taskCount"] = len(self.tasks)
        return out


task_assignee = db.Table(
    "task_assignee",
    db.Column("task_id", db.Integer, db.ForeignKey("task.id", ondelete="CASCADE"), primary_key=True),
    db.Column("team_member_id", db.Integer, db.ForeignKey("team_member.id", ondelete="CASCADE"), primary_key=True),
)


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(240), nullable=False)
    production_id = db.Column(db.Integer, db.ForeignKey("production.id", ondelete="SET NULL"), nullable=True)
    created_by_id = db.Column(db.Integer, db.ForeignKey("team_member.id", ondelete="SET NULL"), nullable=True)
    due_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(20), nullable=False, default="To Do")
    priority = db.Column(db.String(10), nullable=False, default="Normal")
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    assignees = db.relationship("TeamMember", secondary=task_assignee, lazy="joined")
    created_by = db.relationship("TeamMember", lazy="joined", foreign_keys=[created_by_id])
    subtasks = db.relationship(
        "Subtask", backref="task", cascade="all, delete-orphan",
        passive_deletes=True, order_by="Subtask.position",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "productionId": self.production_id,
            "productionName": (f"{self.production.client} — {self.production.shoot_name}"
                                if self.production_id and self.production else None),
            "assignees": [m.name for m in self.assignees],
            "createdBy": self.created_by.name if self.created_by else "",
            "dueDate": self.due_date.isoformat() if self.due_date else None,
            "status": self.status,
            "priority": self.priority,
            "notes": self.notes,
            "subtasks": [s.to_dict() for s in self.subtasks],
            "createdAt": self.created_at.isoformat(),
            "updatedAt": self.updated_at.isoformat(),
        }


class Subtask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey("task.id", ondelete="CASCADE"), nullable=False)
    text = db.Column(db.String(300), nullable=False)
    done = db.Column(db.Boolean, nullable=False, default=False)
    position = db.Column(db.Integer, nullable=False, default=0)

    def to_dict(self):
        return {"id": self.id, "text": self.text, "done": self.done}


class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    production_id = db.Column(db.Integer, db.ForeignKey("production.id", ondelete="CASCADE"), nullable=False)
    description = db.Column(db.String(300), nullable=False)
    category = db.Column(db.String(60), nullable=False, default="Other")
    brand = db.Column(db.String(120), nullable=True)
    amount = db.Column(db.Integer, nullable=False, default=0)
    date = db.Column(db.Date, nullable=True)
    paid_by_id = db.Column(db.Integer, db.ForeignKey("team_member.id", ondelete="SET NULL"), nullable=True)
    status = db.Column(db.String(10), nullable=False, default="Unpaid")
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    paid_by = db.relationship("TeamMember", lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "productionId": self.production_id,
            "description": self.description,
            "category": self.category,
            "brand": self.brand,
            "amount": self.amount,
            "date": self.date.isoformat() if self.date else None,
            "paidBy": self.paid_by.name if self.paid_by else "",
            "status": self.status,
            "notes": self.notes,
            "createdAt": self.created_at.isoformat(),
        }


class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    actor_id = db.Column(db.Integer, db.ForeignKey("team_member.id", ondelete="SET NULL"), nullable=True)
    actor_name = db.Column(db.String(120), nullable=False)  # snapshot — survives the actor losing login access
    action = db.Column(db.String(20), nullable=False)  # "created" | "updated" | "deleted"
    entity_type = db.Column(db.String(40), nullable=False)
    entity_label = db.Column(db.String(240), nullable=False)
    detail = db.Column(db.String(300), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "actor": self.actor_name,
            "action": self.action,
            "entityType": self.entity_type,
            "entityLabel": self.entity_label,
            "detail": self.detail,
            "createdAt": self.created_at.isoformat(),
        }
