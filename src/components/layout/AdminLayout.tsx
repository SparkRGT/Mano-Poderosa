import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { CartProvider } from '../../context';
import { cn } from '../../utils';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <CartProvider>
      <div className="min-h-screen bg-sky-50/50">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
        
        {/* Main content - padding según sidebar colapsado en desktop */}
        <div
          className={cn(
            'transition-all duration-300 min-w-0 w-full',
            sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
          )}
        >
          <Navbar
            onMenuClick={() => setSidebarOpen(true)}
            title="Panel de Administración"
          />
          
          <main className="p-4 sm:p-5 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </CartProvider>
  );
}
