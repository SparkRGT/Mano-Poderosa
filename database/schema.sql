-- =============================================
-- SISTEMA DE VENTAS - ESQUEMA DE BASE DE DATOS
-- Para Supabase (PostgreSQL)
-- =============================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TIPOS ENUMERADOS (ENUMS)
-- =============================================

-- Roles de usuario
CREATE TYPE user_role AS ENUM ('admin', 'customer');

-- Estado de venta
CREATE TYPE sale_status AS ENUM ('paid', 'pending');

-- Tipo de deuda
CREATE TYPE debt_type AS ENUM ('sale', 'external');

-- Estado de solicitud de pago
CREATE TYPE payment_request_status AS ENUM ('pending', 'approved', 'rejected');

-- =============================================
-- TABLAS
-- =============================================

-- ---------------------------------------------
-- 1. USUARIOS (users)
-- Extiende la tabla auth.users de Supabase
-- ---------------------------------------------
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para búsqueda por rol
CREATE INDEX idx_users_role ON public.users(role);

-- ---------------------------------------------
-- 2. CATEGORÍAS (categories)
-- ---------------------------------------------
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------
-- 3. PRODUCTOS (products)
-- ---------------------------------------------
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

-- Índices
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_code ON public.products(product_code);
CREATE INDEX idx_products_active ON public.products(is_active);

-- ---------------------------------------------
-- 4. VENTAS (sales)
-- ---------------------------------------------
CREATE TABLE public.sales (
    id SERIAL PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    status sale_status NOT NULL DEFAULT 'paid',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT
);

-- Índices
CREATE INDEX idx_sales_customer ON public.sales(customer_id);
CREATE INDEX idx_sales_date ON public.sales(created_at);
CREATE INDEX idx_sales_status ON public.sales(status);
CREATE INDEX idx_sales_created_by ON public.sales(created_by);

-- ---------------------------------------------
-- 5. DETALLE DE VENTA (sale_items)
-- ---------------------------------------------
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

-- Índice
CREATE INDEX idx_sale_items_sale ON public.sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON public.sale_items(product_id);

-- ---------------------------------------------
-- 6. FACTURAS (invoices)
-- ---------------------------------------------
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

-- Índices
CREATE INDEX idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX idx_invoices_date ON public.invoices(created_at);
CREATE INDEX idx_invoices_number ON public.invoices(invoice_number);

-- ---------------------------------------------
-- 7. DEUDAS (debts)
-- ---------------------------------------------
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

-- Índices
CREATE INDEX idx_debts_customer ON public.debts(customer_id);
CREATE INDEX idx_debts_type ON public.debts(type);
CREATE INDEX idx_debts_remaining ON public.debts(remaining) WHERE remaining > 0;

-- ---------------------------------------------
-- 8. SOLICITUDES DE PAGO (payment_requests)
-- ---------------------------------------------
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

-- Índices
CREATE INDEX idx_payment_requests_customer ON public.payment_requests(customer_id);
CREATE INDEX idx_payment_requests_status ON public.payment_requests(status);
CREATE INDEX idx_payment_requests_pending ON public.payment_requests(status) WHERE status = 'pending';

-- ---------------------------------------------
-- 9. CONFIGURACIÓN (settings)
-- ---------------------------------------------
CREATE TABLE public.settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- FUNCIONES Y TRIGGERS
-- =============================================

-- ---------------------------------------------
-- Función: Actualizar updated_at automáticamente
-- ---------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------
-- Función: Generar número de factura automático
-- ---------------------------------------------
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    prefix TEXT;
    next_number INTEGER;
    new_invoice_number TEXT;
BEGIN
    -- Obtener prefijo de configuración
    SELECT value INTO prefix FROM public.settings WHERE key = 'invoice_prefix';
    IF prefix IS NULL THEN
        prefix := 'FAC-';
    END IF;
    
    -- Obtener siguiente número
    SELECT COALESCE(MAX(
        CAST(REPLACE(invoice_number, prefix, '') AS INTEGER)
    ), 0) + 1 INTO next_number
    FROM public.invoices
    WHERE invoice_number LIKE prefix || '%';
    
    -- Formatear número con ceros
    new_invoice_number := prefix || LPAD(next_number::TEXT, 6, '0');
    
    NEW.invoice_number := new_invoice_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_invoice_number_trigger
    BEFORE INSERT ON public.invoices
    FOR EACH ROW
    WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
    EXECUTE FUNCTION generate_invoice_number();

-- ---------------------------------------------
-- Función: Crear deuda automática para ventas pendientes
-- ---------------------------------------------
CREATE OR REPLACE FUNCTION create_debt_for_pending_sale()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'pending' THEN
        INSERT INTO public.debts (
            customer_id,
            concept,
            amount,
            remaining,
            sale_id,
            type,
            created_by
        ) VALUES (
            NEW.customer_id,
            'Venta #' || NEW.id,
            NEW.total,
            NEW.total,
            NEW.id,
            'sale',
            NEW.created_by
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_debt_on_pending_sale
    AFTER INSERT ON public.sales
    FOR EACH ROW EXECUTE FUNCTION create_debt_for_pending_sale();

-- ---------------------------------------------
-- Función: Descontar stock al vender
-- ---------------------------------------------
CREATE OR REPLACE FUNCTION decrease_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER decrease_stock_on_sale
    AFTER INSERT ON public.sale_items
    FOR EACH ROW EXECUTE FUNCTION decrease_product_stock();

-- ---------------------------------------------
-- Función: Crear factura automáticamente al vender
-- ---------------------------------------------
CREATE OR REPLACE FUNCTION create_invoice_for_sale()
RETURNS TRIGGER AS $$
DECLARE
    customer_record RECORD;
BEGIN
    -- Obtener datos del cliente
    SELECT name, email INTO customer_record
    FROM public.users
    WHERE id = NEW.customer_id;
    
    -- Crear factura
    INSERT INTO public.invoices (
        sale_id,
        customer_id,
        customer_email,
        customer_name,
        total
    ) VALUES (
        NEW.id,
        NEW.customer_id,
        customer_record.email,
        customer_record.name,
        NEW.total
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_invoice_on_sale
    AFTER INSERT ON public.sales
    FOR EACH ROW EXECUTE FUNCTION create_invoice_for_sale();

-- =============================================
-- DATOS INICIALES
-- =============================================

-- Configuración inicial
INSERT INTO public.settings (key, value, description) VALUES
    ('min_stock_alert', '10', 'Cantidad mínima de stock para enviar alerta'),
    ('admin_whatsapp', '+1234567890', 'Número de WhatsApp del administrador para alertas'),
    ('invoice_prefix', 'FAC-', 'Prefijo para números de factura');

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------
-- Función auxiliar: Verificar si es admin
-- ---------------------------------------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------
-- Políticas: USERS
-- ---------------------------------------------
-- Admin puede ver todos
CREATE POLICY "Admin can view all users"
    ON public.users FOR SELECT
    TO authenticated
    USING (is_admin());

-- Cliente puede ver su propio perfil
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Admin puede actualizar cualquier usuario
CREATE POLICY "Admin can update all users"
    ON public.users FOR UPDATE
    TO authenticated
    USING (is_admin());

-- Usuario puede actualizar su propio perfil
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Admin puede eliminar usuarios (excepto a sí mismo)
CREATE POLICY "Admin can delete users"
    ON public.users FOR DELETE
    TO authenticated
    USING (is_admin() AND auth.uid() != id);

-- Permitir insertar al registrarse
CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- ---------------------------------------------
-- Políticas: CATEGORIES
-- ---------------------------------------------
-- Todos pueden ver categorías
CREATE POLICY "Anyone can view categories"
    ON public.categories FOR SELECT
    TO authenticated
    USING (true);

-- Solo admin puede crear
CREATE POLICY "Admin can create categories"
    ON public.categories FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

-- Solo admin puede actualizar
CREATE POLICY "Admin can update categories"
    ON public.categories FOR UPDATE
    TO authenticated
    USING (is_admin());

-- Solo admin puede eliminar
CREATE POLICY "Admin can delete categories"
    ON public.categories FOR DELETE
    TO authenticated
    USING (is_admin());

-- ---------------------------------------------
-- Políticas: PRODUCTS
-- ---------------------------------------------
-- Todos pueden ver productos activos
CREATE POLICY "Anyone can view active products"
    ON public.products FOR SELECT
    TO authenticated
    USING (is_active = true OR is_admin());

-- Solo admin puede crear
CREATE POLICY "Admin can create products"
    ON public.products FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

-- Solo admin puede actualizar
CREATE POLICY "Admin can update products"
    ON public.products FOR UPDATE
    TO authenticated
    USING (is_admin());

-- Solo admin puede eliminar
CREATE POLICY "Admin can delete products"
    ON public.products FOR DELETE
    TO authenticated
    USING (is_admin());

-- ---------------------------------------------
-- Políticas: SALES
-- ---------------------------------------------
-- Admin puede ver todas las ventas
CREATE POLICY "Admin can view all sales"
    ON public.sales FOR SELECT
    TO authenticated
    USING (is_admin());

-- Cliente puede ver sus propias ventas
CREATE POLICY "Customers can view own sales"
    ON public.sales FOR SELECT
    TO authenticated
    USING (customer_id = auth.uid());

-- Solo admin puede crear ventas
CREATE POLICY "Admin can create sales"
    ON public.sales FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

-- Solo admin puede actualizar ventas
CREATE POLICY "Admin can update sales"
    ON public.sales FOR UPDATE
    TO authenticated
    USING (is_admin());

-- ---------------------------------------------
-- Políticas: SALE_ITEMS
-- ---------------------------------------------
-- Admin puede ver todos los items
CREATE POLICY "Admin can view all sale items"
    ON public.sale_items FOR SELECT
    TO authenticated
    USING (is_admin());

-- Cliente puede ver items de sus ventas
CREATE POLICY "Customers can view own sale items"
    ON public.sale_items FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.sales
            WHERE sales.id = sale_items.sale_id
            AND sales.customer_id = auth.uid()
        )
    );

-- Solo admin puede crear items
CREATE POLICY "Admin can create sale items"
    ON public.sale_items FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

-- ---------------------------------------------
-- Políticas: INVOICES
-- ---------------------------------------------
-- Admin puede ver todas las facturas
CREATE POLICY "Admin can view all invoices"
    ON public.invoices FOR SELECT
    TO authenticated
    USING (is_admin());

-- Cliente puede ver sus propias facturas
CREATE POLICY "Customers can view own invoices"
    ON public.invoices FOR SELECT
    TO authenticated
    USING (customer_id = auth.uid());

-- ---------------------------------------------
-- Políticas: DEBTS
-- ---------------------------------------------
-- Admin puede ver todas las deudas
CREATE POLICY "Admin can view all debts"
    ON public.debts FOR SELECT
    TO authenticated
    USING (is_admin());

-- Cliente puede ver sus propias deudas
CREATE POLICY "Customers can view own debts"
    ON public.debts FOR SELECT
    TO authenticated
    USING (customer_id = auth.uid());

-- Solo admin puede crear deudas
CREATE POLICY "Admin can create debts"
    ON public.debts FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

-- Solo admin puede actualizar deudas
CREATE POLICY "Admin can update debts"
    ON public.debts FOR UPDATE
    TO authenticated
    USING (is_admin());

-- ---------------------------------------------
-- Políticas: PAYMENT_REQUESTS
-- ---------------------------------------------
-- Admin puede ver todas las solicitudes
CREATE POLICY "Admin can view all payment requests"
    ON public.payment_requests FOR SELECT
    TO authenticated
    USING (is_admin());

-- Cliente puede ver sus propias solicitudes
CREATE POLICY "Customers can view own payment requests"
    ON public.payment_requests FOR SELECT
    TO authenticated
    USING (customer_id = auth.uid());

-- Cliente puede crear solicitudes
CREATE POLICY "Customers can create payment requests"
    ON public.payment_requests FOR INSERT
    TO authenticated
    WITH CHECK (customer_id = auth.uid());

-- Solo admin puede actualizar solicitudes
CREATE POLICY "Admin can update payment requests"
    ON public.payment_requests FOR UPDATE
    TO authenticated
    USING (is_admin());

-- ---------------------------------------------
-- Políticas: SETTINGS
-- ---------------------------------------------
-- Solo admin puede ver configuración
CREATE POLICY "Admin can view settings"
    ON public.settings FOR SELECT
    TO authenticated
    USING (is_admin());

-- Solo admin puede actualizar configuración
CREATE POLICY "Admin can update settings"
    ON public.settings FOR UPDATE
    TO authenticated
    USING (is_admin());

-- Solo admin puede crear configuración
CREATE POLICY "Admin can create settings"
    ON public.settings FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

-- =============================================
-- VISTAS ÚTILES
-- =============================================

-- Vista: Resumen de deuda por cliente
CREATE OR REPLACE VIEW public.customer_debt_summary AS
SELECT 
    customer_id,
    SUM(remaining) as total_debt,
    COUNT(*) as debt_count
FROM public.debts
WHERE remaining > 0
GROUP BY customer_id;

-- Vista: Productos con stock bajo
CREATE OR REPLACE VIEW public.low_stock_products AS
SELECT 
    p.*,
    c.name as category_name,
    s.value::INTEGER as min_stock
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
CROSS JOIN public.settings s
WHERE s.key = 'min_stock_alert'
AND p.stock <= s.value::INTEGER
AND p.is_active = true;

-- Vista: Ventas con detalle de cliente
CREATE OR REPLACE VIEW public.sales_with_customer AS
SELECT 
    s.*,
    u.name as customer_name,
    u.email as customer_email,
    u.phone as customer_phone,
    i.invoice_number
FROM public.sales s
JOIN public.users u ON s.customer_id = u.id
LEFT JOIN public.invoices i ON s.id = i.sale_id;

-- =============================================
-- FIN DEL ESQUEMA
-- =============================================
