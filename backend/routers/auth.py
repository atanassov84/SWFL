from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth as auth_module

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.TokenResponse)
def register(data: schemas.RegisterRequest, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == data.email).first():
        raise HTTPException(status_code=400, detail="E-Mail bereits registriert")

    user = models.User(
        email=data.email,
        password_hash=auth_module.hash_password(data.password),
        role=data.role,
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone,
        street=data.street,
        city=data.city,
        postal_code=data.postal_code,
        pflegegrad=data.pflegegrad,
        krankenkasse=data.krankenkasse,
        versichertennummer=data.versichertennummer,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if data.role == models.UserRole.helper:
        profile = models.HelperProfile(user_id=user.id)
        db.add(profile)
        db.commit()

    token = auth_module.create_access_token({"sub": user.id})
    return schemas.TokenResponse(
        access_token=token,
        user_id=user.id,
        role=user.role.value,
        full_name=f"{user.first_name} {user.last_name}",
    )


@router.post("/login", response_model=schemas.TokenResponse)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not auth_module.verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Ungültige Anmeldedaten")
    if not user.active:
        raise HTTPException(status_code=403, detail="Konto deaktiviert")

    token = auth_module.create_access_token({"sub": user.id})
    return schemas.TokenResponse(
        access_token=token,
        user_id=user.id,
        role=user.role.value,
        full_name=f"{user.first_name} {user.last_name}",
    )


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(auth_module.get_current_user)):
    return current_user


@router.put("/me", response_model=schemas.UserOut)
def update_me(
    data: schemas.UserUpdate,
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db),
):
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user
