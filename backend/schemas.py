from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from models import UserRole, BookingStatus, InvoiceStatus


# ── Auth ─────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.customer
    first_name: str
    last_name: str
    phone: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    pflegegrad: Optional[int] = None
    krankenkasse: Optional[str] = None
    versichertennummer: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 8:
            raise ValueError("Passwort muss mindestens 8 Zeichen haben")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    role: str
    full_name: str


# ── User ─────────────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: int
    email: str
    role: UserRole
    first_name: str
    last_name: str
    phone: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    pflegegrad: Optional[int] = None
    krankenkasse: Optional[str] = None
    versichertennummer: Optional[str] = None
    active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    pflegegrad: Optional[int] = None
    krankenkasse: Optional[str] = None
    versichertennummer: Optional[str] = None


# ── Helper Profile ────────────────────────────────────────────────────────────

class HelperProfileIn(BaseModel):
    bio: Optional[str] = None
    hourly_rate: float = 12.0
    max_hours_per_week: int = 20
    qualifications: Optional[str] = None
    insurance_certified: bool = False
    pflegegrad_experience: bool = False
    radius_km: int = 10
    service_category_ids: List[int] = []


class HelperProfileOut(BaseModel):
    id: int
    user_id: int
    bio: Optional[str] = None
    hourly_rate: float
    max_hours_per_week: int
    qualifications: Optional[str] = None
    insurance_certified: bool
    pflegegrad_experience: bool
    radius_km: int
    rating: float
    rating_count: int
    active: bool

    class Config:
        from_attributes = True


class HelperOut(BaseModel):
    user: UserOut
    profile: HelperProfileOut
    services: List[str] = []

    class Config:
        from_attributes = True


# ── Service Category ──────────────────────────────────────────────────────────

class ServiceCategoryOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    krankenkasse_eligible: bool
    paragraph_sgb: Optional[str] = None

    class Config:
        from_attributes = True


# ── Booking ───────────────────────────────────────────────────────────────────

class BookingCreate(BaseModel):
    helper_id: int
    service_category_id: int
    booking_date: str  # YYYY-MM-DD
    start_time: str    # HH:MM
    duration_hours: float
    address: Optional[str] = None
    notes: Optional[str] = None
    krankenkasse_billing: bool = True


class BookingOut(BaseModel):
    id: int
    customer_id: int
    helper_id: int
    service_category_id: int
    booking_date: str
    start_time: str
    duration_hours: float
    address: Optional[str] = None
    notes: Optional[str] = None
    status: BookingStatus
    krankenkasse_billing: bool
    created_at: Optional[datetime] = None

    customer_name: Optional[str] = None
    helper_name: Optional[str] = None
    service_name: Optional[str] = None

    class Config:
        from_attributes = True


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


# ── Documentation ─────────────────────────────────────────────────────────────

class DocumentationCreate(BaseModel):
    booking_id: int
    service_description: str
    actual_duration_hours: Optional[float] = None
    helper_notes: Optional[str] = None


class DocumentationOut(BaseModel):
    id: int
    booking_id: int
    service_description: str
    actual_duration_hours: Optional[float] = None
    customer_confirmed: bool
    helper_notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Review ────────────────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    booking_id: int
    reviewee_id: int
    rating: int
    comment: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v):
        if not 1 <= v <= 5:
            raise ValueError("Bewertung muss zwischen 1 und 5 liegen")
        return v


class ReviewOut(BaseModel):
    id: int
    booking_id: int
    reviewer_id: int
    reviewee_id: int
    rating: int
    comment: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Invoice ───────────────────────────────────────────────────────────────────

class InvoiceCreate(BaseModel):
    customer_id: int
    period_start: str
    period_end: str
    booking_ids: List[int]
    notes: Optional[str] = None


class InvoiceOut(BaseModel):
    id: int
    invoice_number: str
    customer_id: int
    period_start: str
    period_end: str
    total_hours: float
    total_amount: float
    krankenkasse_amount: float
    self_pay_amount: float
    status: InvoiceStatus
    krankenkasse_name: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Admin ─────────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_users: int
    total_helpers: int
    total_customers: int
    total_bookings: int
    pending_bookings: int
    completed_bookings: int
    total_invoices: int
    revenue_this_month: float
