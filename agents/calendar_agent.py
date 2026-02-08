from ics import Calendar, Event
from datetime import datetime
import pytz

def get_event_name(event):
    ev = event["eventos"][0]
    if isinstance(ev, dict):
        return ev.get("nombre", "Evento")
    return ev

def get_participants(event):
    parts = []
    for p in event.get("participantes", []):
        if isinstance(p, dict):
            parts.append(p.get("nombre"))
        else:
            parts.append(p)
    return parts



def check_conflict(event_time_iso: str):
    # Simulación (después será DB)
    existing = ["2026-02-08T08:00:00+00:00"]

    if event_time_iso in existing:
        return {"conflict": True}
    return {"conflict": False}

