--
-- PostgreSQL database dump
--

\restrict yYiZ5w1Qo01cOqyn68qJZkttnJqa8mroNqw21mSlhI7whubJ63oOwpL5Jjk2q6k

-- Dumped from database version 18.4 (Homebrew)
-- Dumped by pg_dump version 18.4 (Homebrew)

-- Started on 2026-08-24 03:39:49 +0630

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 255 (class 1255 OID 17509)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: kaungkaung
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO kaungkaung;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 244 (class 1259 OID 17943)
-- Name: testimonials; Type: TABLE; Schema: public; Owner: kaungkaung
--

CREATE TABLE public.testimonials (
    testimonial_id integer NOT NULL,
    client_name character varying(100) NOT NULL,
    client_position character varying(100),
    client_company character varying(100),
    content text NOT NULL,
    rating integer,
    client_image character varying(255),
    is_approved boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT testimonials_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.testimonials OWNER TO kaungkaung;

--
-- TOC entry 252 (class 1259 OID 18012)
-- Name: active_testimonials_view; Type: VIEW; Schema: public; Owner: kaungkaung
--

CREATE VIEW public.active_testimonials_view AS
 SELECT testimonial_id,
    client_name,
    client_position,
    client_company,
    content,
    rating,
    client_image,
    is_approved,
    display_order,
    created_at
   FROM public.testimonials
  WHERE (is_approved = true)
  ORDER BY display_order;


ALTER VIEW public.active_testimonials_view OWNER TO kaungkaung;

--
-- TOC entry 254 (class 1259 OID 18023)
-- Name: blog_comments; Type: TABLE; Schema: public; Owner: kaungkaung
--

CREATE TABLE public.blog_comments (
    comment_id integer NOT NULL,
    post_id integer,
    author_name character varying(100) NOT NULL,
    author_email character varying(100),
    author_website character varying(255),
    content text NOT NULL,
    is_approved boolean,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.blog_comments OWNER TO kaungkaung;

--
-- TOC entry 253 (class 1259 OID 18022)
-- Name: blog_comments_comment_id_seq; Type: SEQUENCE; Schema: public; Owner: kaungkaung
--

CREATE SEQUENCE public.blog_comments_comment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blog_comments_comment_id_seq OWNER TO kaungkaung;

--
-- TOC entry 4096 (class 0 OID 0)
-- Dependencies: 253
-- Name: blog_comments_comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaungkaung
--

ALTER SEQUENCE public.blog_comments_comment_id_seq OWNED BY public.blog_comments.comment_id;


--
-- TOC entry 246 (class 1259 OID 17959)
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: kaungkaung
--

CREATE TABLE public.blog_posts (
    post_id integer NOT NULL,
    title character varying(200) NOT NULL,
    slug character varying(200) NOT NULL,
    excerpt text,
    content text NOT NULL,
    featured_image character varying(255),
    tags text[] DEFAULT '{}'::text[],
    views integer DEFAULT 0,
    is_published boolean DEFAULT false,
    published_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer
);


ALTER TABLE public.blog_posts OWNER TO kaungkaung;

--
-- TOC entry 245 (class 1259 OID 17958)
-- Name: blog_posts_post_id_seq; Type: SEQUENCE; Schema: public; Owner: kaungkaung
--

CREATE SEQUENCE public.blog_posts_post_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blog_posts_post_id_seq OWNER TO kaungkaung;

--
-- TOC entry 4097 (class 0 OID 0)
-- Dependencies: 245
-- Name: blog_posts_post_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaungkaung
--

ALTER SEQUENCE public.blog_posts_post_id_seq OWNED BY public.blog_posts.post_id;


--
-- TOC entry 220 (class 1259 OID 17516)
-- Name: certifications; Type: TABLE; Schema: public; Owner: kaungkaung
--

CREATE TABLE public.certifications (
    certification_id integer NOT NULL,
    name character varying(200) NOT NULL,
    issuing_organization character varying(200) NOT NULL,
    issue_date date,
    expiration_date date,
    credential_id character varying(100),
    credential_url character varying(255),
    logo_url character varying(255),
    display_order integer,
    is_active boolean,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.certifications OWNER TO kaungkaung;

--
-- TOC entry 219 (class 1259 OID 17515)
-- Name: certifications_certification_id_seq; Type: SEQUENCE; Schema: public; Owner: kaungkaung
--

CREATE SEQUENCE public.certifications_certification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.certifications_certification_id_seq OWNER TO kaungkaung;

--
-- TOC entry 4098 (class 0 OID 0)
-- Dependencies: 219
-- Name: certifications_certification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaungkaung
--

ALTER SEQUENCE public.certifications_certification_id_seq OWNED BY public.certifications.certification_id;


--
-- TOC entry 248 (class 1259 OID 17979)
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: kaungkaung
--

CREATE TABLE public.contact_messages (
    message_id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    subject character varying(200),
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.contact_messages OWNER TO kaungkaung;

--
-- TOC entry 247 (class 1259 OID 17978)
-- Name: contact_messages_message_id_seq; Type: SEQUENCE; Schema: public; Owner: kaungkaung
--

CREATE SEQUENCE public.contact_messages_message_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contact_messages_message_id_seq OWNER TO kaungkaung;

--
-- TOC entry 4099 (class 0 OID 0)
-- Dependencies: 247
-- Name: contact_messages_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaungkaung
--

ALTER SEQUENCE public.contact_messages_message_id_seq OWNED BY public.contact_messages.message_id;


--
-- TOC entry 242 (class 1259 OID 17927)
-- Name: education; Type: TABLE; Schema: public; Owner: kaungkaung
--

CREATE TABLE public.education (
    education_id integer NOT NULL,
    institution character varying(200) NOT NULL,
    degree character varying(200) NOT NULL,
    field_of_study character varying(200),
    location character varying(100),
    start_date date NOT NULL,
    end_date date,
    gpa numeric(3,2),
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.education OWNER TO kaungkaung;

--
-- TOC entry 241 (class 1259 OID 17926)
-- Name: education_education_id_seq; Type: SEQUENCE; Schema: public; Owner: kaungkaung
--

CREATE SEQUENCE public.education_education_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.education_education_id_seq OWNER TO kaungkaung;

--
-- TOC entry 4100 (class 0 OID 0)
-- Dependencies: 241
-- Name: education_education_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaungkaung
--

ALTER SEQUENCE public.education_education_id_seq OWNED BY public.education.education_id;


--
-- TOC entry 240 (class 1259 OID 17910)
-- Name: experiences; Type: TABLE; Schema: public; Owner: kaungkaung
--

CREATE TABLE public.experiences (
    experience_id integer NOT NULL,
    company_name character varying(200) NOT NULL,
    "position" character varying(200) NOT NULL,
    location character varying(100),
    description text,
    start_date date NOT NULL,
    end_date date,
    is_current boolean DEFAULT false,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.experiences OWNER TO kaungkaung;

--
-- TOC entry 239 (class 1259 OID 17909)
-- Name: experiences_experience_id_seq; Type: SEQUENCE; Schema: public; Owner: kaungkaung
--

CREATE SEQUENCE public.experiences_experience_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.experiences_experience_id_seq OWNER TO kaungkaung;

--
-- TOC entry 4101 (class 0 OID 0)
-- Dependencies: 239
-- Name: experiences_experience_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaungkaung
--

ALTER SEQUENCE public.experiences_experience_id_seq OWNED BY public.experiences.experience_id;


--
-- TOC entry 249 (class 1259 OID 17999)
-- Name: project_details_view; Type: VIEW; Schema: public; Owner: kaungkaung
--

CREATE VIEW public.project_details_view AS
SELECT
    NULL::integer AS project_id,
    NULL::character varying(200) AS title,
    NULL::character varying(200) AS slug,
    NULL::text AS description,
    NULL::text AS content,
    NULL::character varying(50) AS category,
    NULL::boolean AS featured,
    NULL::character varying(255) AS featured_image,
    NULL::text[] AS technologies,
    NULL::character varying(255) AS github_link,
    NULL::character varying(255) AS live_demo_link,
    NULL::integer AS display_order,
    NULL::timestamp without time zone AS created_at,
    NULL::timestamp without time zone AS updated_at,
    NULL::character varying[] AS skill_names;


ALTER VIEW public.project_details_view OWNER TO kaungkaung;

--
-- TOC entry 250 (class 1259 OID 18004)
-- Name: featured_projects_view; Type: VIEW; Schema: public; Owner: kaungkaung
--

CREATE VIEW public.featured_projects_view AS
 SELECT project_id,
    title,
    slug,
    description,
    content,
    category,
    featured,
    featured_image,
    technologies,
    github_link,
    live_demo_link,
    display_order,
    created_at,
    updated_at,
    skill_names
   FROM public.project_details_view
  WHERE (featured = true)
  ORDER BY display_order;


ALTER VIEW public.featured_projects_view OWNER TO kaungkaung;

--
-- TOC entry 226 (class 1259 OID 17583)
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: kaungkaung
--

CREATE TABLE public.newsletter_subscribers (
    subscriber_id integer NOT NULL,
    email character varying(100) NOT NULL,
    name character varying(100),
    is_active boolean,
    subscribed_at timestamp without time zone DEFAULT now(),
    unsubscribed_at timestamp without time zone
);


ALTER TABLE public.newsletter_subscribers OWNER TO kaungkaung;

--
-- TOC entry 225 (class 1259 OID 17582)
-- Name: newsletter_subscribers_subscriber_id_seq; Type: SEQUENCE; Schema: public; Owner: kaungkaung
--

CREATE SEQUENCE public.newsletter_subscribers_subscriber_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.newsletter_subscribers_subscriber_id_seq OWNER TO kaungkaung;

--
-- TOC entry 4102 (class 0 OID 0)
-- Dependencies: 225
-- Name: newsletter_subscribers_subscriber_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaungkaung
--

ALTER SEQUENCE public.newsletter_subscribers_subscriber_id_seq OWNED BY public.newsletter_subscribers.subscriber_id;


--
-- TOC entry 232 (class 1259 OID 17845)
-- Name: personal_info; Type: TABLE; Schema: public; Owner: kaungkaung
--

CREATE TABLE public.personal_info (
    info_id integer NOT NULL,
    full_name character varying(100) NOT NULL,
    title character varying(100),
    bio text,
    email character varying(100),
    phone character varying(20),
    profile_image character varying(255),
    resume_url character varying(255),
    github_url character varying(255),
    linkedin_url character varying(255),
    twitter_url character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.personal_info OWNER TO kaungkaung;

--
-- TOC entry 231 (class 1259 OID 17844)
-- Name: personal_info_info_id_seq; Type: SEQUENCE; Schema: public; Owner: kaungkaung
--

CREATE SEQUENCE public.personal_info_info_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_info_info_id_seq OWNER TO kaungkaung;

--
-- TOC entry 4103 (class 0 OID 0)
-- Dependencies: 231
-- Name: personal_info_info_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaungkaung
--

ALTER SEQUENCE public.personal_info_info_id_seq OWNED BY public.personal_info.info_id;


--
-- TOC entry 222 (class 1259 OID 17550)
-- Name: portfolio_items; Type: TABLE; Schema: public; Owner: kaungkaung
--

CREATE TABLE public.portfolio_items (
    item_id integer NOT NULL,
    title character varying(200),
    description text,
    media_type character varying(20),
    media_url character varying(255) NOT NULL,
    thumbnail_url character varying(255),
    project_id integer,
    display_order integer,
    is_active boolean,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.portfolio_items OWNER TO kaungkaung;

--
-- TOC entry 221 (class 1259 OID 17549)
-- Name: portfolio_items_item_id_seq; Type: SEQUENCE; Schema: public; Owner: kaungkaung
--

CREATE SEQUENCE public.portfolio_items_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.portfolio_items_item_id_seq OWNER TO kaungkaung;

--
-- TOC entry 4104 (class 0 OID 0)
-- Dependencies: 221
-- Name: portfolio_items_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaungkaung
--

ALTER SEQUENCE public.portfolio_items_item_id_seq OWNED BY public.portfolio_items.item_id;


--
-- TOC entry 238 (class 1259 OID 17890)
-- Name: project_skills; Type: TABLE; Schema: public; Owner: kaungkaung
--

CREATE TABLE public.project_skills (
    project_skill_id integer NOT NULL,
    project_id integer,
    skill_id integer
);


ALTER TABLE public.project_skills OWNER TO kaungkaung;

--
-- TOC entry 237 (class 1259 OID 17889)
-- Name: project_skills_project_skill_id_seq; Type: SEQUENCE; Schema: public; Owner: kaungkaung
--

CREATE SEQUENCE public.project_skills_project_skill_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.project_skills_project_skill_id_seq OWNER TO kaungkaung;

--
-- TOC entry 4105 (class 0 OID 0)
-- Dependencies: 237
-- Name: project_skills_project_skill_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaungkaung
--

ALTER SEQUENCE public.project_skills_project_skill_id_seq OWNED BY public.project_skills.project_skill_id;


--
-- TOC entry 236 (class 1259 OID 17871)
-- Name: projects; Type: TABLE; Schema: public; Owner: kaungkaung
--

CREATE TABLE public.projects (
    project_id integer NOT NULL,
    title character varying(200) NOT NULL,
    slug character varying(200) NOT NULL,
    description text,
    content text,
    category character varying(50),
    featured boolean DEFAULT false,
    featured_image character varying(255),
    technologies text[] DEFAULT '{}'::text[],
    github_link character varying(255),
    live_demo_link character varying(255),
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.projects OWNER TO kaungkaung;

--
-- TOC entry 235 (class 1259 OID 17870)
-- Name: projects_project_id_seq; Type: SEQUENCE; Schema: public; Owner: kaungkaung
--

CREATE SEQUENCE public.projects_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.projects_project_id_seq OWNER TO kaungkaung;

--
-- TOC entry 4106 (class 0 OID 0)
-- Dependencies: 235
-- Name: projects_project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaungkaung
--

ALTER SEQUENCE public.projects_project_id_seq OWNED BY public.projects.project_id;


--
-- TOC entry 251 (class 1259 OID 18008)
-- Name: published_blog_posts_view; Type: VIEW; Schema: public; Owner: kaungkaung
--

CREATE VIEW public.published_blog_posts_view AS
 SELECT post_id,
    title,
    slug,
    excerpt,
    content,
    featured_image,
    tags,
    views,
    is_published,
    published_at,
    created_at,
    updated_at
   FROM public.blog_posts
  WHERE (is_published = true)
  ORDER BY published_at DESC;


ALTER VIEW public.published_blog_posts_view OWNER TO kaungkaung;

--
-- TOC entry 224 (class 1259 OID 17569)
-- Name: services; Type: TABLE; Schema: public; Owner: kaungkaung
--

CREATE TABLE public.services (
    service_id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    icon_class character varying(100),
    price double precision,
    price_currency character varying(3),
    price_period character varying(20),
    features text[],
    display_order integer,
    is_active boolean,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.services OWNER TO kaungkaung;

--
-- TOC entry 223 (class 1259 OID 17568)
-- Name: services_service_id_seq; Type: SEQUENCE; Schema: public; Owner: kaungkaung
--

CREATE SEQUENCE public.services_service_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_service_id_seq OWNER TO kaungkaung;

--
-- TOC entry 4107 (class 0 OID 0)
-- Dependencies: 223
-- Name: services_service_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaungkaung
--

ALTER SEQUENCE public.services_service_id_seq OWNED BY public.services.service_id;


--
-- TOC entry 228 (class 1259 OID 17595)
-- Name: site_settings; Type: TABLE; Schema: public; Owner: kaungkaung
--

CREATE TABLE public.site_settings (
    setting_id integer NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value text,
    setting_group character varying(50),
    setting_type character varying(20),
    description text,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.site_settings OWNER TO kaungkaung;

--
-- TOC entry 227 (class 1259 OID 17594)
-- Name: site_settings_setting_id_seq; Type: SEQUENCE; Schema: public; Owner: kaungkaung
--

CREATE SEQUENCE public.site_settings_setting_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.site_settings_setting_id_seq OWNER TO kaungkaung;

--
-- TOC entry 4108 (class 0 OID 0)
-- Dependencies: 227
-- Name: site_settings_setting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaungkaung
--

ALTER SEQUENCE public.site_settings_setting_id_seq OWNED BY public.site_settings.setting_id;


--
-- TOC entry 234 (class 1259 OID 17858)
-- Name: skills; Type: TABLE; Schema: public; Owner: kaungkaung
--

CREATE TABLE public.skills (
    skill_id integer NOT NULL,
    name character varying(100) NOT NULL,
    category character varying(50) NOT NULL,
    proficiency integer,
    icon_class character varying(100),
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT skills_proficiency_check CHECK (((proficiency >= 0) AND (proficiency <= 100)))
);


ALTER TABLE public.skills OWNER TO kaungkaung;

--
-- TOC entry 233 (class 1259 OID 17857)
-- Name: skills_skill_id_seq; Type: SEQUENCE; Schema: public; Owner: kaungkaung
--

CREATE SEQUENCE public.skills_skill_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.skills_skill_id_seq OWNER TO kaungkaung;

--
-- TOC entry 4109 (class 0 OID 0)
-- Dependencies: 233
-- Name: skills_skill_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaungkaung
--

ALTER SEQUENCE public.skills_skill_id_seq OWNED BY public.skills.skill_id;


--
-- TOC entry 243 (class 1259 OID 17942)
-- Name: testimonials_testimonial_id_seq; Type: SEQUENCE; Schema: public; Owner: kaungkaung
--

CREATE SEQUENCE public.testimonials_testimonial_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.testimonials_testimonial_id_seq OWNER TO kaungkaung;

--
-- TOC entry 4110 (class 0 OID 0)
-- Dependencies: 243
-- Name: testimonials_testimonial_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaungkaung
--

ALTER SEQUENCE public.testimonials_testimonial_id_seq OWNED BY public.testimonials.testimonial_id;


--
-- TOC entry 230 (class 1259 OID 17827)
-- Name: users; Type: TABLE; Schema: public; Owner: kaungkaung
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO kaungkaung;

--
-- TOC entry 229 (class 1259 OID 17826)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: kaungkaung
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO kaungkaung;

--
-- TOC entry 4111 (class 0 OID 0)
-- Dependencies: 229
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaungkaung
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 3839 (class 2604 OID 18026)
-- Name: blog_comments comment_id; Type: DEFAULT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.blog_comments ALTER COLUMN comment_id SET DEFAULT nextval('public.blog_comments_comment_id_seq'::regclass);


--
-- TOC entry 3830 (class 2604 OID 17962)
-- Name: blog_posts post_id; Type: DEFAULT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.blog_posts ALTER COLUMN post_id SET DEFAULT nextval('public.blog_posts_post_id_seq'::regclass);


--
-- TOC entry 3787 (class 2604 OID 17519)
-- Name: certifications certification_id; Type: DEFAULT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.certifications ALTER COLUMN certification_id SET DEFAULT nextval('public.certifications_certification_id_seq'::regclass);


--
-- TOC entry 3836 (class 2604 OID 17982)
-- Name: contact_messages message_id; Type: DEFAULT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.contact_messages ALTER COLUMN message_id SET DEFAULT nextval('public.contact_messages_message_id_seq'::regclass);


--
-- TOC entry 3822 (class 2604 OID 17930)
-- Name: education education_id; Type: DEFAULT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.education ALTER COLUMN education_id SET DEFAULT nextval('public.education_education_id_seq'::regclass);


--
-- TOC entry 3816 (class 2604 OID 17913)
-- Name: experiences experience_id; Type: DEFAULT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.experiences ALTER COLUMN experience_id SET DEFAULT nextval('public.experiences_experience_id_seq'::regclass);


--
-- TOC entry 3796 (class 2604 OID 17586)
-- Name: newsletter_subscribers subscriber_id; Type: DEFAULT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.newsletter_subscribers ALTER COLUMN subscriber_id SET DEFAULT nextval('public.newsletter_subscribers_subscriber_id_seq'::regclass);


--
-- TOC entry 3802 (class 2604 OID 17848)
-- Name: personal_info info_id; Type: DEFAULT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.personal_info ALTER COLUMN info_id SET DEFAULT nextval('public.personal_info_info_id_seq'::regclass);


--
-- TOC entry 3790 (class 2604 OID 17553)
-- Name: portfolio_items item_id; Type: DEFAULT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.portfolio_items ALTER COLUMN item_id SET DEFAULT nextval('public.portfolio_items_item_id_seq'::regclass);


--
-- TOC entry 3815 (class 2604 OID 17893)
-- Name: project_skills project_skill_id; Type: DEFAULT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.project_skills ALTER COLUMN project_skill_id SET DEFAULT nextval('public.project_skills_project_skill_id_seq'::regclass);


--
-- TOC entry 3808 (class 2604 OID 17874)
-- Name: projects project_id; Type: DEFAULT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.projects ALTER COLUMN project_id SET DEFAULT nextval('public.projects_project_id_seq'::regclass);


--
-- TOC entry 3793 (class 2604 OID 17572)
-- Name: services service_id; Type: DEFAULT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.services ALTER COLUMN service_id SET DEFAULT nextval('public.services_service_id_seq'::regclass);


--
-- TOC entry 3798 (class 2604 OID 17598)
-- Name: site_settings setting_id; Type: DEFAULT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.site_settings ALTER COLUMN setting_id SET DEFAULT nextval('public.site_settings_setting_id_seq'::regclass);


--
-- TOC entry 3805 (class 2604 OID 17861)
-- Name: skills skill_id; Type: DEFAULT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.skills ALTER COLUMN skill_id SET DEFAULT nextval('public.skills_skill_id_seq'::regclass);


--
-- TOC entry 3826 (class 2604 OID 17946)
-- Name: testimonials testimonial_id; Type: DEFAULT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.testimonials ALTER COLUMN testimonial_id SET DEFAULT nextval('public.testimonials_testimonial_id_seq'::regclass);


--
-- TOC entry 3800 (class 2604 OID 17830)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 4090 (class 0 OID 18023)
-- Dependencies: 254
-- Data for Name: blog_comments; Type: TABLE DATA; Schema: public; Owner: kaungkaung
--

COPY public.blog_comments (comment_id, post_id, author_name, author_email, author_website, content, is_approved, created_at) FROM stdin;
\.


--
-- TOC entry 4086 (class 0 OID 17959)
-- Dependencies: 246
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: kaungkaung
--

COPY public.blog_posts (post_id, title, slug, excerpt, content, featured_image, tags, views, is_published, published_at, created_at, updated_at, created_by) FROM stdin;
2	My First Blog Post	my-first-blog-post	A short introduction to my blog post	This is the full content of my blog post. It contains detailed information about the topic.	https://example.com/image.jpg	{tech,python,fastapi}	0	f	\N	2026-08-24 02:58:47.635231	2026-08-24 02:58:47.635231	1
\.


--
-- TOC entry 4060 (class 0 OID 17516)
-- Dependencies: 220
-- Data for Name: certifications; Type: TABLE DATA; Schema: public; Owner: kaungkaung
--

COPY public.certifications (certification_id, name, issuing_organization, issue_date, expiration_date, credential_id, credential_url, logo_url, display_order, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4088 (class 0 OID 17979)
-- Dependencies: 248
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: kaungkaung
--

COPY public.contact_messages (message_id, name, email, subject, message, is_read, created_at) FROM stdin;
1	Visitor	visitor@example.com	Inquiry	I have a question about your services.	t	2026-08-24 02:59:56.19064
\.


--
-- TOC entry 4082 (class 0 OID 17927)
-- Dependencies: 242
-- Data for Name: education; Type: TABLE DATA; Schema: public; Owner: kaungkaung
--

COPY public.education (education_id, institution, degree, field_of_study, location, start_date, end_date, gpa, display_order, created_at, updated_at) FROM stdin;
2	MIT	M.S. Software Engineering	Software Engineering	Cambridge, MA	2020-09-01	2022-06-30	3.90	2	2026-08-22 15:18:46.42009	2026-08-22 15:18:46.42009
4	MIT	B.Sc.	Computer Science	Cambridge, MA	2025-08-23	2026-08-23	3.80	0	2026-08-24 01:03:37.367617	2026-08-24 01:03:37.367617
5	MIT	B.Sc.	Computer Science	Cambridge, MA	2025-08-23	2026-08-23	3.80	0	2026-08-24 01:06:26.752102	2026-08-24 01:06:26.752102
6	MIT	B.Sc.	Computer Science	Cambridge, MA	2025-08-23	2026-08-23	3.80	0	2026-08-24 02:57:27.642906	2026-08-24 02:57:27.642906
\.


--
-- TOC entry 4080 (class 0 OID 17910)
-- Dependencies: 240
-- Data for Name: experiences; Type: TABLE DATA; Schema: public; Owner: kaungkaung
--

COPY public.experiences (experience_id, company_name, "position", location, description, start_date, end_date, is_current, display_order, created_at, updated_at, is_active) FROM stdin;
2	Web Solutions Inc	Full Stack Developer	New York, NY	Built and maintained 20+ client websites. Improved performance by 60%.	2020-06-01	2022-12-31	f	2	2026-08-22 15:18:46.419156	2026-08-22 15:18:46.419156	t
4	Google	Software Engineer	Remote	Built scalable backend services	2025-08-23	2026-08-23	f	0	2026-08-24 02:56:19.629479	2026-08-24 02:56:19.629479	t
\.


--
-- TOC entry 4066 (class 0 OID 17583)
-- Dependencies: 226
-- Data for Name: newsletter_subscribers; Type: TABLE DATA; Schema: public; Owner: kaungkaung
--

COPY public.newsletter_subscribers (subscriber_id, email, name, is_active, subscribed_at, unsubscribed_at) FROM stdin;
\.


--
-- TOC entry 4072 (class 0 OID 17845)
-- Dependencies: 232
-- Data for Name: personal_info; Type: TABLE DATA; Schema: public; Owner: kaungkaung
--

COPY public.personal_info (info_id, full_name, title, bio, email, phone, profile_image, resume_url, github_url, linkedin_url, twitter_url, created_at, updated_at) FROM stdin;
1	John Doe	Full Stack Developer	Building awesome things with FastAPI and React	john@example.com	+1234567890	\N	\N	https://github.com/johndoe	https://linkedin.com/in/johndoe	https://twitter.com/johndoe	2026-08-22 15:18:46.413369	2026-08-23 23:36:30.579798
\.


--
-- TOC entry 4062 (class 0 OID 17550)
-- Dependencies: 222
-- Data for Name: portfolio_items; Type: TABLE DATA; Schema: public; Owner: kaungkaung
--

COPY public.portfolio_items (item_id, title, description, media_type, media_url, thumbnail_url, project_id, display_order, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4078 (class 0 OID 17890)
-- Dependencies: 238
-- Data for Name: project_skills; Type: TABLE DATA; Schema: public; Owner: kaungkaung
--

COPY public.project_skills (project_skill_id, project_id, skill_id) FROM stdin;
9	3	9
10	3	10
1	\N	\N
2	\N	2
3	\N	3
4	\N	8
5	\N	\N
6	\N	2
7	\N	3
8	\N	7
\.


--
-- TOC entry 4076 (class 0 OID 17871)
-- Dependencies: 236
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: kaungkaung
--

COPY public.projects (project_id, title, slug, description, content, category, featured, featured_image, technologies, github_link, live_demo_link, display_order, created_at, updated_at, is_active) FROM stdin;
3	Mobile App UI Kit	mobile-app-ui-kit	Modern UI kit for mobile	Detailed project description...	Design	f	/images/projects/uikit.jpg	{Figma,Sketch}	\N	https://uikit-demo.com	3	2026-08-22 15:18:46.416221	2026-08-22 15:18:46.416221	t
4	My Awesome Project	my-awesome-project	A cool project built with modern technologies	\N	web	f	\N	{React,FastAPI,PostgreSQL}	https://github.com/username/project	https://project-demo.com	0	2026-08-24 00:05:39.699382	2026-08-24 00:05:39.699382	t
\.


--
-- TOC entry 4064 (class 0 OID 17569)
-- Dependencies: 224
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: kaungkaung
--

COPY public.services (service_id, title, description, icon_class, price, price_currency, price_period, features, display_order, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4068 (class 0 OID 17595)
-- Dependencies: 228
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: kaungkaung
--

COPY public.site_settings (setting_id, setting_key, setting_value, setting_group, setting_type, description, updated_at) FROM stdin;
\.


--
-- TOC entry 4074 (class 0 OID 17858)
-- Dependencies: 234
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: kaungkaung
--

COPY public.skills (skill_id, name, category, proficiency, icon_class, display_order, created_at) FROM stdin;
3	Node.js	programming	80	devicon-nodejs-plain	3	2026-08-22 15:18:46.414632
5	HTML5	programming	95	devicon-html5-plain	5	2026-08-22 15:18:46.414632
6	CSS3	programming	90	devicon-css3-plain	6	2026-08-22 15:18:46.414632
7	PostgreSQL	database	75	devicon-postgresql-plain	7	2026-08-22 15:18:46.414632
8	MongoDB	database	70	devicon-mongodb-plain	8	2026-08-22 15:18:46.414632
9	Figma	design	65	devicon-figma-plain	9	2026-08-22 15:18:46.414632
10	Photoshop	design	60	devicon-photoshop-plain	10	2026-08-22 15:18:46.414632
11	Python	backend	90	fab fa-python	0	2026-08-23 23:36:48.174657
12	Python	backend	90	fab fa-python	0	2026-08-23 23:37:25.988044
13	Python	backend	90	fab fa-python	0	2026-08-23 23:41:52.5317
2	Python	backend	90	fab fa-python	0	2026-08-22 15:18:46.414632
14	Python	backend	90	fab fa-python	0	2026-08-24 02:53:25.303906
\.


--
-- TOC entry 4084 (class 0 OID 17943)
-- Dependencies: 244
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: kaungkaung
--

COPY public.testimonials (testimonial_id, client_name, client_position, client_company, content, rating, client_image, is_approved, display_order, created_at) FROM stdin;
2	Mike Chen	Product Manager	Web Solutions Inc	A pleasure to work with. Understands business needs perfectly.	5	\N	t	2	2026-08-22 15:18:46.421003
4	Jane Doe	CEO	Acme Inc	Amazing work! Highly recommended.	5	\N	t	0	2026-08-24 02:14:28.385999
5	Jane Doe	CEO	Acme Inc	Amazing work! Highly recommended.	5	\N	t	0	2026-08-24 02:58:09.604064
\.


--
-- TOC entry 4070 (class 0 OID 17827)
-- Dependencies: 230
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: kaungkaung
--

COPY public.users (user_id, username, email, password_hash, full_name, created_at) FROM stdin;
1	Testuser1	test@example.com	$2b$12$l7Z3e24OcP3YbNWnk47FqeFB0sNvcC3xIS0m6C9q/nP8IIIIU3gyS	Test User	2026-08-24 02:52:38.500113
\.


--
-- TOC entry 4112 (class 0 OID 0)
-- Dependencies: 253
-- Name: blog_comments_comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaungkaung
--

SELECT pg_catalog.setval('public.blog_comments_comment_id_seq', 1, false);


--
-- TOC entry 4113 (class 0 OID 0)
-- Dependencies: 245
-- Name: blog_posts_post_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaungkaung
--

SELECT pg_catalog.setval('public.blog_posts_post_id_seq', 2, true);


--
-- TOC entry 4114 (class 0 OID 0)
-- Dependencies: 219
-- Name: certifications_certification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaungkaung
--

SELECT pg_catalog.setval('public.certifications_certification_id_seq', 1, false);


--
-- TOC entry 4115 (class 0 OID 0)
-- Dependencies: 247
-- Name: contact_messages_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaungkaung
--

SELECT pg_catalog.setval('public.contact_messages_message_id_seq', 1, true);


--
-- TOC entry 4116 (class 0 OID 0)
-- Dependencies: 241
-- Name: education_education_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaungkaung
--

SELECT pg_catalog.setval('public.education_education_id_seq', 6, true);


--
-- TOC entry 4117 (class 0 OID 0)
-- Dependencies: 239
-- Name: experiences_experience_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaungkaung
--

SELECT pg_catalog.setval('public.experiences_experience_id_seq', 4, true);


--
-- TOC entry 4118 (class 0 OID 0)
-- Dependencies: 225
-- Name: newsletter_subscribers_subscriber_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaungkaung
--

SELECT pg_catalog.setval('public.newsletter_subscribers_subscriber_id_seq', 1, false);


--
-- TOC entry 4119 (class 0 OID 0)
-- Dependencies: 231
-- Name: personal_info_info_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaungkaung
--

SELECT pg_catalog.setval('public.personal_info_info_id_seq', 1, true);


--
-- TOC entry 4120 (class 0 OID 0)
-- Dependencies: 221
-- Name: portfolio_items_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaungkaung
--

SELECT pg_catalog.setval('public.portfolio_items_item_id_seq', 1, false);


--
-- TOC entry 4121 (class 0 OID 0)
-- Dependencies: 237
-- Name: project_skills_project_skill_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaungkaung
--

SELECT pg_catalog.setval('public.project_skills_project_skill_id_seq', 10, true);


--
-- TOC entry 4122 (class 0 OID 0)
-- Dependencies: 235
-- Name: projects_project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaungkaung
--

SELECT pg_catalog.setval('public.projects_project_id_seq', 5, true);


--
-- TOC entry 4123 (class 0 OID 0)
-- Dependencies: 223
-- Name: services_service_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaungkaung
--

SELECT pg_catalog.setval('public.services_service_id_seq', 1, false);


--
-- TOC entry 4124 (class 0 OID 0)
-- Dependencies: 227
-- Name: site_settings_setting_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaungkaung
--

SELECT pg_catalog.setval('public.site_settings_setting_id_seq', 1, false);


--
-- TOC entry 4125 (class 0 OID 0)
-- Dependencies: 233
-- Name: skills_skill_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaungkaung
--

SELECT pg_catalog.setval('public.skills_skill_id_seq', 14, true);


--
-- TOC entry 4126 (class 0 OID 0)
-- Dependencies: 243
-- Name: testimonials_testimonial_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaungkaung
--

SELECT pg_catalog.setval('public.testimonials_testimonial_id_seq', 5, true);


--
-- TOC entry 4127 (class 0 OID 0)
-- Dependencies: 229
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaungkaung
--

SELECT pg_catalog.setval('public.users_user_id_seq', 1, true);


--
-- TOC entry 3897 (class 2606 OID 18034)
-- Name: blog_comments blog_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_pkey PRIMARY KEY (comment_id);


--
-- TOC entry 3888 (class 2606 OID 17975)
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (post_id);


--
-- TOC entry 3890 (class 2606 OID 17977)
-- Name: blog_posts blog_posts_slug_key; Type: CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);


--
-- TOC entry 3844 (class 2606 OID 17528)
-- Name: certifications certifications_pkey; Type: CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT certifications_pkey PRIMARY KEY (certification_id);


--
-- TOC entry 3894 (class 2606 OID 17992)
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (message_id);


--
-- TOC entry 3884 (class 2606 OID 17941)
-- Name: education education_pkey; Type: CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.education
    ADD CONSTRAINT education_pkey PRIMARY KEY (education_id);


--
-- TOC entry 3882 (class 2606 OID 17925)
-- Name: experiences experiences_pkey; Type: CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.experiences
    ADD CONSTRAINT experiences_pkey PRIMARY KEY (experience_id);


--
-- TOC entry 3855 (class 2606 OID 17591)
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (subscriber_id);


--
-- TOC entry 3867 (class 2606 OID 17856)
-- Name: personal_info personal_info_pkey; Type: CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.personal_info
    ADD CONSTRAINT personal_info_pkey PRIMARY KEY (info_id);


--
-- TOC entry 3848 (class 2606 OID 17561)
-- Name: portfolio_items portfolio_items_pkey; Type: CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.portfolio_items
    ADD CONSTRAINT portfolio_items_pkey PRIMARY KEY (item_id);


--
-- TOC entry 3878 (class 2606 OID 17896)
-- Name: project_skills project_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.project_skills
    ADD CONSTRAINT project_skills_pkey PRIMARY KEY (project_skill_id);


--
-- TOC entry 3880 (class 2606 OID 17898)
-- Name: project_skills project_skills_project_id_skill_id_key; Type: CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.project_skills
    ADD CONSTRAINT project_skills_project_id_skill_id_key UNIQUE (project_id, skill_id);


--
-- TOC entry 3874 (class 2606 OID 17886)
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (project_id);


--
-- TOC entry 3876 (class 2606 OID 17888)
-- Name: projects projects_slug_key; Type: CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_slug_key UNIQUE (slug);


--
-- TOC entry 3851 (class 2606 OID 17580)
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (service_id);


--
-- TOC entry 3859 (class 2606 OID 17605)
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (setting_id);


--
-- TOC entry 3870 (class 2606 OID 17869)
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (skill_id);


--
-- TOC entry 3886 (class 2606 OID 17957)
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (testimonial_id);


--
-- TOC entry 3861 (class 2606 OID 17843)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3863 (class 2606 OID 17839)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3865 (class 2606 OID 17841)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3891 (class 1259 OID 17996)
-- Name: idx_blog_posts_published; Type: INDEX; Schema: public; Owner: kaungkaung
--

CREATE INDEX idx_blog_posts_published ON public.blog_posts USING btree (published_at) WHERE (is_published = true);


--
-- TOC entry 3892 (class 1259 OID 17995)
-- Name: idx_blog_posts_slug; Type: INDEX; Schema: public; Owner: kaungkaung
--

CREATE INDEX idx_blog_posts_slug ON public.blog_posts USING btree (slug);


--
-- TOC entry 3895 (class 1259 OID 17998)
-- Name: idx_contact_messages_created; Type: INDEX; Schema: public; Owner: kaungkaung
--

CREATE INDEX idx_contact_messages_created ON public.contact_messages USING btree (created_at);


--
-- TOC entry 3871 (class 1259 OID 17994)
-- Name: idx_projects_featured; Type: INDEX; Schema: public; Owner: kaungkaung
--

CREATE INDEX idx_projects_featured ON public.projects USING btree (featured) WHERE (featured = true);


--
-- TOC entry 3872 (class 1259 OID 17993)
-- Name: idx_projects_slug; Type: INDEX; Schema: public; Owner: kaungkaung
--

CREATE INDEX idx_projects_slug ON public.projects USING btree (slug);


--
-- TOC entry 3868 (class 1259 OID 17997)
-- Name: idx_skills_category; Type: INDEX; Schema: public; Owner: kaungkaung
--

CREATE INDEX idx_skills_category ON public.skills USING btree (category);


--
-- TOC entry 3898 (class 1259 OID 18040)
-- Name: ix_blog_comments_comment_id; Type: INDEX; Schema: public; Owner: kaungkaung
--

CREATE INDEX ix_blog_comments_comment_id ON public.blog_comments USING btree (comment_id);


--
-- TOC entry 3845 (class 1259 OID 17529)
-- Name: ix_certifications_certification_id; Type: INDEX; Schema: public; Owner: kaungkaung
--

CREATE INDEX ix_certifications_certification_id ON public.certifications USING btree (certification_id);


--
-- TOC entry 3852 (class 1259 OID 17592)
-- Name: ix_newsletter_subscribers_email; Type: INDEX; Schema: public; Owner: kaungkaung
--

CREATE UNIQUE INDEX ix_newsletter_subscribers_email ON public.newsletter_subscribers USING btree (email);


--
-- TOC entry 3853 (class 1259 OID 17593)
-- Name: ix_newsletter_subscribers_subscriber_id; Type: INDEX; Schema: public; Owner: kaungkaung
--

CREATE INDEX ix_newsletter_subscribers_subscriber_id ON public.newsletter_subscribers USING btree (subscriber_id);


--
-- TOC entry 3846 (class 1259 OID 17567)
-- Name: ix_portfolio_items_item_id; Type: INDEX; Schema: public; Owner: kaungkaung
--

CREATE INDEX ix_portfolio_items_item_id ON public.portfolio_items USING btree (item_id);


--
-- TOC entry 3849 (class 1259 OID 17581)
-- Name: ix_services_service_id; Type: INDEX; Schema: public; Owner: kaungkaung
--

CREATE INDEX ix_services_service_id ON public.services USING btree (service_id);


--
-- TOC entry 3856 (class 1259 OID 17607)
-- Name: ix_site_settings_setting_id; Type: INDEX; Schema: public; Owner: kaungkaung
--

CREATE INDEX ix_site_settings_setting_id ON public.site_settings USING btree (setting_id);


--
-- TOC entry 3857 (class 1259 OID 17606)
-- Name: ix_site_settings_setting_key; Type: INDEX; Schema: public; Owner: kaungkaung
--

CREATE UNIQUE INDEX ix_site_settings_setting_key ON public.site_settings USING btree (setting_key);


--
-- TOC entry 4055 (class 2618 OID 18002)
-- Name: project_details_view _RETURN; Type: RULE; Schema: public; Owner: kaungkaung
--

CREATE OR REPLACE VIEW public.project_details_view AS
 SELECT p.project_id,
    p.title,
    p.slug,
    p.description,
    p.content,
    p.category,
    p.featured,
    p.featured_image,
    p.technologies,
    p.github_link,
    p.live_demo_link,
    p.display_order,
    p.created_at,
    p.updated_at,
    array_agg(DISTINCT s.name) AS skill_names
   FROM ((public.projects p
     LEFT JOIN public.project_skills ps ON ((p.project_id = ps.project_id)))
     LEFT JOIN public.skills s ON ((ps.skill_id = s.skill_id)))
  GROUP BY p.project_id
  ORDER BY p.display_order;


--
-- TOC entry 3907 (class 2620 OID 18020)
-- Name: blog_posts update_blog_posts_updated_at; Type: TRIGGER; Schema: public; Owner: kaungkaung
--

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3906 (class 2620 OID 18019)
-- Name: education update_education_updated_at; Type: TRIGGER; Schema: public; Owner: kaungkaung
--

CREATE TRIGGER update_education_updated_at BEFORE UPDATE ON public.education FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3905 (class 2620 OID 18018)
-- Name: experiences update_experiences_updated_at; Type: TRIGGER; Schema: public; Owner: kaungkaung
--

CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON public.experiences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3903 (class 2620 OID 18016)
-- Name: personal_info update_personal_info_updated_at; Type: TRIGGER; Schema: public; Owner: kaungkaung
--

CREATE TRIGGER update_personal_info_updated_at BEFORE UPDATE ON public.personal_info FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3904 (class 2620 OID 18017)
-- Name: projects update_projects_updated_at; Type: TRIGGER; Schema: public; Owner: kaungkaung
--

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3902 (class 2606 OID 18035)
-- Name: blog_comments blog_comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(post_id) ON DELETE CASCADE;


--
-- TOC entry 3901 (class 2606 OID 18287)
-- Name: blog_posts fk_blog_posts_created_by; Type: FK CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT fk_blog_posts_created_by FOREIGN KEY (created_by) REFERENCES public.users(user_id);


--
-- TOC entry 3899 (class 2606 OID 17899)
-- Name: project_skills project_skills_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.project_skills
    ADD CONSTRAINT project_skills_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- TOC entry 3900 (class 2606 OID 17904)
-- Name: project_skills project_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaungkaung
--

ALTER TABLE ONLY public.project_skills
    ADD CONSTRAINT project_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(skill_id) ON DELETE CASCADE;


-- Completed on 2026-08-24 03:39:49 +0630

--
-- PostgreSQL database dump complete
--

\unrestrict yYiZ5w1Qo01cOqyn68qJZkttnJqa8mroNqw21mSlhI7whubJ63oOwpL5Jjk2q6k

