import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const MerchantDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [alertsDismissed, setAlertsDismissed] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user?.id) return;
      try {
        const res = await api.get(`/products/vendor/${user.id}`);
        setProducts(res.data.products || res.data || []);
        setLastUpdated(new Date());
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [user]);

  // Compute smart alerts from real data
  const computedAlerts = React.useMemo(() => {
    if (alertsDismissed) return [];
    const alerts = [];
    if (!loading && products.length === 0) {
      alerts.push({ id: 'no-products', type: 'info', borderColor: 'border-l-primary', label: 'Getting Started', detail: 'No products yet — add your first product to begin selling.', badge: 'Action needed', badgeColor: 'text-primary' });
    }
    products.forEach((p) => {
      const stock = p.stockCount || p.stock_count || 0;
      if (stock === 0) {
        alerts.push({ id: `oos-${p.id}`, type: 'error', borderColor: 'border-l-error', label: 'Out of Stock', detail: `"${p.title}" has 0 units remaining. Restock immediately.`, badge: 'Critical', badgeColor: 'text-error' });
      } else if (stock <= 5) {
        alerts.push({ id: `low-${p.id}`, type: 'warning', borderColor: 'border-l-brand-gold', label: 'Low Stock Warning', detail: `"${p.title}" is running low with only ${stock} unit${stock !== 1 ? 's' : ''} left.`, badge: `${stock} left`, badgeColor: 'text-brand-gold' });
      }
    });
    if (!loading && products.length > 0) {
      alerts.push({ id: 'product-count', type: 'info', borderColor: 'border-l-tertiary', label: 'Inventory Summary', detail: `You have ${products.length} product${products.length !== 1 ? 's' : ''} listed in your store.`, badge: `${products.length} total`, badgeColor: 'text-tertiary' });
    }
    return alerts;
  }, [products, loading, alertsDismissed]);

  // Compute inventory health metric
  const inventoryMetric = React.useMemo(() => {
    if (products.length === 0) return { percentage: 0, label: 'No inventory data yet' };
    const totalStock = products.reduce((sum, p) => sum + (p.stockCount || p.stock_count || 0), 0);
    const inStockCount = products.filter(p => (p.stockCount || p.stock_count || 0) > 0).length;
    const healthPercent = Math.round((inStockCount / products.length) * 100);
    return { percentage: healthPercent, label: `${inStockCount} of ${products.length} products in stock (${totalStock} total units)` };
  }, [products]);

  return (
    <div className="max-w-container-max mx-auto space-y-gutter">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Command Center</h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-on-surface-variant font-body-md">Monitor your merchant operations across Ghana.</p>
            <span className="text-outline-variant">•</span>
            <p className="text-label-sm text-on-surface-variant font-label-sm uppercase tracking-widest mt-0.5">Last Updated: <span className="font-bold text-on-surface">{lastUpdated ? `Today, ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Loading...'}</span></p>
          </div>
        </div>
        <div className="flex items-center">
          <button onClick={() => navigate("/merchant/finances")} className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md flex items-center gap-2 hover:shadow-lg transition-soft active:scale-[0.98]">
            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            Financial Dashboard
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Left Column: Revenue & Actions (8 cols) */}
        <div className="lg:col-span-8 space-y-gutter">
          


          {/* Inventory Health */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-md text-label-md font-bold text-on-surface">Inventory Health</h3>
              <Link to="/merchant/inventory" className="text-primary font-label-sm hover:underline">View All Inventory</Link>
            </div>
            <div className="divide-y divide-outline-variant">
              {loading ? (
                <div className="px-6 py-4">Loading inventory...</div>
              ) : products.length === 0 ? (
                <div className="px-6 py-4 text-on-surface-variant">No products found. Add a product to get started!</div>
              ) : products.slice(0, 3).map((product) => (
                <div key={product.id} className="px-6 py-4 flex items-center justify-between hover:bg-surface-container transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-surface-variant overflow-hidden">
                      <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                        {product.title.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <p className="font-label-md text-on-surface group-hover:text-primary transition-colors">{product.title}</p>
                      <p className="text-label-sm text-on-surface-variant">Stock: {product.stockCount || product.stock_count} units</p>
                    </div>
                  </div>
                  <span className={(product.stockCount || product.stock_count) > 0 ? "bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-full text-label-sm" : "bg-error-container text-on-error-container px-3 py-1 rounded-full text-label-sm"}>
                    {(product.stockCount || product.stock_count) > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              ))}
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
              {computedAlerts.length > 0 && (
                <span className="ml-auto bg-primary/10 text-primary text-label-sm font-bold px-2 py-0.5 rounded-full">{computedAlerts.length}</span>
              )}
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="bg-white border border-outline-variant p-4 rounded-xl text-on-surface-variant text-label-sm">Analyzing your store data...</div>
              ) : computedAlerts.length === 0 ? (
                <div className="bg-white border border-outline-variant p-4 rounded-xl text-center">
                  <span className="material-symbols-outlined text-tertiary text-3xl mb-2" data-icon="check_circle">check_circle</span>
                  <p className="font-label-md text-on-surface font-bold">All Clear!</p>
                  <p className="text-label-sm text-on-surface-variant mt-1">No alerts at this time. Your store is running smoothly.</p>
                </div>
              ) : computedAlerts.map((alert) => (
                <div key={alert.id} className={`bg-white border border-outline-variant p-4 rounded-xl hover:shadow-md transition-soft cursor-pointer border-l-4 ${alert.borderColor}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-label-md text-on-surface font-bold">{alert.label}</span>
                    <span className={`text-label-sm font-bold ${alert.badgeColor}`}>{alert.badge}</span>
                  </div>
                  <p className="text-label-sm text-on-surface-variant">{alert.detail}</p>
                </div>
              ))}
            </div>
            
            {computedAlerts.length > 0 && (
              <button onClick={() => setAlertsDismissed(true)} className="w-full mt-6 py-2 text-primary font-label-md flex items-center justify-center gap-2 border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors">
                <span className="material-symbols-outlined text-[18px]" data-icon="done_all">done_all</span>
                Dismiss All
              </button>
            )}
          </section>

          {/* Inventory Health Metric */}
          <section className="bg-surface-container-highest border border-outline-variant rounded-2xl p-6">
            <h3 className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4">Inventory Health</h3>
            <div className="flex items-center gap-4">
              <div className={`text-4xl font-bold ${inventoryMetric.percentage >= 80 ? 'text-tertiary' : inventoryMetric.percentage >= 50 ? 'text-brand-gold' : 'text-error'}`}>{inventoryMetric.percentage}%</div>
              <p className="text-label-sm text-on-surface-variant">{inventoryMetric.label}</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;
