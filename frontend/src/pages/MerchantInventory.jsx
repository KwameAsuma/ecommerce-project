import React from "react";

const mockInventory = [
  {
    id: "KEN-GLD-001",
    name: "Premium Handwoven Kente",
    category: "Traditional Apparel",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZjgjmdSVgIPF_1GJOSmaOd8rBe6yiYIZieQa-C5q_Ba540xoCRTJwH5lK-rat9PINLzHb3_x_gPh9tN9d_qaTrIaamecHlL9Qewyo6dlUtPmHamqCjKdbgs0S9lu7bA3RE8GJyIx0QJCb-skJV54VfGE-cSs5uwYl_Z0HPYWz93iCBB2asAbcM16UBAq8zJnhH-CoJ1GOmoo3vtXZHfBnC9fTdqVWqb_SKar1fPGr_OVS4nQXBHnQbXKfh5TRpAdd5-WShwt-WmE",
    catalogType: "Native Store",
    stockUnits: 24,
    stockStatus: "HEALTHY",
    price: 1450.00,
    priceLabel: "Fixed Price",
    status: "Active",
    statusColor: "bg-tertiary",
  },
  {
    id: "ELC-MAC-M1-S",
    name: "Refurbished MacBook Pro M1",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=200",
    catalogType: "Auction Engine",
    stockUnits: 1,
    stockStatus: "AUCTION LIVE",
    price: 12500.00,
    priceLabel: "8 Bids Placed",
    status: "Live",
    statusColor: "bg-secondary",
  },
  {
    id: "HLT-SHB-ORG",
    name: "Organic Shea Butter",
    category: "Beauty & Health",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBovg_RZCTEWcFx8oeR4OxGSXzTwTN0FhVLYo22wn8w5-rP6GVKmB53NDLZRbydQ7TV7KGBC6VkoNcXGlulB9brmqaFDJJOxU3PouIJM0swZFdSvu-h4IbcgXdQ8R3p9g95drKxYxngdROcPREqmK8nKNtnOEcFOhkSAntVp2qLc5DKGP50fI2hO2k1_EFC9Dt6D8jsgkLHJ_X7-YeU9MFW9pxjx_Jaz-_Gb5aIGxVWkhBLTgZ442q7SJFOztpA9KgdYpsnBRELj58",
    catalogType: "Native Store",
    stockUnits: 5,
    stockStatus: "LOW STOCK",
    price: 120.00,
    priceLabel: "Restock Suggested",
    status: "Listed",
    statusColor: "bg-outline",
  },
  {
    id: "FTW-SND-LTH",
    name: "Artisan Leather Sandals",
    category: "Footwear",
    image: "https://images.unsplash.com/photo-1562183241-b937e95585b6?auto=format&fit=crop&q=80&w=200",
    catalogType: "Native Store",
    stockUnits: 0,
    stockStatus: "OUT OF STOCK",
    price: 350.00,
    priceLabel: "Unavailable",
    status: "Paused",
    statusColor: "bg-error",
  }
];

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
  return (
    <div className="max-w-container-max mx-auto space-y-gutter">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Inventory & Stock Management</h2>
          <p className="text-on-surface-variant font-body-md mt-1">Real-time overview of your product ecosystem across native and auction channels.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => alert("Downloading CSV...")} className="bg-surface border border-outline-variant text-on-surface px-6 py-3 rounded-xl font-label-md flex items-center gap-2 hover:bg-surface-container transition-soft active:scale-[0.98]">
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
          
          <select className="bg-surface border border-outline-variant text-on-surface text-label-md px-4 py-2 rounded-full appearance-none outline-none focus:border-primary pr-8 relative cursor-pointer hover:bg-surface-container transition-colors">
            <option>Category: All</option>
            <option>Traditional Apparel</option>
            <option>Electronics</option>
          </select>
          
          <select className="bg-surface border border-outline-variant text-on-surface text-label-md px-4 py-2 rounded-full appearance-none outline-none focus:border-primary pr-8 relative cursor-pointer hover:bg-surface-container transition-colors">
            <option>Status: Live/Auction</option>
            <option>Active</option>
            <option>Paused</option>
          </select>

          <select className="bg-surface border border-outline-variant text-on-surface text-label-md px-4 py-2 rounded-full appearance-none outline-none focus:border-primary pr-8 relative cursor-pointer hover:bg-surface-container transition-colors">
            <option>Stock: Any</option>
            <option>In Stock</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </select>

          <select className="bg-surface border border-outline-variant text-on-surface text-label-md px-4 py-2 rounded-full appearance-none outline-none focus:border-primary pr-8 relative cursor-pointer hover:bg-surface-container transition-colors">
            <option>Price Range</option>
            <option>Under ₵500</option>
            <option>₵500 - ₵5000</option>
            <option>Over ₵5000</option>
          </select>

          <div className="w-px h-6 bg-outline-variant mx-2 hidden md:block"></div>
          <button onClick={() => alert("Filters cleared!")} className="text-primary text-label-md font-medium hover:underline px-2">Clear all filters</button>
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
              {mockInventory.map((item, index) => (
                <tr key={index} className="hover:bg-surface-container-low transition-colors group">
                  <td className="p-4">
                    <input type="checkbox" className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"/>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-surface-variant overflow-hidden border border-outline-variant flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-label-md font-bold text-on-surface group-hover:text-primary transition-colors cursor-pointer">{item.name}</p>
                        <p className="text-[12px] text-on-surface-variant mt-0.5">{item.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-body-md text-on-surface-variant tracking-wider text-sm">{item.id}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant" data-icon={item.catalogType === 'Native Store' ? 'storefront' : 'gavel'}>
                        {item.catalogType === 'Native Store' ? 'storefront' : 'gavel'}
                      </span>
                      <span className="font-body-md text-on-surface">{item.catalogType}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-label-md font-bold text-on-surface">{item.stockUnits} {item.stockUnits === 1 ? 'Unit' : 'Units'}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStockBadgeClasses(item.stockStatus)}`}>
                        {item.stockStatus}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-label-md font-bold text-on-surface">GHS {item.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      <span className="text-[12px] text-on-surface-variant mt-0.5">{item.priceLabel}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.statusColor}`}></div>
                      <span className="font-body-md text-on-surface">{item.status}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => alert("Opening item actions menu...")} className="text-on-surface-variant hover:text-primary p-2 transition-colors rounded-full hover:bg-surface-container">
                      <span className="material-symbols-outlined text-[20px]" data-icon="more_horiz">more_horiz</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-low">
          <span className="text-label-md text-on-surface-variant">Showing 1 to 4 of 128 products</span>
          <div className="flex items-center gap-1">
            <button onClick={() => alert("Previous page")} className="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-variant disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-[18px]" data-icon="chevron_left">chevron_left</span>
            </button>
            <button onClick={() => alert("Page 1")} className="w-8 h-8 flex items-center justify-center rounded bg-primary text-on-primary font-label-md font-bold">1</button>
            <button onClick={() => alert("Page 2")} className="w-8 h-8 flex items-center justify-center rounded text-on-surface hover:bg-surface-variant font-label-md">2</button>
            <button onClick={() => alert("Page 3")} className="w-8 h-8 flex items-center justify-center rounded text-on-surface hover:bg-surface-variant font-label-md">3</button>
            <span className="w-8 h-8 flex items-center justify-center text-on-surface-variant">...</span>
            <button onClick={() => alert("Page 32")} className="w-8 h-8 flex items-center justify-center rounded text-on-surface hover:bg-surface-variant font-label-md">32</button>
            <button onClick={() => alert("Next page")} className="w-8 h-8 flex items-center justify-center rounded text-on-surface hover:bg-surface-variant">
              <span className="material-symbols-outlined text-[18px]" data-icon="chevron_right">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantInventory;
