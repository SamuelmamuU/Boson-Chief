from agents.basic_agent import basic_agent
from agents.schema_agent import normalize_schema
from agents.basic_agent import basic_agent
from legacy.orchestrator import run
from agents.calendar_writer import generate_google_calendar_link
if __name__ == "__main__":
    text = """
    mañana 3 am tengo reunión del proyecto Alpha con Juan y María. Agenda la sesion y envía recordatorio.
    """

    user_timezone = "America/Mexico_City"  # después vendrá del login
    result = basic_agent(text, user_timezone)

    print(result)
    ##print(normalize_schema(result))
    link = generate_google_calendar_link(result)
    print("Link de Google Calendar:", link)


