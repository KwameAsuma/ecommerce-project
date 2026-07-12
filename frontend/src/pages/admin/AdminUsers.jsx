import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Forms
  const [passwordForm, setPasswordForm] = useState('');
  const [roleForm, setRoleForm] = useState('customer');
  const [walletForm, setWalletForm] = useState({ availableBalance: 0, trustScore: 0 });

  const fetchUsers = () => {
    api.get('/admin/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (u) => {
    setSelectedUser(u);
    setRoleForm(u.role);
    setWalletForm({ availableBalance: u.availableBalance || 0, trustScore: u.trustScore || 0 });
    setPasswordForm('');
  };

  const closeModal = () => setSelectedUser(null);

  const handleDelete = (id) => {
    if (window.confirm("WARNING: Are you absolutely sure you want to hard-delete this user? All their data will be wiped.")) {
      api.delete(`/admin/users/${id}`)
        .then(() => {
          alert('User wiped from existence.');
          fetchUsers();
          closeModal();
        })
        .catch(err => alert(err.response?.data?.error || 'Failed to delete'));
    }
  };

  const handleUpdateRole = () => {
    api.put(`/admin/users/${selectedUser.id}/role`, { role: roleForm })
      .then(() => {
        alert('Role updated');
        fetchUsers();
      })
      .catch(err => alert(err.response?.data?.error || 'Failed to update role'));
  };

  const handleUpdateWallet = () => {
    api.put(`/admin/users/${selectedUser.id}/wallet`, { 
      availableBalance: parseFloat(walletForm.availableBalance), 
      trustScore: parseInt(walletForm.trustScore) 
    })
      .then(() => {
        alert('Wallet & Trust Score updated');
        fetchUsers();
      })
      .catch(err => alert(err.response?.data?.error || 'Failed to update wallet'));
  };

  const handlePasswordChange = () => {
    if (!passwordForm || passwordForm.length < 6) return alert('Password must be at least 6 chars');
    api.put(`/admin/users/${selectedUser.id}/password`, { newPassword: passwordForm })
      .then(() => {
        alert('Password overwritten successfully');
        setPasswordForm('');
      })
      .catch(err => alert(err.response?.data?.error || 'Failed to change password'));
  };

  return (
    <div style={{ animation: 'fadeRoute 0.4s ease-out' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', margin: '0 0 0.5rem 0', letterSpacing: '-1px' }}>User Management</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.1rem' }}>God mode enabled. You have absolute authority over all accounts.</p>
      </div>
      
      <div style={{ backgroundColor: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>ID</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>User</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Role</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Wallet</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='var(--bg-base)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='transparent'}>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600' }}>#{u.id}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{u.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.email}</div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700', backgroundColor: u.role === 'admin' ? 'var(--danger)' : u.role === 'merchant' ? 'var(--brand-gold)' : 'var(--brand-blue)', color: 'white', textTransform: 'uppercase' }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ fontWeight: '700', color: 'var(--success)' }}>GH₵ {parseFloat(u.availableBalance || 0).toFixed(2)}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Trust: {u.trustScore || 0}</div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <button onClick={() => openModal(u)} style={{ backgroundColor: 'var(--brand-blue)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseOver={e=>e.currentTarget.style.opacity='0.8'} onMouseOut={e=>e.currentTarget.style.opacity='1'}>
                    God Mode
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* GOD MODE MODAL */}
      {selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-panel)', padding: '2.5rem', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid var(--brand-blue)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: 'var(--brand-blue)', fontWeight: '900', fontSize: '1.5rem' }}>God Mode: {selectedUser.name}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><span className="material-symbols-outlined">close</span></button>
            </div>

            {/* Role Manager */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-base)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <h4 style={{ margin: '0 0 0.8rem 0', color: 'var(--text-primary)' }}>1. Authority Level</h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select value={roleForm} onChange={e=>setRoleForm(e.target.value)} style={{ flexGrow: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <option value="customer">Customer</option>
                  <option value="merchant">Merchant</option>
                  <option value="admin">Admin</option>
                </select>
                <button onClick={handleUpdateRole} style={{ backgroundColor: 'var(--text-primary)', color: 'white', border: 'none', padding: '0 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Apply</button>
              </div>
            </div>

            {/* Wallet Manager */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-base)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <h4 style={{ margin: '0 0 0.8rem 0', color: 'var(--text-primary)' }}>2. Financial & Trust Injection</h4>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ flexGrow: 1 }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Wallet Balance (GH₵)</label>
                  <input type="number" step="0.01" value={walletForm.availableBalance} onChange={e=>setWalletForm({...walletForm, availableBalance: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
                <div style={{ width: '100px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Trust Score</label>
                  <input type="number" value={walletForm.trustScore} onChange={e=>setWalletForm({...walletForm, trustScore: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
              </div>
              <button onClick={handleUpdateWallet} style={{ width: '100%', backgroundColor: 'var(--text-primary)', color: 'white', border: 'none', padding: '0.6rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Inject Funds/Trust</button>
            </div>

            {/* Password Override */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-base)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <h4 style={{ margin: '0 0 0.8rem 0', color: 'var(--text-primary)' }}>3. Password Override</h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="text" placeholder="New Password" value={passwordForm} onChange={e=>setPasswordForm(e.target.value)} style={{ flexGrow: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                <button onClick={handlePasswordChange} style={{ backgroundColor: 'var(--text-primary)', color: 'white', border: 'none', padding: '0 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Force</button>
              </div>
            </div>

            {/* Destructive */}
            <button onClick={() => handleDelete(selectedUser.id)} style={{ width: '100%', backgroundColor: 'var(--danger)', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined">delete_forever</span> ERASE USER COMPLETELY
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
