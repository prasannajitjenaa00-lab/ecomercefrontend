import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiLock } from 'react-icons/fi';
import api from '../../utils/api';
import { getMe } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showPwForm, setShowPwForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/profile', form);
      dispatch(getMe());
      setEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error("Passwords don't match"); return; }
    try {
      await api.put('/users/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      setShowPwForm(false);
      toast.success('Password changed!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-dark-950 pt-24">
      <div className="container mx-auto px-4 lg:px-8 py-10 max-w-4xl">
        <h1 className="font-display text-4xl text-dark-950 dark:text-white mb-10">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-900 rounded-2xl p-6 border border-stone-100 dark:border-dark-800 text-center">
              <div className="w-20 h-20 rounded-full bg-gold-400/20 flex items-center justify-center mx-auto mb-4">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="font-display text-3xl font-bold text-gold-400">{user?.name?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <h2 className="font-heading text-xl text-dark-950 dark:text-white">{user?.name}</h2>
              <p className="font-body text-sm text-stone-400">{user?.email}</p>
              <span className={`inline-block mt-2 font-body text-xs px-3 py-1 rounded-full ${user?.isVerified ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-600'}`}>
                {user?.isVerified ? '✓ Verified' : '⚠ Unverified'}
              </span>
            </div>
          </div>

          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-900 rounded-2xl p-6 border border-stone-100 dark:border-dark-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-xl text-dark-950 dark:text-white">Personal Information</h2>
                <button onClick={() => setEditing(!editing)} className="flex items-center space-x-2 text-gold-400 font-body text-sm hover:underline">
                  <FiEdit2 size={14} /><span>{editing ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>
              <form onSubmit={handleSaveProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: FiUser, label: 'Full Name', field: 'name', type: 'text' },
                    { icon: FiPhone, label: 'Phone', field: 'phone', type: 'tel' },
                  ].map(({ icon: Icon, label, field, type }) => (
                    <div key={field}>
                      <label className="font-body text-xs tracking-widest uppercase text-stone-400 mb-2 block">{label}</label>
                      <div className="relative">
                        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input type={type} value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} disabled={!editing}
                          className="w-full pl-10 pr-4 py-3 border border-stone-200 dark:border-dark-700 rounded-lg font-body text-sm bg-transparent dark:text-white focus:outline-none focus:border-gold-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all" />
                      </div>
                    </div>
                  ))}
                  <div>
                    <label className="font-body text-xs tracking-widest uppercase text-stone-400 mb-2 block">Email</label>
                    <div className="relative">
                      <FiMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input type="email" value={user?.email} disabled
                        className="w-full pl-10 pr-4 py-3 border border-stone-200 dark:border-dark-700 rounded-lg font-body text-sm bg-transparent dark:text-white opacity-60 cursor-not-allowed" />
                    </div>
                  </div>
                </div>
                {editing && (
                  <button type="submit" disabled={saving} className="mt-4 btn-gold rounded-lg flex items-center space-x-2 text-sm disabled:opacity-60">
                    <FiSave size={16} /><span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                )}
              </form>
            </motion.div>

            {/* Change Password */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white dark:bg-dark-900 rounded-2xl p-6 border border-stone-100 dark:border-dark-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl text-dark-950 dark:text-white">Security</h2>
                <button onClick={() => setShowPwForm(!showPwForm)} className="flex items-center space-x-2 text-gold-400 font-body text-sm hover:underline">
                  <FiLock size={14} /><span>{showPwForm ? 'Cancel' : 'Change Password'}</span>
                </button>
              </div>
              {!showPwForm && <p className="font-body text-sm text-stone-400">Your password is securely encrypted. Click "Change Password" to update it.</p>}
              {showPwForm && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {[['currentPassword', 'Current Password'], ['newPassword', 'New Password'], ['confirm', 'Confirm New Password']].map(([field, label]) => (
                    <input key={field} type="password" placeholder={label} value={pwForm[field]} required
                      onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                      className="w-full border border-stone-200 dark:border-dark-700 rounded-lg px-4 py-3 font-body text-sm bg-transparent dark:text-white focus:outline-none focus:border-gold-400" />
                  ))}
                  <button type="submit" className="btn-gold rounded-lg text-sm">Update Password</button>
                </form>
              )}
            </motion.div>

            {/* Addresses */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white dark:bg-dark-900 rounded-2xl p-6 border border-stone-100 dark:border-dark-800">
              <h2 className="font-heading text-xl text-dark-950 dark:text-white mb-4">Saved Addresses</h2>
              {user?.addresses?.length === 0 && <p className="font-body text-sm text-stone-400">No addresses saved yet.</p>}
              <div className="space-y-3">
                {user?.addresses?.map(addr => (
                  <div key={addr._id} className="p-4 border border-stone-200 dark:border-dark-700 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-body font-semibold text-sm text-dark-900 dark:text-white">{addr.name}</span>
                          <span className="font-body text-xs border border-stone-300 dark:border-dark-600 px-2 py-0.5 rounded capitalize text-stone-400">{addr.type}</span>
                          {addr.isDefault && <span className="font-body text-xs text-gold-400 border border-gold-300 px-2 py-0.5 rounded">Default</span>}
                        </div>
                        <p className="font-body text-sm text-stone-500">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="font-body text-sm text-stone-500">📞 {addr.phone}</p>
                      </div>
                      <button onClick={async () => {
                        try { await api.delete(`/users/address/${addr._id}`); dispatch(getMe()); toast.success('Address removed'); }
                        catch { toast.error('Failed'); }
                      }} className="text-stone-300 hover:text-red-400 transition-colors text-xs font-body">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
