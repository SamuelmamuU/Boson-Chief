EVENT_SCHEMA = {
  "eventos": [
    {
      "nombre": "string",
      "fecha": "string ",
      "hora": "string"
    }
  ],
  "participantes": [
    { "nombre": "string" }
  ],
  "acciones": [
    {
      "nombre": "string",
      "requisito": "string | null"
    }
  ]
}

def normalize_schema(data: dict):
    allowed_participants = []

    for p in data.get("participantes", []):
        if isinstance(p, str) and p.strip() and "agente" not in p.lower():
            allowed_participants.append(p)

    return {
        "eventos": data.get("eventos", []),
        "participantes": allowed_participants,
        "fecha_hora": (
            data.get("fecha_hora")
            or data.get("fecha y hora")
        ),
        "acciones_necesarias": data.get("acciones_necesarias", []),
        "fecha_iso": data.get("fecha_iso")
    }
