import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const MerchantDashboard = () => {
  const [revenue, setRevenue] = useState(0);

  // Micro-interaction for Revenue Number animation
  useEffect(() => {
    let startTimestamp = null;
    const duration = 1500;
    const start = 0;
    const end = 42850;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      setRevenue(value);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    const timeout = setTimeout(() => {
      window.requestAnimationFrame(step);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="max-w-container-max mx-auto space-y-gutter">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Command Center</h2>
          <p className="text-on-surface-variant font-body-md mt-1">Monitor your merchant operations across Ghana.</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-label-sm text-on-surface-variant font-label-sm uppercase tracking-widest">Last Updated</p>
          <p className="font-label-md text-on-surface">Today, 10:42 AM</p>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Left Column: Revenue & Actions (8 cols) */}
        <div className="lg:col-span-8 space-y-gutter">
          
          {/* Revenue Pulse */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-[0.15em]">Revenue Pulse</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display-lg text-display-lg text-primary tabular-nums inline-block min-w-[200px] text-left">
                  ₵{revenue.toLocaleString()}.00
                </span>
                <span className="text-on-surface-variant font-body-md whitespace-nowrap">Available for Payout</span>
              </div>
            </div>
            <button onClick={() => alert("Withdrawal system coming soon!")} className="bg-secondary text-on-secondary px-8 py-4 rounded-xl font-label-md flex items-center gap-3 hover:shadow-lg transition-soft active:scale-[0.98]">
              <span className="material-symbols-outlined" data-icon="account_balance_wallet" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
              Withdraw to MoMo
            </button>
          </section>

          {/* Quick Actions Row */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => alert("Add Product system coming soon!")} className="group bg-surface-container-low border border-outline-variant hover:border-primary p-6 rounded-2xl flex flex-col items-center text-center gap-4 transition-soft">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary border border-outline-variant group-hover:bg-primary group-hover:text-white transition-soft">
                <span className="material-symbols-outlined text-[28px]" data-icon="add_circle">add_circle</span>
              </div>
              <span className="font-label-md text-on-surface">Add New Product</span>
            </button>
            <button onClick={() => alert("Auction system coming soon!")} className="group bg-surface-container-low border border-outline-variant hover:border-secondary p-6 rounded-2xl flex flex-col items-center text-center gap-4 transition-soft">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-secondary border border-outline-variant group-hover:bg-secondary group-hover:text-white transition-soft">
                <span className="material-symbols-outlined text-[28px]" data-icon="gavel">gavel</span>
              </div>
              <span className="font-label-md text-on-surface">Launch Auction</span>
            </button>
            <button onClick={() => alert("Escrow system coming soon!")} className="group bg-surface-container-low border border-outline-variant hover:border-tertiary p-6 rounded-2xl flex flex-col items-center text-center gap-4 transition-soft">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-tertiary border border-outline-variant group-hover:bg-tertiary group-hover:text-white transition-soft">
                <span className="material-symbols-outlined text-[28px]" data-icon="assignment_turned_in">assignment_turned_in</span>
              </div>
              <span className="font-label-md text-on-surface">Escrow Release</span>
            </button>
          </section>

          {/* Inventory Health */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-md text-label-md font-bold text-on-surface">Inventory Health</h3>
              <Link to="/merchant/inventory" className="text-primary font-label-sm hover:underline">View All Inventory</Link>
            </div>
            <div className="divide-y divide-outline-variant">
              
              <div className="px-6 py-4 flex items-center justify-between hover:bg-surface-container transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-variant overflow-hidden">
                    <img className="w-full h-full object-cover" alt="Premium Leather Briefcase" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5DxPVuCKPFu0qtKTmQ0B0rXzdN2Ow0XdJ4oDihHL8BPClVfZgN-Mz__C9K_T9vju5PaoAcFpTjKp0dKsxZobRuhfMXNi5GAQUG2QpCLNgOyR0voENku0rIZrzIeYyCsN_e1eRYvpSNBcrMfTKJkMl2_Gy9aKxrneRzHAe347rgJc6W94udzktznyw_AgtvSbZE4Z0VuoAGMRJCpE3LoPIN_WRf2VWr_tIvAHrRD1uaMkuAYNEc8XH5ludqP0ro_rTcCqMVdMSQjw"/>
                  </div>
                  <div>
                    <p className="font-label-md text-on-surface group-hover:text-primary transition-colors">Premium Leather Briefcase</p>
                    <p className="text-label-sm text-on-surface-variant">Stock: 24 units</p>
                  </div>
                </div>
                <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-full text-label-sm">In Stock</span>
              </div>

              <div className="px-6 py-4 flex items-center justify-between hover:bg-surface-container transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-variant overflow-hidden">
                    <img className="w-full h-full object-cover" alt="Organic Shea Butter" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBovg_RZCTEWcFx8oeR4OxGSXzTwTN0FhVLYo22wn8w5-rP6GVKmB53NDLZRbydQ7TV7KGBC6VkoNcXGlulB9brmqaFDJJOxU3PouIJM0swZFdSvu-h4IbcgXdQ8R3p9g95drKxYxngdROcPREqmK8nKNtnOEcFOhkSAntVp2qLc5DKGP50fI2hO2k1_EFC9Dt6D8jsgkLHJ_X7-YeU9MFW9pxjx_Jaz-_Gb5aIGxVWkhBLTgZ442q7SJFOztpA9KgdYpsnBRELj58"/>
                  </div>
                  <div>
                    <p className="font-label-md text-on-surface group-hover:text-primary transition-colors">Organic Shea Butter (500g)</p>
                    <p className="text-label-sm text-on-surface-variant">Last bid: ₵120.00</p>
                  </div>
                </div>
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-sm">Auction Live</span>
              </div>

              <div className="px-6 py-4 flex items-center justify-between hover:bg-surface-container transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-variant overflow-hidden">
                    <img className="w-full h-full object-cover" alt="Hand-woven Kente Strip" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZjgjmdSVgIPF_1GJOSmaOd8rBe6yiYIZieQa-C5q_Ba540xoCRTJwH5lK-rat9PINLzHb3_x_gPh9tN9d_qaTrIaamecHlL9Qewyo6dlUtPmHamqCjKdbgs0S9lu7bA3RE8GJyIx0QJCb-skJV54VfGE-cSs5uwYl_Z0HPYWz93iCBB2asAbcM16UBAq8zJnhH-CoJ1GOmoo3vtXZHfBnC9fTdqVWqb_SKar1fPGr_OVS4nQXBHnQbXKfh5TRpAdd5-WShwt-WmE"/>
                  </div>
                  <div>
                    <p className="font-label-md text-on-surface group-hover:text-primary transition-colors">Hand-woven Kente Strip</p>
                    <p className="text-label-sm text-on-surface-variant">ETA: Tomorrow</p>
                  </div>
                </div>
                <span className="bg-surface-dim text-on-surface-variant px-3 py-1 rounded-full text-label-sm">In Transit</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Smart Alerts & Tasks (4 cols) */}
        <div className="lg:col-span-4 space-y-gutter">
          
          {/* Smart Alerts */}
          <section className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 h-fit sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary" data-icon="auto_awesome">auto_awesome</span>
              <h3 className="font-headline-md text-label-md font-bold text-on-surface">Smart Alerts</h3>
            </div>
            <div className="space-y-4">
              
              <div className="bg-white border border-outline-variant p-4 rounded-xl hover:shadow-md transition-soft cursor-pointer border-l-4 border-l-error">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-label-md text-on-surface font-bold">Auction ending soon</span>
                  <span className="text-label-sm text-error font-bold">12m left</span>
                </div>
                <p className="text-label-sm text-on-surface-variant">Gold Coast Pendant auction is reaching its peak. Monitor bids.</p>
              </div>

              <div className="bg-white border border-outline-variant p-4 rounded-xl hover:shadow-md transition-soft cursor-pointer border-l-4 border-l-primary">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-label-md text-on-surface font-bold">Shipments pending</span>
                  <span className="text-label-sm text-primary font-bold">2 items</span>
                </div>
                <p className="text-label-sm text-on-surface-variant">Verify pick-up for Order #GH-9021 and #GH-8842.</p>
              </div>

              {/* Progress Task */}
              <div className="bg-white border border-outline-variant p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-label-md text-on-surface font-bold">Store Rating Goal</span>
                  <span className="text-label-sm text-on-surface-variant">4.8/5.0</span>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-secondary" style={{ width: "85%" }}></div>
                </div>
                <p className="text-label-sm text-on-surface-variant">Complete 5 more verified deliveries to reach 4.9 stars.</p>
              </div>
            </div>
            
            <button onClick={() => alert("Dismissing alerts...")} className="w-full mt-6 py-2 text-primary font-label-md flex items-center justify-center gap-2 border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors">
              <span className="material-symbols-outlined text-[18px]" data-icon="done_all">done_all</span>
              Dismiss All
            </button>
          </section>

          {/* Market Insight Simple */}
          <section className="bg-surface-container-highest border border-outline-variant rounded-2xl p-6">
            <h3 className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4">Market Trend</h3>
            <div className="flex items-center gap-4">
              <div className="text-display-lg text-tertiary-container font-bold">+12%</div>
              <p className="text-label-sm text-on-surface-variant">Increase in demand for <span className="font-bold text-on-surface">Handcrafted Textiles</span> this week.</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;
