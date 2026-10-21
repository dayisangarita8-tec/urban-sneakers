"""MySQL connection settings for local development and cloud deployment."""

import os

import mysql.connector
from dotenv import load_dotenv


load_dotenv()


def obtener_conexion():
    """Open a connection using Railway MYSQL* variables or local DB_* values."""
    return mysql.connector.connect(
        host=os.getenv("MYSQLHOST") or os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("MYSQLPORT") or os.getenv("DB_PORT", "3306")),
        database=os.getenv("MYSQLDATABASE") or os.getenv("DB_NAME", "urban_sneakers1"),
        user=os.getenv("MYSQLUSER") or os.getenv("DB_USER", "root"),
        password=os.getenv("MYSQLPASSWORD") or os.getenv("DB_PASSWORD", ""),
        connection_timeout=int(os.getenv("DB_CONNECT_TIMEOUT", "10")),
    )
