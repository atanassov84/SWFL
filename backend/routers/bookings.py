from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, auth as auth_module

router = APIRouter(prefix="/bookings", tags=["bookings"])


def _booking_to_dict(b: models.Booking) -> dict:
    return {
        "id": b.id,
        "customer_id": b.customer_id,
        "helper_id": b.helper_id,
        "service_category_id": b.service_category_id,
        "booking_date": b.booking_date,
        "start_time": b.start_time,
        "duration_hours": b.duration_hours,
        "address": b.address,
        "notes": b.notes,
        "status": b.status.value,
        "krankenkasse_billing": b.krankenkasse_billing,
        "created_at": b.created_at.isoformat() if b.created_at else None,
        "customer_name": f"{b.customer.first_name} {b.customer.last_name}" if b.customer else None,
        "helper_name": f"{b.helper.first_name} {b.helper.last_name}" if b.helper else None,
        "service_name": b.service_category.name if b.service_category else None,
    }


@router.post("", response_model=dict)
def create_booking(
    data: schemas.BookingCreate,
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db),
):
    helper = db.query(models.User).filter(
        models.User.id == data.helper_id,
        models.User.role == models.UserRole.helper,
        models.User.active == True,
    ).first()
    if not helper:
        raise HTTPException(status_code=404, detail="Helfer nicht gefunden")

    service = db.query(models.ServiceCategory).filter(
        models.ServiceCategory.id == data.service_category_id
    ).first()
    if not service:
        raise HTTPException(status_code=404, detail="Leistung nicht gefunden")

    booking = models.Booking(
        customer_id=current_user.id,
        helper_id=data.helper_id,
        service_category_id=data.service_category_id,
        booking_date=data.booking_date,
        start_time=data.start_time,
        duration_hours=data.duration_hours,
        address=data.address or current_user.street,
        notes=data.notes,
        krankenkasse_billing=data.krankenkasse_billing,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return _booking_to_dict(booking)


@router.get("", response_model=List[dict])
def list_bookings(
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == models.UserRole.admin:
        bookings = db.query(models.Booking).order_by(models.Booking.created_at.desc()).all()
    elif current_user.role == models.UserRole.helper:
        bookings = (
            db.query(models.Booking)
            .filter(models.Booking.helper_id == current_user.id)
            .order_by(models.Booking.booking_date.desc())
            .all()
        )
    else:
        bookings = (
            db.query(models.Booking)
            .filter(models.Booking.customer_id == current_user.id)
            .order_by(models.Booking.booking_date.desc())
            .all()
        )
    return [_booking_to_dict(b) for b in bookings]


@router.get("/{booking_id}", response_model=dict)
def get_booking(
    booking_id: int,
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db),
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Buchung nicht gefunden")
    if current_user.role != models.UserRole.admin:
        if booking.customer_id != current_user.id and booking.helper_id != current_user.id:
            raise HTTPException(status_code=403, detail="Keine Berechtigung")
    return _booking_to_dict(booking)


@router.patch("/{booking_id}/status", response_model=dict)
def update_booking_status(
    booking_id: int,
    data: schemas.BookingStatusUpdate,
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db),
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Buchung nicht gefunden")

    if current_user.role == models.UserRole.customer:
        if booking.customer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Keine Berechtigung")
        if data.status not in (models.BookingStatus.cancelled,):
            raise HTTPException(status_code=403, detail="Kunden können nur stornieren")
    elif current_user.role == models.UserRole.helper:
        if booking.helper_id != current_user.id:
            raise HTTPException(status_code=403, detail="Keine Berechtigung")

    booking.status = data.status
    db.commit()
    db.refresh(booking)
    return _booking_to_dict(booking)


@router.post("/{booking_id}/documentation", response_model=dict)
def add_documentation(
    booking_id: int,
    data: schemas.DocumentationCreate,
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db),
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Buchung nicht gefunden")
    if booking.helper_id != current_user.id and current_user.role != models.UserRole.admin:
        raise HTTPException(status_code=403, detail="Nur der Helfer kann Dokumentation hinzufügen")
    if booking.documentation:
        raise HTTPException(status_code=400, detail="Dokumentation existiert bereits")

    doc = models.ServiceDocumentation(
        booking_id=booking_id,
        service_description=data.service_description,
        actual_duration_hours=data.actual_duration_hours or booking.duration_hours,
        helper_notes=data.helper_notes,
    )
    db.add(doc)
    booking.status = models.BookingStatus.completed
    db.commit()
    db.refresh(doc)
    return {
        "id": doc.id,
        "booking_id": doc.booking_id,
        "service_description": doc.service_description,
        "actual_duration_hours": doc.actual_duration_hours,
        "customer_confirmed": doc.customer_confirmed,
        "helper_notes": doc.helper_notes,
        "created_at": doc.created_at.isoformat() if doc.created_at else None,
    }


@router.post("/{booking_id}/confirm-documentation")
def confirm_documentation(
    booking_id: int,
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db),
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Buchung nicht gefunden")
    if booking.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Nur der Kunde kann bestätigen")
    if not booking.documentation:
        raise HTTPException(status_code=400, detail="Keine Dokumentation vorhanden")

    booking.documentation.customer_confirmed = True
    db.commit()
    return {"message": "Leistungsnachweis bestätigt"}


@router.post("/{booking_id}/review", response_model=dict)
def add_review(
    booking_id: int,
    data: schemas.ReviewCreate,
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db),
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Buchung nicht gefunden")
    if booking.status != models.BookingStatus.completed:
        raise HTTPException(status_code=400, detail="Buchung muss abgeschlossen sein")
    if booking.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Keine Berechtigung")
    if booking.review:
        raise HTTPException(status_code=400, detail="Bewertung existiert bereits")

    review = models.Review(
        booking_id=booking_id,
        reviewer_id=current_user.id,
        reviewee_id=booking.helper_id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)

    profile = booking.helper.helper_profile
    if profile:
        total = profile.rating * profile.rating_count + data.rating
        profile.rating_count += 1
        profile.rating = total / profile.rating_count

    db.commit()
    db.refresh(review)
    return {
        "id": review.id,
        "rating": review.rating,
        "comment": review.comment,
    }
