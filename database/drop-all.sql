-- =============================================
-- SCRIPT PARA ELIMINAR TODO
-- Ejecutar en Supabase SQL Editor
-- ⚠️ CUIDADO: Esto eliminará TODOS los datos
-- =============================================

-- Eliminar triggers primero
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
DROP TRIGGER IF EXISTS generate_invoice_number_trigger ON public.invoices;
DROP TRIGGER IF EXISTS create_debt_on_pending_sale ON public.sales;
DROP TRIGGER IF EXISTS decrease_stock_on_sale ON public.sale_items;
DROP TRIGGER IF EXISTS create_invoice_on_sale ON public.sales;

-- Eliminar vistas
DROP VIEW IF EXISTS public.customer_debt_summary;
DROP VIEW IF EXISTS public.low_stock_products;
DROP VIEW IF EXISTS public.sales_with_customer;

-- Eliminar funciones
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.generate_invoice_number();
DROP FUNCTION IF EXISTS public.create_debt_for_pending_sale();
DROP FUNCTION IF EXISTS public.decrease_product_stock();
DROP FUNCTION IF EXISTS public.create_invoice_for_sale();

-- Eliminar tablas (en orden por dependencias)
DROP TABLE IF EXISTS public.payment_requests;
DROP TABLE IF EXISTS public.debts;
DROP TABLE IF EXISTS public.invoices;
DROP TABLE IF EXISTS public.sale_items;
DROP TABLE IF EXISTS public.sales;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.categories;
DROP TABLE IF EXISTS public.settings;
DROP TABLE IF EXISTS public.users;

-- Eliminar tipos enumerados
DROP TYPE IF EXISTS payment_request_status;
DROP TYPE IF EXISTS debt_type;
DROP TYPE IF EXISTS sale_status;
DROP TYPE IF EXISTS user_role;

-- =============================================
-- FIN - Base de datos limpia
-- =============================================
