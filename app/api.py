import base64
import binascii
import io
from datetime import datetime, date

from flask import Blueprint, current_app, jsonify, request, send_file, session
from PIL import Image, ImageOps, UnidentifiedImageError

from .auth import admin_required, login_required
from .constants import (
    PRODUCTION_STATUSES, PRODUCTION_TYPES, TASK_STATUSES, TASK_PRIORITIES,
    EXPENSE_CATEGORIES, EXPENSE_STATUSES,
)
from .export import build_export_workbook
from .models import db, TeamMember, Production, Task, Subtask, Expense, AuditLog

bp = Blueprint("api", __name__)

AVATAR_MAX_UPLOAD_BYTES = 8 * 1024 * 1024  # 8MB raw upload cap, before resizing


# ---------- helpers ----------

def parse_date(s):
    if not s:
        return None
    try:
        return date.fromisoformat(s)
    except ValueError:
        return None


def parse_time(s):
    """Accepts an <input type=time> value ("HH:MM" or "HH:MM:SS") and
    normalizes it to "HH:MM". Anything else is dropped rather than stored."""
    s = (s or "").strip()
    if not s:
        return None
    parts = s.split(":")
    if len(parts) < 2:
        return None
    try:
        h, m = int(parts[0]), int(parts[1])
    except ValueError:
        return None
    if not (0 <= h <= 23 and 0 <= m <= 59):
        return None
    return f"{h:02d}:{m:02d}"


def parse_int(v):
    v = str(v or "").strip()
    if not v:
        return None
    try:
        return int(float(v))
    except ValueError:
        return None


def log_change(action, entity_type, label, detail=None):
    """Records an entry in the Super Admin-visible changes log. Doesn't
    commit — piggybacks on the caller's own db.session.commit() so the
    log entry and the change it describes land atomically."""
    db.session.add(AuditLog(
        actor_id=session.get("user_id"),
        actor_name=session.get("viewer_name") or "Unknown",
        action=action,
        entity_type=entity_type,
        entity_label=label,
        detail=detail,
    ))


def get_or_create_member(name):
    name = (name or "").strip()
    if not name:
        return None
    member = TeamMember.query.filter(db.func.lower(TeamMember.name) == name.lower()).first()
    if member:
        return member
    member = TeamMember(name=name)
    db.session.add(member)
    db.session.flush()
    return member


def process_avatar(data_uri):
    """Decode an uploaded image (any common format), square-crop it, and
    re-encode as a small JPEG data: URI so avatars stay cheap to store and
    send. Raises ValueError on anything that isn't a decodable image."""
    if not data_uri or "," not in data_uri:
        raise ValueError("No image data.")
    try:
        raw = base64.b64decode(data_uri.split(",", 1)[1], validate=False)
    except (ValueError, TypeError, binascii.Error):
        raise ValueError("That doesn't look like an image file.")
    if len(raw) > AVATAR_MAX_UPLOAD_BYTES:
        raise ValueError("Image is too large (max 8MB).")
    try:
        img = Image.open(io.BytesIO(raw))
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGB")
    except (UnidentifiedImageError, OSError):
        raise ValueError("That doesn't look like an image file.")
    img = ImageOps.fit(img, (256, 256), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    encoded = base64.b64encode(buf.getvalue()).decode("ascii")
    return "data:image/jpeg;base64," + encoded


def bootstrap():
    productions = Production.query.order_by(Production.created_at.desc()).all()
    tasks = Task.query.order_by(Task.created_at.desc()).all()
    expenses = Expense.query.order_by(Expense.date.desc().nullslast(), Expense.created_at.desc()).all()
    team = TeamMember.query.order_by(TeamMember.name.asc()).all()
    return {
        "meta": {
            "studioName": current_app.config["STUDIO_NAME"],
            "viewerName": session.get("viewer_name", ""),
        },
        "constants": {
            "productionStatuses": PRODUCTION_STATUSES,
            "productionTypes": PRODUCTION_TYPES,
            "taskStatuses": TASK_STATUSES,
            "taskPriorities": TASK_PRIORITIES,
            "expenseCategories": EXPENSE_CATEGORIES,
            "expenseStatuses": EXPENSE_STATUSES,
        },
        "team": [m.to_dict() for m in team],
        "productions": [p.to_dict(include_children=True) for p in productions],
        "tasks": [t.to_dict() for t in tasks],
        "expenses": [e.to_dict() for e in expenses],
    }


def ok(status=200):
    return jsonify({"ok": True, "state": bootstrap()}), status


def bad(msg, status=400):
    return jsonify({"ok": False, "error": msg}), status


@bp.route("/bootstrap")
@login_required
def api_bootstrap():
    return jsonify({"ok": True, "state": bootstrap()})




# ---------- productions ----------

@bp.route("/productions", methods=["POST"])
@login_required
def create_production():
    body = request.json or {}
    if not (body.get("client") or "").strip() or not (body.get("shootName") or "").strip():
        return bad("Client and shoot name are required.")
    p = Production(
        client=body["client"].strip(),
        shoot_name=body["shootName"].strip(),
        type=body.get("type") or PRODUCTION_TYPES[0],
        status=body.get("status") or PRODUCTION_STATUSES[0],
        shoot_date=parse_date(body.get("shootDate")),
        shoot_time_start=parse_time(body.get("shootTimeStart")),
        shoot_time_end=parse_time(body.get("shootTimeEnd")),
        budget=parse_int(body.get("budget")),
        production_hours=parse_int(body.get("productionHours")),
        looks_skus=body.get("looksSkus") or None,
        frame_count=parse_int(body.get("frameCount")),
        videos=body.get("videos") or None,
        location=body.get("location") or None,
        drive_link=body.get("driveLink") or None,
        brief_link=body.get("briefLink") or None,
        rundown_link=body.get("rundownLink") or None,
        notes=body.get("notes") or None,
    )
    for name in body.get("crew") or []:
        member = get_or_create_member(name)
        if member:
            p.crew.append(member)
    db.session.add(p)
    log_change("created", "Production", f"{p.client} — {p.shoot_name}")
    db.session.commit()
    return ok(201)


@bp.route("/productions/<int:pid>", methods=["PUT"])
@login_required
def update_production(pid):
    p = Production.query.get_or_404(pid)
    body = request.json or {}
    if not (body.get("client") or "").strip() or not (body.get("shootName") or "").strip():
        return bad("Client and shoot name are required.")
    p.client = body["client"].strip()
    p.shoot_name = body["shootName"].strip()
    p.type = body.get("type") or p.type
    p.status = body.get("status") or p.status
    p.shoot_date = parse_date(body.get("shootDate"))
    p.shoot_time_start = parse_time(body.get("shootTimeStart"))
    p.shoot_time_end = parse_time(body.get("shootTimeEnd"))
    p.budget = parse_int(body.get("budget"))
    p.production_hours = parse_int(body.get("productionHours"))
    p.looks_skus = body.get("looksSkus") or None
    p.frame_count = parse_int(body.get("frameCount"))
    p.videos = body.get("videos") or None
    p.location = body.get("location") or None
    p.drive_link = body.get("driveLink") or None
    p.brief_link = body.get("briefLink") or None
    p.rundown_link = body.get("rundownLink") or None
    p.notes = body.get("notes") or None
    if "crew" in body:
        p.crew = []
        for name in body.get("crew") or []:
            member = get_or_create_member(name)
            if member:
                p.crew.append(member)
    log_change("updated", "Production", f"{p.client} — {p.shoot_name}")
    db.session.commit()
    return ok()


@bp.route("/productions/<int:pid>", methods=["DELETE"])
@login_required
def delete_production(pid):
    p = Production.query.get_or_404(pid)
    label = f"{p.client} — {p.shoot_name}"
    db.session.delete(p)
    log_change("deleted", "Production", label)
    db.session.commit()
    return ok()


@bp.route("/productions/<int:pid>/status", methods=["PATCH"])
@login_required
def set_production_status(pid):
    p = Production.query.get_or_404(pid)
    status = (request.json or {}).get("status")
    if status not in PRODUCTION_STATUSES:
        return bad("Not a valid production status.")
    old_status = p.status
    p.status = status
    log_change("updated", "Production", f"{p.client} — {p.shoot_name}", detail=f"Status: {old_status} → {status}")
    db.session.commit()
    return ok()


# ---------- tasks ----------

@bp.route("/tasks", methods=["POST"])
@login_required
def create_task():
    body = request.json or {}
    if not (body.get("title") or "").strip():
        return bad("Task title is required.")
    t = Task(
        title=body["title"].strip(),
        production_id=int(body["productionId"]) if str(body.get("productionId") or "").strip() else None,
        created_by=get_or_create_member(session.get("viewer_name")),
        due_date=parse_date(body.get("dueDate")),
        status=body.get("status") or TASK_STATUSES[0],
        priority=body.get("priority") or "Normal",
        notes=body.get("notes") or None,
    )
    for name in body.get("assignees") or []:
        member = get_or_create_member(name)
        if member:
            t.assignees.append(member)
    db.session.add(t)
    log_change("created", "Task", t.title)
    db.session.commit()
    return ok(201)


@bp.route("/tasks/<int:tid>", methods=["PUT"])
@login_required
def update_task(tid):
    t = Task.query.get_or_404(tid)
    body = request.json or {}
    if not (body.get("title") or "").strip():
        return bad("Task title is required.")
    t.title = body["title"].strip()
    t.production_id = int(body["productionId"]) if str(body.get("productionId") or "").strip() else None
    t.due_date = parse_date(body.get("dueDate"))
    t.status = body.get("status") or t.status
    t.priority = body.get("priority") or t.priority
    t.notes = body.get("notes") or None
    if "assignees" in body:
        t.assignees = []
        for name in body.get("assignees") or []:
            member = get_or_create_member(name)
            if member:
                t.assignees.append(member)
    log_change("updated", "Task", t.title)
    db.session.commit()
    return ok()


@bp.route("/tasks/<int:tid>", methods=["DELETE"])
@login_required
def delete_task(tid):
    t = Task.query.get_or_404(tid)
    label = t.title
    db.session.delete(t)
    log_change("deleted", "Task", label)
    db.session.commit()
    return ok()


@bp.route("/tasks/<int:tid>/status", methods=["PATCH"])
@login_required
def set_task_status(tid):
    t = Task.query.get_or_404(tid)
    status = (request.json or {}).get("status")
    if status not in TASK_STATUSES:
        return bad("Not a valid task status.")
    old_status = t.status
    t.status = status
    log_change("updated", "Task", t.title, detail=f"Status: {old_status} → {status}")
    db.session.commit()
    return ok()


@bp.route("/tasks/<int:tid>/subtasks", methods=["POST"])
@login_required
def add_subtask(tid):
    t = Task.query.get_or_404(tid)
    text = ((request.json or {}).get("text") or "").strip()
    if not text:
        return bad("Subtask text is required.")
    pos = max([s.position for s in t.subtasks], default=-1) + 1
    db.session.add(Subtask(task_id=t.id, text=text, position=pos))
    db.session.commit()
    return ok(201)


@bp.route("/subtasks/<int:sid>", methods=["PUT"])
@login_required
def update_subtask(sid):
    s = Subtask.query.get_or_404(sid)
    body = request.json or {}
    if "done" in body:
        s.done = bool(body["done"])
    if "text" in body and body["text"].strip():
        s.text = body["text"].strip()
    db.session.commit()
    return ok()


@bp.route("/subtasks/<int:sid>", methods=["DELETE"])
@login_required
def delete_subtask(sid):
    s = Subtask.query.get_or_404(sid)
    db.session.delete(s)
    db.session.commit()
    return ok()


# ---------- expenses ----------

@bp.route("/expenses", methods=["POST"])
@login_required
def create_expense():
    body = request.json or {}
    if not (body.get("description") or "").strip() or not str(body.get("productionId") or "").strip():
        return bad("Description and a linked production are required.")
    try:
        amount = int(float(body.get("amount") or 0))
    except (TypeError, ValueError):
        return bad("Amount must be a number.")
    e = Expense(
        production_id=int(body["productionId"]),
        description=body["description"].strip(),
        category=body.get("category") or EXPENSE_CATEGORIES[0],
        brand=body.get("brand") or None,
        amount=amount,
        date=parse_date(body.get("date")),
        paid_by=get_or_create_member(body.get("paidBy")),
        status=body.get("status") or "Unpaid",
        notes=body.get("notes") or None,
    )
    db.session.add(e)
    log_change("created", "Expense", e.description)
    db.session.commit()
    return ok(201)


@bp.route("/expenses/<int:eid>", methods=["PUT"])
@login_required
def update_expense(eid):
    e = Expense.query.get_or_404(eid)
    body = request.json or {}
    if not (body.get("description") or "").strip():
        return bad("Description is required.")
    try:
        amount = int(float(body.get("amount") or 0))
    except (TypeError, ValueError):
        return bad("Amount must be a number.")
    e.description = body["description"].strip()
    e.category = body.get("category") or e.category
    e.brand = body.get("brand") or None
    e.amount = amount
    e.date = parse_date(body.get("date"))
    e.paid_by = get_or_create_member(body.get("paidBy"))
    e.status = body.get("status") or e.status
    e.notes = body.get("notes") or None
    log_change("updated", "Expense", e.description)
    db.session.commit()
    return ok()


@bp.route("/expenses/<int:eid>", methods=["DELETE"])
@login_required
def delete_expense(eid):
    e = Expense.query.get_or_404(eid)
    label = e.description
    db.session.delete(e)
    log_change("deleted", "Expense", label)
    db.session.commit()
    return ok()


@bp.route("/expenses/<int:eid>/status", methods=["PATCH"])
@login_required
def set_expense_status(eid):
    e = Expense.query.get_or_404(eid)
    status = (request.json or {}).get("status")
    if status not in EXPENSE_STATUSES:
        return bad("Not a valid expense status.")
    old_status = e.status
    e.status = status
    log_change("updated", "Expense", e.description, detail=f"Status: {old_status} → {status}")
    db.session.commit()
    return ok()


# ---------- team ----------

@bp.route("/team", methods=["POST"])
@login_required
def add_team_member():
    name = ((request.json or {}).get("name") or "").strip()
    if not name:
        return bad("Name is required.")
    get_or_create_member(name)
    db.session.commit()
    return ok(201)


# ---------- admin: user accounts (Super Admin only) ----------

def users_ok(status=200):
    members = TeamMember.query.order_by(TeamMember.name.asc()).all()
    return jsonify({"ok": True, "users": [m.to_admin_dict() for m in members]}), status


@bp.route("/admin/export", methods=["GET"])
@login_required
@admin_required
def export_data():
    buf = build_export_workbook()
    filename = "itsjimman-export-" + datetime.utcnow().strftime("%Y-%m-%d") + ".xlsx"
    return send_file(
        buf,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        as_attachment=True,
        download_name=filename,
    )


@bp.route("/admin/users", methods=["GET"])
@login_required
@admin_required
def list_users():
    return users_ok()


@bp.route("/admin/audit-log", methods=["GET"])
@login_required
@admin_required
def get_audit_log():
    entries = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(200).all()
    return jsonify({"ok": True, "log": [e.to_dict() for e in entries]})


@bp.route("/admin/users", methods=["POST"])
@login_required
@admin_required
def create_user():
    body = request.json or {}
    name = (body.get("name") or "").strip()
    username = (body.get("username") or "").strip()
    password = body.get("password") or ""
    role = body.get("role") or "member"
    if not name or not username or not password:
        return bad("Name, username, and password are all required.")
    if role not in ("member", "super_admin"):
        return bad("Not a valid role.")
    if len(password) < 4:
        return bad("Password must be at least 4 characters.")
    taken = TeamMember.query.filter(
        db.func.lower(TeamMember.username) == username.lower()
    ).first()
    if taken:
        return bad("That username is already taken.")
    member = TeamMember.query.filter(db.func.lower(TeamMember.name) == name.lower()).first()
    if not member:
        member = TeamMember(name=name)
        db.session.add(member)
    elif member.username:
        return bad(f"{member.name} already has a login — remove it first if you want to replace it.")
    member.username = username
    member.role = role
    member.set_password(password)
    log_change("created", "User login", f"{member.name} ({username})", detail=f"Role: {role}")
    db.session.commit()
    return users_ok(201)


@bp.route("/admin/users/<int:uid>", methods=["DELETE"])
@login_required
@admin_required
def remove_user(uid):
    member = TeamMember.query.get_or_404(uid)
    if member.role == "super_admin":
        other_admins = TeamMember.query.filter(
            TeamMember.role == "super_admin", TeamMember.id != uid
        ).count()
        if other_admins == 0:
            return bad("Can't remove the last Super Admin.")
    # Revoke login only — keep the team member record so past productions,
    # tasks, and expenses linked to them stay intact.
    member.username = None
    member.password_hash = None
    member.role = "member"
    log_change("deleted", "User login", member.name, detail="Login access removed")
    db.session.commit()
    return users_ok()


@bp.route("/admin/users/<int:uid>/password", methods=["PATCH"])
@login_required
@admin_required
def reset_user_password(uid):
    member = TeamMember.query.get_or_404(uid)
    password = (request.json or {}).get("password") or ""
    if len(password) < 4:
        return bad("Password must be at least 4 characters.")
    member.set_password(password)
    log_change("updated", "User login", member.name, detail="Password reset")
    db.session.commit()
    return users_ok()


# ---------- me: self-service profile (any logged-in user, own account only) ----------

def current_member():
    return TeamMember.query.get_or_404(session["user_id"])


@bp.route("/me", methods=["GET"])
@login_required
def get_me():
    return jsonify({"ok": True, "user": current_member().to_profile_dict()})


@bp.route("/me", methods=["PUT"])
@login_required
def update_me():
    member = current_member()
    name = ((request.json or {}).get("name") or "").strip()
    if not name:
        return bad("Name is required.")
    clash = TeamMember.query.filter(
        db.func.lower(TeamMember.name) == name.lower(), TeamMember.id != member.id
    ).first()
    if clash:
        return bad("Someone else already has that name.")
    member.name = name
    db.session.commit()
    session["viewer_name"] = member.name
    return jsonify({"ok": True, "user": member.to_profile_dict()})


@bp.route("/me/avatar", methods=["PUT"])
@login_required
def update_my_avatar():
    member = current_member()
    body = request.json or {}
    if "image" in body and not body["image"]:
        member.avatar_data = None
    else:
        try:
            member.avatar_data = process_avatar(body.get("image"))
        except ValueError as e:
            return bad(str(e))
    db.session.commit()
    return jsonify({"ok": True, "user": member.to_profile_dict()})


@bp.route("/me/password", methods=["PUT"])
@login_required
def update_my_password():
    member = current_member()
    body = request.json or {}
    current_password = body.get("currentPassword") or ""
    new_password = body.get("newPassword") or ""
    if not member.check_password(current_password):
        return bad("Current password is incorrect.")
    if len(new_password) < 4:
        return bad("New password must be at least 4 characters.")
    member.set_password(new_password)
    db.session.commit()
    return jsonify({"ok": True})
