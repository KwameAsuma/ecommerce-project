import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = () => {
    api.get('/admin/orders')
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = (id, newStatus) => {
    if (window.confirm(`WARNING: Force order status to ${newStatus}? This skips normal escrow rules.`)) {
      api.put(`/admin/orders/${id}/status`, { status: newStatus })
        .then(() => {
          alert('Status overridden successfully.');
          fetchOrders();
        })
        .catch(err => alert('Failed to update status'));
    }
  };

  return (
    <div style={{ animation: 'fadeRoute 0.4s ease-out' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', margin: '0 0 0.5rem 0', letterSpacing: '-1px' }}>Escrow & Orders</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.1rem' }}>God mode enabled. Override smart contracts and release/cancel funds.</p>
        </div>
      </div>
      
      <div style={{ backgroundColor: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Order ID</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Customer / Vendor</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Product</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Total Amount</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>God Override</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='var(--bg-base)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='transparent'}>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600' }}>#{o.id}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ fontWeight: '700', color: 'var(--brand-primary)' }}>C: {o.customer?.name}</div>
                  <div style={{ fontWeight: '700', color: 'var(--brand-accent)' }}>V: {o.vendor?.name}</div>
                </td>
                <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>{o.product?.title}</td>
                <td style={{ padding: '1rem 1.5rem', fontWeight: '700', color: 'var(--success)' }}>GH₵ {parseFloat(o.totalAmount).toFixed(2)}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ 
                    background: o.status === 'COMPLETED' ? 'var(--success-bg)' : o.status === 'CANCELLED' ? '#ffebee' : '#fff3e0',
                    color: o.status === 'COMPLETED' ? 'var(--success)' : o.status === 'CANCELLED' ? 'var(--danger)' : 'var(--brand-accent)',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    textTransform: 'uppercase'
                  }}>
                    {o.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <select 
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    value=""
                    style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', fontWeight: '600', color: 'var(--text-primary)', outline: 'none' }}
                  >
                    <option value="" disabled>Force State...</option>
                    <option value="HELD_IN_ESCROW">Hold Escrow</option>
                    <option value="COMPLETED">Force Complete</option>
                    <option value="CANCELLED">Force Cancel</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>No escrow history.</div>}
      </div>
    </div>
  );
};

export default AdminOrders;
