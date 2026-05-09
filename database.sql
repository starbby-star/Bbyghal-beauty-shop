-- Babyghal Beauty Shop Database Schema
-- Designed for PostgreSQL

-- ENUMS for standardized lists
CREATE TYPE user_role AS ENUM ('admin', 'staff');
CREATE TYPE payment_method AS ENUM ('Cash', 'Mpesa');
CREATE TYPE payment_status AS ENUM ('Paid', 'Deposit', 'Debt');
CREATE TYPE product_category AS ENUM (
    'All', 'Soaps', 'Facial', 'Hair', 'Braids', 'Makeup', 
    'Skincare', 'Perfumes', 'Nails', 'Body', 'Accessories', 'Other'
);

-- Profiles / Users
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'staff',
    display_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sellers / Agents (Suppliers or specific consignors)
CREATE TABLE sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    product_name VARCHAR(255),
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    contact VARCHAR(100),
    whatsapp_number VARCHAR(100),
    address TEXT,
    date_added TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products Catalog & Inventory
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    category product_category NOT NULL DEFAULT 'Other',
    seller_id UUID REFERENCES sellers(id) ON DELETE SET NULL,
    
    first_price DECIMAL(10, 2) NOT NULL, -- Original cost/buying price
    last_price DECIMAL(10, 2) NOT NULL,  -- Most recent cost/buying price
    selling_price DECIMAL(10, 2) NOT NULL,
    
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    is_fixed_price BOOLEAN NOT NULL DEFAULT false,
    
    image_url TEXT,
    short_description VARCHAR(500),
    full_description TEXT,
    ingredients TEXT,
    how_to_use TEXT,
    
    rating DECIMAL(3, 2),
    reviews_count INTEGER DEFAULT 0,
    
    -- Specific Beauty/Cosmetics Details
    best_used_by VARCHAR(255),
    best_used_when VARCHAR(255),
    best_used_with VARCHAR(255),
    results_after VARCHAR(255),
    
    -- Braid Specifics
    braid_type VARCHAR(255),
    color_number VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sales / Transactions
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Product reference (snapshotted in case product changes/deleted)
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    
    quantity INTEGER NOT NULL,
    
    -- Financials at time of sale
    selling_price DECIMAL(10, 2) NOT NULL,
    buying_price DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    profit DECIMAL(10, 2) NOT NULL,
    
    -- Payment Details
    payment_method payment_method NOT NULL,
    payment_status payment_status NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    debt_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    
    -- Staff & Seller tracking
    staff_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    staff_name VARCHAR(255) NOT NULL,
    seller_name VARCHAR(255),
    
    -- Customer info
    customer_name VARCHAR(255),
    customer_phone VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cleared_at TIMESTAMP WITH TIME ZONE, -- When debt was cleared
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_sales_payment_status ON sales(payment_status);
CREATE INDEX idx_sales_staff_id ON sales(staff_id);
