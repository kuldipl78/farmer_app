#!/bin/bash

# Script to run user queries on SQLite database
# Usage: ./run_user_queries.sh

DB_FILE="farmer_marketplace.db"

if [ ! -f "$DB_FILE" ]; then
    echo "❌ Database file not found: $DB_FILE"
    exit 1
fi

echo "📊 User Database Queries"
echo "========================"
echo ""

echo "1️⃣  All Users (Basic Info):"
echo "---------------------------"
sqlite3 $DB_FILE "SELECT id, email, first_name, last_name, role, phone, is_active, created_at FROM users ORDER BY created_at DESC;" -header -column
echo ""

echo "2️⃣  User Count by Role:"
echo "------------------------"
sqlite3 $DB_FILE "SELECT role, COUNT(*) as total_users, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users FROM users GROUP BY role;" -header -column
echo ""

echo "3️⃣  Recent Sign-ups (Last 7 days):"
echo "-----------------------------------"
sqlite3 $DB_FILE "SELECT id, email, first_name, last_name, role, created_at FROM users WHERE created_at >= datetime('now', '-7 days') ORDER BY created_at DESC;" -header -column
echo ""

echo "4️⃣  All Customers:"
echo "------------------"
sqlite3 $DB_FILE "SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, COUNT(o.id) as total_orders FROM users u LEFT JOIN orders o ON u.id = o.customer_id WHERE u.role = 'customer' GROUP BY u.id ORDER BY u.created_at DESC;" -header -column
echo ""

echo "5️⃣  All Farmers:"
echo "----------------"
sqlite3 $DB_FILE "SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, COUNT(p.id) as total_products FROM users u LEFT JOIN products p ON u.id = p.farmer_id WHERE u.role = 'farmer' GROUP BY u.id ORDER BY u.created_at DESC;" -header -column
echo ""

echo "6️⃣  User Statistics Summary:"
echo "-----------------------------"
sqlite3 $DB_FILE "SELECT COUNT(*) as total_users, SUM(CASE WHEN role = 'customer' THEN 1 ELSE 0 END) as customers, SUM(CASE WHEN role = 'farmer' THEN 1 ELSE 0 END) as farmers, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users FROM users;" -header -column
echo ""

echo "✅ Query execution complete!"
