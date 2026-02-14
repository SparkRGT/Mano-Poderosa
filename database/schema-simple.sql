-- =============================================
-- SISTEMA DE VENTAS - ESQUEMA SIMPLIFICADO
-- Sin Supabase Auth - Autenticación propia
-- =============================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TIPOS ENUMERADOS (ENUMS)
-- =============================================

CREATE TYPE user_role AS ENUM ('admin', 'customer');
CREATE TYPE sale_status AS ENUM ('paid', 'pending');
CREATE TYPE debt_type AS ENUM ('sale', 'external');
CREATE TYPE payment_request_status AS ENUM ('pending', 'approved', 'rejected');

-- =============================================
-- TABLAS
-- =============================================

-- 1. USUARIOS (sin referencia a auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL DEFAULT '',
    role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);

-- 2. CATEGORÍAS
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PRODUCTOS
CREATE TABLE public.products (
    id SERIAL PRIMARY KEY,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_code ON public.products(product_code);
CREATE INDEX idx_products_active ON public.products(is_active);

-- 4. VENTAS
CREATE TABLE public.sales (
    id SERIAL PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    status sale_status NOT NULL DEFAULT 'paid',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT
);
CREATE INDEX idx_sales_customer ON public.sales(customer_id);
CREATE INDEX idx_sales_date ON public.sales(created_at);
CREATE INDEX idx_sales_status ON public.sales(status);

-- 5. DETALLE DE VENTA
CREATE TABLE public.sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    product_code VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0)
);
CREATE INDEX idx_sale_items_sale ON public.sale_items(sale_id);

-- 6. FACTURAS
CREATE TABLE public.invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(20) UNIQUE NOT NULL,
    sale_id INTEGER UNIQUE NOT NULL REFERENCES public.sales(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX idx_invoices_number ON public.invoices(invoice_number);

-- 7. DEUDAS
CREATE TABLE public.debts (
    id SERIAL PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    concept VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    remaining DECIMAL(10,2) NOT NULL CHECK (remaining >= 0),
    sale_id INTEGER REFERENCES public.sales(id) ON DELETE SET NULL,
    type debt_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT
);
CREATE INDEX idx_debts_customer ON public.debts(customer_id);
CREATE INDEX idx_debts_remaining ON public.debts(remaining) WHERE remaining > 0;

-- 8. SOLICITUDES DE PAGO
CREATE TABLE public.payment_requests (
    id SERIAL PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    status payment_request_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    admin_notes TEXT,
    resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
CREATE INDEX idx_payment_requests_customer ON public.payment_requests(customer_id);
CREATE INDEX idx_payment_requests_status ON public.payment_requests(status);

-- 9. CONFIGURACIÓN
CREATE TABLE public.settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- FUNCIONES
-- =============================================

-- Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generar número de factura
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    prefix TEXT;
    next_number INTEGER;
BEGIN
    SELECT value INTO prefix FROM public.settings WHERE key = 'invoice_prefix';
    IF prefix IS NULL THEN prefix := 'FAC-'; END IF;
    
    SELECT COALESCE(MAX(CAST(REPLACE(invoice_number, prefix, '') AS INTEGER)), 0) + 1 
    INTO next_number FROM public.invoices WHERE invoice_number LIKE prefix || '%';
    
    NEW.invoice_number := prefix || LPAD(next_number::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear deuda para ventas pendientes
CREATE OR REPLACE FUNCTION create_debt_for_pending_sale()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'pending' THEN
        INSERT INTO public.debts (customer_id, concept, amount, remaining, sale_id, type, created_by)
        VALUES (NEW.customer_id, 'Venta #' || NEW.id, NEW.total, NEW.total, NEW.id, 'sale', NEW.created_by);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Descontar stock
CREATE OR REPLACE FUNCTION decrease_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products SET stock = stock - NEW.quantity WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear factura automática
CREATE OR REPLACE FUNCTION create_invoice_for_sale()
RETURNS TRIGGER AS $$
DECLARE
    customer_record RECORD;
BEGIN
    SELECT name, email INTO customer_record FROM public.users WHERE id = NEW.customer_id;
    INSERT INTO public.invoices (sale_id, customer_id, customer_email, customer_name, total)
    VALUES (NEW.id, NEW.customer_id, customer_record.email, customer_record.name, NEW.total);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER generate_invoice_number_trigger BEFORE INSERT ON public.invoices
    FOR EACH ROW WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
    EXECUTE FUNCTION generate_invoice_number();

CREATE TRIGGER create_debt_on_pending_sale AFTER INSERT ON public.sales
    FOR EACH ROW EXECUTE FUNCTION create_debt_for_pending_sale();

CREATE TRIGGER decrease_stock_on_sale AFTER INSERT ON public.sale_items
    FOR EACH ROW EXECUTE FUNCTION decrease_product_stock();

CREATE TRIGGER create_invoice_on_sale AFTER INSERT ON public.sales
    FOR EACH ROW EXECUTE FUNCTION create_invoice_for_sale();

-- =============================================
-- DATOS INICIALES
-- =============================================

INSERT INTO public.settings (key, value, description) VALUES
    ('min_stock_alert', '10', 'Cantidad mínima de stock para enviar alerta'),
    ('admin_whatsapp', '+1234567890', 'Número de WhatsApp del administrador'),
    ('invoice_prefix', 'FAC-', 'Prefijo para números de factura');

-- =============================================
-- USUARIOS DE PRUEBA
-- =============================================

-- Admin
INSERT INTO public.users (email, password, name, phone, role) VALUES
    ('admin@tienda.com', 'admin123', 'Administrador', '0987654321', 'admin');

-- Cliente
INSERT INTO public.users (email, password, name, phone, role) VALUES
    ('cliente@tienda.com', 'cliente123', 'Cliente Prueba', '0912345678', 'customer');

-- =============================================
-- DESACTIVAR RLS (para simplificar sin auth)
-- =============================================

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- =============================================
-- VISTAS
-- =============================================

CREATE OR REPLACE VIEW public.customer_debt_summary AS
SELECT customer_id, SUM(remaining) as total_debt, COUNT(*) as debt_count
FROM public.debts WHERE remaining > 0 GROUP BY customer_id;

CREATE OR REPLACE VIEW public.low_stock_products AS
SELECT p.*, c.name as category_name, s.value::INTEGER as min_stock
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
CROSS JOIN public.settings s
WHERE s.key = 'min_stock_alert' AND p.stock <= s.value::INTEGER AND p.is_active = true;

CREATE OR REPLACE VIEW public.sales_with_customer AS
SELECT s.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone, i.invoice_number
FROM public.sales s
JOIN public.users u ON s.customer_id = u.id
LEFT JOIN public.invoices i ON s.id = i.sale_id;

-- =============================================
-- FIN DEL ESQUEMA
-- =============================================

-- CREDENCIALES:
-- Admin: admin@tienda.com / admin123
-- Cliente: cliente@tienda.com / cliente123
