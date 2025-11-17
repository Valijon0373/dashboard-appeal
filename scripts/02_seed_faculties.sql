-- Complete seed data for all 5 faculties with departments

-- FILOLOGIYA FAKULTETI (Philology Faculty)
INSERT INTO faculties (name_uz, name_ru, name_en, description) VALUES 
('Filologiya fakulteti', 'Филологический факультет', 'Faculty of Philology', 'Til va adabiyot yo''qiquvchi') 
ON CONFLICT DO NOTHING;

INSERT INTO departments (faculty_id, name_uz, name_ru, name_en, head_name) 
SELECT id, 'Rus tili va adabiyoti kafedrasi', 'Кафедра русского языка и литературы', 'Russian Language and Literature Department', 'Department Head' FROM faculties WHERE name_uz = 'Filologiya fakulteti'
ON CONFLICT DO NOTHING;

INSERT INTO departments (faculty_id, name_uz, name_ru, name_en, head_name) 
SELECT id, 'O''zbek tili va adabiyoti kafedrasi', 'Кафедра узбекского языка и литературы', 'Uzbek Language and Literature Department', 'Department Head' FROM faculties WHERE name_uz = 'Filologiya fakulteti'
ON CONFLICT DO NOTHING;

INSERT INTO departments (faculty_id, name_uz, name_ru, name_en, head_name) 
SELECT id, 'Xorijiy filologiya kafedrasi', 'Кафедра иностранной филологии', 'Foreign Philology Department', 'Department Head' FROM faculties WHERE name_uz = 'Filologiya fakulteti'
ON CONFLICT DO NOTHING;

-- BOSHLANG'ICH TA'LIM FAKULTETI (Primary Education Faculty)
INSERT INTO faculties (name_uz, name_ru, name_en, description) VALUES 
('Boshlang''ich ta''lim fakulteti', 'Факультет начального образования', 'Faculty of Primary Education', 'Boshlang''ich ta''lim pedagogikasi')
ON CONFLICT DO NOTHING;

INSERT INTO departments (faculty_id, name_uz, name_ru, name_en, head_name) 
SELECT id, 'Boshlang''ich ta''lim metodikasi kafedrasi', 'Кафедра методики начального образования', 'Primary Education Methodology Department', 'Department Head' FROM faculties WHERE name_uz = 'Boshlang''ich ta''lim fakulteti'
ON CONFLICT DO NOTHING;

INSERT INTO departments (faculty_id, name_uz, name_ru, name_en, head_name) 
SELECT id, 'Boshlang''ich ta''lim nazariyasi kafedrasi', 'Кафедра теории начального образования', 'Primary Education Theory Department', 'Department Head' FROM faculties WHERE name_uz = 'Boshlang''ich ta''lim fakulteti'
ON CONFLICT DO NOTHING;

-- ANIQ VA TABIIY FANLAR FAKULTETI (Exact and Natural Sciences Faculty)
INSERT INTO faculties (name_uz, name_ru, name_en, description) VALUES 
('Aniq va tabiiy fanlar fakulteti', 'Факультет точных и естественных наук', 'Faculty of Exact and Natural Sciences', 'Matematika va tabiiy fanlar')
ON CONFLICT DO NOTHING;

INSERT INTO departments (faculty_id, name_uz, name_ru, name_en, head_name) 
SELECT id, 'Matematika va kompyuter texnologiyalari kafedrasi', 'Кафедра математики и компьютерных технологий', 'Mathematics and Computer Technologies Department', 'Department Head' FROM faculties WHERE name_uz = 'Aniq va tabiiy fanlar fakulteti'
ON CONFLICT DO NOTHING;

INSERT INTO departments (faculty_id, name_uz, name_ru, name_en, head_name) 
SELECT id, 'Tabiiy fanlar kafedrasi', 'Кафедра естественных наук', 'Natural Sciences Department', 'Department Head' FROM faculties WHERE name_uz = 'Aniq va tabiiy fanlar fakulteti'
ON CONFLICT DO NOTHING;

INSERT INTO departments (faculty_id, name_uz, name_ru, name_en, head_name) 
SELECT id, 'Fizika va astronomiya kafedrasi', 'Кафедра физики и астрономии', 'Physics and Astronomy Department', 'Department Head' FROM faculties WHERE name_uz = 'Aniq va tabiiy fanlar fakulteti'
ON CONFLICT DO NOTHING;

INSERT INTO departments (faculty_id, name_uz, name_ru, name_en, head_name) 
SELECT id, 'Texnologik ta''lim kafedrasi', 'Кафедра технологического образования', 'Technological Education Department', 'Department Head' FROM faculties WHERE name_uz = 'Aniq va tabiiy fanlar fakulteti'
ON CONFLICT DO NOTHING;

-- PEDAGOGIKA FAKULTETI (Pedagogy Faculty)
INSERT INTO faculties (name_uz, name_ru, name_en, description) VALUES 
('Pedagogika fakulteti', 'Педагогический факультет', 'Faculty of Pedagogy', 'Pedagogika va psixologiya')
ON CONFLICT DO NOTHING;

INSERT INTO departments (faculty_id, name_uz, name_ru, name_en, head_name) 
SELECT id, 'Pedagogika va psixologiya kafedrasi', 'Кафедра педагогики и психологии', 'Pedagogy and Psychology Department', 'Department Head' FROM faculties WHERE name_uz = 'Pedagogika fakulteti'
ON CONFLICT DO NOTHING;

INSERT INTO departments (faculty_id, name_uz, name_ru, name_en, head_name) 
SELECT id, 'Maktabgacha ta''lim kafedrasi', 'Кафедра дошкольного образования', 'Preschool Education Department', 'Department Head' FROM faculties WHERE name_uz = 'Pedagogika fakulteti'
ON CONFLICT DO NOTHING;

-- IJTIMOIY VA AMALIY FANLAR FAKULTETI (Social and Applied Sciences Faculty)
INSERT INTO faculties (name_uz, name_ru, name_en, description) VALUES 
('Ijtimoiy va amaliy fanlar fakulteti', 'Факультет социальных и прикладных наук', 'Faculty of Social and Applied Sciences', 'Ijtimoiy va amaliy fanlar')
ON CONFLICT DO NOTHING;

INSERT INTO departments (faculty_id, name_uz, name_ru, name_en, head_name) 
SELECT id, 'Tarix kafedrasi', 'Кафедра истории', 'History Department', 'Department Head' FROM faculties WHERE name_uz = 'Ijtimoiy va amaliy fanlar fakulteti'
ON CONFLICT DO NOTHING;

INSERT INTO departments (faculty_id, name_uz, name_ru, name_en, head_name) 
SELECT id, 'Milliy g''oya va falsafa kafedrasi', 'Кафедра национальной идеи и философии', 'National Idea and Philosophy Department', 'Department Head' FROM faculties WHERE name_uz = 'Ijtimoiy va amaliy fanlar fakulteti'
ON CONFLICT DO NOTHING;

INSERT INTO departments (faculty_id, name_uz, name_ru, name_en, head_name) 
SELECT id, 'San''atshunoslik kafedrasi', 'Кафедра искусствознания', 'Arts and Crafts Department', 'Department Head' FROM faculties WHERE name_uz = 'Ijtimoiy va amaliy fanlar fakulteti'
ON CONFLICT DO NOTHING;

INSERT INTO departments (faculty_id, name_uz, name_ru, name_en, head_name) 
SELECT id, 'Jismoniy madaniyat kafedrasi', 'Кафедра физической культуры', 'Physical Culture Department', 'Department Head' FROM faculties WHERE name_uz = 'Ijtimoiy va amaliy fanlar fakulteti'
ON CONFLICT DO NOTHING;
