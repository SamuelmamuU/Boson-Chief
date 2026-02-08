from datetime import datetime, timedelta
import pytz
import re

def normalize_datetime(fecha_hora: str, user_tz: str):
    tz = pytz.timezone(user_tz)
    now = datetime.now(tz)

    #if not fecha_hora:
    #    return None

    text = fecha_hora.lower()

    # Día
    if "mañana" in text:
        date = now + timedelta(days=1)
    else:
        date = now

    # Hora
    hour = 9
    match = re.search(r"(\d{1,2})\s*(am|pm)", text)
    if match:
        hour = int(match.group(1))
        period = match.group(2)
        if period == "pm" and hour != 12:
            hour += 12
        if period == "am" and hour == 12:
            hour = 0

    date = date.replace(hour=hour, minute=0, second=0, microsecond=0)

    return date.astimezone(pytz.UTC).isoformat()
