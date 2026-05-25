from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from database import engine, Base
import models
from routers import auth, helpers, bookings, admin

# Datenbanktabellen erstellen
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Alltagshilfe App", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Router
app.include_router(auth.router)
app.include_router(helpers.router)
app.include_router(bookings.router)
app.include_router(admin.router)

# Service-Kategorien und Admin-Benutzer beim ersten Start anlegen
from database import SessionLocal
from auth import hash_password

def seed_data():
    db = SessionLocal()
    try:
        if db.query(models.ServiceCategory).count() == 0:
            categories = [
                models.ServiceCategory(
                    name="Einkaufshilfe",
                    description="Einkäufe erledigen, Besorgungen",
                    icon="🛒",
                    krankenkasse_eligible=True,
                    paragraph_sgb="§45b SGB XI",
                ),
                models.ServiceCategory(
                    name="Haushaltshilfe",
                    description="Putzen, Aufräumen, Wäsche",
                    icon="🏠",
                    krankenkasse_eligible=True,
                    paragraph_sgb="§45b SGB XI",
                ),
                models.ServiceCategory(
                    name="Begleitung & Gesellschaft",
                    description="Spazieren gehen, Arztbegleitung, Gespräche",
                    icon="🤝",
                    krankenkasse_eligible=True,
                    paragraph_sgb="§45b SGB XI",
                ),
                models.ServiceCategory(
                    name="Gartenarbeit",
                    description="Rasenmähen, Unkraut jäten, Pflanzenpflege",
                    icon="🌿",
                    krankenkasse_eligible=True,
                    paragraph_sgb="§45b SGB XI",
                ),
                models.ServiceCategory(
                    name="Fahrdienst",
                    description="Transport zu Terminen, Behörden, Einkauf",
                    icon="🚗",
                    krankenkasse_eligible=True,
                    paragraph_sgb="§45b SGB XI",
                ),
                models.ServiceCategory(
                    name="Digital-Assistenz",
                    description="Hilfe mit Computer, Smartphone, Internet",
                    icon="💻",
                    krankenkasse_eligible=False,
                    paragraph_sgb=None,
                ),
                models.ServiceCategory(
                    name="Kochen & Mahlzeiten",
                    description="Mahlzeiten zubereiten, Einkaufsliste",
                    icon="🍳",
                    krankenkasse_eligible=True,
                    paragraph_sgb="§45b SGB XI",
                ),
                models.ServiceCategory(
                    name="Behördengänge",
                    description="Begleitung zu Ämtern und Behörden",
                    icon="📋",
                    krankenkasse_eligible=True,
                    paragraph_sgb="§45b SGB XI",
                ),
            ]
            db.add_all(categories)
            db.commit()

        if not db.query(models.User).filter(models.User.email == "admin@alltagshilfe.de").first():
            admin_user = models.User(
                email="admin@alltagshilfe.de",
                password_hash=hash_password("Admin2025!"),
                role=models.UserRole.admin,
                first_name="Admin",
                last_name="System",
            )
            db.add(admin_user)
            db.commit()
    finally:
        db.close()

seed_data()

# Frontend statische Dateien
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.exists(frontend_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="assets")

    @app.get("/")
    def root():
        return FileResponse(os.path.join(frontend_path, "index.html"))

    @app.get("/{page}.html")
    def serve_page(page: str):
        file_path = os.path.join(frontend_path, f"{page}.html")
        if os.path.exists(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_path, "index.html"))


@app.get("/health")
def health():
    return {"status": "ok", "app": "Alltagshilfe"}
