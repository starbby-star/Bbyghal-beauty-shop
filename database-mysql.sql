-- Babyghal Beauty Shop Database Schema
-- Designed for MySQL / MariaDB (XAMPP)

-- Profiles / Users
CREATE TABLE profiles (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
    display_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sellers / Agents (Suppliers or specific consignors)
CREATE TABLE sellers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    product_name VARCHAR(255),
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    contact VARCHAR(100),
    whatsapp_number VARCHAR(100),
    address TEXT,
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products Catalog & Inventory
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    category ENUM(
        'All', 'Soaps', 'Facial', 'Hair', 'Braids', 'Makeup', 
        'Skincare', 'Perfumes', 'Nails', 'Body', 'Accessories', 'Other'
    ) NOT NULL DEFAULT 'Other',
    seller_id VARCHAR(36),
    
    first_price DECIMAL(10, 2) NOT NULL, -- Original cost/buying price
    last_price DECIMAL(10, 2) NOT NULL,  -- Most recent cost/buying price
    selling_price DECIMAL(10, 2) NOT NULL,
    
    stock_quantity INT NOT NULL DEFAULT 0,
    is_fixed_price BOOLEAN NOT NULL DEFAULT FALSE,
    
    image_url TEXT,
    short_description VARCHAR(500),
    full_description TEXT,
    ingredients TEXT,
    how_to_use TEXT,
    
    rating DECIMAL(3, 2),
    reviews_count INT DEFAULT 0,
    
    -- Specific Beauty/Cosmetics Details
    best_used_by VARCHAR(255),
    best_used_when VARCHAR(255),
    best_used_with VARCHAR(255),
    results_after VARCHAR(255),
    
    -- Braid Specifics
    braid_type VARCHAR(255),
    color_number VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE SET NULL
);

-- Sales / Transactions
CREATE TABLE sales (
    id VARCHAR(36) PRIMARY KEY,
    
    -- Product reference (snapshotted in case product changes/deleted)
    product_id VARCHAR(36),
    product_name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    
    quantity INT NOT NULL,
    
    -- Financials at time of sale
    selling_price DECIMAL(10, 2) NOT NULL,
    buying_price DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    profit DECIMAL(10, 2) NOT NULL,
    
    -- Payment Details
    payment_method ENUM('Cash', 'Mpesa') NOT NULL,
    payment_status ENUM('Paid', 'Deposit', 'Debt') NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    debt_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    
    -- Staff & Seller tracking
    staff_id VARCHAR(36),
    staff_name VARCHAR(255) NOT NULL,
    seller_name VARCHAR(255),
    
    -- Customer info
    customer_name VARCHAR(255),
    customer_phone VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cleared_at TIMESTAMP NULL DEFAULT NULL, -- When debt was cleared
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (staff_id) REFERENCES profiles(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_sales_payment_status ON sales(payment_status);
CREATE INDEX idx_sales_staff_id ON sales(staff_id);
