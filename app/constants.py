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

EXPENSE_CATEGORIES = [
    "Transport", "Model Payment", "Location Payment",
    "Vendor / Crew Payment", "Equipment Rental", "Catering", "Other",
]
EXPENSE_STATUSES = ["Unpaid", "Paid"]
EXPENSE_STATUS_TONE = {"Unpaid": "danger", "Paid": "good"}
