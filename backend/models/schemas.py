from typing import Optional
from pydantic import BaseModel

class ReservoirPrediction(BaseModel):
    reservoir_id: str
    name: str
    state: str
    basin: Optional[str] = None
    current_storage_pct: float
    predicted_storage_4weeks_pct: float
    shortage_probability_below_40: float
    status: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class GroundwaterDistrict(BaseModel):
    district_id: str
    district_name: str
    state: str
    water_table_depth_m: float
    classification: str
    risk_probability: float

class LeakageAnomaly(BaseModel):
    sensor_id: str
    location: str
    flow_rate_m3h: float
    pressure_bar: float
    leak_probability: float
    event_type: str