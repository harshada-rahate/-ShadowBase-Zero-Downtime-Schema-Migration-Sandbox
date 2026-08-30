--
-- PostgreSQL database dump
--

\restrict 8iOrXMlvUr4LTvfwbCgFHJGYxVzzR269ceQvQ1cap9UK6Imyq2xLeDRst8RpZ3n

-- Dumped from database version 16.15 (Debian 16.15-1.pgdg13+2)
-- Dumped by pg_dump version 16.15 (Debian 16.15-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    name character varying(100),
    email character varying(150)
);


ALTER TABLE public.customers OWNER TO postgres;

--
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
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, name, email) FROM stdin;
1	Test User	test@example.com
2	Kafka Test	kafka@test.com
\.


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 2, true);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: dbz_publication; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION dbz_publication WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION dbz_publication OWNER TO postgres;

--
-- Name: dbz_publication customers; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION dbz_publication ADD TABLE ONLY public.customers;


--
-- PostgreSQL database dump complete
--

\unrestrict 8iOrXMlvUr4LTvfwbCgFHJGYxVzzR269ceQvQ1cap9UK6Imyq2xLeDRst8RpZ3n

