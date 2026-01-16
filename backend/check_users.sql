-- SQL Queries to Check All Signed-In Users Data
-- Database: farmer_marketplace.db (SQLite)

-- 1. View All Users with Basic Information
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    phone,
    is_active,
    created_at
FROM users
ORDER BY created_at DESC;

-- 2. View All Users with Full Details (including password hash - for admin use only)
SELECT 
    id,
    email,
    password_hash,
    role,
    first_name,
    last_name,
    phone,
    is_active,
    created_at
FROM users
ORDER BY id;

-- 3. Count Users by Role
SELECT 
    role,
    COUNT(*) as total_users,
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users
FROM users
GROUP BY role;

-- 4. View Recent Sign-ups (Last 30 days)
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    created_at
FROM users
WHERE created_at >= datetime('now', '-30 days')
ORDER BY created_at DESC;

-- 5. View All Customers
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.phone,
    u.created_at,
    COUNT(o.id) as total_orders
FROM users u
LEFT JOIN orders o ON u.id = o.customer_id
WHERE u.role = 'customer'
GROUP BY u.id
ORDER BY u.created_at DESC;

-- 6. View All Farmers
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.phone,
    u.created_at,
    COUNT(p.id) as total_products,
    COUNT(o.id) as total_orders_received
FROM users u
LEFT JOIN products p ON u.id = p.farmer_id
LEFT JOIN orders o ON u.id = o.farmer_id
WHERE u.role = 'farmer'
GROUP BY u.id
ORDER BY u.created_at DESC;

-- 7. View Users with Their Orders
SELECT 
    u.id as user_id,
    u.email,
    u.first_name || ' ' || u.last_name as full_name,
    u.role,
    o.id as order_id,
    o.status,
    o.total_amount,
    o.created_at as order_date
FROM users u
LEFT JOIN orders o ON u.id = o.customer_id OR u.id = o.farmer_id
ORDER BY u.id, o.created_at DESC;

-- 8. View Active Users (is_active = 1)
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    phone,
    created_at
FROM users
WHERE is_active = 1
ORDER BY created_at DESC;

-- 9. View Users with Phone Numbers
SELECT 
    id,
    email,
    first_name,
    last_name,
    phone,
    role,
    created_at
FROM users
WHERE phone IS NOT NULL AND phone != ''
ORDER BY created_at DESC;

-- 10. View User Statistics Summary
SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN role = 'customer' THEN 1 ELSE 0 END) as customers,
    SUM(CASE WHEN role = 'farmer' THEN 1 ELSE 0 END) as farmers,
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users,
    SUM(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 ELSE 0 END) as users_with_phone
FROM users;

-- 11. View Users Created Today
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    created_at
FROM users
WHERE DATE(created_at) = DATE('now')
ORDER BY created_at DESC;

-- 12. View Users by Email Domain
SELECT 
    SUBSTR(email, INSTR(email, '@') + 1) as email_domain,
    COUNT(*) as user_count
FROM users
GROUP BY email_domain
ORDER BY user_count DESC;
