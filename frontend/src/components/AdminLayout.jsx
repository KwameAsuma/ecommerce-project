import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        await logout();
        navigate('/login');
      } catch (err) {
        console.error("Logout failed", err);
      }
    }
  };

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ to, icon, label }) => (
    <Link 
      to={to} 
      style={{ 
        display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.2rem', 
        borderRadius: '12px', textDecoration: 'none', 
        backgroundColor: isActive(to) ? 'var(--brand-primary)' : 'transparent', 
        color: isActive(to) ? '#fff' : 'var(--text-primary)', 
        fontWeight: '600', transition: 'all 0.2s', marginBottom: '0.5rem'
      }}
      onMouseOver={e=>{if(!isActive(to)) e.currentTarget.style.backgroundColor='var(--bg-panel-hover)'}} 
      onMouseOut={e=>{if(!isActive(to)) e.currentTarget.style.backgroundColor='transparent'}}
    >
      <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive(to) ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
      {label}
    </Link>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-base)', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Sidebar Navigation */}
      <nav style={{ width: '280px', backgroundColor: 'var(--bg-panel)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', top: 0, left: 0, padding: '2rem 1.5rem', boxShadow: '5px 0 15px rgba(0,0,0,0.02)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '3rem', cursor: 'pointer' }} onClick={() => navigate('/admin')}>
          <img src="/app_icon.png" alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--brand-primary)', margin: 0, letterSpacing: '-0.5px', textTransform: 'uppercase' }}>Admin Hub</h2>
        </div>

        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <NavItem to="/admin" icon="dashboard" label="Dashboard" />
          <NavItem to="/admin/users" icon="group" label="User Management" />
          <NavItem to="/admin/orders" icon="receipt_long" label="Orders & Escrow" />
          <NavItem to="/admin/products" icon="inventory_2" label="Product Catalog" />
          <NavItem to="/admin/auctions" icon="gavel" label="Live Auctions" />
        </div>

        {user && (
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--danger)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '800', fontSize: '1.2rem' }}>
                {user.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem', textTransform: 'capitalize' }}>{user.name}</p>
                <p style={{ margin: 0, color: 'var(--danger)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>SUPER ADMIN</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', width: '100%', padding: '0.8rem', backgroundColor: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={e=>{e.currentTarget.style.backgroundColor='var(--danger)'; e.currentTarget.style.color='white'}}
              onMouseOut={e=>{e.currentTarget.style.backgroundColor='transparent'; e.currentTarget.style.color='var(--danger)'}}
            >
              <span className="material-symbols-outlined text-[20px]">logout</span> Log Out
            </button>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main style={{ marginLeft: '280px', flexGrow: 1, padding: '2rem 3rem', backgroundColor: 'var(--bg-base)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default AdminLayout;
