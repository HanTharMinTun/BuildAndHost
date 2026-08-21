from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from app import models, schemas

# ============ USER CRUD ============
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    from app.auth import get_password_hash
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=get_password_hash(user.password),
        full_name=user.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# ============ PERSONAL INFO CRUD ============
def get_personal_info(db: Session):
    return db.query(models.PersonalInfo).first()

def update_personal_info(db: Session, info: schemas.PersonalInfoCreate):
    db_info = get_personal_info(db)
    if not db_info:
        db_info = models.PersonalInfo(**info.dict())
        db.add(db_info)
    else:
        for key, value in info.dict().items():
            setattr(db_info, key, value)
    db.commit()
    db.refresh(db_info)
    return db_info

# ============ SKILL CRUD ============
def get_skills(db: Session, skip: int = 0, limit: int = 100, category: Optional[str] = None):
    query = db.query(models.Skill)
    if category:
        query = query.filter(models.Skill.category == category)
    return query.order_by(models.Skill.display_order).offset(skip).limit(limit).all()

def get_skill(db: Session, skill_id: int):
    return db.query(models.Skill).filter(models.Skill.skill_id == skill_id).first()

def create_skill(db: Session, skill: schemas.SkillCreate):
    db_skill = models.Skill(**skill.dict())
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

def update_skill(db: Session, skill_id: int, skill: schemas.SkillCreate):
    db_skill = get_skill(db, skill_id)
    if not db_skill:
        return None
    for key, value in skill.dict().items():
        setattr(db_skill, key, value)
    db.commit()
    db.refresh(db_skill)
    return db_skill

def delete_skill(db: Session, skill_id: int):
    db_skill = get_skill(db, skill_id)
    if db_skill:
        db.delete(db_skill)
        db.commit()
        return True
    return False

# ============ PROJECT CRUD ============
def get_projects(db: Session, skip: int = 0, limit: int = 100, featured: Optional[bool] = None):
    query = db.query(models.Project)
    if featured is not None:
        query = query.filter(models.Project.featured == featured)
    return query.order_by(models.Project.display_order).offset(skip).limit(limit).all()

def get_project(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.project_id == project_id).first()

def get_project_by_slug(db: Session, slug: str):
    return db.query(models.Project).filter(models.Project.slug == slug).first()

def create_project(db: Session, project: schemas.ProjectCreate):
    db_project = models.Project(**project.dict(exclude={'skill_ids'}))
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    if project.skill_ids:
        for skill_id in project.skill_ids:
            skill = db.query(models.Skill).filter(models.Skill.skill_id == skill_id).first()
            if skill:
                db_project.project_skills.append(models.ProjectSkill(project_id=db_project.project_id, skill_id=skill_id))
        db.commit()
    
    return db_project

def update_project(db: Session, project_id: int, project: schemas.ProjectUpdate):
    db_project = get_project(db, project_id)
    if not db_project:
        return None
    
    for key, value in project.dict(exclude={'skill_ids'}).items():
        setattr(db_project, key, value)
    
    if project.skill_ids is not None:
        db.query(models.ProjectSkill).filter(models.ProjectSkill.project_id == project_id).delete()
        for skill_id in project.skill_ids:
            skill = db.query(models.Skill).filter(models.Skill.skill_id == skill_id).first()
            if skill:
                db_project.project_skills.append(models.ProjectSkill(project_id=project_id, skill_id=skill_id))
    
    db.commit()
    db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: int):
    db_project = get_project(db, project_id)
    if db_project:
        db.delete(db_project)
        db.commit()
        return True
    return False

# ============ EXPERIENCE CRUD ============
def get_experiences(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Experience).order_by(models.Experience.display_order).offset(skip).limit(limit).all()

def get_experience(db: Session, experience_id: int):
    return db.query(models.Experience).filter(models.Experience.experience_id == experience_id).first()

def create_experience(db: Session, experience: schemas.ExperienceCreate):
    db_experience = models.Experience(**experience.dict())
    db.add(db_experience)
    db.commit()
    db.refresh(db_experience)
    return db_experience

def update_experience(db: Session, experience_id: int, experience: schemas.ExperienceCreate):
    db_experience = get_experience(db, experience_id)
    if not db_experience:
        return None
    for key, value in experience.dict().items():
        setattr(db_experience, key, value)
    db.commit()
    db.refresh(db_experience)
    return db_experience

def delete_experience(db: Session, experience_id: int):
    db_experience = get_experience(db, experience_id)
    if db_experience:
        db.delete(db_experience)
        db.commit()
        return True
    return False

# ============ EDUCATION CRUD ============
def get_education_list(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Education).order_by(models.Education.display_order).offset(skip).limit(limit).all()

def get_education(db: Session, education_id: int):
    return db.query(models.Education).filter(models.Education.education_id == education_id).first()

def create_education(db: Session, education: schemas.EducationCreate):
    db_education = models.Education(**education.dict())
    db.add(db_education)
    db.commit()
    db.refresh(db_education)
    return db_education

def update_education(db: Session, education_id: int, education: schemas.EducationCreate):
    db_education = get_education(db, education_id)
    if not db_education:
        return None
    for key, value in education.dict().items():
        setattr(db_education, key, value)
    db.commit()
    db.refresh(db_education)
    return db_education

def delete_education(db: Session, education_id: int):
    db_education = get_education(db, education_id)
    if db_education:
        db.delete(db_education)
        db.commit()
        return True
    return False

# ============ TESTIMONIAL CRUD ============
def get_testimonials(db: Session, skip: int = 0, limit: int = 100, approved_only: bool = True):
    query = db.query(models.Testimonial)
    if approved_only:
        query = query.filter(models.Testimonial.is_approved == True)
    return query.order_by(models.Testimonial.display_order).offset(skip).limit(limit).all()

def get_testimonial(db: Session, testimonial_id: int):
    return db.query(models.Testimonial).filter(models.Testimonial.testimonial_id == testimonial_id).first()

def create_testimonial(db: Session, testimonial: schemas.TestimonialCreate):
    db_testimonial = models.Testimonial(**testimonial.dict())
    db.add(db_testimonial)
    db.commit()
    db.refresh(db_testimonial)
    return db_testimonial

def update_testimonial(db: Session, testimonial_id: int, testimonial: schemas.TestimonialCreate):
    db_testimonial = get_testimonial(db, testimonial_id)
    if not db_testimonial:
        return None
    for key, value in testimonial.dict().items():
        setattr(db_testimonial, key, value)
    db.commit()
    db.refresh(db_testimonial)
    return db_testimonial

def delete_testimonial(db: Session, testimonial_id: int):
    db_testimonial = get_testimonial(db, testimonial_id)
    if db_testimonial:
        db.delete(db_testimonial)
        db.commit()
        return True
    return False

# ============ BLOG CRUD ============
def get_blog_posts(db: Session, skip: int = 0, limit: int = 100, published_only: bool = True):
    query = db.query(models.BlogPost)
    if published_only:
        query = query.filter(models.BlogPost.is_published == True)
    return query.order_by(models.BlogPost.published_at.desc()).offset(skip).limit(limit).all()

def get_blog_post(db: Session, post_id: int):
    return db.query(models.BlogPost).filter(models.BlogPost.post_id == post_id).first()

def get_blog_post_by_slug(db: Session, slug: str):
    return db.query(models.BlogPost).filter(models.BlogPost.slug == slug).first()

def create_blog_post(db: Session, post: schemas.BlogPostCreate, user_id: int):
    db_post = models.BlogPost(**post.dict(), created_by=user_id)
    if post.is_published and not post.published_at:
        db_post.published_at = datetime.utcnow()
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def update_blog_post(db: Session, post_id: int, post: schemas.BlogPostCreate):
    db_post = get_blog_post(db, post_id)
    if not db_post:
        return None
    for key, value in post.dict().items():
        setattr(db_post, key, value)
    if post.is_published and not db_post.published_at:
        db_post.published_at = datetime.utcnow()
    db.commit()
    db.refresh(db_post)
    return db_post

def delete_blog_post(db: Session, post_id: int):
    db_post = get_blog_post(db, post_id)
    if db_post:
        db.delete(db_post)
        db.commit()
        return True
    return False

def increment_blog_view(db: Session, post_id: int):
    db_post = get_blog_post(db, post_id)
    if db_post:
        db_post.views += 1
        db.commit()
        return True
    return False

# ============ CONTACT CRUD ============
def create_contact_message(db: Session, message: schemas.ContactMessageCreate):
    db_message = models.ContactMessage(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_contact_messages(db: Session, skip: int = 0, limit: int = 100, unread_only: bool = False):
    query = db.query(models.ContactMessage)
    if unread_only:
        query = query.filter(models.ContactMessage.is_read == False)
    return query.order_by(models.ContactMessage.created_at.desc()).offset(skip).limit(limit).all()

def mark_message_read(db: Session, message_id: int):
    db_message = db.query(models.ContactMessage).filter(models.ContactMessage.message_id == message_id).first()
    if db_message:
        db_message.is_read = True
        db.commit()
        return True
    return False