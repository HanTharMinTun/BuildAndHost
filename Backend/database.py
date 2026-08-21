import psycopg2


def get_connection():

    conn = psycopg2.connect(
        host="localhost",
        database="portfolio_db",
        user="kaungkaung",
        password="password",
        port="5432"
    )

    return conn