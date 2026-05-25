from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas, auth as auth_module

router = APIRouter(prefix="/helpers", tags=["helpers"])


@router.get("", response_model=List[dict])
def list_helpers(
    postal_code: Optional[str] = Query(None),
    service_id: Optional[int] = Query(None),
    max_rate: Optional[float] = Query(None),
    db: Session = Depends(get_db),
):
    query = (
        db.query(models.User, models.HelperProfile)
        .join(models.HelperProfile, models.User.id == models.HelperProfile.user_id)
        .filter(
            models.User.role == models.UserRole.helper,
            models.User.active == True,
            models.HelperProfile.active == True,
        )
    )

    if max_rate:
        query = query.filter(models.HelperProfile.hourly_rate <= max_rate)

    if service_id:
        query = query.join(
            models.HelperService,
            models.HelperProfile.id == models.HelperService.helper_profile_id,
        ).filter(models.HelperService.service_category_id == service_id)

    results = query.all()
    helpers = []
    for user, profile in results:
        services = (
            db.query(models.ServiceCategory.name)
            .join(models.HelperService, models.ServiceCategory.id == models.HelperService.service_category_id)
            .filter(models.HelperService.helper_profile_id == profile.id)
            .all()
        )
        helpers.append({
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "city": user.city,
            "postal_code": user.postal_code,
            "bio": profile.bio,
            "hourly_rate": profile.hourly_rate,
            "rating": profile.rating,
            "rating_count": profile.rating_count,
            "insurance_certified": profile.insurance_certified,
            "pflegegrad_experience": profile.pflegegrad_experience,
            "radius_km": profile.radius_km,
            "services": [s.name for s in services],
        })
    return helpers


@router.get("/{helper_id}", response_model=dict)
def get_helper(helper_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.id == helper_id,
        models.User.role == models.UserRole.helper,
        models.User.active == True,
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="Helfer nicht gefunden")

    profile = user.helper_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Helfer-Profil nicht gefunden")

    services = (
        db.query(models.ServiceCategory)
        .join(models.HelperService, models.ServiceCategory.id == models.HelperService.service_category_id)
        .filter(models.HelperService.helper_profile_id == profile.id)
        .all()
    )

    reviews = (
        db.query(models.Review)
        .filter(models.Review.reviewee_id == helper_id)
        .order_by(models.Review.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "city": user.city,
        "postal_code": user.postal_code,
        "phone": user.phone,
        "bio": profile.bio,
        "hourly_rate": profile.hourly_rate,
        "max_hours_per_week": profile.max_hours_per_week,
        "qualifications": profile.qualifications,
        "insurance_certified": profile.insurance_certified,
        "pflegegrad_experience": profile.pflegegrad_experience,
        "radius_km": profile.radius_km,
        "rating": profile.rating,
        "rating_count": profile.rating_count,
        "services": [{"id": s.id, "name": s.name, "icon": s.icon} for s in services],
        "reviews": [
            {
                "rating": r.rating,
                "comment": r.comment,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in reviews
        ],
    }


@router.put("/profile", response_model=schemas.HelperProfileOut)
def update_helper_profile(
    data: schemas.HelperProfileIn,
    current_user: models.User = Depends(auth_module.require_helper),
    db: Session = Depends(get_db),
):
    profile = current_user.helper_profile
    if not profile:
        profile = models.HelperProfile(user_id=current_user.id)
        db.add(profile)

    profile.bio = data.bio
    profile.hourly_rate = data.hourly_rate
    profile.max_hours_per_week = data.max_hours_per_week
    profile.qualifications = data.qualifications
    profile.insurance_certified = data.insurance_certified
    profile.pflegegrad_experience = data.pflegegrad_experience
    profile.radius_km = data.radius_km

    db.query(models.HelperService).filter(
        models.HelperService.helper_profile_id == profile.id
    ).delete()

    db.commit()
    db.refresh(profile)

    for cat_id in data.service_category_ids:
        hs = models.HelperService(
            helper_profile_id=profile.id,
            service_category_id=cat_id,
        )
        db.add(hs)

    db.commit()
    db.refresh(profile)
    return profile
