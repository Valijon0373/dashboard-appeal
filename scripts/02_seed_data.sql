-- Adding sample data for testing

-- Insert sample faculty
INSERT INTO faculties (name_uz, name_ru, description)
VALUES 
  ('Informatika Fakulteti', 'Факультет информатики', 'Zamonaviy informatsion texnologiyalar va kompyuter fanlarini o''qitish'),
  ('Iqtisodiyot Fakulteti', 'Факультет экономики', 'Iqtisodiyot va biznes boshqaruvi sohasidagi ta''lim'),
  ('Muhandislik Fakulteti', 'Факультет инженерии', 'Muhandislik va texnologiyalar sohasidagi ta''lim');

-- Insert sample departments  
INSERT INTO departments (faculty_id, name_uz, name_ru, head_name)
VALUES
  ((SELECT id FROM faculties WHERE name_uz = 'Informatika Fakulteti'), 'Dasturlash Kafedrasi', 'Кафедра программирования', 'Qo''chqorov Abdulloyev'),
  ((SELECT id FROM faculties WHERE name_uz = 'Informatika Fakulteti'), 'Tarmoq Kafedrasi', 'Кафедра сетей', 'Salim Rahimov'),
  ((SELECT id FROM faculties WHERE name_uz = 'Iqtisodiyot Fakulteti'), 'Makroiqtisodiyot Kafedrasi', 'Кафедра макроэкономики', 'Gulnoza Qoriyeva'),
  ((SELECT id FROM faculties WHERE name_uz = 'Muhandislik Fakulteti'), 'Mexanika Kafedrasi', 'Кафедра механики', 'Olim Xusanov');

-- Insert sample teachers
INSERT INTO teachers (department_id, first_name, last_name, email, phone, specialization_uz, experience_years)
VALUES
  ((SELECT id FROM departments WHERE name_uz = 'Dasturlash Kafedrasi'), 'Rustam', 'Salimov', 'rustam@urspi.uz', '+998901234567', 'Python va Web dasturlash', 8),
  ((SELECT id FROM departments WHERE name_uz = 'Dasturlash Kafedrasi'), 'Madina', 'Karimova', 'madina@urspi.uz', '+998902234567', 'Java dasturlash', 6),
  ((SELECT id FROM departments WHERE name_uz = 'Tarmoq Kafedrasi'), 'Kamol', 'Boboev', 'kamol@urspi.uz', '+998903234567', 'Kompyuter tarmoqlari', 10),
  ((SELECT id FROM departments WHERE name_uz = 'Makroiqtisodiyot Kafedrasi'), 'Sevara', 'Usmanova', 'sevara@urspi.uz', '+998904234567', 'Iqtisodiyot va moliya', 5),
  ((SELECT id FROM departments WHERE name_uz = 'Mexanika Kafedrasi'), 'Abdullo', 'Sodikov', 'abdullo@urspi.uz', '+998905234567', 'Mexanika va mexanizamlar', 12);

-- Insert sample reviews
INSERT INTO reviews (teacher_id, reviewer_name, rating, teaching_quality, communication, professional_knowledge, approachability, comment, anonymous)
VALUES
  ((SELECT id FROM teachers WHERE last_name = 'Salimov'), 'Student 1', 5, 5, 4, 5, 5, 'Juda yaxshi o''qituvchi. Mavzularni aniq tushuntiradi.', false),
  ((SELECT id FROM teachers WHERE last_name = 'Salimov'), NULL, 4, 4, 4, 5, 4, 'Darslar interaktiv va foydali. Shuni taklif qilamiz!', true),
  ((SELECT id FROM teachers WHERE last_name = 'Karimova'), 'Student 2', 5, 5, 5, 5, 5, 'Eng yaxshi o''qituvchi. Har bir talabani qabul qiladi.', false),
  ((SELECT id FROM teachers WHERE last_name = 'Boboev'), NULL, 4, 4, 3, 5, 4, 'Chuqur bilimga ega. Ba''zan aniqlik to''g''risidagi mulohazalar kerak.', true),
  ((SELECT id FROM teachers WHERE last_name = 'Usmanova'), 'Student 3', 5, 5, 5, 4, 5, 'Keng tajriba va praktik misollar. Tavsiya qilamiz!', false);
