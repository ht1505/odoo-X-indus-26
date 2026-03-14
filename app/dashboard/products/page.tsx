"use client";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { toast } from "react-hot-toast";
import { X, Package, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Product { id: string; name: string; sku: string; category: { name: string }; unit: string; reorderLevel: number; stocks?: { quantity: number; location: { name: string } }[]; }
interface Category { id: string; name: string; }

const init = { name: "", sku: "", categoryId: "", unit: "", reorderLevel: 0 };

const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb',
  borderRadius: '8px', fontSize: '13px', color: '#111827',
  background: '#fff', boxSizing: 'border-box' as const, outline: 'none',
  fontFamily: 'DM Sans, sans-serif',
};
const labelStyle = {
  display: 'block', fontSize: '11px', fontWeight: 600 as const,
  color: '#6b7280', textTransform: 'uppercase' as const,
  letterSpacing: '0.5px', marginBottom: '5px',
};

export default function ProductsPage() {
  const user = useAuth();
  const isManager = user?.role === 'MANAGER';
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(init);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grouped' | 'table'>('grouped');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [p, c] = await Promise.all([
        axios.get("/products"),
        axios.get("/categories"),
      ]);
      setProducts(p.data);
      setCategories(c.data);
    } catch { toast.error("Failed to fetch data."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/products", { ...form, reorderLevel: Number(form.reorderLevel) });
      toast.success("Product created!");
      setOpen(false); setForm(init); fetchData();
    } catch { toast.error("Failed to create product."); }
  };

  const toggleCategory = (cat: string) => setCollapsed(p => ({ ...p, [cat]: !p[cat] }));

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const grouped = filtered.reduce<Record<string, Product[]>>((acc, p) => {
    const cat = p.category.name;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  const totalStock = (p: Product) => p.stocks?.reduce((sum, s) => sum + s.quantity, 0) ?? 0;
  const isLowStock = (p: Product) => totalStock(p) <= p.reorderLevel;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: '13px' }}>
      Loading products...
    </div>
  );

  return (
    <div style={{ padding: '24px', background: '#f8f9fc', minHeight: '100%', fontFamily: 'DM Sans, sans-serif' }}>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .ci-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
        .product-row:hover { background: #f9fafb; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '20px', color: '#111827', margin: 0 }}>Products</h2>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '2px 0 0' }}>{products.length} products across {Object.keys(grouped).length} categories</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            {(['grouped', 'table'] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)} style={{
                padding: '7px 14px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500,
                background: viewMode === mode ? '#eef2ff' : 'transparent',
                color: viewMode === mode ? '#4f46e5' : '#6b7280',
                transition: 'all 0.15s',
              }}>{mode === 'grouped' ? 'By Category' : 'Table'}</button>
            ))}
          </div>
          {isManager && (
            <button onClick={() => setOpen(true)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', border: 'none', borderRadius: '8px',
              padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}>
              <Plus size={14} /> New Product
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <input
        type="text" placeholder="Search products or SKU..."
        value={search} onChange={e => setSearch(e.target.value)}
        className="ci-input"
        style={{ ...inputStyle, width: '280px', marginBottom: '20px' }}
      />

      {/* Grouped View */}
      {viewMode === 'grouped' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              {/* Category header */}
              <div
                onClick={() => toggleCategory(category)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', cursor: 'pointer', background: '#fafafa', borderBottom: collapsed[category] ? 'none' : '1px solid #f3f4f6' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={13} color="#6366f1" />
                  </div>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: '#111827' }}>{category}</span>
                  <span style={{ background: '#e0e7ff', color: '#4f46e5', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px' }}>{items.length}</span>
                </div>
                {collapsed[category] ? <ChevronRight size={14} color="#9ca3af" /> : <ChevronDown size={14} color="#9ca3af" />}
              </div>

              {/* Products in category */}
              {!collapsed[category] && (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      {['Product Name', 'SKU', 'Unit', 'Reorder Level', 'Stock', 'Status'].map(h => (
                        <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((p, i) => (
                      <tr key={p.id} className="product-row" style={{ borderTop: '1px solid #f3f4f6', transition: 'background 0.1s' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '13px', color: '#111827' }}>{p.name}</td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#6366f1', fontSize: '12px' }}>{p.sku}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{p.unit}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{p.reorderLevel}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#111827' }}>{totalStock(p)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          {isLowStock(p) ? (
                            <span style={{ background: '#fef2f2', color: '#ef4444', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}>Low Stock</span>
                          ) : (
                            <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}>In Stock</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
          {Object.keys(grouped).length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              No products found
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Name', 'SKU', 'Category', 'Unit', 'Reorder Level', 'Stock', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>No products found</td></tr>
              ) : filtered.map((p, i) => (
                <tr key={p.id} className="product-row" style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none', transition: 'background 0.1s' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '13px', color: '#111827' }}>{p.name}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#6366f1', fontSize: '12px' }}>{p.sku}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{p.category.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{p.unit}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{p.reorderLevel}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#111827' }}>{totalStock(p)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {isLowStock(p) ? (
                      <span style={{ background: '#fef2f2', color: '#ef4444', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}>Low Stock</span>
                    ) : (
                      <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}>In Stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: '#111827', margin: 0 }}>Add New Product</h3>
                <p style={{ color: '#9ca3af', fontSize: '12px', margin: '3px 0 0' }}>Fill in the product details below</p>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                {[
                  { label: 'Product Name', name: 'name', type: 'text' },
                  { label: 'SKU / Code', name: 'sku', type: 'text' },
                  { label: 'Unit (e.g. pcs, kg)', name: 'unit', type: 'text' },
                  { label: 'Reorder Level', name: 'reorderLevel', type: 'number' },
                ].map(f => (
                  <div key={f.name}>
                    <label style={labelStyle}>{f.label}</label>
                    <input className="ci-input" style={inputStyle} type={f.type} required
                      value={(form as any)[f.name]}
                      onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Category</label>
                <select className="ci-input" style={{ ...inputStyle, appearance: 'none' as const }} required
                  value={form.categoryId}
                  onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}>
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setOpen(false)} style={{ padding: '9px 18px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', color: '#6b7280' }}>Cancel</button>
                <button type="submit" style={{ padding: '9px 18px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#fff' }}>Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}