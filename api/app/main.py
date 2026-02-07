from fastapi import FastAPI
from app.api.v1.endpoints import router as api_v1_router
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

# Incluimos las rutas del módulo v1
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"status": "La API está funcionando correctamente"}