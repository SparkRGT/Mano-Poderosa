import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { CartProvider } from '../../context';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-100">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main content */}
        <div className="lg:pl-64 transition-all duration-300">
          <Navbar
            onMenuClick={() => setSidebarOpen(true)}
            title="Panel de Administración"
          />
          
          <main className="p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </CartProvider>
  );
}
