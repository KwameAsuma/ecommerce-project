import React, { useState, useRef, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MerchantLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const hoverTimeoutRef = useRef(null);

  const isExpanded = isPinned || isHovered;

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 150); // 150ms delay
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
  };

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

  return (
    <div className="bg-surface text-on-surface font-body-md selection:bg-secondary-container min-h-screen flex flex-col relative">
      {/* TopNavBar */}
      <header className="bg-surface dark:bg-inverse-surface border-b border-outline-variant dark:border-outline w-full h-16 flex justify-between items-center px-margin-desktop sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link to="/merchant" className="no-underline">
            <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary tracking-tight cursor-pointer flex items-baseline gap-2">
              TradeHub <span className="text-sm font-normal text-tertiary">Merchant Platform</span>
            </h1>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center bg-surface-container-low border border-outline-variant rounded-full px-4 py-1.5 w-64 focus-within:border-primary transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant text-body-md" data-icon="search">search</span>
            <input className="bg-transparent border-none focus:ring-0 text-label-md w-full ml-2 placeholder:text-on-surface-variant outline-none" placeholder="Search orders..." type="text" />
          </div>
          <div className="flex items-center gap-4 relative">
            
            {/* Notifications Toggle */}
            <button 
              onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsProfileOpen(false); }}
              className="relative material-symbols-outlined text-on-surface-variant hover:bg-surface-container transition-colors p-2 rounded-full cursor-pointer" 
              data-icon="notifications"
            >
              notifications
              <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface"></div>
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute top-12 right-12 w-80 bg-surface-container-lowest border border-outline-variant shadow-lg rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-outline-variant bg-surface-container flex justify-between items-center">
                  <span className="font-bold text-label-md">Notifications</span>
                  <button className="text-primary text-[12px] hover:underline font-bold">Mark all read</button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  <div className="px-4 py-3 border-b border-outline-variant hover:bg-surface-container-low cursor-pointer transition-colors border-l-4 border-l-error">
                    <p className="font-label-md font-bold text-on-surface">Auction ending soon</p>
                    <p className="text-label-sm text-on-surface-variant mt-1">Gold Coast Pendant auction is reaching its peak.</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-surface-container-low cursor-pointer transition-colors border-l-4 border-l-primary">
                    <p className="font-label-md font-bold text-on-surface">Shipments pending</p>
                    <p className="text-label-sm text-on-surface-variant mt-1">Verify pick-up for Order #GH-9021.</p>
                  </div>
                </div>
              </div>
            )}

            <button onClick={() => navigate("/merchant/support")} className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container transition-colors p-2 rounded-full cursor-pointer" data-icon="help">help</button>
            
            {/* Profile Toggle */}
            <div 
              onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotificationsOpen(false); }}
              className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border border-outline-variant cursor-pointer hover:opacity-80 transition-opacity"
            >
              {user?.avatarUrl ? (
                <img className="w-full h-full object-cover pointer-events-none" alt="Merchant Profile" src={`http://localhost:5001${user.avatarUrl}`}/>
              ) : (
                <span className="font-bold text-sm text-primary">{user?.name ? user.name.charAt(0).toUpperCase() : "M"}</span>
              )}
            </div>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute top-12 right-0 w-48 bg-surface-container-lowest border border-outline-variant shadow-lg rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-outline-variant">
                  <p className="font-bold text-label-md text-on-surface">{user?.name || "Ghana Merchant"}</p>
                  <p className="text-label-sm text-on-surface-variant">{user?.email || "seller@tradehub.com"}</p>
                </div>
                <div className="py-1">
                  <button onClick={() => { setIsProfileOpen(false); navigate("/profile"); }} className="w-full text-left px-4 py-2 text-label-md text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">person</span> My Profile
                  </button>
                  <button onClick={() => { setIsProfileOpen(false); navigate("/merchant/settings"); }} className="w-full text-left px-4 py-2 text-label-md text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">manage_accounts</span> Store Settings
                  </button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-label-md text-error hover:bg-error-container transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">logout</span> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* SideNavBar */}
        <aside 
          onMouseLeave={handleMouseLeave}
          className={`hidden md:flex flex-col h-[calc(100vh-64px)] ${isExpanded ? 'w-[280px]' : 'w-[80px]'} bg-surface-container-low dark:bg-inverse-surface border-r border-outline-variant dark:border-outline p-4 sticky top-16 z-30 transition-all duration-300`}
        >
          <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} mb-8 px-2`}>
            <div 
              onClick={() => setIsPinned(true)}
              className="flex items-center gap-3 cursor-pointer"
              title="Pin Sidebar"
            >
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center text-on-secondary font-bold font-headline-md flex-shrink-0 overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={`http://localhost:5001${user.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name.charAt(0).toUpperCase() : "M"
                )}
              </div>
              {isExpanded && (
                <div>
                  <p className="font-headline-md text-label-md font-extrabold text-on-surface whitespace-nowrap">{user?.name || "Ghana Merchant"}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Verified Seller</p>
                </div>
              )}
            </div>
            {isExpanded && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPinned(false);
                  setIsHovered(false);
                }} 
                className="text-on-surface-variant hover:bg-surface-container-high p-1.5 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                title="Collapse Sidebar"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
            )}
          </div>
          
          <nav className="flex-1 space-y-1">
            <Link 
              to="/merchant" 
              onMouseEnter={handleMouseEnter}
              onClick={() => setIsPinned(true)}
              className={`flex items-center ${isExpanded ? 'gap-3' : 'justify-center'} px-4 py-3 rounded-lg font-label-md transition-all whitespace-nowrap overflow-hidden ${isActive('/merchant') ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'}`} 
              title={!isExpanded ? "Command Center" : undefined}
            >
              <span className={`material-symbols-outlined ${isActive('/merchant') ? 'active-nav-item' : ''}`} data-icon="dashboard">dashboard</span>
              {isExpanded && <span>Command Center</span>}
            </Link>
            <Link 
              to="/merchant/inventory" 
              onMouseEnter={handleMouseEnter}
              onClick={() => setIsPinned(true)}
              className={`flex items-center ${isExpanded ? 'gap-3' : 'justify-center'} px-4 py-3 rounded-lg font-label-md transition-all whitespace-nowrap overflow-hidden ${isActive('/merchant/inventory') ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'}`} 
              title={!isExpanded ? "Inventory" : undefined}
            >
              <span className={`material-symbols-outlined ${isActive('/merchant/inventory') ? 'active-nav-item' : ''}`} data-icon="inventory_2">inventory_2</span>
              {isExpanded && <span>Inventory</span>}
            </Link>
            <Link 
              to="/merchant/auctions" 
              onMouseEnter={handleMouseEnter}
              onClick={() => setIsPinned(true)}
              className={`flex items-center ${isExpanded ? 'gap-3' : 'justify-center'} px-4 py-3 rounded-lg font-label-md transition-all whitespace-nowrap overflow-hidden ${isActive('/merchant/auctions') ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'}`} 
              title={!isExpanded ? "Auctions" : undefined}
            >
              <span className={`material-symbols-outlined ${isActive('/merchant/auctions') ? 'active-nav-item' : ''}`} data-icon="gavel">gavel</span>
              {isExpanded && <span>Auctions</span>}
            </Link>
            <Link 
              to="/merchant/escrow" 
              onMouseEnter={handleMouseEnter}
              onClick={() => setIsPinned(true)}
              className={`flex items-center ${isExpanded ? 'gap-3' : 'justify-center'} px-4 py-3 rounded-lg font-label-md transition-all whitespace-nowrap overflow-hidden ${isActive('/merchant/escrow') ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'}`} 
              title={!isExpanded ? "Escrow Payouts" : undefined}
            >
              <span className={`material-symbols-outlined ${isActive('/merchant/escrow') ? 'active-nav-item' : ''}`} data-icon="payments">payments</span>
              {isExpanded && <span>Escrow Payouts</span>}
            </Link>
            <Link 
              to="/merchant/settings" 
              onMouseEnter={handleMouseEnter}
              onClick={() => setIsPinned(true)}
              className={`flex items-center ${isExpanded ? 'gap-3' : 'justify-center'} px-4 py-3 rounded-lg font-label-md transition-all whitespace-nowrap overflow-hidden ${isActive('/merchant/settings') ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'}`} 
              title={!isExpanded ? "Settings" : undefined}
            >
              <span className={`material-symbols-outlined ${isActive('/merchant/settings') ? 'active-nav-item' : ''}`} data-icon="settings">settings</span>
              {isExpanded && <span>Settings</span>}
            </Link>
          </nav>
          
          <button 
            onMouseEnter={handleMouseEnter}
            onClick={() => {
              setIsPinned(true);
              navigate("/merchant/products/new");
            }} 
            className={`mt-4 w-full bg-primary text-on-primary py-3 rounded-xl font-label-md flex items-center justify-center ${isExpanded ? 'gap-2' : ''} hover:opacity-90 transition-all whitespace-nowrap overflow-hidden active:scale-[0.98]`} 
            title={!isExpanded ? "Add New Product" : undefined}
          >
            <span className="material-symbols-outlined text-[20px]" data-icon="add">add</span>
            {isExpanded && <span>Add New Product</span>}
          </button>
          
          <div className="mt-auto pt-4 border-t border-outline-variant space-y-1 overflow-hidden">
            <Link 
              to="/merchant/support" 
              onMouseEnter={handleMouseEnter}
              onClick={() => setIsPinned(true)}
              className={`flex items-center ${isExpanded ? 'gap-3' : 'justify-center'} px-4 py-3 rounded-lg font-label-md transition-all whitespace-nowrap overflow-hidden ${isActive('/merchant/support') ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'}`} 
              title={!isExpanded ? "Support" : undefined}
            >
              <span className={`material-symbols-outlined ${isActive('/merchant/support') ? 'active-nav-item' : ''}`} data-icon="support_agent">support_agent</span>
              {isExpanded && <span>Support</span>}
            </Link>
            <button 
              onMouseEnter={handleMouseEnter}
              onClick={handleLogout} 
              className={`w-full flex items-center ${isExpanded ? 'gap-3' : 'justify-center'} px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg font-label-md transition-all whitespace-nowrap overflow-hidden`} 
              title={!isExpanded ? "Sign Out" : undefined}
            >
              <span className="material-symbols-outlined" data-icon="logout">logout</span>
              {isExpanded && <span>Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main 
          className="flex-1 bg-surface p-margin-desktop overflow-x-hidden relative"
          onClick={() => { setIsNotificationsOpen(false); setIsProfileOpen(false); }}
        >
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-surface-container-lowest dark:bg-on-surface border-t border-outline-variant dark:border-outline w-full py-unit mt-auto z-30">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop max-w-container-max mx-auto h-16">
          <div className="font-label-md text-label-md font-bold text-on-surface-variant">
            © 2024 TradeHub Merchant Hub.
          </div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="#" className="text-on-surface-variant hover:text-primary font-label-sm transition-colors">Terms of Service</Link>
            <Link to="#" className="text-on-surface-variant hover:text-primary font-label-sm transition-colors">Privacy Policy</Link>
            <Link to="/merchant/support" className="text-on-surface-variant hover:text-primary font-label-sm transition-colors">Seller Support</Link>
            <Link to="#" className="text-on-surface-variant hover:text-primary font-label-sm transition-colors">Escrow Rules</Link>
          </div>
        </div>
      </footer>

      {/* Mobile Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant h-16 flex items-center justify-around px-4 z-50">
        <Link to="/merchant" className={`flex flex-col items-center gap-1 ${isActive('/merchant') ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className={`material-symbols-outlined ${isActive('/merchant') ? 'active-nav-item' : ''}`} data-icon="dashboard">dashboard</span>
          <span className="text-[10px] font-label-sm">Home</span>
        </Link>
        <Link to="/merchant/inventory" className={`flex flex-col items-center gap-1 ${isActive('/merchant/inventory') ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className={`material-symbols-outlined ${isActive('/merchant/inventory') ? 'active-nav-item' : ''}`} data-icon="inventory_2">inventory_2</span>
          <span className="text-[10px] font-label-sm">Items</span>
        </Link>
        <button onClick={() => navigate("/merchant/products/new")} className="flex flex-col items-center gap-1 text-on-surface-variant">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white -mt-8 shadow-lg">
            <span className="material-symbols-outlined" data-icon="add">add</span>
          </div>
          <span className="text-[10px] font-label-sm">Sell</span>
        </button>
        <Link to="/merchant/escrow" className={`flex flex-col items-center gap-1 ${isActive('/merchant/escrow') ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className={`material-symbols-outlined ${isActive('/merchant/escrow') ? 'active-nav-item' : ''}`} data-icon="payments">payments</span>
          <span className="text-[10px] font-label-sm">Payouts</span>
        </Link>
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined" data-icon="logout">logout</span>
          <span className="text-[10px] font-label-sm">Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default MerchantLayout;
