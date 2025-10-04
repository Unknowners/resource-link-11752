-- Manually confirm the user's email (only email_confirmed_at)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'antonyaskevych@gmail.com';