import os
import sys
from pathlib import Path

# Add PyMySQL Patch for cPanel
try:
    import pymysql
    pymysql.version_info = (2, 2, 2, "final", 0)
    pymysql.install_as_MySQLdb()
except ImportError:
    pass

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "portfolio_backend.settings")

from portfolio_backend.wsgi import application
