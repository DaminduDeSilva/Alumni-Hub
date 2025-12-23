--
-- PostgreSQL database dump
--

\restrict 8MQeaVx0dUG280TNZhnCqEM4EuoHKSyHHJGDXXOAyMrP2awY70UagZwxKxPAXg1

-- Dumped from database version 18.1 (Debian 18.1-1.pgdg12+2)
-- Dumped by pg_dump version 18.1 (Debian 18.1-1.pgdg13+2)

-- Started on 2025-12-23 12:56:25 UTC

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
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 16421)
-- Name: batchmate_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.batchmate_submissions (
    id integer NOT NULL,
    calling_name character varying(100) NOT NULL,
    full_name character varying(255) NOT NULL,
    nick_name character varying(100),
    address text,
    country character varying(100) NOT NULL,
    working_place character varying(255),
    whatsapp_mobile character varying(20) NOT NULL,
    phone_mobile character varying(20),
    email character varying(255) NOT NULL,
    university_photo_url character varying(500),
    current_photo_url character varying(500),
    field character varying(50) NOT NULL,
    user_id integer NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    reviewed_by integer,
    reviewed_at timestamp without time zone,
    rejection_reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT batchmate_submissions_field_check CHECK (((field)::text = ANY ((ARRAY['Chemical'::character varying, 'Civil'::character varying, 'Computer'::character varying, 'Electrical'::character varying, 'Electronics'::character varying, 'Material'::character varying, 'Mechanical'::character varying, 'Mining'::character varying, 'Textile'::character varying])::text[]))),
    CONSTRAINT batchmate_submissions_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying])::text[])))
);


--
-- TOC entry 221 (class 1259 OID 16420)
-- Name: batchmate_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.batchmate_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3448 (class 0 OID 0)
-- Dependencies: 221
-- Name: batchmate_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.batchmate_submissions_id_seq OWNED BY public.batchmate_submissions.id;


--
-- TOC entry 224 (class 1259 OID 16455)
-- Name: batchmates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.batchmates (
    id integer NOT NULL,
    calling_name character varying(100) NOT NULL,
    full_name character varying(255) NOT NULL,
    nick_name character varying(100),
    address text,
    country character varying(100) NOT NULL,
    working_place character varying(255),
    whatsapp_mobile character varying(20) NOT NULL,
    phone_mobile character varying(20),
    email character varying(255) NOT NULL,
    university_photo_url character varying(500),
    current_photo_url character varying(500),
    field character varying(50) NOT NULL,
    user_id integer NOT NULL,
    approved_by integer,
    approved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT batchmates_field_check CHECK (((field)::text = ANY ((ARRAY['Chemical'::character varying, 'Civil'::character varying, 'Computer'::character varying, 'Electrical'::character varying, 'Electronics'::character varying, 'Material'::character varying, 'Mechanical'::character varying, 'Mining'::character varying, 'Textile'::character varying])::text[])))
);


--
-- TOC entry 223 (class 1259 OID 16454)
-- Name: batchmates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.batchmates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3449 (class 0 OID 0)
-- Dependencies: 223
-- Name: batchmates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.batchmates_id_seq OWNED BY public.batchmates.id;


--
-- TOC entry 226 (class 1259 OID 16487)
-- Name: field_admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.field_admins (
    id integer NOT NULL,
    field character varying(50) NOT NULL,
    user_id integer NOT NULL,
    assigned_by integer,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deactivated_at timestamp without time zone,
    is_active boolean DEFAULT true
);


--
-- TOC entry 225 (class 1259 OID 16486)
-- Name: field_admins_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.field_admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3450 (class 0 OID 0)
-- Dependencies: 225
-- Name: field_admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.field_admins_id_seq OWNED BY public.field_admins.id;


--
-- TOC entry 220 (class 1259 OID 16400)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255),
    google_id character varying(255),
    auth_method character varying(20) DEFAULT 'local'::character varying,
    full_name character varying(255),
    role character varying(20) DEFAULT 'UNVERIFIED'::character varying,
    assigned_field character varying(50),
    is_verified boolean DEFAULT false,
    verification_status character varying(20) DEFAULT 'PENDING'::character varying,
    verified_by integer,
    verified_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 219 (class 1259 OID 16399)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3451 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3251 (class 2604 OID 16424)
-- Name: batchmate_submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batchmate_submissions ALTER COLUMN id SET DEFAULT nextval('public.batchmate_submissions_id_seq'::regclass);


--
-- TOC entry 3255 (class 2604 OID 16458)
-- Name: batchmates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batchmates ALTER COLUMN id SET DEFAULT nextval('public.batchmates_id_seq'::regclass);


--
-- TOC entry 3258 (class 2604 OID 16490)
-- Name: field_admins id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_admins ALTER COLUMN id SET DEFAULT nextval('public.field_admins_id_seq'::regclass);


--
-- TOC entry 3244 (class 2604 OID 16403)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3438 (class 0 OID 16421)
-- Dependencies: 222
-- Data for Name: batchmate_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.batchmate_submissions (id, calling_name, full_name, nick_name, address, country, working_place, whatsapp_mobile, phone_mobile, email, university_photo_url, current_photo_url, field, user_id, status, reviewed_by, reviewed_at, rejection_reason, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3440 (class 0 OID 16455)
-- Dependencies: 224
-- Data for Name: batchmates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.batchmates (id, calling_name, full_name, nick_name, address, country, working_place, whatsapp_mobile, phone_mobile, email, university_photo_url, current_photo_url, field, user_id, approved_by, approved_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3442 (class 0 OID 16487)
-- Dependencies: 226
-- Data for Name: field_admins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.field_admins (id, field, user_id, assigned_by, assigned_at, deactivated_at, is_active) FROM stdin;
\.


--
-- TOC entry 3436 (class 0 OID 16400)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, google_id, auth_method, full_name, role, assigned_field, is_verified, verification_status, verified_by, verified_at, created_at, updated_at) FROM stdin;
4	admin@alumni.edu	$2b$10$L8CdnTnJTSv7eGCOqNa9nOgJ38vYGvK27uGjRdaihH9jChUwp4tti	\N	local	System Administrator	SUPER_ADMIN	\N	t	APPROVED	\N	\N	2025-12-11 04:24:32.936269	2025-12-23 12:40:50.338028
\.


--
-- TOC entry 3452 (class 0 OID 0)
-- Dependencies: 221
-- Name: batchmate_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.batchmate_submissions_id_seq', 8, true);


--
-- TOC entry 3453 (class 0 OID 0)
-- Dependencies: 223
-- Name: batchmates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.batchmates_id_seq', 8, true);


--
-- TOC entry 3454 (class 0 OID 0)
-- Dependencies: 225
-- Name: field_admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.field_admins_id_seq', 7, true);


--
-- TOC entry 3455 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 11, true);


--
-- TOC entry 3271 (class 2606 OID 16441)
-- Name: batchmate_submissions batchmate_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batchmate_submissions
    ADD CONSTRAINT batchmate_submissions_pkey PRIMARY KEY (id);


--
-- TOC entry 3273 (class 2606 OID 16443)
-- Name: batchmate_submissions batchmate_submissions_user_id_field_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batchmate_submissions
    ADD CONSTRAINT batchmate_submissions_user_id_field_key UNIQUE (user_id, field);


--
-- TOC entry 3275 (class 2606 OID 16475)
-- Name: batchmates batchmates_email_field_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batchmates
    ADD CONSTRAINT batchmates_email_field_key UNIQUE (email, field);


--
-- TOC entry 3277 (class 2606 OID 16473)
-- Name: batchmates batchmates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batchmates
    ADD CONSTRAINT batchmates_pkey PRIMARY KEY (id);


--
-- TOC entry 3279 (class 2606 OID 16497)
-- Name: field_admins field_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_admins
    ADD CONSTRAINT field_admins_pkey PRIMARY KEY (id);


--
-- TOC entry 3265 (class 2606 OID 16417)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3267 (class 2606 OID 16419)
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- TOC entry 3269 (class 2606 OID 16415)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3280 (class 1259 OID 16508)
-- Name: unique_active_field_admin; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_active_field_admin ON public.field_admins USING btree (field) WHERE (is_active = true);


--
-- TOC entry 3281 (class 1259 OID 16509)
-- Name: unique_active_user_field; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_active_user_field ON public.field_admins USING btree (user_id, field) WHERE (is_active = true);


--
-- TOC entry 3282 (class 2606 OID 16449)
-- Name: batchmate_submissions batchmate_submissions_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batchmate_submissions
    ADD CONSTRAINT batchmate_submissions_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- TOC entry 3283 (class 2606 OID 16444)
-- Name: batchmate_submissions batchmate_submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batchmate_submissions
    ADD CONSTRAINT batchmate_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3284 (class 2606 OID 16481)
-- Name: batchmates batchmates_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batchmates
    ADD CONSTRAINT batchmates_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- TOC entry 3285 (class 2606 OID 16476)
-- Name: batchmates batchmates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batchmates
    ADD CONSTRAINT batchmates_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3286 (class 2606 OID 16503)
-- Name: field_admins field_admins_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_admins
    ADD CONSTRAINT field_admins_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- TOC entry 3287 (class 2606 OID 16498)
-- Name: field_admins field_admins_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_admins
    ADD CONSTRAINT field_admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


-- Completed on 2025-12-23 12:56:32 UTC

--
-- PostgreSQL database dump complete
--

\unrestrict 8MQeaVx0dUG280TNZhnCqEM4EuoHKSyHHJGDXXOAyMrP2awY70UagZwxKxPAXg1

