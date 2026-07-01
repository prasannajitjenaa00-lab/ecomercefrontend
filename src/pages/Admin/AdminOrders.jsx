// AdminOrders.jsx
import React, { useEffect, useState } from 'react';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
import api from '../../utils/api';
import { formatCurrency, formatDate, orderStatusColor } from '../../utils/helpers';
import { toast } from 'react-toastify';

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => { loadOrders(); }, [page, search, statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, ...(search && { search }), ...(statusFilter && { status: statusFilter }) });
      const { data } = await api.get(`/admin/orders?${params}`);
      setOrders(data.orders);
      setPagination({ total: data.total, pages: data.pages });
    } finally { setLoading(false); }
  };

  const updateStatus = async (orderId, status, trackingNumber) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status, trackingNumber });
      toast.success('Status updated');
      loadOrders();
    } catch { toast.error('Failed to update'); }
  };

  const statuses = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-white">Orders</h1>
        <p className="font-body text-sm text-stone-500">{pagination?.total || 0} total</p>
      </div>
      <div className="flex gap-4">
        <div className="relative flex-1">
          <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
          <input type="text" placeholder="Search order number..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-dark-900 border border-dark-700 rounded-xl pl-10 pr-4 py-3 font-body text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-gold-400" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-gold-400">
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s} value={s} className="capitalize">{s.replace('_',' ')}</option>)}
        </select>
      </div>

      <div className="bg-dark-900 rounded-2xl border border-dark-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-800">
                {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-4 font-body text-xs tracking-widest uppercase text-stone-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {loading ? [...Array(8)].map((_, i) => <tr key={i}><td colSpan={7}><div className="skeleton h-12 m-3 rounded bg-dark-800" /></td></tr>) :
              orders.map(order => (
                <tr key={order._id} className="hover:bg-dark-800/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs text-gold-400">{order.orderNumber}</p>
                    <p className="font-body text-xs text-stone-500">{formatDate(order.createdAt)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-body text-sm text-white">{order.user?.name}</p>
                    <p className="font-body text-xs text-stone-500">{order.user?.email}</p>
                  </td>
                  <td className="px-5 py-4 font-body text-sm text-stone-300">{order.items?.length}</td>
                  <td className="px-5 py-4 font-body font-semibold text-white">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-5 py-4">
                    <span className={`font-body text-xs px-2 py-1 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`font-body text-xs px-2 py-1 rounded-full capitalize ${orderStatusColor(order.orderStatus)}`}>
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <select value={order.orderStatus} onChange={e => updateStatus(order._id, e.target.value)}
                      className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-1.5 font-body text-xs text-white focus:outline-none focus:border-gold-400 cursor-pointer">
                      {statuses.map(s => <option key={s} value={s} className="capitalize">{s.replace('_',' ')}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination?.pages > 1 && (
          <div className="flex justify-center space-x-2 p-4 border-t border-dark-800">
            {[...Array(pagination.pages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i+1)} className={`w-9 h-9 rounded-lg font-body text-sm ${page===i+1?'bg-gold-400 text-dark-950 font-bold':'bg-dark-800 text-stone-400 hover:text-white'}`}>{i+1}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// AdminUsers.jsx
export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/admin/users?${search ? `search=${search}` : ''}`);
        setUsers(data.users);
      } finally { setLoading(false); }
    };
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  const toggleBlock = async (id) => {
    try {
      const { data } = await api.put(`/admin/users/${id}/block`);
      setUsers(prev => prev.map(u => u._id === id ? data.user : u));
      toast.success(data.message);
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-white">Customers</h1>
      <div className="relative">
        <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
        <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-dark-900 border border-dark-700 rounded-xl pl-10 pr-4 py-3 font-body text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-gold-400" />
      </div>
      <div className="bg-dark-900 rounded-2xl border border-dark-800 overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-dark-800">{['Customer','Role','Verified','Status','Joined','Actions'].map(h=><th key={h} className="text-left px-5 py-4 font-body text-xs tracking-widest uppercase text-stone-400">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-dark-800">
            {loading ? [...Array(6)].map((_,i)=><tr key={i}><td colSpan={6}><div className="skeleton h-12 m-3 rounded bg-dark-800"/></td></tr>) :
            users.map(user => (
              <tr key={user._id} className="hover:bg-dark-800/50">
                <td className="px-5 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gold-400/20 flex items-center justify-center">
                      <span className="font-body text-sm font-bold text-gold-400">{user.name?.[0]?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-body text-sm text-white">{user.name}</p>
                      <p className="font-body text-xs text-stone-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4"><span className="font-body text-xs px-2 py-1 bg-dark-800 text-stone-300 rounded capitalize">{user.role}</span></td>
                <td className="px-5 py-4"><span className={`font-body text-xs ${user.isVerified ? 'text-green-400' : 'text-yellow-400'}`}>{user.isVerified ? '✓ Yes' : '✗ No'}</span></td>
                <td className="px-5 py-4"><span className={`font-body text-xs px-2 py-1 rounded-full ${user.isBlocked ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>{user.isBlocked ? 'Blocked' : 'Active'}</span></td>
                <td className="px-5 py-4 font-body text-xs text-stone-500">{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                <td className="px-5 py-4">
                  <button onClick={() => toggleBlock(user._id)} className={`font-body text-xs px-3 py-1.5 rounded-lg border transition-colors ${user.isBlocked ? 'border-green-700 text-green-400 hover:bg-green-900/20' : 'border-red-700 text-red-400 hover:bg-red-900/20'}`}>
                    {user.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// AdminCoupons.jsx
export function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', minOrderAmount: '', maxDiscount: '', usageLimit: '', endDate: '', description: '', isFirstOrder: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/coupons').then(({ data }) => setCoupons(data.coupons));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/coupons', form);
      setCoupons(prev => [data.coupon, ...prev]);
      setModalOpen(false);
      setForm({ code: '', type: 'percentage', value: '', minOrderAmount: '', maxDiscount: '', usageLimit: '', endDate: '', description: '', isFirstOrder: false });
      toast.success('Coupon created!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    await api.delete(`/coupons/${id}`);
    setCoupons(prev => prev.filter(c => c._id !== id));
    toast.success('Deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-white">Coupons</h1>
        <button onClick={() => setModalOpen(true)} className="flex items-center space-x-2 bg-gold-400 text-dark-950 font-body font-semibold px-5 py-2.5 rounded-xl hover:bg-gold-300 transition-colors">
          <span>+ Add Coupon</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map(c => (
          <div key={c._id} className="bg-dark-900 rounded-2xl border border-dark-800 p-5 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-mono text-lg font-bold text-gold-400">{c.code}</p>
                <p className="font-body text-xs text-stone-500">{c.description}</p>
              </div>
              <span className={`font-body text-xs px-2 py-1 rounded-full ${c.isActive && new Date(c.endDate) > new Date() ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                {c.isActive && new Date(c.endDate) > new Date() ? 'Active' : 'Expired'}
              </span>
            </div>
            <div className="flex justify-between text-sm font-body">
              <span className="text-stone-400">Discount</span>
              <span className="text-white font-semibold">{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</span>
            </div>
            <div className="flex justify-between text-sm font-body">
              <span className="text-stone-400">Used</span>
              <span className="text-white">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</span>
            </div>
            <div className="flex justify-between text-sm font-body">
              <span className="text-stone-400">Expires</span>
              <span className="text-white">{new Date(c.endDate).toLocaleDateString('en-IN')}</span>
            </div>
            <button onClick={() => deleteCoupon(c._id)} className="w-full text-center font-body text-xs text-red-400 border border-red-800 py-2 rounded-lg hover:bg-red-900/20 transition-colors">Delete</button>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-dark-950/80 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-900 rounded-2xl border border-dark-700 p-6 w-full max-w-md">
            <h2 className="font-heading text-xl text-white mb-5">Create Coupon</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[['code','Code (auto-uppercase)','text'],['value','Discount Value','number'],['minOrderAmount','Min Order Amount','number'],['maxDiscount','Max Discount (₹)','number'],['usageLimit','Usage Limit','number'],['endDate','Expiry Date','date']].map(([field,label,type]) => (
                <div key={field}>
                  <label className="font-body text-xs text-stone-400 mb-1 block">{label}</label>
                  <input type={type} value={form[field]} onChange={e => setForm(p => ({...p, [field]: field==='code' ? e.target.value.toUpperCase() : e.target.value}))} required={['code','value','endDate'].includes(field)}
                    className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-gold-400" />
                </div>
              ))}
              <div>
                <label className="font-body text-xs text-stone-400 mb-1 block">Type</label>
                <select value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))} className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-gold-400">
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat Amount</option>
                </select>
              </div>
              <div>
                <label className="font-body text-xs text-stone-400 mb-1 block">Description</label>
                <input type="text" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 font-body text-sm text-white focus:outline-none focus:border-gold-400" />
              </div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={form.isFirstOrder} onChange={e=>setForm(p=>({...p,isFirstOrder:e.target.checked}))} className="accent-gold-400" />
                <span className="font-body text-sm text-stone-300">First order only</span>
              </label>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={()=>setModalOpen(false)} className="flex-1 border border-dark-600 text-stone-400 font-body py-2.5 rounded-xl">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-gold-400 text-dark-950 font-body font-semibold py-2.5 rounded-xl hover:bg-gold-300 disabled:opacity-60">
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Stub pages
export function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', gender: 'all' });
  useEffect(() => { api.get('/categories').then(({data}) => setCats(data.categories)); }, []);
  const submit = async (e) => {
    e.preventDefault();
    const { data } = await api.post('/categories', { ...form, slug: form.name.toLowerCase().replace(/\s+/g,'-') });
    setCats(p => [data.category, ...p]); setForm({ name: '', slug: '', gender: 'all' }); toast.success('Category created');
  };
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-white">Categories</h1>
      <form onSubmit={submit} className="bg-dark-900 rounded-2xl border border-dark-800 p-6 flex gap-4 items-end">
        <div className="flex-1"><label className="font-body text-xs text-stone-400 mb-1 block">Name</label><input required value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-sm text-white font-body focus:outline-none focus:border-gold-400"/></div>
        <div><label className="font-body text-xs text-stone-400 mb-1 block">Gender</label><select value={form.gender} onChange={e=>setForm(p=>({...p,gender:e.target.value}))} className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-sm text-white font-body focus:outline-none focus:border-gold-400"><option value="all">All</option><option value="men">Men</option><option value="women">Women</option><option value="kids">Kids</option></select></div>
        <button type="submit" className="bg-gold-400 text-dark-950 font-body font-semibold px-6 py-3 rounded-xl hover:bg-gold-300">Add</button>
      </form>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cats.map(c => (
          <div key={c._id} className="bg-dark-900 rounded-xl border border-dark-800 p-4 flex justify-between items-center">
            <div><p className="font-body font-medium text-white">{c.name}</p><p className="font-body text-xs text-stone-500 capitalize">{c.gender}</p></div>
            <button onClick={async()=>{await api.delete(`/categories/${c._id}`);setCats(p=>p.filter(x=>x._id!==c._id));}} className="text-red-400 hover:text-red-300 font-body text-xs">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [name, setName] = useState('');
  useEffect(() => { api.get('/brands').then(({data}) => setBrands(data.brands)); }, []);
  const submit = async (e) => { e.preventDefault(); const {data} = await api.post('/brands', {name, slug: name.toLowerCase().replace(/\s+/g,'-')}); setBrands(p=>[data.brand,...p]); setName(''); toast.success('Brand created'); };
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-white">Brands</h1>
      <form onSubmit={submit} className="bg-dark-900 rounded-2xl border border-dark-800 p-6 flex gap-4">
        <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Brand name" className="flex-1 bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-sm text-white font-body focus:outline-none focus:border-gold-400"/>
        <button type="submit" className="bg-gold-400 text-dark-950 font-body font-semibold px-6 py-3 rounded-xl hover:bg-gold-300">Add</button>
      </form>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {brands.map(b => (
          <div key={b._id} className="bg-dark-900 rounded-xl border border-dark-800 p-4 flex justify-between items-center">
            <p className="font-body font-medium text-white">{b.name}</p>
            <button onClick={async()=>{await api.delete(`/brands/${b._id}`);setBrands(p=>p.filter(x=>x._id!==b._id));}} className="text-red-400 font-body text-xs">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({ title: '', subtitle: '', link: '', buttonText: '', position: 'hero', image: { url: '' } });
  useEffect(() => { api.get('/banners').then(({data}) => setBanners(data.banners)); }, []);
  const submit = async (e) => { e.preventDefault(); const {data} = await api.post('/banners', form); setBanners(p=>[data.banner,...p]); toast.success('Banner created'); };
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-white">Banners</h1>
      <form onSubmit={submit} className="bg-dark-900 rounded-2xl border border-dark-800 p-6 grid grid-cols-2 gap-4">
        {[['title','Title'],['subtitle','Subtitle'],['link','Link URL'],['buttonText','Button Text']].map(([f,l])=>(
          <div key={f}><label className="font-body text-xs text-stone-400 mb-1 block">{l}</label><input required={f==='title'} value={form[f]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-sm text-white font-body focus:outline-none focus:border-gold-400"/></div>
        ))}
        <div><label className="font-body text-xs text-stone-400 mb-1 block">Image URL</label><input value={form.image.url} onChange={e=>setForm(p=>({...p,image:{url:e.target.value}}))} className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-sm text-white font-body focus:outline-none focus:border-gold-400"/></div>
        <div><label className="font-body text-xs text-stone-400 mb-1 block">Position</label><select value={form.position} onChange={e=>setForm(p=>({...p,position:e.target.value}))} className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-sm text-white font-body focus:outline-none focus:border-gold-400"><option value="hero">Hero</option><option value="middle">Middle</option><option value="popup">Popup</option></select></div>
        <div className="col-span-2"><button type="submit" className="bg-gold-400 text-dark-950 font-body font-semibold px-6 py-3 rounded-xl hover:bg-gold-300">Create Banner</button></div>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map(b => (
          <div key={b._id} className="bg-dark-900 rounded-xl border border-dark-800 p-4">
            <p className="font-heading text-white font-semibold">{b.title}</p>
            <p className="font-body text-xs text-stone-500">{b.position} • {b.isActive ? 'Active' : 'Inactive'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminOrders;
