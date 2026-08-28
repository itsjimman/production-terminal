"""Shared vocabulary for the production terminal — mirrors the fields the team
already knows from the previous version, kept in one place so the API
and the frontend never drift apart."""

TEAM_DEFAULT = ["Jimman", "Evelyn", "Bayu"]

PRODUCTION_STATUSES = [
    "Inquiry", "Pre-Production", "Shooting",
    "Editing", "Review", "Delivered", "Cancelled",
]
PRODUCTION_STATUS_TONE = {
    "Inquiry": "neutral", "Pre-Production": "info",
    "Shooting": "accent", "Editing": "accent", "Review": "accent",
    "Delivered": "good", "Cancelled": "danger",
}
PRODUCTION_TYPES = [
    "Campaign - Photography", "Campaign - Videography", "Full Production",
    "Catalog", "Events", "Personal",
]

TASK_STATUSES = ["To Do", "In Progress", "Done"]
TASK_STATUS_TONE = {"To Do": "neutral", "In Progress": "info", "Done": "good"}
TASK_PRIORITIES = ["Low", "Normal", "High"]
TASK_PRIORITY_TONE = {"Low": "neutral", "Normal": "info", "High": "danger"}

POST_PRO_STAGES = {
    "Photo": ["Selections", "Color", "Retouch", "Revision", "Delivered"],
    "Video": ["Color Sample", "Rough Cut", "Revision", "Delivered"],
}
POST_PRO_STAGE_TONE = {
    "Selections": "neutral", "Color": "info", "Color Sample": "info",
    "Retouch": "accent", "Rough Cut": "accent", "Revision": "danger",
    "Delivered": "good",
}


def infer_post_pro_media_type(production_type):
    """Photography/Catalog shoots default to the photo pipeline, Videography
    to the video pipeline. Anything else (Full Production, Events, Personal)
    could be either, so it defaults to Photo but stays editable per item."""
    return "Video" if "Videography" in (production_type or "") else "Photo"


EXPENSE_CATEGORIES = [
    "Transport", "Model Payment", "Location Payment",
    "Vendor / Crew Payment", "Equipment Rental", "Catering", "Other",
]
EXPENSE_STATUSES = ["Unpaid", "Paid"]
EXPENSE_STATUS_TONE = {"Unpaid": "danger", "Paid": "good"}
