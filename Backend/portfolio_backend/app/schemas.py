from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date

# ============ AUTH SCHEMAS ============
class TokenData(BaseModel):
    """Schema for JWT token data"""
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# ============ PERSONAL INFO SCHEMAS ============
class PersonalInfoBase(BaseModel):
    full_name: str
    title: Optional[str] = None
    bio: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    resume_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None

class PersonalInfoCreate(PersonalInfoBase):
    pass

class PersonalInfoResponse(PersonalInfoBase):
    info_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ============ SKILL SCHEMAS ============
class SkillBase(BaseModel):
    name: str
    category: str
    proficiency: Optional[int] = Field(None, ge=0, le=100)
    icon_class: Optional[str] = None
    display_order: Optional[int] = 0

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    skill_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ============ PROJECT SCHEMAS ============
class ProjectBase(BaseModel):
    title: str
    slug: str
    description: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    featured: Optional[bool] = False
    featured_image: Optional[str] = None
    technologies: Optional[List[str]] = []
    github_link: Optional[str] = None
    live_demo_link: Optional[str] = None
    display_order: Optional[int] = 0

class ProjectCreate(ProjectBase):
    skill_ids: Optional[List[int]] = []

class ProjectUpdate(ProjectBase):
    skill_ids: Optional[List[int]] = []

class ProjectResponse(ProjectBase):
    project_id: int
    created_at: datetime
    updated_at: datetime
    skill_names: Optional[List[str]] = []

    class Config:
        from_attributes = True

# ============ EXPERIENCE SCHEMAS ============
class ExperienceBase(BaseModel):
    company_name: str
    position: str
    location: Optional[str] = None
    description: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    is_current: Optional[bool] = False
    display_order: Optional[int] = 0

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceResponse(ExperienceBase):
    experience_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ============ EDUCATION SCHEMAS ============
class EducationBase(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    location: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    gpa: Optional[float] = None
    display_order: Optional[int] = 0

class EducationCreate(EducationBase):
    pass

class EducationResponse(EducationBase):
    education_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ============ TESTIMONIAL SCHEMAS ============
class TestimonialBase(BaseModel):
    client_name: str
    client_position: Optional[str] = None
    client_company: Optional[str] = None
    content: str
    rating: Optional[int] = Field(None, ge=1, le=5)
    client_image: Optional[str] = None
    is_approved: Optional[bool] = True
    display_order: Optional[int] = 0

class TestimonialCreate(TestimonialBase):
    pass

class TestimonialResponse(TestimonialBase):
    testimonial_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ============ BLOG SCHEMAS ============
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime


# ============ BLOG SCHEMAS ============

class BlogPostBase(BaseModel):
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: str
    featured_image: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    is_published: bool = False
    published_at: Optional[datetime] = None


class BlogPostCreate(BlogPostBase):
    pass


class BlogPostResponse(BlogPostBase):
    post_id: int
    views: int
    created_at: datetime
    updated_at: datetime
    author_name: Optional[str] = None

    class Config:
        from_attributes = True


class BlogCommentBase(BaseModel):
    author_name: str
    author_email: Optional[EmailStr] = None
    author_website: Optional[str] = None
    content: str


class BlogCommentCreate(BlogCommentBase):
    pass


class BlogCommentResponse(BlogCommentBase):
    comment_id: int
    post_id: int
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ============ CONTACT SCHEMAS ============
# ============ NEWSLETTER SCHEMAS ============

class NewsletterSubscribe(BaseModel):
    email: EmailStr
    
class ContactMessageBase(BaseModel):
    name: str
    email: EmailStr
    subject: Optional[str] = None
    message: str

class ContactMessageCreate(ContactMessageBase):
    pass

class ContactMessageResponse(ContactMessageBase):
    message_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True