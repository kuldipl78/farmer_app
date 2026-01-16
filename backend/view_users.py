#!/usr/bin/env python3
"""
Script to view all users in the database
Usage: python3 view_users.py
"""

import sqlite3
import sys
from datetime import datetime

DB_FILE = 'farmer_marketplace.db'

def print_separator():
    print("=" * 100)

def view_all_users():
    """View all users with basic information"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, email, first_name, last_name, role, phone, is_active, created_at 
        FROM users 
        ORDER BY created_at DESC
    """)
    
    users = cursor.fetchall()
    
    print("\n📊 ALL USERS IN DATABASE")
    print_separator()
    
    if users:
        print(f"\n{'ID':<5} {'Email':<35} {'Name':<25} {'Role':<10} {'Phone':<15} {'Active':<8} {'Created At'}")
        print("-" * 100)
        for user in users:
            user_id, email, first_name, last_name, role, phone, is_active, created_at = user
            name = f"{first_name} {last_name}"
            phone_str = phone if phone else "N/A"
            active_str = "✓" if is_active else "✗"
            print(f"{user_id:<5} {email:<35} {name:<25} {role:<10} {phone_str:<15} {active_str:<8} {created_at}")
        
        print(f"\n✅ Total Users: {len(users)}")
    else:
        print("No users found in database")
    
    conn.close()

def view_users_by_role():
    """View users grouped by role"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    print("\n\n📈 USERS BY ROLE")
    print_separator()
    
    cursor.execute("""
        SELECT role, COUNT(*) as total, 
               SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active
        FROM users 
        GROUP BY role
    """)
    
    for role, total, active in cursor.fetchall():
        print(f"\n{role.upper()}:")
        print(f"  Total: {total}")
        print(f"  Active: {active}")
        print(f"  Inactive: {total - active}")
    
    conn.close()

def view_recent_users(days=7):
    """View recent sign-ups"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    print(f"\n\n🆕 RECENT SIGN-UPS (Last {days} days)")
    print_separator()
    
    cursor.execute("""
        SELECT id, email, first_name, last_name, role, created_at 
        FROM users 
        WHERE created_at >= datetime('now', '-' || ? || ' days')
        ORDER BY created_at DESC
    """, (days,))
    
    users = cursor.fetchall()
    
    if users:
        print(f"\n{'ID':<5} {'Email':<35} {'Name':<25} {'Role':<10} {'Created At'}")
        print("-" * 100)
        for user in users:
            user_id, email, first_name, last_name, role, created_at = user
            name = f"{first_name} {last_name}"
            print(f"{user_id:<5} {email:<35} {name:<25} {role:<10} {created_at}")
        print(f"\n✅ Total: {len(users)}")
    else:
        print(f"No new users in the last {days} days")
    
    conn.close()

def view_customers_with_orders():
    """View customers with their order count"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    print("\n\n🛒 CUSTOMERS WITH ORDER HISTORY")
    print_separator()
    
    cursor.execute("""
        SELECT u.id, u.email, u.first_name, u.last_name, u.phone, 
               COUNT(o.id) as total_orders,
               COALESCE(SUM(o.total_amount), 0) as total_spent
        FROM users u
        LEFT JOIN orders o ON u.id = o.customer_id
        WHERE u.role = 'customer'
        GROUP BY u.id
        ORDER BY total_orders DESC, u.created_at DESC
    """)
    
    customers = cursor.fetchall()
    
    if customers:
        print(f"\n{'ID':<5} {'Email':<35} {'Name':<25} {'Phone':<15} {'Orders':<8} {'Total Spent'}")
        print("-" * 100)
        for customer in customers:
            user_id, email, first_name, last_name, phone, orders, spent = customer
            name = f"{first_name} {last_name}"
            phone_str = phone if phone else "N/A"
            print(f"{user_id:<5} {email:<35} {name:<25} {phone_str:<15} {orders:<8} ${spent:.2f}")
        print(f"\n✅ Total Customers: {len(customers)}")
    else:
        print("No customers found")
    
    conn.close()

def view_farmers_with_products():
    """View farmers with their product count"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    print("\n\n🌾 FARMERS WITH PRODUCTS")
    print_separator()
    
    cursor.execute("""
        SELECT u.id, u.email, u.first_name, u.last_name, u.phone,
               COUNT(DISTINCT p.id) as total_products,
               COUNT(DISTINCT o.id) as total_orders
        FROM users u
        LEFT JOIN products p ON u.id = p.farmer_id
        LEFT JOIN orders o ON u.id = o.farmer_id
        WHERE u.role = 'farmer'
        GROUP BY u.id
        ORDER BY total_products DESC, u.created_at DESC
    """)
    
    farmers = cursor.fetchall()
    
    if farmers:
        print(f"\n{'ID':<5} {'Email':<35} {'Name':<25} {'Phone':<15} {'Products':<10} {'Orders'}")
        print("-" * 100)
        for farmer in farmers:
            user_id, email, first_name, last_name, phone, products, orders = farmer
            name = f"{first_name} {last_name}"
            phone_str = phone if phone else "N/A"
            print(f"{user_id:<5} {email:<35} {name:<25} {phone_str:<15} {products:<10} {orders}")
        print(f"\n✅ Total Farmers: {len(farmers)}")
    else:
        print("No farmers found")
    
    conn.close()

def view_user_statistics():
    """View overall user statistics"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    print("\n\n📊 USER STATISTICS SUMMARY")
    print_separator()
    
    cursor.execute("""
        SELECT 
            COUNT(*) as total_users,
            SUM(CASE WHEN role = 'customer' THEN 1 ELSE 0 END) as customers,
            SUM(CASE WHEN role = 'farmer' THEN 1 ELSE 0 END) as farmers,
            SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users,
            SUM(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 ELSE 0 END) as users_with_phone
        FROM users
    """)
    
    stats = cursor.fetchone()
    total, customers, farmers, active, with_phone = stats
    
    print(f"\nTotal Users: {total}")
    print(f"  - Customers: {customers}")
    print(f"  - Farmers: {farmers}")
    print(f"  - Active Users: {active}")
    print(f"  - Users with Phone: {with_phone}")
    print(f"  - Inactive Users: {total - active}")
    
    conn.close()

if __name__ == '__main__':
    try:
        view_all_users()
        view_users_by_role()
        view_recent_users(7)
        view_customers_with_orders()
        view_farmers_with_products()
        view_user_statistics()
        print("\n" + "=" * 100)
        print("✅ Query execution complete!")
    except FileNotFoundError:
        print(f"❌ Error: Database file '{DB_FILE}' not found!")
        print("   Make sure you're running this script from the backend directory.")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
