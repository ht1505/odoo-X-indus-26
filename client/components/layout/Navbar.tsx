"use client";

import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const pageTitles: Record<string, string> = {
  '/dashboard':   'Dashboard',
  '/products':    'Products',
  '/receipts':    'Receipts',
  '/deliveries':  'Deliveries',
  '/transfers':   'Internal Transfers',
  '/adjustments': 'Stock Adjustments',
  '/ledger':      'Move History',
  '/warehouses':  'Warehouses',
  '/suppliers':   'Suppliers',
};

const pageActions: Record<string, string> = {
  '/products':    '+ New Product',
  '/receipts':    '+ New Receipt',
  '/deliveries':  '+ New Delivery',
  '/transfers':   '+ New Transfer',
  '/adjustments': '+ New Adjustment',
  '/warehouses':  '+ New Warehouse',
  '/suppliers':   '+ New Supplier',
};

export default function Navbar() {
  const pathname = usePathname();
  const user = useAuth();
  const isManager = user?.role === 'MANAGER';

  const title = Object.entries(pageTitles).find(([k]) => pathname.startsWith(k))?.[1] || 'CoreInventory';
  const action = Object.entries(pageActions).find(([k]) => pathname.startsWith(k))?.[1];

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      padding: '0 24px',
      height: '56px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '17px', color: '#111827', margin: 0 }}>
          {title}
        </h1>
        {/* Role badge */}
        <span style={{
          padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600,
          background: isManager ? '#eef2ff' : '#f0fdf4',
          color: isManager ? '#4f46e5' : '#16a34a',
          border: `1px solid ${isManager ? '#c7d2fe' : '#bbf7d0'}`,
          textTransform: 'uppercase', letterSpacing: '0.3px',
        }}>
          {user?.role === 'MANAGER' ? 'Manager' : 'Staff'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Low stock alert */}
        <div style={{
          background: '#fef2f2', color: '#ef4444',
          border: '1px solid #fecaca',
          borderRadius: '20px', padding: '4px 12px', fontSize: '11px', cursor: 'pointer',
          fontWeight: 500,
        }}>⚠ Low Stock Alert</div>

        {/* Action button — only for managers */}
        {action && isManager && (
          <button style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', border: 'none', borderRadius: '8px',
            padding: '8px 16px', fontSize: '12px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}
          >{action}</button>
        )}
      </div>
    </header>
  );
}