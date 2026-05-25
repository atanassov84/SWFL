from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text,
    ForeignKey, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base


class UserRole(str, enum.Enum):
    customer = "customer"
    helper = "helper"
    admin = "admin"


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"


class InvoiceStatus(str, enum.Enum):
    draft = "draft"
    sent = "sent"
    paid = "paid"
    rejected = "rejected"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.customer, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String)
    street = Column(String)
    city = Column(String)
    postal_code = Column(String)
    pflegegrad = Column(Integer, nullable=True)  # 1-5, nur für Kunden
    krankenkasse = Column(String, nullable=True)
    versichertennummer = Column(String, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    helper_profile = relationship("HelperProfile", back_populates="user", uselist=False)
    bookings_as_customer = relationship("Booking", foreign_keys="Booking.customer_id", back_populates="customer")
    bookings_as_helper = relationship("Booking", foreign_keys="Booking.helper_id", back_populates="helper")
    reviews_given = relationship("Review", foreign_keys="Review.reviewer_id", back_populates="reviewer")
    reviews_received = relationship("Review", foreign_keys="Review.reviewee_id", back_populates="reviewee")


class HelperProfile(Base):
    __tablename__ = "helper_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    bio = Column(Text)
    hourly_rate = Column(Float, default=12.0)
    max_hours_per_week = Column(Integer, default=20)
    qualifications = Column(Text)
    insurance_certified = Column(Boolean, default=False)
    pflegegrad_experience = Column(Boolean, default=False)
    radius_km = Column(Integer, default=10)
    rating = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    active = Column(Boolean, default=True)

    user = relationship("User", back_populates="helper_profile")
    helper_services = relationship("HelperService", back_populates="helper_profile")


class ServiceCategory(Base):
    __tablename__ = "service_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    icon = Column(String)
    krankenkasse_eligible = Column(Boolean, default=True)
    paragraph_sgb = Column(String, default="§45b SGB XI")

    helper_services = relationship("HelperService", back_populates="service_category")
    bookings = relationship("Booking", back_populates="service_category")


class HelperService(Base):
    __tablename__ = "helper_services"

    id = Column(Integer, primary_key=True, index=True)
    helper_profile_id = Column(Integer, ForeignKey("helper_profiles.id"), nullable=False)
    service_category_id = Column(Integer, ForeignKey("service_categories.id"), nullable=False)

    helper_profile = relationship("HelperProfile", back_populates="helper_services")
    service_category = relationship("ServiceCategory", back_populates="helper_services")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    helper_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_category_id = Column(Integer, ForeignKey("service_categories.id"), nullable=False)
    booking_date = Column(String, nullable=False)  # YYYY-MM-DD
    start_time = Column(String, nullable=False)    # HH:MM
    duration_hours = Column(Float, nullable=False)
    address = Column(String)
    notes = Column(Text)
    status = Column(SAEnum(BookingStatus), default=BookingStatus.pending)
    krankenkasse_billing = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    customer = relationship("User", foreign_keys=[customer_id], back_populates="bookings_as_customer")
    helper = relationship("User", foreign_keys=[helper_id], back_populates="bookings_as_helper")
    service_category = relationship("ServiceCategory", back_populates="bookings")
    documentation = relationship("ServiceDocumentation", back_populates="booking", uselist=False)
    review = relationship("Review", back_populates="booking", uselist=False)


class ServiceDocumentation(Base):
    __tablename__ = "service_documentations"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True, nullable=False)
    service_description = Column(Text, nullable=False)
    actual_duration_hours = Column(Float)
    customer_confirmed = Column(Boolean, default=False)
    helper_notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    booking = relationship("Booking", back_populates="documentation")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    period_start = Column(String, nullable=False)  # YYYY-MM-DD
    period_end = Column(String, nullable=False)
    total_hours = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    krankenkasse_amount = Column(Float, default=0.0)
    self_pay_amount = Column(Float, default=0.0)
    status = Column(SAEnum(InvoiceStatus), default=InvoiceStatus.draft)
    krankenkasse_name = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    customer = relationship("User")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True, nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    booking = relationship("Booking", back_populates="review")
    reviewer = relationship("User", foreign_keys=[reviewer_id], back_populates="reviews_given")
    reviewee = relationship("User", foreign_keys=[reviewee_id], back_populates="reviews_received")
