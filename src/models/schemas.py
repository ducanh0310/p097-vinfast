from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID


# ── Chat ─────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)
    session_id: Optional[str] = None
    vehicle_context: Optional[dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    analysis: Optional[str] = None
    session_id: Optional[str] = None


# ── Auth ─────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email:    str
    password: str

class LoginResponse(BaseModel):
    token: str
    user:  dict


# ── Pricing ──────────────────────────────────────────────────
class ConfigRequest(BaseModel):
    model:       str
    version:     str
    color:       str
    battery:     str  # "buy" | "rent"
    province:    str
    accessories: List[str] = []

class PricingResponse(BaseModel):
    base_price:      int
    battery_cost:    int
    accessories:     List[dict]
    rolling_costs:   dict
    promotions:      List[dict]
    total_discount:  int
    final_price:     int
    province:        str
    price_version:   str
    calculated_at:   str
    disclaimer:      str


# ── Leads ─────────────────────────────────────────────────────
class LeadCreate(BaseModel):
    session_id:    str
    name:          str
    phone:         str
    province:      Optional[str] = None
    interested_in: Optional[str] = None
    budget:        Optional[int] = None
    note:          Optional[str] = None

class LeadUpdate(BaseModel):
    status:      Optional[str] = None
    assigned_to: Optional[str] = None
    note:        Optional[str] = None

class LeadOut(BaseModel):
    id:            str
    session_id:    str
    name:          Optional[str]
    phone:         Optional[str]
    province:      Optional[str]
    interested_in: Optional[str]
    budget:        Optional[int]
    status:        str
    created_at:    str

    class Config:
        from_attributes = True


# ── Quotes ────────────────────────────────────────────────────
class QuoteCreate(BaseModel):
    session_id:     str
    buyer_name:     str
    buyer_phone:    str
    model:          str
    version:        str
    color:          str
    battery:        str
    province:       str
    accessories:    List[str] = []
    price_snapshot: dict
    price_version:  str
    final_price:    int

class QuoteApprove(BaseModel):
    action:      str   # "approve" | "reject"
    seller_note: Optional[str] = None

class QuoteOut(BaseModel):
    id:             str
    buyer_name:     Optional[str]
    buyer_phone:    Optional[str]
    model:          Optional[str]
    version:        Optional[str]
    color:          Optional[str]
    province:       Optional[str]
    final_price:    int
    price_version:  str
    status:         str
    seller_note:    Optional[str]
    pdf_url:        Optional[str]
    created_at:     str
    reviewed_at:    Optional[str]

    class Config:
        from_attributes = True


# ── Promotions ────────────────────────────────────────────────
class PromotionCreate(BaseModel):
    name:           str
    description:    Optional[str] = None
    model:          str = "ALL"
    province:       Optional[str] = None
    discount_type:  str   # "fixed" | "percent"
    discount_value: int
    start_date:     str
    end_date:       str
    is_active:      bool = True

class PromotionOut(BaseModel):
    id:             str
    name:           str
    description:    Optional[str]
    model:          str
    province:       Optional[str]
    discount_type:  str
    discount_value: int
    start_date:     str
    end_date:       str
    is_active:      bool
    usage_count:    int

    class Config:
        from_attributes = True


# ── Inventory ─────────────────────────────────────────────────
class InventoryUpdate(BaseModel):
    quantity:     int
    est_delivery: Optional[str] = None

class InventoryOut(BaseModel):
    id:           str
    model:        str
    version:      str
    color:        str
    color_hex:    Optional[str]
    quantity:     int
    est_delivery: Optional[str]
    updated_at:   str

    class Config:
        from_attributes = True
