-- =============================================
-- CREAR USUARIOS DE PRUEBA
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- ⚠️ IMPORTANTE: Primero regístrate normalmente en la app
-- Luego usa este script para convertir tu cuenta en admin

-- =============================================
-- OPCIÓN 1: Convertir usuario existente en ADMIN
-- (Recomendado - Primero regístrate en la app)
-- =============================================

-- Cambia 'tu-email@ejemplo.com' por tu email real
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'joustinalonzo@hotmail.com';

-- Verificar que se actualizó
SELECT id, email, name, role FROM public.users;


-- =============================================
-- OPCIÓN 2: Crear usuarios directamente (Avanzado)
-- Solo funciona si tienes acceso a auth.users
-- =============================================

-- Primero necesitas la extensión pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Función para crear usuario completo
CREATE OR REPLACE FUNCTION create_test_user(
    p_email TEXT,
    p_password TEXT,
    p_name TEXT,
    p_phone TEXT,
    p_role user_role DEFAULT 'customer'
)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Generar UUID
    new_user_id := gen_random_uuid();
    
    -- Insertar en auth.users
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data,
        created_at,
        updated_at,
        role,
        aud
    ) VALUES (
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        p_email,
        crypt(p_password, gen_salt('bf')),
        NOW(),
        jsonb_build_object('name', p_name, 'phone', p_phone),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated'
    );
    
    -- Insertar en public.users (el trigger también lo hace, pero por si acaso)
    INSERT INTO public.users (id, email, name, phone, role)
    VALUES (new_user_id, p_email, p_name, p_phone, p_role)
    ON CONFLICT (id) DO UPDATE SET role = p_role;
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- CREAR USUARIOS DE PRUEBA
-- =============================================

-- Crear ADMIN
SELECT create_test_user(
    'admin@tienda.com',      -- Email
    'admin123',              -- Contraseña
    'Administrador',         -- Nombre
    '0987654321',            -- Teléfono
    'admin'                  -- Rol
);

-- Crear CLIENTE
SELECT create_test_user(
    'cliente@tienda.com',    -- Email
    'cliente123',            -- Contraseña
    'Cliente Prueba',        -- Nombre
    '0912345678',            -- Teléfono
    'customer'               -- Rol
);

-- =============================================
-- VERIFICAR USUARIOS CREADOS
-- =============================================

SELECT id, email, name, phone, role, created_at 
FROM public.users 
ORDER BY created_at DESC;

-- =============================================
-- CREDENCIALES DE PRUEBA:
-- 
-- ADMIN:
--   Email: admin@tienda.com
--   Password: admin123
--
-- CLIENTE:
--   Email: cliente@tienda.com  
--   Password: cliente123
-- =============================================
