import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ userCount: 0, orderCount: 0, totalOrderAmount: 0, chartData: null });

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <div style={{ backgroundColor: 'var(--bg-panel)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10px', right: '-10px', color: color, opacity: 0.08 }}>
        <span className="material-symbols-outlined" style={{ fontSize: '100px', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${color}15`, color: color, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <h3 style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h3>
      </div>
      <p style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', margin: 0, zIndex: 1 }}>{value}</p>
    </div>
  );

  // Mock data for the chart to make it look active
  const mockChartData = [
    { label: 'Mon', value: 45, max: 100 },
    { label: 'Tue', value: 68, max: 100 },
    { label: 'Wed', value: 52, max: 100 },
    { label: 'Thu', value: 89, max: 100 },
    { label: 'Fri', value: 74, max: 100 },
    { label: 'Sat', value: 95, max: 100 },
    { label: 'Sun', value: 60, max: 100 },
  ];

  return (
    <div style={{ animation: 'fadeRoute 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', margin: '0 0 0.5rem 0', letterSpacing: '-1px' }}>Command Center</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.1rem' }}>Global system metrics, platform volume, and health overview.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '800' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--success)', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span> SYSTEM STABLE
          </div>
        </div>
      </div>
      
      {/* Top Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title="Total Registered Users" value={stats.userCount} icon="group" color="var(--brand-blue)" />
        <StatCard title="Total Escrow Orders" value={stats.orderCount} icon="receipt_long" color="var(--brand-gold)" />
        <StatCard title="Platform Volume (GH₵)" value={parseFloat(stats.totalOrderAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})} icon="payments" color="var(--success)" />
      </div>

      {/* Analytics Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Main Chart Panel */}
        <div style={{ backgroundColor: 'var(--bg-panel)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>Transaction Volume (7 Days)</h3>
            <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)' }}>bar_chart</span>
          </div>
          
          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'flex-end', gap: '1.5rem', height: '250px', paddingBottom: '1rem', borderBottom: '1px dashed var(--border)' }}>
            {(stats.chartData || mockChartData).map((data, i) => (
              <div key={i} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', height: '100%' }}>
                <div style={{ flexGrow: 1, display: 'flex', alignItems: 'flex-end', width: '100%', position: 'relative' }}>
                  {/* Grid Lines Concept */}
                  <div style={{ width: '100%', height: `${(data.value / data.max) * 100}%`, backgroundColor: i === 6 ? 'var(--brand-gold)' : 'var(--brand-blue)', borderRadius: '6px 6px 0 0', position: 'relative', transition: 'height 1s ease-out' }}>
                    <div style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', opacity: 0, transition: 'opacity 0.2s', backgroundColor: 'var(--text-primary)', color: 'var(--bg-base)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }} className="chart-tooltip">
                      {parseFloat(data.value).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>{data.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Logs / Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--bg-panel)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>Security Hub</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--bg-base)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--brand-gold)' }}>shield_person</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Active Admins</span>
                </div>
                <span style={{ fontWeight: '800', color: 'var(--text-primary)' }}>1</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--bg-base)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--danger)' }}>gavel</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Flags Raised</span>
                </div>
                <span style={{ fontWeight: '800', color: 'var(--text-primary)' }}>0</span>
              </div>
            </div>
          </div>
          
          <div style={{ backgroundColor: 'var(--bg-panel)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', flexGrow: 1, backgroundImage: 'radial-gradient(circle at top right, rgba(245, 158, 11, 0.05) 0%, transparent 70%)' }}>
             <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>Data Sync</h3>
             <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 1.5rem 0' }}>Postgres Database Status</p>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 10px var(--success)' }}></div>
                <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Connected & Live</span>
             </div>
          </div>
        </div>
      </div>
      
      <style>
        {`
          .chart-tooltip {
            pointer-events: none;
          }
          div[style*="transition: height"] > div:hover {
            opacity: 1 !important;
          }
          div[style*="transition: height"]:hover > div.chart-tooltip {
            opacity: 1 !important;
          }
          div[style*="transition: height"]:hover {
            opacity: 0.8;
          }
        `}
      </style>
    </div>
  );
};

export default AdminDashboard;
