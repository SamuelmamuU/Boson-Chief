import json
from llm.client import client
from utils.time_parser import normalize_datetime
from agents.calendar_agent import check_conflict

import re

def extract_json(text: str) -> str:
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        raise ValueError("No se encontró JSON en la respuesta del LLM")
    return match.group(0)

def clean_json(text: str) -> str:
   
    text = text.strip()
    text = re.sub(r"^```json", "", text)
    text = re.sub(r"```$", "", text)
    return text.strip()


def postprocess(data: dict, user_timezone: str):
    raw_time = (
        data.get("fecha_y_hora")
        or data.get("fecha y hora")
        or data.get("fecha_hora")
    )

    # reconstruir desde eventos
    if not raw_time and data.get("eventos"):
        evento = data["eventos"][0]

        if isinstance(evento, dict):
            fecha = evento.get("fecha")
            hora = evento.get("hora")
            if fecha or hora:
                raw_time = f"{fecha or ''} {hora or ''}".strip()

    if raw_time:
        data["fecha_iso"] = normalize_datetime(raw_time, user_timezone)
        conflict = check_conflict(data["fecha_iso"])
        if conflict["conflict"]:
            data["fecha_iso"] = None
    else:
        data["fecha_iso"] = None

    return data


def basic_agent(text: str, user_timezone: str):
    prompt = f"""
   Analiza el texto y extrae EXCLUSIVAMENTE información explícita.
NO infieras, NO supongas, NO agregues información no mencionada.

FORMATO OBLIGATORIO:
{{
  "eventos": [
    {{
      "nombre": "string",
      "fecha": "string",
      "hora": "string"
    }}
  ],
  "participantes": [
    {{ "nombre": "string" }}
  ],
  "acciones": [
    {{
      "nombre": "string",
      "requisito": "string o null"
    }}
  ]
}}
Texto:
    {text}

    Devuelve SOLO JSON válido.
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "Eres un agente de IA organizacional."},
            {"role": "user", "content": prompt}
        ]
    )
    
    raw = extract_json(response.choices[0].message.content)
    raw_data = json.loads(raw)
    return postprocess(raw_data, user_timezone)