from functools import wraps

from flask import Blueprint, abort, redirect, render_template, request, session, url_for

from .models import db, TeamMember

bp = Blueprint("auth", __name__)


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("user_id"):
            return redirect(url_for("auth.login", next=request.path))
        return view(*args, **kwargs)
    return wrapped


def admin_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if session.get("role") != "super_admin":
            abort(403)
        return view(*args, **kwargs)
    return wrapped


@bp.route("/login", methods=["GET", "POST"])
def login():
    error = None
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        member = None
        if username:
            member = TeamMember.query.filter(
                db.func.lower(TeamMember.username) == username.lower()
            ).first()
        if member and member.check_password(password):
            session.clear()
            session["user_id"] = member.id
            session["viewer_name"] = member.name
            session["role"] = member.role
            return redirect(request.form.get("next") or url_for("views.overview"))
        error = "Incorrect username or password."
    return render_template("login.html", error=error, next=request.args.get("next", ""))


@bp.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("auth.login"))
