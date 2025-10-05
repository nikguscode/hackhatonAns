--changeset nikguscode:insert-initial-demo-data

INSERT INTO stand (id, name, activity_type, start_date_time, end_date_time) VALUES
(
  'e91d096c-54a7-47b2-a4e3-3b6805d76d65',
  'Настольные игры: Эволюция',
  'GAME_BOARD'::ACTIVITY_TYPE,
  '2025-10-15 10:00:00+03',
  '2025-10-15 18:00:00+03'
),
(
  '4b9175f0-6c3e-4d43-9828-56950222f779',
  'VR-зона: Путешествие в будущее',
  'VR_AR'::ACTIVITY_TYPE,
  '2025-10-15 11:00:00+03',
  '2025-10-15 19:00:00+03'
),
(
  '2e0d3c69-92b1-4f1f-93d3-95b161204d60',
  'Командный квест: Взлом системы',
  'GAME_PC'::ACTIVITY_TYPE,
  '2025-10-15 12:00:00+03',
  '2025-10-15 20:00:00+03'
);


INSERT INTO employee (id, stand_id, machine_id, login, password, first_name, second_name, last_name, role) VALUES
(
  gen_random_uuid(),
  'e91d096c-54a7-47b2-a4e3-3b6805d76d65',
  NULL,
  'stand_tb1',
  'Pass.12345',
  'Петр',
  'Алексеевич',
  'Иванов',
  'VOLUNTEER'::EMPLOYEE_ROLE
),

(
  gen_random_uuid(),
  '4b9175f0-6c3e-4d43-9828-56950222f779',
  NULL,
  'stand_vr2',
  'Pass.67890',
  'Мария',
  'Сергеевна',
  'Смирнова',
  'VOLUNTEER'::EMPLOYEE_ROLE
),

(
  gen_random_uuid(),
  '2e0d3c69-92b1-4f1f-93d3-95b161204d60',
  NULL,
  'stand_kq3',
  'Pass.13579',
  'Дмитрий',
  'Олегович',
  'Кузнецов',
  'VOLUNTEER'::EMPLOYEE_ROLE
),

(
  gen_random_uuid(),
  NULL,
  NULL,
  'admin_001',
  'Admin123!',
  'Николай',
  'Викторович',
  'Админов',
  'ADMIN'::EMPLOYEE_ROLE
);