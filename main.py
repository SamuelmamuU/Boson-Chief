import ollama
import json

def ingestion_agent(text):
    prompt = f"""
Devuelve SOLO JSON válido.
No expliques nada.


Formato EXACTO:
{{
  "personas": [],
  "fechas": [],
  "acciones": [],
  "decisiones": [],
  "proyectos": []
}}

Texto:
{text}
"""
    response = ollama.generate(
        model="mistral",
        prompt=prompt
    )["response"]

    return response


if __name__ == "__main__":
    text = """
    Reunión del proyecto Atlas con Ana y Luis.
    Decidimos mover el release al 15 de febrero a las 4pm.
    """

    raw = ingestion_agent(text)
    print("RAW RESPONSE:")
    print(raw)

    print("\nPARSED JSON:")
    print(json.loads(raw))
