#!/usr/bin/env python3
"""Simple HTTP server for the farmer marketplace API."""

import json
import hashlib
import secrets
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import os

# Try to load environment variables, fallback if not available
try:
    from dotenv import load_dotenv
    load_dotenv()
    DOTENV_AVAILABLE = True
except ImportError:
    DOTENV_AVAILABLE = False
    print("⚠️  python-dotenv not available, using environment variables directly")

# Database setup
DATABASE_URL = os.getenv('DATABASE_URL')
USE_SQLITE = not DATABASE_URL  # Use SQLite for local development, PostgreSQL for production

if USE_SQLITE:
    import sqlite3
    DB_FILE = "farmer_marketplace.db"
else:
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        POSTGRES_AVAILABLE = True
    except ImportError:
        print("❌ psycopg2 not available, falling back to SQLite")
        USE_SQLITE = True
        import sqlite3
        DB_FILE = "farmer_marketplace.db"

# Simple in-memory token store (in production, use Redis or database)
active_tokens = {}

def get_db_connection():
    """Get database connection based on environment."""
    if USE_SQLITE:
        return sqlite3.connect(DB_FILE)
    else:
        return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def init_db():
    """Initialize database."""
    if USE_SQLITE:
        init_sqlite_db()
    else:
        init_postgres_db()

def init_sqlite_db():
    """Initialize SQLite database."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            phone TEXT,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create categories table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            is_active BOOLEAN DEFAULT 1
        )
    ''')
    
    # Create products table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            price_per_unit REAL NOT NULL,
            unit_type TEXT NOT NULL,
            quantity_available INTEGER DEFAULT 0,
            is_organic BOOLEAN DEFAULT 0,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (farmer_id) REFERENCES users (id),
            FOREIGN KEY (category_id) REFERENCES categories (id)
        )
    ''')
    
    # Create orders table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            farmer_id INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            total_amount REAL NOT NULL,
            delivery_address TEXT NOT NULL,
            delivery_date DATE,
            delivery_time TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES users (id),
            FOREIGN KEY (farmer_id) REFERENCES users (id)
        )
    ''')
    
    # Create order_items table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            total_price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders (id),
            FOREIGN KEY (product_id) REFERENCES products (id)
        )
    ''')
    
    # Insert sample data
    insert_sample_data_sqlite(cursor)
    conn.commit()
    conn.close()

def init_postgres_db():
    """Initialize PostgreSQL database."""
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            phone VARCHAR(20),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create categories table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            description TEXT,
            is_active BOOLEAN DEFAULT TRUE
        )
    ''')
    
    # Create products table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            farmer_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price_per_unit DECIMAL(10, 2) NOT NULL,
            unit_type VARCHAR(50) NOT NULL,
            quantity_available INTEGER DEFAULT 0,
            is_organic BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (farmer_id) REFERENCES users (id),
            FOREIGN KEY (category_id) REFERENCES categories (id)
        )
    ''')
    
    # Insert sample data
    insert_sample_data_postgres(cursor)
    conn.commit()
    conn.close()

def insert_sample_data_sqlite(cursor):
    """Insert sample data for SQLite."""
    # Insert sample categories
    categories = [
        ("Vegetables", "Fresh vegetables and leafy greens"),
        ("Fruits", "Seasonal fruits and berries"),
        ("Herbs", "Fresh herbs and spices"),
        ("Grains", "Rice, wheat, and other grains"),
        ("Dairy", "Fresh milk, cheese, and dairy products"),
        ("Eggs", "Farm fresh eggs"),
    ]
    
    cursor.execute("SELECT COUNT(*) FROM categories")
    if cursor.fetchone()[0] == 0:
        cursor.executemany("INSERT INTO categories (name, description) VALUES (?, ?)", categories)
    
    # Insert sample products with better data
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] == 0:
        # First, create a sample farmer user
        farmer_email = "farmer@example.com"
        farmer_password = hash_password("password123")
        cursor.execute('''
            INSERT OR IGNORE INTO users (email, password_hash, role, first_name, last_name, phone, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (farmer_email, farmer_password, 'farmer', 'John', 'Smith', '+1234567890', 1))
        
        # Get farmer ID
        cursor.execute("SELECT id FROM users WHERE email = ?", (farmer_email,))
        farmer_id = cursor.fetchone()[0]
        
        # Sample products with realistic data
        sample_products = [
            (farmer_id, 1, "Organic Tomatoes", "Fresh, vine-ripened organic tomatoes. Perfect for salads and cooking.", 4.99, "lb", 50, 1),
            (farmer_id, 1, "Fresh Lettuce", "Crisp romaine lettuce, locally grown. Great for salads and sandwiches.", 2.49, "head", 30, 0),
            (farmer_id, 1, "Bell Peppers", "Colorful bell peppers - red, yellow, and green. Sweet and crunchy.", 3.99, "lb", 25, 0),
            (farmer_id, 1, "Organic Carrots", "Sweet, crunchy organic carrots. Perfect for snacking or cooking.", 2.99, "bunch", 40, 1),
            (farmer_id, 2, "Fresh Strawberries", "Sweet, juicy strawberries picked fresh this morning.", 5.99, "box", 20, 1),
            (farmer_id, 2, "Organic Apples", "Crisp, sweet organic apples. Multiple varieties available.", 3.49, "lb", 60, 1),
            (farmer_id, 3, "Fresh Basil", "Aromatic fresh basil leaves. Perfect for pasta and pizza.", 1.99, "bunch", 15, 1),
            (farmer_id, 3, "Organic Cilantro", "Fresh organic cilantro. Great for Mexican and Asian dishes.", 1.49, "bunch", 20, 1),
            (farmer_id, 4, "Brown Rice", "Organic brown rice, locally grown and milled.", 4.99, "lb", 100, 1),
            (farmer_id, 5, "Fresh Milk", "Whole milk from grass-fed cows. Delivered fresh daily.", 3.99, "gallon", 10, 0),
            (farmer_id, 6, "Farm Fresh Eggs", "Free-range chicken eggs. Collected fresh daily.", 4.49, "dozen", 25, 0),
            (farmer_id, 1, "Organic Spinach", "Fresh organic baby spinach. Perfect for salads and smoothies.", 3.99, "bag", 35, 1),
        ]
        
        cursor.executemany('''
            INSERT INTO products (farmer_id, category_id, name, description, price_per_unit, unit_type, quantity_available, is_organic)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', sample_products)

def insert_sample_data_postgres(cursor):
    """Insert sample data for PostgreSQL."""
    # Insert sample categories
    categories = [
        ("Vegetables", "Fresh vegetables and leafy greens"),
        ("Fruits", "Seasonal fruits and berries"),
        ("Herbs", "Fresh herbs and spices"),
        ("Grains", "Rice, wheat, and other grains"),
        ("Dairy", "Fresh milk, cheese, and dairy products"),
        ("Eggs", "Farm fresh eggs"),
    ]
    
    cursor.execute("SELECT COUNT(*) FROM categories")
    if cursor.fetchone()[0] == 0:
        cursor.executemany("INSERT INTO categories (name, description) VALUES (%s, %s)", categories)
    
    # Insert sample products with better data
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] == 0:
        # First, create a sample farmer user
        farmer_email = "farmer@example.com"
        farmer_password = hash_password("password123")
        cursor.execute('''
            INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (email) DO NOTHING
        ''', (farmer_email, farmer_password, 'farmer', 'John', 'Smith', '+1234567890', True))
        
        # Get farmer ID
        cursor.execute("SELECT id FROM users WHERE email = %s", (farmer_email,))
        result = cursor.fetchone()
        farmer_id = result[0] if result else None
        
        if farmer_id:
            # Sample products with realistic data
            sample_products = [
                (farmer_id, 1, "Organic Tomatoes", "Fresh, vine-ripened organic tomatoes. Perfect for salads and cooking.", 4.99, "lb", 50, True),
                (farmer_id, 1, "Fresh Lettuce", "Crisp romaine lettuce, locally grown. Great for salads and sandwiches.", 2.49, "head", 30, False),
                (farmer_id, 1, "Bell Peppers", "Colorful bell peppers - red, yellow, and green. Sweet and crunchy.", 3.99, "lb", 25, False),
                (farmer_id, 1, "Organic Carrots", "Sweet, crunchy organic carrots. Perfect for snacking or cooking.", 2.99, "bunch", 40, True),
                (farmer_id, 2, "Fresh Strawberries", "Sweet, juicy strawberries picked fresh this morning.", 5.99, "box", 20, True),
                (farmer_id, 2, "Organic Apples", "Crisp, sweet organic apples. Multiple varieties available.", 3.49, "lb", 60, True),
                (farmer_id, 3, "Fresh Basil", "Aromatic fresh basil leaves. Perfect for pasta and pizza.", 1.99, "bunch", 15, True),
                (farmer_id, 3, "Organic Cilantro", "Fresh organic cilantro. Great for Mexican and Asian dishes.", 1.49, "bunch", 20, True),
                (farmer_id, 4, "Brown Rice", "Organic brown rice, locally grown and milled.", 4.99, "lb", 100, True),
                (farmer_id, 5, "Fresh Milk", "Whole milk from grass-fed cows. Delivered fresh daily.", 3.99, "gallon", 10, False),
                (farmer_id, 6, "Farm Fresh Eggs", "Free-range chicken eggs. Collected fresh daily.", 4.49, "dozen", 25, False),
                (farmer_id, 1, "Organic Spinach", "Fresh organic baby spinach. Perfect for salads and smoothies.", 3.99, "bag", 35, True),
            ]
            
            cursor.executemany('''
                INSERT INTO products (farmer_id, category_id, name, description, price_per_unit, unit_type, quantity_available, is_organic)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ''', sample_products)

def hash_password(password):
    """Simple password hashing."""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hashed):
    """Verify password."""
    return hash_password(password) == hashed

class APIHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        """Set CORS headers."""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    def _send_json_response(self, data, status=200):
        """Send JSON response."""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self._set_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def _get_request_body(self):
        """Get request body as JSON."""
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length:
            body = self.rfile.read(content_length)
            return json.loads(body.decode())
        return {}
    
    def do_OPTIONS(self):
        """Handle preflight requests."""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests."""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path == '/':
            self._send_json_response({
                "message": "Welcome to Farmer Marketplace API",
                "version": "1.0.0",
                "docs": "/docs"
            })
        elif path == '/health':
            self._send_json_response({"status": "healthy"})
        elif path == '/categories/':
            self._get_categories()
        elif path == '/products/':
            self._get_products()
        elif path == '/products/farmer/my-products' or path == '/products/farmer/my-products/':
            self._get_farmer_products()
        elif path == '/auth/me':
            self._get_current_user()
        elif path == '/orders/' or path == '/orders':
            self._get_orders()
        else:
            self._send_json_response({"detail": "Not found"}, 404)
    
    def do_POST(self):
        """Handle POST requests."""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path == '/auth/register':
            self._register_user()
        elif path == '/auth/login':
            self._login_user()
        elif path == '/products/':
            self._create_product()
        elif path == '/users/profile':
            self._update_profile()
        elif path == '/orders/' or path == '/orders':
            self._create_order()
        else:
            self._send_json_response({"detail": "Not found"}, 404)
    
    def _get_categories(self):
        """Get all categories."""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if USE_SQLITE:
            cursor.execute("SELECT id, name, description FROM categories WHERE is_active = 1")
            categories = []
            for row in cursor.fetchall():
                categories.append({
                    "id": row[0],
                    "name": row[1],
                    "description": row[2],
                    "is_active": True
                })
        else:
            cursor.execute("SELECT id, name, description FROM categories WHERE is_active = TRUE")
            categories = []
            for row in cursor.fetchall():
                categories.append({
                    "id": row['id'],
                    "name": row['name'],
                    "description": row['description'],
                    "is_active": True
                })
        
        conn.close()
        self._send_json_response(categories)
    
    def _get_products(self):
        """Get all products."""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if USE_SQLITE:
            cursor.execute('''
                SELECT p.id, p.name, p.description, p.price_per_unit, p.unit_type, 
                       p.quantity_available, p.is_organic, c.name as category_name
                FROM products p 
                JOIN categories c ON p.category_id = c.id 
                WHERE p.is_active = 1 AND p.quantity_available > 0
            ''')
            products = []
            for row in cursor.fetchall():
                products.append({
                    "id": row[0],
                    "name": row[1],
                    "description": row[2],
                    "price_per_unit": row[3],
                    "unit_type": row[4],
                    "quantity_available": row[5],
                    "is_organic": bool(row[6]),
                    "category": {"name": row[7]},
                    "is_active": True,
                    "is_available": True
                })
        else:
            cursor.execute('''
                SELECT p.id, p.name, p.description, p.price_per_unit, p.unit_type, 
                       p.quantity_available, p.is_organic, c.name as category_name
                FROM products p 
                JOIN categories c ON p.category_id = c.id 
                WHERE p.is_active = TRUE AND p.quantity_available > 0
            ''')
            products = []
            for row in cursor.fetchall():
                products.append({
                    "id": row['id'],
                    "name": row['name'],
                    "description": row['description'],
                    "price_per_unit": float(row['price_per_unit']),
                    "unit_type": row['unit_type'],
                    "quantity_available": row['quantity_available'],
                    "is_organic": row['is_organic'],
                    "category": {"name": row['category_name']},
                    "is_active": True,
                    "is_available": True
                })
        
        conn.close()
        self._send_json_response(products)
    
    def _get_farmer_products(self):
        """Get products for a specific farmer."""
        try:
            # Get Authorization header
            auth_header = self.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                self._send_json_response({"detail": "Missing or invalid authorization header"}, 401)
                return
            
            token = auth_header.split(' ')[1]
            if token not in active_tokens:
                self._send_json_response({"detail": "Invalid or expired token"}, 401)
                return
            
            user_data = active_tokens[token]
            if user_data['role'] != 'farmer':
                self._send_json_response({"detail": "Only farmers can access this endpoint"}, 403)
                return
            
            conn = get_db_connection()
            cursor = conn.cursor()
            
            if USE_SQLITE:
                cursor.execute('''
                    SELECT p.id, p.name, p.description, p.price_per_unit, p.unit_type, 
                           p.quantity_available, p.is_organic, c.name as category_name, p.is_active
                    FROM products p 
                    JOIN categories c ON p.category_id = c.id 
                    WHERE p.farmer_id = ?
                    ORDER BY p.created_at DESC
                ''', (user_data['id'],))
                
                products = []
                for row in cursor.fetchall():
                    products.append({
                        "id": row[0],
                        "name": row[1],
                        "description": row[2],
                        "price_per_unit": row[3],
                        "unit_type": row[4],
                        "quantity_available": row[5],
                        "is_organic": bool(row[6]),
                        "category": {"name": row[7]},
                        "is_active": bool(row[8]),
                        "is_available": row[5] > 0
                    })
            else:
                cursor.execute('''
                    SELECT p.id, p.name, p.description, p.price_per_unit, p.unit_type, 
                           p.quantity_available, p.is_organic, c.name as category_name, p.is_active
                    FROM products p 
                    JOIN categories c ON p.category_id = c.id 
                    WHERE p.farmer_id = %s
                    ORDER BY p.created_at DESC
                ''', (user_data['id'],))
                
                products = []
                for row in cursor.fetchall():
                    products.append({
                        "id": row['id'],
                        "name": row['name'],
                        "description": row['description'],
                        "price_per_unit": float(row['price_per_unit']),
                        "unit_type": row['unit_type'],
                        "quantity_available": row['quantity_available'],
                        "is_organic": row['is_organic'],
                        "category": {"name": row['category_name']},
                        "is_active": row['is_active'],
                        "is_available": row['quantity_available'] > 0
                    })
            
            conn.close()
            self._send_json_response(products)
            
        except Exception as e:
            self._send_json_response({"detail": str(e)}, 500)
    
    def _register_user(self):
        """Register a new user."""
        try:
            data = self._get_request_body()
            required_fields = ['email', 'password', 'role', 'first_name', 'last_name']
            
            for field in required_fields:
                if field not in data:
                    self._send_json_response({"detail": f"Missing field: {field}"}, 400)
                    return
            
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Check if user exists
            if USE_SQLITE:
                cursor.execute("SELECT id FROM users WHERE email = ?", (data['email'],))
            else:
                cursor.execute("SELECT id FROM users WHERE email = %s", (data['email'],))
            
            if cursor.fetchone():
                self._send_json_response({"detail": "Email already registered"}, 400)
                return
            
            # Create user
            password_hash = hash_password(data['password'])
            
            if USE_SQLITE:
                cursor.execute('''
                    INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    data['email'], password_hash, data['role'], 
                    data['first_name'], data['last_name'], data.get('phone')
                ))
                user_id = cursor.lastrowid
            else:
                cursor.execute('''
                    INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
                    VALUES (%s, %s, %s, %s, %s, %s) RETURNING id
                ''', (
                    data['email'], password_hash, data['role'], 
                    data['first_name'], data['last_name'], data.get('phone')
                ))
                user_id = cursor.fetchone()['id']
            
            conn.commit()
            conn.close()
            
            self._send_json_response({
                "id": user_id,
                "email": data['email'],
                "role": data['role'],
                "first_name": data['first_name'],
                "last_name": data['last_name'],
                "is_active": True,
                "is_verified": False
            })
            
        except Exception as e:
            self._send_json_response({"detail": str(e)}, 500)
    
    def _login_user(self):
        """Login user."""
        try:
            data = self._get_request_body()
            
            if 'email' not in data or 'password' not in data:
                self._send_json_response({"detail": "Email and password required"}, 400)
                return
            
            conn = get_db_connection()
            cursor = conn.cursor()
            
            if USE_SQLITE:
                cursor.execute('''
                    SELECT id, email, password_hash, role, first_name, last_name, is_active
                    FROM users WHERE email = ?
                ''', (data['email'],))
                user = cursor.fetchone()
                
                if user:
                    user_data = {
                        "id": user[0],
                        "email": user[1],
                        "password_hash": user[2],
                        "role": user[3],
                        "first_name": user[4],
                        "last_name": user[5],
                        "is_active": bool(user[6])
                    }
                else:
                    user_data = None
            else:
                cursor.execute('''
                    SELECT id, email, password_hash, role, first_name, last_name, is_active
                    FROM users WHERE email = %s
                ''', (data['email'],))
                user = cursor.fetchone()
                
                if user:
                    user_data = {
                        "id": user['id'],
                        "email": user['email'],
                        "password_hash": user['password_hash'],
                        "role": user['role'],
                        "first_name": user['first_name'],
                        "last_name": user['last_name'],
                        "is_active": user['is_active']
                    }
                else:
                    user_data = None
            
            conn.close()
            
            if not user_data or not verify_password(data['password'], user_data['password_hash']):
                self._send_json_response({"detail": "Incorrect email or password"}, 401)
                return
            
            if not user_data['is_active']:
                self._send_json_response({"detail": "Inactive user"}, 400)
                return
            
            # Generate simple token (in production, use JWT)
            token = secrets.token_urlsafe(32)
            
            # Store user info with token
            token_user_data = {
                "id": user_data['id'],
                "email": user_data['email'],
                "role": user_data['role'],
                "first_name": user_data['first_name'],
                "last_name": user_data['last_name'],
                "is_active": user_data['is_active'],
                "is_verified": True
            }
            active_tokens[token] = token_user_data
            
            self._send_json_response({
                "access_token": token,
                "token_type": "bearer"
            })
            
        except Exception as e:
            self._send_json_response({"detail": str(e)}, 500)
    
    def _get_current_user(self):
        """Get current user info from token."""
        try:
            # Get Authorization header
            auth_header = self.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                self._send_json_response({"detail": "Missing or invalid authorization header"}, 401)
                return
            
            token = auth_header.split(' ')[1]
            
            # Get user data from token store
            if token in active_tokens:
                user_data = active_tokens[token]
                self._send_json_response(user_data)
            else:
                self._send_json_response({"detail": "Invalid or expired token"}, 401)
                
        except Exception as e:
            self._send_json_response({"detail": str(e)}, 500)
    
    def do_PUT(self):
        """Handle PUT requests."""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path.startswith('/products/'):
            self._update_product()
        elif path == '/users/profile':
            self._update_profile()
        else:
            self._send_json_response({"detail": "Not found"}, 404)
    
    def do_DELETE(self):
        """Handle DELETE requests."""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path.startswith('/products/'):
            self._delete_product()
        else:
            self._send_json_response({"detail": "Not found"}, 404)
    
    def _create_product(self):
        """Create a new product."""
        try:
            # Get Authorization header
            auth_header = self.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                self._send_json_response({"detail": "Missing or invalid authorization header"}, 401)
                return
            
            token = auth_header.split(' ')[1]
            if token not in active_tokens:
                self._send_json_response({"detail": "Invalid or expired token"}, 401)
                return
            
            user_data = active_tokens[token]
            if user_data['role'] != 'farmer':
                self._send_json_response({"detail": "Only farmers can create products"}, 403)
                return
            
            data = self._get_request_body()
            required_fields = ['name', 'description', 'price_per_unit', 'unit_type', 'quantity_available', 'category_id']
            
            for field in required_fields:
                if field not in data or not data[field]:
                    self._send_json_response({"detail": f"Missing required field: {field}"}, 400)
                    return
            
            # Validate data types
            try:
                price = float(data['price_per_unit'])
                quantity = int(data['quantity_available'])
                category_id = int(data['category_id'])
            except ValueError:
                self._send_json_response({"detail": "Invalid data types for numeric fields"}, 400)
                return
            
            if price <= 0:
                self._send_json_response({"detail": "Price must be greater than 0"}, 400)
                return
            
            if quantity < 0:
                self._send_json_response({"detail": "Quantity cannot be negative"}, 400)
                return
            
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Check if category exists
            if USE_SQLITE:
                cursor.execute("SELECT id FROM categories WHERE id = ?", (category_id,))
            else:
                cursor.execute("SELECT id FROM categories WHERE id = %s", (category_id,))
            
            if not cursor.fetchone():
                self._send_json_response({"detail": "Invalid category ID"}, 400)
                return
            
            # Create product
            if USE_SQLITE:
                cursor.execute('''
                    INSERT INTO products (farmer_id, category_id, name, description, price_per_unit, 
                                        unit_type, quantity_available, is_organic)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    user_data['id'], category_id, data['name'], data['description'],
                    price, data['unit_type'], quantity, data.get('is_organic', False)
                ))
                product_id = cursor.lastrowid
            else:
                cursor.execute('''
                    INSERT INTO products (farmer_id, category_id, name, description, price_per_unit, 
                                        unit_type, quantity_available, is_organic)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
                ''', (
                    user_data['id'], category_id, data['name'], data['description'],
                    price, data['unit_type'], quantity, data.get('is_organic', False)
                ))
                product_id = cursor.fetchone()['id']
            
            conn.commit()
            conn.close()
            
            self._send_json_response({
                "id": product_id,
                "message": "Product created successfully"
            }, 201)
            
        except Exception as e:
            self._send_json_response({"detail": str(e)}, 500)
    
    def _update_product(self):
        """Update an existing product."""
        try:
            # Get Authorization header
            auth_header = self.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                self._send_json_response({"detail": "Missing or invalid authorization header"}, 401)
                return
            
            token = auth_header.split(' ')[1]
            if token not in active_tokens:
                self._send_json_response({"detail": "Invalid or expired token"}, 401)
                return
            
            user_data = active_tokens[token]
            
            # Extract product ID from URL
            path_parts = self.path.split('/')
            if len(path_parts) < 3:
                self._send_json_response({"detail": "Invalid product ID"}, 400)
                return
            
            try:
                product_id = int(path_parts[2])
            except ValueError:
                self._send_json_response({"detail": "Invalid product ID"}, 400)
                return
            
            data = self._get_request_body()
            
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Check if product exists and belongs to the farmer
            if USE_SQLITE:
                cursor.execute("SELECT farmer_id FROM products WHERE id = ?", (product_id,))
            else:
                cursor.execute("SELECT farmer_id FROM products WHERE id = %s", (product_id,))
            
            result = cursor.fetchone()
            if not result:
                self._send_json_response({"detail": "Product not found"}, 404)
                return
            
            farmer_id = result[0] if USE_SQLITE else result['farmer_id']
            if farmer_id != user_data['id']:
                self._send_json_response({"detail": "You can only update your own products"}, 403)
                return
            
            # Update product
            update_fields = []
            update_values = []
            
            if 'name' in data:
                update_fields.append('name = ?' if USE_SQLITE else 'name = %s')
                update_values.append(data['name'])
            if 'description' in data:
                update_fields.append('description = ?' if USE_SQLITE else 'description = %s')
                update_values.append(data['description'])
            if 'price_per_unit' in data:
                try:
                    price = float(data['price_per_unit'])
                    if price <= 0:
                        self._send_json_response({"detail": "Price must be greater than 0"}, 400)
                        return
                    update_fields.append('price_per_unit = ?' if USE_SQLITE else 'price_per_unit = %s')
                    update_values.append(price)
                except ValueError:
                    self._send_json_response({"detail": "Invalid price format"}, 400)
                    return
            if 'quantity_available' in data:
                try:
                    quantity = int(data['quantity_available'])
                    if quantity < 0:
                        self._send_json_response({"detail": "Quantity cannot be negative"}, 400)
                        return
                    update_fields.append('quantity_available = ?' if USE_SQLITE else 'quantity_available = %s')
                    update_values.append(quantity)
                except ValueError:
                    self._send_json_response({"detail": "Invalid quantity format"}, 400)
                    return
            if 'is_organic' in data:
                update_fields.append('is_organic = ?' if USE_SQLITE else 'is_organic = %s')
                update_values.append(data['is_organic'])
            
            if update_fields:
                update_values.append(product_id)
                placeholder = '?' if USE_SQLITE else '%s'
                cursor.execute(f'''
                    UPDATE products SET {', '.join(update_fields)} WHERE id = {placeholder}
                ''', update_values)
                conn.commit()
            
            conn.close()
            self._send_json_response({"message": "Product updated successfully"})
            
        except Exception as e:
            self._send_json_response({"detail": str(e)}, 500)
    
    def _delete_product(self):
        """Delete a product."""
        try:
            # Get Authorization header
            auth_header = self.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                self._send_json_response({"detail": "Missing or invalid authorization header"}, 401)
                return
            
            token = auth_header.split(' ')[1]
            if token not in active_tokens:
                self._send_json_response({"detail": "Invalid or expired token"}, 401)
                return
            
            user_data = active_tokens[token]
            
            # Extract product ID from URL
            path_parts = self.path.split('/')
            if len(path_parts) < 3:
                self._send_json_response({"detail": "Invalid product ID"}, 400)
                return
            
            try:
                product_id = int(path_parts[2])
            except ValueError:
                self._send_json_response({"detail": "Invalid product ID"}, 400)
                return
            
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Check if product exists and belongs to the farmer
            if USE_SQLITE:
                cursor.execute("SELECT farmer_id FROM products WHERE id = ?", (product_id,))
            else:
                cursor.execute("SELECT farmer_id FROM products WHERE id = %s", (product_id,))
            
            result = cursor.fetchone()
            if not result:
                self._send_json_response({"detail": "Product not found"}, 404)
                return
            
            farmer_id = result[0] if USE_SQLITE else result['farmer_id']
            if farmer_id != user_data['id']:
                self._send_json_response({"detail": "You can only delete your own products"}, 403)
                return
            
            # Delete product
            if USE_SQLITE:
                cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
            else:
                cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
            
            conn.commit()
            conn.close()
            
            self._send_json_response({"message": "Product deleted successfully"})
            
        except Exception as e:
            self._send_json_response({"detail": str(e)}, 500)
    
    def _update_profile(self):
        """Update user profile."""
        try:
            # Get Authorization header
            auth_header = self.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                self._send_json_response({"detail": "Missing or invalid authorization header"}, 401)
                return
            
            token = auth_header.split(' ')[1]
            if token not in active_tokens:
                self._send_json_response({"detail": "Invalid or expired token"}, 401)
                return
            
            user_data = active_tokens[token]
            data = self._get_request_body()
            
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Update user profile
            update_fields = []
            update_values = []
            
            if 'first_name' in data:
                update_fields.append('first_name = ?' if USE_SQLITE else 'first_name = %s')
                update_values.append(data['first_name'])
            if 'last_name' in data:
                update_fields.append('last_name = ?' if USE_SQLITE else 'last_name = %s')
                update_values.append(data['last_name'])
            if 'phone' in data:
                update_fields.append('phone = ?' if USE_SQLITE else 'phone = %s')
                update_values.append(data['phone'])
            
            if update_fields:
                update_values.append(user_data['id'])
                placeholder = '?' if USE_SQLITE else '%s'
                cursor.execute(f'''
                    UPDATE users SET {', '.join(update_fields)} WHERE id = {placeholder}
                ''', update_values)
                conn.commit()
                
                # Update token data
                if 'first_name' in data:
                    active_tokens[token]['first_name'] = data['first_name']
                if 'last_name' in data:
                    active_tokens[token]['last_name'] = data['last_name']
            
            conn.close()
            self._send_json_response({"message": "Profile updated successfully"})
            
        except Exception as e:
            self._send_json_response({"detail": str(e)}, 500)
    
    def _create_order(self):
        """Create a new order."""
        try:
            # Get Authorization header
            auth_header = self.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                self._send_json_response({"detail": "Missing or invalid authorization header"}, 401)
                return
            
            token = auth_header.split(' ')[1]
            if token not in active_tokens:
                self._send_json_response({"detail": "Invalid or expired token"}, 401)
                return
            
            user_data = active_tokens[token]
            if user_data.get('role') != 'customer':
                self._send_json_response({"detail": "Only customers can create orders"}, 403)
                return
            
            data = self._get_request_body()
            
            if not data.get('items') or len(data['items']) == 0:
                self._send_json_response({"detail": "Order must contain at least one item"}, 400)
                return
            
            if not data.get('delivery_address'):
                self._send_json_response({"detail": "Delivery address is required"}, 400)
                return
            
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Calculate total and validate products
            total_amount = 0.0
            farmer_id = None
            order_items = []
            
            for item in data['items']:
                product_id = item.get('product_id')
                quantity = item.get('quantity', 1)
                
                if USE_SQLITE:
                    cursor.execute("SELECT id, farmer_id, name, price_per_unit, quantity_available FROM products WHERE id = ?", (product_id,))
                else:
                    cursor.execute("SELECT id, farmer_id, name, price_per_unit, quantity_available FROM products WHERE id = %s", (product_id,))
                
                product = cursor.fetchone()
                if not product:
                    conn.close()
                    self._send_json_response({"detail": f"Product {product_id} not found"}, 404)
                    return
                
                if USE_SQLITE:
                    prod_id, prod_farmer_id, prod_name, prod_price, prod_qty = product
                else:
                    prod_id, prod_farmer_id, prod_name, prod_price, prod_qty = product.values()
                
                if prod_qty < quantity:
                    conn.close()
                    self._send_json_response({"detail": f"Not enough stock for {prod_name}. Available: {prod_qty}"}, 400)
                    return
                
                if farmer_id is None:
                    farmer_id = prod_farmer_id
                elif farmer_id != prod_farmer_id:
                    conn.close()
                    self._send_json_response({"detail": "All items in an order must be from the same farmer"}, 400)
                    return
                
                item_total = float(prod_price) * quantity
                total_amount += item_total
                
                order_items.append({
                    'product_id': prod_id,
                    'quantity': quantity,
                    'unit_price': float(prod_price),
                    'total_price': item_total
                })
            
            # Create order
            if USE_SQLITE:
                cursor.execute('''
                    INSERT INTO orders (customer_id, farmer_id, total_amount, delivery_address, delivery_date, delivery_time, notes, status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                ''', (
                    user_data['id'],
                    farmer_id,
                    total_amount,
                    data.get('delivery_address'),
                    data.get('delivery_date'),
                    data.get('delivery_time'),
                    data.get('notes'),
                    'pending'
                ))
                order_id = cursor.lastrowid
            else:
                cursor.execute('''
                    INSERT INTO orders (customer_id, farmer_id, total_amount, delivery_address, delivery_date, delivery_time, notes, status, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                    RETURNING id
                ''', (
                    user_data['id'],
                    farmer_id,
                    total_amount,
                    data.get('delivery_address'),
                    data.get('delivery_date'),
                    data.get('delivery_time'),
                    data.get('notes'),
                    'pending'
                ))
                order_id = cursor.fetchone()[0]
            
            # Create order items and update product quantities
            for item in order_items:
                if USE_SQLITE:
                    cursor.execute('''
                        INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (order_id, item['product_id'], item['quantity'], item['unit_price'], item['total_price']))
                    
                    cursor.execute('''
                        UPDATE products SET quantity_available = quantity_available - ? WHERE id = ?
                    ''', (item['quantity'], item['product_id']))
                else:
                    cursor.execute('''
                        INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
                        VALUES (%s, %s, %s, %s, %s)
                    ''', (order_id, item['product_id'], item['quantity'], item['unit_price'], item['total_price']))
                    
                    cursor.execute('''
                        UPDATE products SET quantity_available = quantity_available - %s WHERE id = %s
                    ''', (item['quantity'], item['product_id']))
            
            conn.commit()
            
            # Fetch created order
            if USE_SQLITE:
                cursor.execute('''
                    SELECT id, customer_id, farmer_id, total_amount, delivery_address, delivery_date, 
                           delivery_time, notes, status, created_at
                    FROM orders WHERE id = ?
                ''', (order_id,))
                order_row = cursor.fetchone()
                order = {
                    'id': order_row[0],
                    'customer_id': order_row[1],
                    'farmer_id': order_row[2],
                    'total_amount': float(order_row[3]),
                    'delivery_address': order_row[4],
                    'delivery_date': order_row[5],
                    'delivery_time': order_row[6],
                    'notes': order_row[7],
                    'status': order_row[8],
                    'created_at': order_row[9],
                    'items': order_items
                }
            else:
                cursor.execute('''
                    SELECT id, customer_id, farmer_id, total_amount, delivery_address, delivery_date, 
                           delivery_time, notes, status, created_at
                    FROM orders WHERE id = %s
                ''', (order_id,))
                order_row = cursor.fetchone()
                order = {
                    'id': order_row['id'],
                    'customer_id': order_row['customer_id'],
                    'farmer_id': order_row['farmer_id'],
                    'total_amount': float(order_row['total_amount']),
                    'delivery_address': order_row['delivery_address'],
                    'delivery_date': str(order_row['delivery_date']) if order_row['delivery_date'] else None,
                    'delivery_time': order_row['delivery_time'],
                    'notes': order_row['notes'],
                    'status': order_row['status'],
                    'created_at': str(order_row['created_at']),
                    'items': order_items
                }
            
            conn.close()
            self._send_json_response(order, 201)
            
        except Exception as e:
            self._send_json_response({"detail": str(e)}, 500)
    
    def _get_orders(self):
        """Get orders for the current user."""
        try:
            # Get Authorization header
            auth_header = self.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                self._send_json_response({"detail": "Missing or invalid authorization header"}, 401)
                return
            
            token = auth_header.split(' ')[1]
            if token not in active_tokens:
                self._send_json_response({"detail": "Invalid or expired token"}, 401)
                return
            
            user_data = active_tokens[token]
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Get orders based on user role
            if user_data.get('role') == 'customer':
                if USE_SQLITE:
                    cursor.execute('''
                        SELECT id, customer_id, farmer_id, total_amount, delivery_address, delivery_date, 
                               delivery_time, notes, status, created_at
                        FROM orders WHERE customer_id = ? ORDER BY created_at DESC
                    ''', (user_data['id'],))
                else:
                    cursor.execute('''
                        SELECT id, customer_id, farmer_id, total_amount, delivery_address, delivery_date, 
                               delivery_time, notes, status, created_at
                        FROM orders WHERE customer_id = %s ORDER BY created_at DESC
                    ''', (user_data['id'],))
            else:  # farmer
                if USE_SQLITE:
                    cursor.execute('''
                        SELECT id, customer_id, farmer_id, total_amount, delivery_address, delivery_date, 
                               delivery_time, notes, status, created_at
                        FROM orders WHERE farmer_id = ? ORDER BY created_at DESC
                    ''', (user_data['id'],))
                else:
                    cursor.execute('''
                        SELECT id, customer_id, farmer_id, total_amount, delivery_address, delivery_date, 
                               delivery_time, notes, status, created_at
                        FROM orders WHERE farmer_id = %s ORDER BY created_at DESC
                    ''', (user_data['id'],))
            
            orders = []
            for row in cursor.fetchall():
                if USE_SQLITE:
                    order = {
                        'id': row[0],
                        'customer_id': row[1],
                        'farmer_id': row[2],
                        'total_amount': float(row[3]),
                        'delivery_address': row[4],
                        'delivery_date': row[5],
                        'delivery_time': row[6],
                        'notes': row[7],
                        'status': row[8],
                        'created_at': row[9],
                        'items': []
                    }
                else:
                    order = {
                        'id': row['id'],
                        'customer_id': row['customer_id'],
                        'farmer_id': row['farmer_id'],
                        'total_amount': float(row['total_amount']),
                        'delivery_address': row['delivery_address'],
                        'delivery_date': str(row['delivery_date']) if row['delivery_date'] else None,
                        'delivery_time': row['delivery_time'],
                        'notes': row['notes'],
                        'status': row['status'],
                        'created_at': str(row['created_at']),
                        'items': []
                    }
                
                # Get order items
                if USE_SQLITE:
                    cursor.execute('''
                        SELECT product_id, quantity, unit_price, total_price
                        FROM order_items WHERE order_id = ?
                    ''', (order['id'],))
                else:
                    cursor.execute('''
                        SELECT product_id, quantity, unit_price, total_price
                        FROM order_items WHERE order_id = %s
                    ''', (order['id'],))
                
                for item_row in cursor.fetchall():
                    if USE_SQLITE:
                        order['items'].append({
                            'product_id': item_row[0],
                            'quantity': item_row[1],
                            'unit_price': float(item_row[2]),
                            'total_price': float(item_row[3])
                        })
                    else:
                        order['items'].append({
                            'product_id': item_row['product_id'],
                            'quantity': item_row['quantity'],
                            'unit_price': float(item_row['unit_price']),
                            'total_price': float(item_row['total_price'])
                        })
                
                orders.append(order)
            
            conn.close()
            self._send_json_response(orders)
            
        except Exception as e:
            self._send_json_response({"detail": str(e)}, 500)

def run_server(port=None):
    """Run the HTTP server."""
    if port is None:
        port = int(os.getenv('PORT', 8001))
    
    init_db()
    server_address = ('0.0.0.0', port)  # Listen on all interfaces
    httpd = HTTPServer(server_address, APIHandler)
    
    db_type = "PostgreSQL" if not USE_SQLITE else "SQLite"
    print(f"🚀 Server running on http://0.0.0.0:{port}")
    print(f"🗄️  Database: {db_type}")
    print(f"📚 API endpoints available:")
    print(f"   - GET  /health")
    print(f"   - GET  /categories/")
    print(f"   - GET  /products/")
    print(f"   - POST /auth/register")
    print(f"   - POST /auth/login")
    print(f"   - GET  /auth/me")
    print(f"\n✨ Ready to accept requests!")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()