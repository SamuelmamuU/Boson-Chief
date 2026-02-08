from agents.basic_agent import basic_agent
from agents.calendar_agent import check_conflict
from agents.schema_agent import normalize_schema
from agents.calendar_writer import generate_google_calendar_link

def run(text: str):
    # 1️⃣ Extraer info con IA
    event = basic_agent(text)

    # 2️⃣ Normalizar esquema (absorbe variaciones del LLM)
    event = normalize_schema(event)

    # 3️⃣ Validar fecha
    if not event.get("fecha_iso"):
        raise ValueError("No se puede agendar sin fecha válida")

    # 4️⃣ Checar conflictos
    conflict = check_conflict(event["fecha_iso"])
    event["conflict"] = conflict

    # 5️⃣ 👉 AQUÍ SE AGENDA
    if not conflict["conflict"]:
        calendar_file = generate_google_calendar_link(event)
        event["calendar_file"] = calendar_file
    else:
        event["calendar_file"] = None

    return event
