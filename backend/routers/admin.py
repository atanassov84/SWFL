from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from database import get_db
import models, schemas, auth as auth_module
from datetime import date

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard", response_model=schemas.DashboardStats)
def dashboard(
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_module.require_admin),
):
    total_users = db.query(models.User).count()
    total_helpers = db.query(models.User).filter(models.User.role == models.UserRole.helper).count()
    total_customers = db.query(models.User).filter(models.User.role == models.UserRole.customer).count()
    total_bookings = db.query(models.Booking).count()
    pending = db.query(models.Booking).filter(models.Booking.status == models.BookingStatus.pending).count()
    completed = db.query(models.Booking).filter(models.Booking.status == models.BookingStatus.completed).count()
    total_invoices = db.query(models.Invoice).count()

    today = date.today()
    month_start = f"{today.year}-{today.month:02d}-01"
    invoices_this_month = db.query(models.Invoice).filter(
        models.Invoice.created_at >= month_start,
        models.Invoice.status.in_([models.InvoiceStatus.sent, models.InvoiceStatus.paid]),
    ).all()
    revenue = sum(i.total_amount for i in invoices_this_month)

    return schemas.DashboardStats(
        total_users=total_users,
        total_helpers=total_helpers,
        total_customers=total_customers,
        total_bookings=total_bookings,
        pending_bookings=pending,
        completed_bookings=completed,
        total_invoices=total_invoices,
        revenue_this_month=revenue,
    )


@router.get("/users", response_model=List[schemas.UserOut])
def list_users(
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_module.require_admin),
):
    return db.query(models.User).order_by(models.User.created_at.desc()).all()


@router.patch("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_module.require_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")
    user.active = not user.active
    db.commit()
    return {"active": user.active}


@router.get("/bookings", response_model=List[dict])
def list_all_bookings(
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_module.require_admin),
):
    bookings = db.query(models.Booking).order_by(models.Booking.created_at.desc()).all()
    return [
        {
            "id": b.id,
            "customer_name": f"{b.customer.first_name} {b.customer.last_name}",
            "helper_name": f"{b.helper.first_name} {b.helper.last_name}",
            "service_name": b.service_category.name,
            "booking_date": b.booking_date,
            "duration_hours": b.duration_hours,
            "status": b.status.value,
            "krankenkasse_billing": b.krankenkasse_billing,
            "has_documentation": b.documentation is not None,
            "customer_confirmed": b.documentation.customer_confirmed if b.documentation else False,
        }
        for b in bookings
    ]


@router.post("/invoices", response_model=schemas.InvoiceOut)
def create_invoice(
    data: schemas.InvoiceCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_module.require_admin),
):
    customer = db.query(models.User).filter(models.User.id == data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Kunde nicht gefunden")

    bookings = (
        db.query(models.Booking)
        .filter(
            models.Booking.id.in_(data.booking_ids),
            models.Booking.customer_id == data.customer_id,
            models.Booking.status == models.BookingStatus.completed,
        )
        .all()
    )

    total_hours = sum(
        b.documentation.actual_duration_hours if b.documentation else b.duration_hours
        for b in bookings
    )

    avg_rate = 12.0
    if bookings:
        rates = [b.helper.helper_profile.hourly_rate for b in bookings if b.helper.helper_profile]
        avg_rate = sum(rates) / len(rates) if rates else 12.0

    total_amount = total_hours * avg_rate
    kk_max = 125.0  # §45b SGB XI Entlastungsbetrag
    krankenkasse_amount = min(total_amount, kk_max)
    self_pay = max(0.0, total_amount - kk_max)

    count = db.query(models.Invoice).count() + 1
    invoice_number = f"RE-{date.today().year}-{count:04d}"

    invoice = models.Invoice(
        invoice_number=invoice_number,
        customer_id=data.customer_id,
        period_start=data.period_start,
        period_end=data.period_end,
        total_hours=total_hours,
        total_amount=total_amount,
        krankenkasse_amount=krankenkasse_amount,
        self_pay_amount=self_pay,
        krankenkasse_name=customer.krankenkasse,
        notes=data.notes,
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


@router.get("/invoices", response_model=List[schemas.InvoiceOut])
def list_invoices(
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_module.require_admin),
):
    return db.query(models.Invoice).order_by(models.Invoice.created_at.desc()).all()


@router.patch("/invoices/{invoice_id}/status")
def update_invoice_status(
    invoice_id: int,
    status: models.InvoiceStatus,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_module.require_admin),
):
    invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Rechnung nicht gefunden")
    invoice.status = status
    db.commit()
    return {"status": status.value}


@router.get("/service-categories", response_model=List[schemas.ServiceCategoryOut])
def list_service_categories(db: Session = Depends(get_db)):
    return db.query(models.ServiceCategory).all()
