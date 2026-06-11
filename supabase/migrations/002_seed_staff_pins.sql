-- BLUMERA initial staff PINs (bcrypt-hashed via admin_set_staff_pin)
-- Run once in Supabase SQL editor after 001_security.sql

select admin_set_staff_pin('admin', '20473405', 'Administrator', 'admin');
select admin_set_staff_pin('employee_1', '506316', 'Employee 1', 'staff');
select admin_set_staff_pin('employee_2', '200316', 'Employee 2', 'staff');
