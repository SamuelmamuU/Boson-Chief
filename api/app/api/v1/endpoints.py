from fastapi import APIRouter

router = APIRouter()

@router.get("/saludo")
async def leer_item():
    return {"msg": "¡Hola desde la versión 1!"}