--
-- PostgreSQL database dump
--

\restrict sjXU3pIzQWdeFoWI8g4hP1PdXoCOwNNyff2r3uNxjBu5IEPx1qLLSzcxOyG1Duv

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

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
-- Name: likes; Type: TABLE; Schema: public; Owner: nutrient_user
--

CREATE TABLE public.likes (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "nutrientId" integer NOT NULL
);


ALTER TABLE public.likes OWNER TO nutrient_user;

--
-- Name: likes_id_seq; Type: SEQUENCE; Schema: public; Owner: nutrient_user
--

CREATE SEQUENCE public.likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.likes_id_seq OWNER TO nutrient_user;

--
-- Name: likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nutrient_user
--

ALTER SEQUENCE public.likes_id_seq OWNED BY public.likes.id;


--
-- Name: nutrients; Type: TABLE; Schema: public; Owner: nutrient_user
--

CREATE TABLE public.nutrients (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    "dailyNorm" double precision,
    unit character varying(20),
    description text,
    status character varying(20) DEFAULT 'черновик'::character varying NOT NULL,
    "imageKey" character varying(255) NOT NULL,
    "videoKey" character varying(255) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "formedAt" timestamp without time zone,
    "creatorId" integer NOT NULL
);


ALTER TABLE public.nutrients OWNER TO nutrient_user;

--
-- Name: nutrients_id_seq; Type: SEQUENCE; Schema: public; Owner: nutrient_user
--

CREATE SEQUENCE public.nutrients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nutrients_id_seq OWNER TO nutrient_user;

--
-- Name: nutrients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nutrient_user
--

ALTER SEQUENCE public.nutrients_id_seq OWNED BY public.nutrients.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: nutrient_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'создатель'::character varying NOT NULL
);


ALTER TABLE public.users OWNER TO nutrient_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: nutrient_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO nutrient_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nutrient_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: likes id; Type: DEFAULT; Schema: public; Owner: nutrient_user
--

ALTER TABLE ONLY public.likes ALTER COLUMN id SET DEFAULT nextval('public.likes_id_seq'::regclass);


--
-- Name: nutrients id; Type: DEFAULT; Schema: public; Owner: nutrient_user
--

ALTER TABLE ONLY public.nutrients ALTER COLUMN id SET DEFAULT nextval('public.nutrients_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: nutrient_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: nutrient_user
--

COPY public.likes (id, "userId", "nutrientId") FROM stdin;
1	1	1
2	4	1
3	10	1
4	2	2
5	3	2
6	5	5
7	6	5
8	7	5
9	1	3
10	2	3
11	3	3
12	1	24
13	1	26
15	1	30
\.


--
-- Data for Name: nutrients; Type: TABLE DATA; Schema: public; Owner: nutrient_user
--

COPY public.nutrients (id, name, "dailyNorm", unit, description, status, "imageKey", "videoKey", "createdAt", "formedAt", "creatorId") FROM stdin;
4	Клетчатка	30	г	Сложный углевод, который не переваривается, но служит пищей для полезных бактерий в кишечнике. Нормализует пищеварение, помогает контролировать вес и снижает уровень сахара и холестерина в крови. Содержится в цельнозерновых крупах, свежих овощах, фруктах с кожурой и отрубях.	опубликован	fiber.jpg	fiber.mp4	2026-09-16 14:54:58.963861	2026-09-16 19:17:43.329	1
3	Железо	18	мг	Участвует в переносе кислорода в составе гемоглобина ко всем органам и тканям. Достаточный уровень железа предотвращает анемию, хроническую слабость и головокружения. Гемовое железо (из красного мяса и печени) усваивается лучше всего, а растительное (из яблок, гречки, шпината) рекомендуется употреблять вместе с витамином С.	опубликован	iron.jpg	iron.mp4	2026-09-16 14:54:58.963861	\N	1
5	Омега-3	1.6	г	Полиненасыщенные жирные кислоты, незаменимые для здоровья сердечно-сосудистой системы и мозга. Они уменьшают воспаления в организме, улучшают память и поддерживают здоровье суставов и кожи. Главный источник — жирная морская рыба (лосось, скумбрия, сельдь), а также льняное семя и грецкие орехи.	опубликован	omega3.jpg	omega3.mp4	2026-09-16 14:54:58.963861	\N	2
1	Витамин C	90	мг	Поддерживает иммунитет и синтез коллагена. Также он является мощным антиоксидантом, который защищает клетки от повреждений свободными радикалами. Отлично усваивается из цитрусовых, киви, шиповника и чёрной смородины. Регулярное употребление помогает бороться с усталостью и улучшает усвоение железа.	опубликован	vitamin-c.jpg	vitamin-c.mp4	2026-09-16 14:54:58.963861	\N	1
2	Белок	90	г	Главный строительный материал для всех клеток, тканей и органов нашего тела. Он критически важен для роста мышц, восстановления после тренировок и выработки ферментов. Лучшие источники: мясо птицы, рыба, яйца, творог, а также бобовые и орехи для вегетарианцев. Обеспечивает долгое чувство сытости.	опубликован	protein.jpg	protein.mp4	2026-09-16 14:54:58.963861	\N	2
24	Нутриент	30	мг	Новый	удален	1790446256201-fdru2j4a62p.jpg	1790446256216-n8epobkcq8r.mp4	2026-09-26 18:10:56.378628	2026-09-26 21:19:09.814	1
23	Тестовый нутриент	50	мг	Для лаб3	удален	1790444498919-znj9ldch8zk.jpg	1790444498954-l18vic3ljb.mp4	2026-09-26 17:41:39.093594	2026-09-26 20:44:44.2	1
25	Нутриент	30	мг	Новый	удален	1790447958500-cd4xle464gg.jpg	1790447958515-vngdsey1um.mp4	2026-09-26 18:39:18.65503	2026-09-26 21:39:35.789	1
26	Нутриент	30	мг	Новый	удален	1791295621629-77wlielkuq4.jpg	1791295621680-iktt2ohg50f.mp4	2026-10-06 14:07:01.988602	2026-10-06 17:09:27.62	1
27	Нутриент	\N	\N	\N	опубликован	1791407357102-k0puqnp6rgk.jpg	1791407357121-x1su94lynum.mp4	2026-10-07 21:09:17.249808	2026-10-08 00:10:02.476	1
28	Нутриент2	\N	\N	\N	опубликован	1791407674804-ny83at0sxc.jpg	1791407674822-awmuc28zv2m.mp4	2026-10-07 21:14:35.013532	2026-10-08 00:15:03.459	1
30	Нутриент5	30	г	Сложный углевод, нормализует пищеварение	удален	1791410983315-h6x0iy7zhl4.jpg	1791410983337-2xx8sq9ryjf.mp4	2026-10-07 22:09:43.502079	2026-10-08 01:11:24.188	1
29	Нутриент3	30	г	Сложный углевод, нормализует пищеварение	удален	1791407864897-a25dj9lvhrw.jpg	1791407864913-e4hi7vv7voj.mp4	2026-10-07 21:17:45.214873	2026-10-08 00:25:44.675	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: nutrient_user
--

COPY public.users (id, username, password, role) FROM stdin;
1	alice	pass1	создатель
2	bob	pass2	создатель
3	moderator	pass3	модератор
4	user4	p	создатель
5	user5	p	создатель
6	user6	p	создатель
7	user7	p	создатель
10	user10	p	создатель
11	testuser	test123	создатель
12	test	test1111	создатель
13	test1	test2222	создатель
\.


--
-- Name: likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nutrient_user
--

SELECT pg_catalog.setval('public.likes_id_seq', 15, true);


--
-- Name: nutrients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nutrient_user
--

SELECT pg_catalog.setval('public.nutrients_id_seq', 30, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nutrient_user
--

SELECT pg_catalog.setval('public.users_id_seq', 13, true);


--
-- Name: nutrients PK_05bf070f987b9f67ea7b5896855; Type: CONSTRAINT; Schema: public; Owner: nutrient_user
--

ALTER TABLE ONLY public.nutrients
    ADD CONSTRAINT "PK_05bf070f987b9f67ea7b5896855" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: nutrient_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: likes PK_a9323de3f8bced7539a794b4a37; Type: CONSTRAINT; Schema: public; Owner: nutrient_user
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT "PK_a9323de3f8bced7539a794b4a37" PRIMARY KEY (id);


--
-- Name: likes fk_likes_nutrient; Type: FK CONSTRAINT; Schema: public; Owner: nutrient_user
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT fk_likes_nutrient FOREIGN KEY ("nutrientId") REFERENCES public.nutrients(id) ON DELETE RESTRICT;


--
-- Name: likes fk_likes_user; Type: FK CONSTRAINT; Schema: public; Owner: nutrient_user
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT fk_likes_user FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: nutrients fk_nutrients_creator; Type: FK CONSTRAINT; Schema: public; Owner: nutrient_user
--

ALTER TABLE ONLY public.nutrients
    ADD CONSTRAINT fk_nutrients_creator FOREIGN KEY ("creatorId") REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict sjXU3pIzQWdeFoWI8g4hP1PdXoCOwNNyff2r3uNxjBu5IEPx1qLLSzcxOyG1Duv

