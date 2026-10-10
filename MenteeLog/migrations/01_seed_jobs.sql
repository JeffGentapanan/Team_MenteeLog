-- Assumption: listings_jobs.id is a UUID primary key with a default (e.g., uuid_generate_v4() or gen_random_uuid()).
-- Assumption: listings_jobs.supervisor_id is a UUID foreign key referencing profiles(id).

-- Insert seeded jobs with generated UUIDs for an example Supervisor UUID.
-- Replace '<YOUR_SUPERVISOR_UUID>' with a valid Supervisor UUID from the profiles table.
INSERT INTO listings_jobs (id, supervisor_id, title, company, location, mode, courses, slots, status, description, specs, skills) VALUES 
(gen_random_uuid(), '<YOUR_SUPERVISOR_UUID>', 'Software Engineer Intern', 'Accenture Philippines', 'BGC, Taguig', 'Hybrid', ARRAY['BS Computer Science','BS Information Technology'], 12, 'Active', 'Build meaningful software with a collaborative engineering team. Work on frontend features, automated testing, and technical documentation.', 'Accredited HTE • Active MOA • 500-hour training plan', 'JavaScript, HTML & CSS, Git'),
(gen_random_uuid(), '<YOUR_SUPERVISOR_UUID>', 'Network Engineering Intern', 'Globe Telecom', 'Mandaluyong', 'On-site', ARRAY['BS Information Technology','BS Computer Engineering'], 8, 'Active', 'Support network operations, learn infrastructure monitoring, and help document network configurations.', 'Accredited HTE • Active MOA • 500-hour training plan', 'Networking, troubleshooting, documentation'),
(gen_random_uuid(), '<YOUR_SUPERVISOR_UUID>', 'FinTech & Systems Intern', 'BDO Unibank', 'Makati', 'On-site', ARRAY['BS Computer Science','BS Information Technology'], 6, 'Active', 'Help improve internal systems through quality assurance, data validation, and business process documentation.', 'Accredited HTE • Active MOA • 500-hour training plan', 'SQL, analytical thinking, quality assurance'),
(gen_random_uuid(), '<YOUR_SUPERVISOR_UUID>', 'ICT Infrastructure Intern', 'Meralco', 'Pasig', 'On-site', ARRAY['BS Information Technology','BS Computer Engineering'], 4, 'Active', 'Learn enterprise IT support and contribute to reliable infrastructure services.', 'Accredited HTE • Active MOA', 'Hardware, networking, customer support'),
(gen_random_uuid(), '<YOUR_SUPERVISOR_UUID>', 'Software Development Intern', 'PhilStar Digital', 'Remote', 'Remote', ARRAY['BS Computer Science','BS Information Technology'], 5, 'Active', 'Collaborate on digital publishing tools and responsive web experiences.', 'Accredited HTE • Active MOA', 'JavaScript, responsive design, Git'),
(gen_random_uuid(), '<YOUR_SUPERVISOR_UUID>', 'Business Intelligence Intern', 'SM Technologies', 'Pasay', 'Hybrid', ARRAY['BS Computer Science','BS Information Technology'], 10, 'Active', 'Turn operational data into useful dashboards and insights for business teams.', 'Accredited HTE • Active MOA', 'SQL, spreadsheets, data visualization');

-- Query to find orphaned applications (where job_id does not exist in listings_jobs)
SELECT * FROM applications a
WHERE NOT EXISTS (
  SELECT 1 FROM listings_jobs j 
  WHERE j.id::text = a.job_id::text
);
