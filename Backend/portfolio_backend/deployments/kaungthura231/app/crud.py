from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from fastapi import HTTPException
from app import models, schemas
from fastapi import HTTPException

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

    # Check duplicate slug
    existing_project = (
        db.query(models.Project)
        .filter(models.Project.slug == project.slug)
        .first()
    )

    if existing_project:
        raise HTTPException(
            status_code=409,
            detail=f"Project with slug '{project.slug}' already exists"
        )

    db_project = models.Project(
        **project.dict(exclude={"skill_ids"})
    )

    db.add(db_project)

    try:
        db.commit()
        db.refresh(db_project)

    except Exception:
        db.rollback()
        raise

    # Add skills
    if project.skill_ids:

        for skill_id in project.skill_ids:

            skill = (
                db.query(models.Skill)
                .filter(models.Skill.skill_id == skill_id)
                .first()
            )

            if skill:
                db_project.project_skills.append(
                    models.ProjectSkill(
                        project_id=db_project.project_id,
                        skill_id=skill_id
                    )
                )

        db.commit()
        db.refresh(db_project)

    return db_project

def update_project(
    db: Session,
    project_id: int,
    project: schemas.ProjectUpdate
):
    db_project = get_project(db, project_id)

    if not db_project:
        return None

    update_data = project.dict(exclude={"skill_ids"})

    # Check slug only if slug is being updated
    if "slug" in update_data and update_data["slug"] is not None:

        existing_project = (
            db.query(models.Project)
            .filter(
                models.Project.slug == update_data["slug"],
                models.Project.project_id != project_id
            )
            .first()
        )

        if existing_project:
            raise HTTPException(
                status_code=400,
                detail="Project slug already exists"
            )

    # Update project fields
    for key, value in update_data.items():
        setattr(db_project, key, value)

    # Update skills
    if project.skill_ids is not None:

        db.query(models.ProjectSkill).filter(
            models.ProjectSkill.project_id == project_id
        ).delete(synchronize_session=False)

        for skill_id in project.skill_ids:

            skill = (
                db.query(models.Skill)
                .filter(models.Skill.skill_id == skill_id)
                .first()
            )

            if skill:
                db_project.project_skills.append(
                    models.ProjectSkill(
                        project_id=project_id,
                        skill_id=skill_id
                    )
                )

    try:
        db.commit()
        db.refresh(db_project)

    except Exception:
        db.rollback()
        raise

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

def create_blog_post(
    db: Session,
    post: schemas.BlogPostCreate,
    user_id: int
):
    # Check duplicate slug before inserting
    existing_post = (
        db.query(models.BlogPost)
        .filter(models.BlogPost.slug == post.slug)
        .first()
    )

    if existing_post:
        raise HTTPException(
            status_code=400,
            detail=f"Slug '{post.slug}' already exists"
        )

    db_post = models.BlogPost(
        title=post.title,
        slug=post.slug,
        excerpt=post.excerpt,
        content=post.content,
        featured_image=post.featured_image,
        tags=post.tags,
        is_published=post.is_published,
        published_at=post.published_at,
        created_by=user_id
    )

    if post.is_published and not post.published_at:
        db_post.published_at = datetime.utcnow()

    try:
        db.add(db_post)
        db.commit()
        db.refresh(db_post)

        return db_post

    except Exception:
        db.rollback()
        raise

def update_blog_post(
    db: Session,
    post_id: int,
    post: schemas.BlogPostCreate
):
    db_post = (
        db.query(models.BlogPost)
        .filter(models.BlogPost.post_id == post_id)
        .first()
    )

    if not db_post:
        return None

    # Check duplicate slug
    existing_slug = (
        db.query(models.BlogPost)
        .filter(
            models.BlogPost.slug == post.slug,
            models.BlogPost.post_id != post_id
        )
        .first()
    )

    if existing_slug:
        raise HTTPException(
            status_code=400,
            detail=f"Slug '{post.slug}' already exists"
        )

    db_post.title = post.title
    db_post.slug = post.slug
    db_post.excerpt = post.excerpt
    db_post.content = post.content
    db_post.featured_image = post.featured_image
    db_post.tags = post.tags
    db_post.is_published = post.is_published

    if post.is_published and not post.published_at:
        if not db_post.published_at:
            db_post.published_at = datetime.utcnow()
    else:
        db_post.published_at = post.published_at

    try:
        db.commit()
        db.refresh(db_post)

        return db_post

    except Exception:
        db.rollback()
        raise

def create_blog_comment(
    db: Session,
    post_id: int,
    comment: schemas.BlogCommentCreate
):
    post = (
        db.query(models.BlogPost)
        .filter(models.BlogPost.post_id == post_id)
        .first()
    )

    if not post:
        return None

    db_comment = models.BlogComment(
        post_id=post_id,
        author_name=comment.author_name,
        author_email=comment.author_email,
        author_website=comment.author_website,
        content=comment.content
    )

    try:
        db.add(db_comment)
        db.commit()
        db.refresh(db_comment)

        return db_comment

    except Exception:
        db.rollback()
        raise


def get_blog_comments(
    db: Session,
    post_id: int
):
    return (
        db.query(models.BlogComment)
        .filter(models.BlogComment.post_id == post_id)
        .order_by(models.BlogComment.created_at.desc())
        .all()
    )

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
def create_contact_message(
    db: Session,
    message: schemas.ContactMessageCreate
):
    db_message = models.ContactMessage(
        name=message.name,
        email=message.email,
        subject=message.subject,
        message=message.message
    )

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