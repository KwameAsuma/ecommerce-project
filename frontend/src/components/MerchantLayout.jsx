import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MerchantLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bg-surface text-on-surface font-body-md selection:bg-secondary-container min-h-screen flex flex-col relative">
      {/* TopNavBar */}
      <header className="bg-surface dark:bg-inverse-surface border-b border-outline-variant dark:border-outline w-full h-16 flex justify-between items-center px-margin-desktop sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <h1 
            className="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary tracking-tight cursor-pointer flex items-baseline gap-2"
            onClick={() => navigate("/merchant")}
          >
            TradeHub <span className="text-sm font-normal text-tertiary">Merchant Platform</span>
          </h1>
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
              <img className="w-full h-full object-cover pointer-events-none" alt="Merchant Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3AOsAwVf70-xfL5RCHMYkfZppwGZAbk2w6VZyK1YPCESu__EsNQ0JiTM6ErG2-kMxLvPGum25T9KtJ181_RTJD991kF-ELx8L-qhDcH5IIpPitzx0RmnlSgDnAYdIsAMWGTPlWDa5LGx3WcIbCML8Eafq_dzZTcwcI1pIk27apY1BK8cs1gWFdgk1i4Si6IPujoPDU8t_HShbA5mW3fpjAPvxH1y8V-Tbbj5dpia0JZodNmBWNqQHKEAo73BEfAdc8c-8wzBvXZ8"/>
            </div>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute top-12 right-0 w-48 bg-surface-container-lowest border border-outline-variant shadow-lg rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-outline-variant">
                  <p className="font-bold text-label-md text-on-surface">Ghana Merchant</p>
                  <p className="text-label-sm text-on-surface-variant">seller@tradehub.com</p>
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
        <aside className="hidden md:flex flex-col h-[calc(100vh-64px)] w-[280px] bg-surface-container-low dark:bg-inverse-surface border-r border-outline-variant dark:border-outline p-4 sticky top-16 z-30">
          <div className="mb-8 px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center text-on-secondary font-bold font-headline-md">GM</div>
              <div>
                <p className="font-headline-md text-label-md font-extrabold text-on-surface">Ghana Merchant</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Verified Seller</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 space-y-1">
            <Link to="/merchant" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-all ${isActive('/merchant') ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
              <span className={`material-symbols-outlined ${isActive('/merchant') ? 'active-nav-item' : ''}`} data-icon="dashboard">dashboard</span>
              Command Center
            </Link>
            <Link to="/merchant/inventory" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-all ${isActive('/merchant/inventory') ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
              <span className={`material-symbols-outlined ${isActive('/merchant/inventory') ? 'active-nav-item' : ''}`} data-icon="inventory_2">inventory_2</span>
              Inventory
            </Link>
            <Link to="/merchant/auctions" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-all ${isActive('/merchant/auctions') ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
              <span className={`material-symbols-outlined ${isActive('/merchant/auctions') ? 'active-nav-item' : ''}`} data-icon="gavel">gavel</span>
              Auctions
            </Link>
            <Link to="/merchant/escrow" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-all ${isActive('/merchant/escrow') ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
              <span className={`material-symbols-outlined ${isActive('/merchant/escrow') ? 'active-nav-item' : ''}`} data-icon="payments">payments</span>
              Escrow Payouts
            </Link>
            <Link to="/merchant/settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-all ${isActive('/merchant/settings') ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
              <span className={`material-symbols-outlined ${isActive('/merchant/settings') ? 'active-nav-item' : ''}`} data-icon="settings">settings</span>
              Settings
            </Link>
          </nav>
          
          <button onClick={() => setIsAddProductOpen(true)} className="mt-4 w-full bg-primary text-on-primary py-3 rounded-xl font-label-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]">
            <span className="material-symbols-outlined text-[20px]" data-icon="add">add</span>
            Add New Product
          </button>
          
          <div className="mt-auto pt-4 border-t border-outline-variant space-y-1">
            <Link to="/merchant/support" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-all ${isActive('/merchant/support') ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
              <span className={`material-symbols-outlined ${isActive('/merchant/support') ? 'active-nav-item' : ''}`} data-icon="support_agent">support_agent</span>
              Support
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg font-label-md transition-all">
              <span className="material-symbols-outlined" data-icon="logout">logout</span>
              Sign Out
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
        <button onClick={() => setIsAddProductOpen(true)} className="flex flex-col items-center gap-1 text-on-surface-variant">
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

      {/* Add New Product Modal Overlay */}
      {isAddProductOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container">
              <h2 className="font-headline-md font-bold text-on-surface">Add New Product</h2>
              <button onClick={() => setIsAddProductOpen(false)} className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error-container">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center text-primary mb-4 border border-outline-variant">
                <span className="material-symbols-outlined text-[40px]">inventory_2</span>
              </div>
              <h3 className="font-label-md font-bold text-on-surface text-lg">Product Creation Wizard</h3>
              <p className="text-on-surface-variant text-center max-w-sm mt-2 font-body-md">
                This guided wizard will help you list a new item on the native store or launch it into the auction engine.
              </p>
              <div className="mt-6 px-6 py-3 bg-surface-variant text-on-surface-variant rounded-lg font-label-md">
                Form implementation coming soon
              </div>
            </div>
            <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-low flex justify-end gap-3">
              <button onClick={() => setIsAddProductOpen(false)} className="px-6 py-2 border border-outline-variant rounded-lg font-label-md text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
              <button disabled className="px-6 py-2 bg-primary/50 text-on-primary rounded-lg font-label-md cursor-not-allowed">Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantLayout;
