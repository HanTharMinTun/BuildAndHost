--
-- PostgreSQL database dump
--

\restrict m2RHIos8NCfb8OY3K7eZvHs5kFfWaDrgFuA6f92aHnCqwFBcSdcVhFEWPbC5xV6

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-08-24 03:44:32

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 17786)
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    phone character varying(30),
    email character varying(150),
    address text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17785)
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO postgres;

--
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 221
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- TOC entry 232 (class 1259 OID 17874)
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id integer NOT NULL,
    title character varying(150) NOT NULL,
    category character varying(100),
    amount numeric(12,2) NOT NULL,
    description text,
    expense_date date NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 17873)
-- Name: expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expenses_id_seq OWNER TO postgres;

--
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 231
-- Name: expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expenses_id_seq OWNED BY public.expenses.id;


--
-- TOC entry 230 (class 1259 OID 17856)
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    sale_id integer NOT NULL,
    amount numeric(12,2) NOT NULL,
    payment_method character varying(30) NOT NULL,
    payment_status character varying(20) DEFAULT 'paid'::character varying,
    payment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    note character varying(255)
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 17855)
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO postgres;

--
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 229
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- TOC entry 224 (class 1259 OID 17798)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    category character varying(100),
    buying_price numeric(12,2) DEFAULT 0.00,
    selling_price numeric(12,2) NOT NULL,
    stock_quantity integer DEFAULT 0,
    low_stock_limit integer DEFAULT 5,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17797)
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 223
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 228 (class 1259 OID 17833)
-- Name: sale_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_items (
    id integer NOT NULL,
    sale_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    subtotal numeric(12,2) NOT NULL
);


ALTER TABLE public.sale_items OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17832)
-- Name: sale_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sale_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sale_items_id_seq OWNER TO postgres;

--
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 227
-- Name: sale_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sale_items_id_seq OWNED BY public.sale_items.id;


--
-- TOC entry 226 (class 1259 OID 17812)
-- Name: sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales (
    id integer NOT NULL,
    customer_id integer,
    user_id integer,
    total_amount numeric(12,2) DEFAULT 0.00,
    sale_status character varying(20) DEFAULT 'pending'::character varying,
    sale_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sales OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17811)
-- Name: sales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_id_seq OWNER TO postgres;

--
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 225
-- Name: sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sales_id_seq OWNED BY public.sales.id;


--
-- TOC entry 220 (class 1259 OID 17769)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'staff'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 17768)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4889 (class 2604 OID 17789)
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- TOC entry 4904 (class 2604 OID 17877)
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- TOC entry 4901 (class 2604 OID 17859)
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- TOC entry 4891 (class 2604 OID 17801)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 4900 (class 2604 OID 17836)
-- Name: sale_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items ALTER COLUMN id SET DEFAULT nextval('public.sale_items_id_seq'::regclass);


--
-- TOC entry 4896 (class 2604 OID 17815)
-- Name: sales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales ALTER COLUMN id SET DEFAULT nextval('public.sales_id_seq'::regclass);


--
-- TOC entry 4886 (class 2604 OID 17772)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5077 (class 0 OID 17786)
-- Dependencies: 222
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, name, phone, email, address, created_at) FROM stdin;
\.


--
-- TOC entry 5087 (class 0 OID 17874)
-- Dependencies: 232
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, title, category, amount, description, expense_date, created_at) FROM stdin;
1	API Test Expense	Testing	500.00	Created from API tester	2026-08-23	2026-08-24 03:14:12.335184
\.


--
-- TOC entry 5085 (class 0 OID 17856)
-- Dependencies: 230
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, sale_id, amount, payment_method, payment_status, payment_date, note) FROM stdin;
1	3	1500.00	cash	paid	2026-08-24 03:14:04.367457	API test
\.


--
-- TOC entry 5079 (class 0 OID 17798)
-- Dependencies: 224
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, category, buying_price, selling_price, stock_quantity, low_stock_limit, created_at) FROM stdin;
2	Test Product	General	1000.00	1500.00	19	5	2026-08-24 03:13:10.466666
\.


--
-- TOC entry 5083 (class 0 OID 17833)
-- Dependencies: 228
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_items (id, sale_id, product_id, quantity, unit_price, subtotal) FROM stdin;
1	3	2	1	1500.00	1500.00
\.


--
-- TOC entry 5081 (class 0 OID 17812)
-- Dependencies: 226
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales (id, customer_id, user_id, total_amount, sale_status, sale_date) FROM stdin;
3	\N	\N	1500.00	pending	2026-08-24 03:13:39.641662
\.


--
-- TOC entry 5075 (class 0 OID 17769)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role, created_at) FROM stdin;
1	Test User	apitest_1787517721264@example.com	$2b$12$MwG5.13J3nELCYOWcLvU8.l4SEFvwmEd/bS5JRVWFb6k2mjXxOgj.	staff	2026-08-24 03:12:01.501782
\.


--
-- TOC entry 5100 (class 0 OID 0)
-- Dependencies: 221
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 1, true);


--
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 231
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expenses_id_seq', 1, true);


--
-- TOC entry 5102 (class 0 OID 0)
-- Dependencies: 229
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, true);


--
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 223
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 2, true);


--
-- TOC entry 5104 (class 0 OID 0)
-- Dependencies: 227
-- Name: sale_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sale_items_id_seq', 1, true);


--
-- TOC entry 5105 (class 0 OID 0)
-- Dependencies: 225
-- Name: sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_id_seq', 3, true);


--
-- TOC entry 5106 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- TOC entry 4911 (class 2606 OID 17796)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 4921 (class 2606 OID 17886)
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- TOC entry 4919 (class 2606 OID 17867)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 4913 (class 2606 OID 17810)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4917 (class 2606 OID 17844)
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4915 (class 2606 OID 17821)
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- TOC entry 4907 (class 2606 OID 17784)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4909 (class 2606 OID 17782)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4926 (class 2606 OID 17868)
-- Name: payments fk_payments_sale; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk_payments_sale FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;


--
-- TOC entry 4924 (class 2606 OID 17850)
-- Name: sale_items fk_sale_items_product; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT fk_sale_items_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- TOC entry 4925 (class 2606 OID 17845)
-- Name: sale_items fk_sale_items_sale; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT fk_sale_items_sale FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;


--
-- TOC entry 4922 (class 2606 OID 17822)
-- Name: sales fk_sales_customer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT fk_sales_customer FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- TOC entry 4923 (class 2606 OID 17827)
-- Name: sales fk_sales_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT fk_sales_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


-- Completed on 2026-08-24 03:44:33

--
-- PostgreSQL database dump complete
--

\unrestrict m2RHIos8NCfb8OY3K7eZvHs5kFfWaDrgFuA6f92aHnCqwFBcSdcVhFEWPbC5xV6

