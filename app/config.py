import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-only-change-me")
    basedir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "sqlite:///" + os.path.join(basedir, "instance", "itsjimman.db")
    )
    SQLALCHEMY_ENGINE_OPTIONS = {"connect_args": {"check_same_thread": False}} \
        if SQLALCHEMY_DATABASE_URI.startswith("sqlite") else {}
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    STUDIO_NAME = "ITSJIMMAN"
