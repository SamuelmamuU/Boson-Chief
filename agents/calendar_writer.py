from urllib.parse import quote
from datetime import datetime, timedelta

def generate_google_calendar_link(event):
    start_utc = datetime.fromisoformat(event["fecha_iso"])
    end_utc = start_utc + timedelta(hours=1)

    start_str = start_utc.strftime("%Y%m%dT%H%M%SZ")
    end_str = end_utc.strftime("%Y%m%dT%H%M%SZ")

    name = quote(event["eventos"][0]["nombre"])
    description = quote(
        "Participantes:\n" + "\n".join(p["nombre"] for p in event["participantes"])
    )

    link = (
        f"https://calendar.google.com/calendar/render?action=TEMPLATE"
        f"&text={name}"
        f"&dates={start_str}/{end_str}"
        f"&details={description}"
    )
    return link

