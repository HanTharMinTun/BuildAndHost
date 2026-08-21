from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Date, Float, ForeignKey, ARRAY, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100))
    role = Column(String(20), default="admin")
    profile_image = Column(String(255))
    bio = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    last_login = Column(DateTime)
    is_active = Column(Boolean, default=True)

    # Relationships
    blog_posts = relationship("BlogPost", back_populates="author")

class PersonalInfo(Base):
    __tablename__ = "personal_info"

    info_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    title = Column(String(100))
    bio = Column(Text)
    email = Column(String(100))
    phone = Column(String(20))
    address = Column(Text)
    profile_image_url = Column(String(255))
    resume_url = Column(String(255))
    github_url = Column(String(255))
    linkedin_url = Column(String(255))
    twitter_url = Column(String(255))
    youtube_url = Column(String(255))
    instagram_url = Column(String(255))
    facebook_url = Column(String(255))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Skill(Base):
    __tablename__ = "skills"

    skill_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    proficiency = Column(Integer)
    icon_class = Column(String(100))
    color_code = Column(String(7))
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    project_skills = relationship("ProjectSkill", back_populates="skill")

class Project(Base):
    __tablename__ = "projects"

    project_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    description = Column(Text)
    content = Column(Text)
    category = Column(String(50))
    project_type = Column(String(50))
    status = Column(String(20), default="completed")
    featured = Column(Boolean, default=False)
    featured_image = Column(String(255))
    images = Column(ARRAY(Text), default=[])
    technologies = Column(ARRAY(Text), default=[])
    github_link = Column(String(255))
    live_demo_link = Column(String(255))
    client_name = Column(String(100))
    start_date = Column(Date)
    end_date = Column(Date)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    project_skills = relationship("ProjectSkill", back_populates="project")
    portfolio_items = relationship("PortfolioItem", back_populates="project")

class ProjectSkill(Base):
    __tablename__ = "project_skills"

    project_skill_id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.project_id", ondelete="CASCADE"))
    skill_id = Column(Integer, ForeignKey("skills.skill_id", ondelete="CASCADE"))

    # Relationships
    project = relationship("Project", back_populates="project_skills")
    skill = relationship("Skill", back_populates="project_skills")

class Experience(Base):
    __tablename__ = "experiences"

    experience_id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(200), nullable=False)
    position = Column(String(200), nullable=False)
    location = Column(String(100))
    description = Column(Text)
    achievements = Column(ARRAY(Text), default=[])
    technologies = Column(ARRAY(Text), default=[])
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    is_current = Column(Boolean, default=False)
    company_logo = Column(String(255))
    company_website = Column(String(255))
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Education(Base):
    __tablename__ = "education"

    education_id = Column(Integer, primary_key=True, index=True)
    institution = Column(String(200), nullable=False)
    degree = Column(String(200), nullable=False)
    field_of_study = Column(String(200))
    location = Column(String(100))
    description = Column(Text)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    is_current = Column(Boolean, default=False)
    gpa = Column(Float)
    logo_url = Column(String(255))
    website = Column(String(255))
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Testimonial(Base):
    __tablename__ = "testimonials"

    testimonial_id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String(100), nullable=False)
    client_position = Column(String(100))
    client_company = Column(String(100))
    content = Column(Text, nullable=False)
    rating = Column(Integer)
    client_image = Column(String(255))
    website = Column(String(255))
    is_approved = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Certification(Base):
    __tablename__ = "certifications"

    certification_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    issuing_organization = Column(String(200), nullable=False)
    issue_date = Column(Date)
    expiration_date = Column(Date)
    credential_id = Column(String(100))
    credential_url = Column(String(255))
    logo_url = Column(String(255))
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class BlogPost(Base):
    __tablename__ = "blog_posts"

    post_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    excerpt = Column(Text)
    content = Column(Text, nullable=False)
    featured_image = Column(String(255))
    category = Column(String(50))
    tags = Column(ARRAY(Text), default=[])
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    is_published = Column(Boolean, default=False)
    published_at = Column(DateTime)
    created_by = Column(Integer, ForeignKey("users.user_id"))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    author = relationship("User", back_populates="blog_posts")
    comments = relationship("BlogComment", back_populates="post")

class BlogComment(Base):
    __tablename__ = "blog_comments"

    comment_id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("blog_posts.post_id", ondelete="CASCADE"))
    author_name = Column(String(100), nullable=False)
    author_email = Column(String(100))
    author_website = Column(String(255))
    content = Column(Text, nullable=False)
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    post = relationship("BlogPost", back_populates="comments")

class PortfolioItem(Base):
    __tablename__ = "portfolio_items"

    item_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))
    description = Column(Text)
    media_type = Column(String(20), default="image")
    media_url = Column(String(255), nullable=False)
    thumbnail_url = Column(String(255))
    project_id = Column(Integer, ForeignKey("projects.project_id", ondelete="SET NULL"))
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="portfolio_items")

class Service(Base):
    __tablename__ = "services"

    service_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    icon_class = Column(String(100))
    price = Column(Float)
    price_currency = Column(String(3), default="USD")
    price_period = Column(String(20))
    features = Column(ARRAY(Text), default=[])
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class ContactMessage(Base):
    __tablename__ = "contact_messages"

    message_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    subject = Column(String(200))
    message = Column(Text, nullable=False)
    phone = Column(String(20))
    ip_address = Column(String(45))
    user_agent = Column(Text)
    is_read = Column(Boolean, default=False)
    is_replied = Column(Boolean, default=False)
    replied_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())

class NewsletterSubscriber(Base):
    __tablename__ = "newsletter_subscribers"

    subscriber_id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(100))
    is_active = Column(Boolean, default=True)
    subscribed_at = Column(DateTime, server_default=func.now())
    unsubscribed_at = Column(DateTime)

class SiteSetting(Base):
    __tablename__ = "site_settings"

    setting_id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String(100), unique=True, nullable=False, index=True)
    setting_value = Column(Text)
    setting_group = Column(String(50), default="general")
    setting_type = Column(String(20), default="text")
    description = Column(Text)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())