import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD")
        )
        cur = conn.cursor()
        cur.execute("SET CLIENT_ENCODING TO 'UTF8'")
        return conn
    except psycopg2.Error as e:
        print("Error al conectar a la base de datos:", e)
        return None