import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const nav = [
  { to: '/admin', label: 'Dashboard', icon: '🏠' },
  { to: '/admin/students', label: 'Students', icon: '👥' },
  { to: '/admin/reports', label: 'Reports', icon: '📊' },
  { to: '/admin/export', label: 'Export Data', icon: '📤' },
  { to: '/admin/levels', label: 'Manage Levels', icon: '⚙️' },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const { pathname } = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:block
      `}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="text-sm font-semibold text-gray-800">Super Admin</div>
          <button 
            onClick={onClose}
            className="md:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="space-y-1 p-2">
          {nav.map((n) => {
            const active = pathname === n.to;
            return (
              <Link 
                key={n.to} 
                to={n.to} 
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{n.icon}</span>
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
