import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const getStockBadgeClasses = (status) => {
  switch (status) {
    case "HEALTHY":
      return "bg-tertiary-fixed text-on-tertiary-fixed-variant";
    case "AUCTION LIVE":
      return "bg-secondary-container text-on-secondary-container";
    case "LOW STOCK":
      return "bg-error-container text-on-error-container";
    case "OUT OF STOCK":
      return "bg-error text-on-error";
    default:
      return "bg-surface-variant text-on-surface-variant";
  }
};

const MerchantInventory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user?.id) return;
      try {
        const res = await api.get(`/products/vendor/${user.id}`);
        setProducts(res.data.products || res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [user]);

  // Derive unique categories from products
  const categories = React.useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    return cats.sort();
  }, [products]);

  // Apply filters
  const filteredProducts = React.useMemo(() => {
    let result = products;
    if (categoryFilter) {
      result = result.filter(p => p.category === categoryFilter);
    }
    if (stockFilter) {
      result = result.filter(p => {
        const stock = p.stockCount || p.stock_count || 0;
        switch (stockFilter) {
          case 'in-stock': return stock > 5;
          case 'low-stock': return stock > 0 && stock <= 5;
          case 'out-of-stock': return stock === 0;
          default: return true;
        }
      });
    }
    return result;
  }, [products, categoryFilter, stockFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const showingFrom = filteredProducts.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const showingTo = Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, stockFilter]);

  const clearFilters = () => {
    setCategoryFilter("");
    setStockFilter("");
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = ["SKU/ID", "Title", "Category", "Price", "Stock Level", "Status"];
    const csvData = filteredProducts.map(p => {
      const stock = p.stockCount || p.stock_count || 0;
      const status = stock > 0 ? "IN STOCK" : "OUT OF STOCK";
      return [
        `PROD-${p.id}`,
        `"${p.title.replace(/"/g, '""')}"`,
        p.category || "Uncategorized",
        p.price,
        stock,
        status
      ].join(",");
    });
    const csvString = [headers.join(","), ...csvData].join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch(e) {
      console.error("Failed to delete", e);
      alert("Failed to delete product.");
    }
  };

  return (
    <div className="max-w-container-max mx-auto space-y-gutter">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Inventory & Stock Management</h2>
          <p className="text-on-surface-variant font-body-md mt-1">Real-time overview of your product ecosystem across native and auction channels.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportCSV} className="bg-surface border border-outline-variant text-on-surface px-6 py-3 rounded-xl font-label-md flex items-center gap-2 hover:bg-surface-container transition-soft active:scale-[0.98]">
            <span className="material-symbols-outlined text-[20px]" data-icon="download">download</span>
            Export CSV
          </button>
          <button onClick={() => alert("Syncing with auction engine...")} className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md flex items-center gap-2 hover:bg-primary/90 transition-soft active:scale-[0.98]">
            <span className="material-symbols-outlined text-[20px]" data-icon="sync">sync</span>
            Sync Channels
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 mr-2">
            <span className="material-symbols-outlined text-on-surface-variant" data-icon="filter_list">filter_list</span>
            <span className="font-label-md text-on-surface-variant font-medium">Filters:</span>
          </div>
          
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-surface border border-outline-variant text-on-surface text-label-md px-4 py-2 rounded-full appearance-none outline-none focus:border-primary pr-8 relative cursor-pointer hover:bg-surface-container transition-colors">
            <option value="">Category: All</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <select className="bg-surface border border-outline-variant text-on-surface text-label-md px-4 py-2 rounded-full appearance-none outline-none focus:border-primary pr-8 relative cursor-pointer hover:bg-surface-container transition-colors">
            <option>Status: Live/Auction</option>
            <option>Active</option>
            <option>Paused</option>
          </select>

          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="bg-surface border border-outline-variant text-on-surface text-label-md px-4 py-2 rounded-full appearance-none outline-none focus:border-primary pr-8 relative cursor-pointer hover:bg-surface-container transition-colors">
            <option value="">Stock: Any</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>

          <select className="bg-surface border border-outline-variant text-on-surface text-label-md px-4 py-2 rounded-full appearance-none outline-none focus:border-primary pr-8 relative cursor-pointer hover:bg-surface-container transition-colors">
            <option>Price Range</option>
            <option>Under ₵500</option>
            <option>₵500 - ₵5000</option>
            <option>Over ₵5000</option>
          </select>

          <div className="w-px h-6 bg-outline-variant mx-2 hidden md:block"></div>
          <button onClick={clearFilters} className="text-primary text-label-md font-medium hover:underline px-2">Clear all filters</button>
        </div>

        <div className="flex items-center bg-surface-container-low border border-outline-variant rounded-lg p-1">
          <button onClick={() => alert("Switched to List View")} className="bg-white shadow-sm rounded-md p-1.5 text-on-surface flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]" data-icon="list">list</span>
          </button>
          <button onClick={() => alert("Switched to Grid View")} className="p-1.5 text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-[20px]" data-icon="grid_view">grid_view</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="p-4 w-12"><input type="checkbox" className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"/></th>
                <th className="p-4 font-label-md text-on-surface font-bold">Product Details</th>
                <th className="p-4 font-label-md text-on-surface font-bold">SKU/ID</th>
                <th className="p-4 font-label-md text-on-surface font-bold">Catalog Type</th>
                <th className="p-4 font-label-md text-on-surface font-bold">Stock Level</th>
                <th className="p-4 font-label-md text-on-surface font-bold">Price/Bid</th>
                <th className="p-4 font-label-md text-on-surface font-bold">Status</th>
                <th className="p-4 font-label-md text-on-surface font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr><td colSpan="8" className="p-4 text-center">Loading inventory...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="8" className="p-4 text-center text-on-surface-variant">{products.length === 0 ? 'No products found.' : 'No products match the selected filters.'}</td></tr>
              ) : paginatedProducts.map((item, index) => (
                <tr key={item.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="p-4">
                    <input type="checkbox" className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"/>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-surface-variant overflow-hidden border border-outline-variant flex-shrink-0 flex items-center justify-center text-primary font-bold text-lg">
                        {item.title.charAt(0)}
                      </div>
                      <div>
                        <p className="font-label-md font-bold text-on-surface group-hover:text-primary transition-colors cursor-pointer">{item.title}</p>
                        <p className="text-[12px] text-on-surface-variant mt-0.5">{item.category || "Uncategorized"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-body-md text-on-surface-variant tracking-wider text-sm">PROD-{item.id}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant" data-icon={'storefront'}>
                        storefront
                      </span>
                      <span className="font-body-md text-on-surface">Native Store</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-label-md font-bold text-on-surface">{item.stockCount || item.stock_count} Units</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${(item.stockCount || item.stock_count) > 0 ? getStockBadgeClasses('HEALTHY') : getStockBadgeClasses('OUT OF STOCK')}`}>
                        {(item.stockCount || item.stock_count) > 0 ? "IN STOCK" : "OUT OF STOCK"}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-label-md font-bold text-on-surface">GHS {parseFloat(item.price).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      <span className="text-[12px] text-on-surface-variant mt-0.5">Fixed Price</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-tertiary`}></div>
                      <span className="font-body-md text-on-surface">Active</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => navigate(`/merchant/products/${item.id}/edit`)} className="text-on-surface-variant hover:text-primary p-2 transition-colors rounded-full hover:bg-surface-container" title="Edit Product">
                        <span className="material-symbols-outlined text-[20px]" data-icon="edit">edit</span>
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-error hover:text-error/80 p-2 transition-colors rounded-full hover:bg-error-container/20" title="Delete Product">
                        <span className="material-symbols-outlined text-[20px]" data-icon="delete">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-low">
          <span className="text-label-md text-on-surface-variant">Showing {showingFrom} to {showingTo} of {filteredProducts.length} products</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-variant disabled:opacity-50" disabled={currentPage === 1}>
              <span className="material-symbols-outlined text-[18px]" data-icon="chevron_left">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-8 h-8 flex items-center justify-center rounded font-label-md ${currentPage === pageNum ? 'bg-primary text-on-primary font-bold' : 'text-on-surface hover:bg-surface-variant'}`}>{pageNum}</button>
              );
            })}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="w-8 h-8 flex items-center justify-center text-on-surface-variant">...</span>
                <button onClick={() => setCurrentPage(totalPages)} className="w-8 h-8 flex items-center justify-center rounded text-on-surface hover:bg-surface-variant font-label-md">{totalPages}</button>
              </>
            )}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="w-8 h-8 flex items-center justify-center rounded text-on-surface hover:bg-surface-variant disabled:opacity-50" disabled={currentPage === totalPages}>
              <span className="material-symbols-outlined text-[18px]" data-icon="chevron_right">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantInventory;
