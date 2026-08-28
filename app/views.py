from flask import Blueprint, render_template, session

from .auth import admin_required, login_required
from .models import TeamMember

bp = Blueprint("views", __name__)


def _shell(active_tab):
    member = TeamMember.query.get(session["user_id"]) if session.get("user_id") else None
    return render_template(
        "base.html",
        active_tab=active_tab,
        viewer_name=member.name if member else session.get("viewer_name", ""),
        role=member.role if member else session.get("role", "member"),
        avatar=member.avatar_data if member else None,
    )


@bp.route("/")
@login_required
def overview():
    return _shell("overview")


@bp.route("/productions")
@login_required
def productions():
    return _shell("productions")


@bp.route("/tasks")
@login_required
def tasks():
    return _shell("tasks")


@bp.route("/calendar")
@login_required
def calendar():
    return _shell("calendar")


@bp.route("/post-pro")
@login_required
def post_pro():
    return _shell("post-pro")


@bp.route("/admin")
@login_required
@admin_required
def admin():
    return _shell("admin")


@bp.route("/profile")
@login_required
def profile():
    return _shell("profile")
