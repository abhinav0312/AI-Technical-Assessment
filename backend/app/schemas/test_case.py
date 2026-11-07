from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TestCaseBase(BaseModel):
    stdin: str = ""
    expected_output: str
    is_sample: bool = False
    description: Optional[str] = None
    weight: float = Field(default=1.0, ge=0.1, le=10.0)
    order_index: int = 0


class TestCaseCreate(TestCaseBase):
    pass


class TestCaseUpdate(BaseModel):
    stdin: Optional[str] = None
    expected_output: Optional[str] = None
    is_sample: Optional[bool] = None
    description: Optional[str] = None
    weight: Optional[float] = Field(None, ge=0.1, le=10.0)
    order_index: Optional[int] = None


class TestCaseResponse(TestCaseBase):
    id: str
    challenge_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class SampleTestCaseResponse(BaseModel):
    id: str
    description: Optional[str] = None
    stdin: str
    expected_output: str
    order_index: int = 0

    class Config:
        from_attributes = True
