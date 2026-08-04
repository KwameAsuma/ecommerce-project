import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const resolveImageUrl = (url) => {
  const defaultPlaceholder = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80";
  if (!url) return defaultPlaceholder;
  const cleanUrl = typeof url === "string" ? url.split(",")[0].trim() : url;
  if (!cleanUrl) return defaultPlaceholder;

  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://") || cleanUrl.startsWith("blob:")) {
    return cleanUrl;
  }

  if (cleanUrl.startsWith("/uploads/")) {
    let baseUrl = "";
    if (import.meta.env.VITE_API_URL) {
      baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");
    } else if (api.defaults.baseURL && api.defaults.baseURL !== "/api" && api.defaults.baseURL !== "api") {
      baseUrl = api.defaults.baseURL.replace(/\/api\/?$/, "");
    } else if (typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5173") && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
      baseUrl = `http://${window.location.hostname}:5001`;
    }
    return `${baseUrl}${cleanUrl}`;
  }

  return cleanUrl;
};

const MerchantProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    stockCount: "",
    description: "",
    imageUrl: "",
  });

  // TASK 1: State to store both actual File objects and local preview URL strings
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Clean up object URLs on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      selectedFiles.forEach(item => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [selectedFiles]);

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const res = await api.get(`/products/${id}`);
          const product = res.data.product || res.data;
          setFormData({
            title: product.title || "",
            category: product.category || "",
            price: product.price ? String(product.price) : "",
            stockCount: product.stockCount || product.stock_count || "",
            description: product.description || "",
            imageUrl: product.imageUrl || "",
          });
        } catch (err) {
          console.error("Failed to fetch product", err);
          setError("Failed to load product details.");
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file selection and generate URL.createObjectURL local previews
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setError(null);
    const newPreviewItems = files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setSelectedFiles(prev => [...prev, ...newPreviewItems]);
  };

  const handleClearImages = () => {
    // Revoke URL object strings before clearing state
    selectedFiles.forEach(item => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setSelectedFiles([]);
    setFormData({ ...formData, imageUrl: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // 1. Upload newly selected File objects to backend storage
      let existingUrls = formData.imageUrl ? formData.imageUrl.split(',').map(u => u.trim()).filter(Boolean) : [];
      
      if (selectedFiles.length > 0) {
        for (const item of selectedFiles) {
          if (item.file.size > 20 * 1024 * 1024) {
            throw new Error(`Image "${item.file.name}" exceeds the 20MB file size limit.`);
          }
          const uploadData = new FormData();
          uploadData.append("image", item.file);

          const res = await api.post("/upload/image?type=products", uploadData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          if (res.data && res.data.status === "success") {
            // Store strictly relative URL string returned from backend
            existingUrls.push(res.data.imageUrl);
          }
        }
      }

      const finalImageUrlString = existingUrls.join(',');

      const payload = {
        title: formData.title,
        category: formData.category,
        price: parseFloat(formData.price),
        stockCount: parseInt(formData.stockCount, 10),
        description: formData.description,
        imageUrl: finalImageUrlString,
      };

      if (isEditMode) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post("/products", payload);
      }

      // Cleanup local preview blob URLs after successful submission
      selectedFiles.forEach(item => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      setSelectedFiles([]);

      navigate("/merchant/inventory");
    } catch (err) {
      console.error("Failed to save product", err);
      setError(err.response?.data?.error || err.message || "An error occurred while saving the product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#4343C7] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-base font-extrabold uppercase tracking-widest text-[#4343C7]">Loading Product Data...</p>
      </div>
    );
  }

  const inp = "w-full bg-slate-50/70 border border-slate-200 text-slate-900 px-4 py-3.5 rounded-2xl text-base font-bold focus:bg-white focus:border-[#4343C7] focus:ring-2 focus:ring-[#4343C7]/20 outline-none transition-all";
  const lbl = "block text-[14px] font-black text-slate-700 mb-2 uppercase tracking-wide";

  const hasAnyImages = selectedFiles.length > 0 || (formData.imageUrl && formData.imageUrl.trim() !== "");

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 font-sans space-y-8">
      
      {/* Top Title Banner */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => navigate(-1)} 
            className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-slate-700 shadow-xs flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 font-serif tracking-tight">
              {isEditMode ? "Edit Inventory Listing" : "Add New Store SKU"}
            </h1>
            <p className="text-slate-500 text-[15px] font-medium mt-1">
              {isEditMode ? "Modify pricing, inventory units, and multimedia assets below." : "List new merchandise directly into your verified BediDwa store repository."}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl font-extrabold text-[15px] flex items-center gap-3 shadow-sm animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-rose-600 text-[24px]">error</span>
          {error}
        </div>
      )}

      {/* ─── Apple Liquid Glass Image Studio ─── */}
      <div className="bg-white/80 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-8 shadow-[0_10px_40px_rgb(0,0,0,0.04)] space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 font-serif">Product Visuals & Multimedia Studio</h3>
            <p className="text-slate-500 text-sm mt-0.5">Select high-resolution photos below for immediate live browser preview before publishing.</p>
          </div>
          <span className="px-3.5 py-1.5 bg-[#4343C7]/10 text-[#4343C7] text-xs font-black rounded-full uppercase tracking-wider">
            Up to 20MB / Photo
          </span>
        </div>

        {/* Live Browser Preview Grid & Existing Saved Images */}
        <div className="flex overflow-x-auto whitespace-nowrap py-2 gap-5 min-h-[160px] items-center">
          {hasAnyImages ? (
            <>
              {/* 1. Display existing saved product URLs from database */}
              {formData.imageUrl && formData.imageUrl.split(',').map(u => u.trim()).filter(Boolean).map((url, idx) => (
                <div key={`saved-${idx}`} className="w-48 h-48 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 relative group shadow-md hover:shadow-xl transition-all">
                  <img src={resolveImageUrl(url)} alt={`Saved SKU Asset ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-3 left-3 bg-[#4343C7] text-[#D4F613] px-3 py-1 rounded-lg text-xs font-black shadow-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">verified</span> Server Saved
                  </div>
                </div>
              ))}

              {/* 2. Display live instant local preview URLs created via URL.createObjectURL(file) */}
              {selectedFiles.map((item, idx) => (
                <div key={`local-${idx}`} className="w-48 h-48 bg-slate-100 rounded-2xl border-2 border-[#4343C7] flex items-center justify-center overflow-hidden flex-shrink-0 relative group shadow-lg">
                  <img src={item.previewUrl} alt={`Local Live Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-[#D4F613] text-slate-900 px-3 py-1 rounded-lg text-xs font-black shadow-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">visibility</span> Live Preview
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="w-full py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 gap-2">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[32px] text-[#4343C7]">add_photo_alternate</span>
              </div>
              <p className="text-base font-bold text-slate-600">No photos selected or attached to this listing yet.</p>
              <p className="text-xs font-semibold text-slate-400">Select files below to preview instantly in your browser before publishing to server disk.</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-5 pt-2">
          <label className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-[15px] font-black uppercase tracking-wider cursor-pointer shadow-lg bg-[#4343C7] hover:bg-[#3232a8] text-white shadow-[#4343C7]/30 hover:scale-102 active:scale-98 border border-[#D4F613]/40 transition-all">
            <span className="material-symbols-outlined text-[24px] text-[#D4F613]">
              add_photo_alternate
            </span>
            Choose Image Files
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {hasAnyImages && (
            <button 
              type="button" 
              onClick={handleClearImages}
              className="px-6 py-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[14px] font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              Clear Images
            </button>
          )}
        </div>
      </div>

      {/* ─── Apple Liquid Glass Product Specs Container ─── */}
      <div className="bg-white/90 backdrop-blur-2xl border border-slate-200 shadow-[0_10px_40px_rgb(0,0,0,0.04)] rounded-3xl p-8 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className={lbl}>Product Title & Name *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Apple MacBook Pro M3 Max Studio Bundle"
                className={inp}
              />
            </div>
            <div className="space-y-2">
              <label className={lbl}>Catalog Department / Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className={inp}
              >
                <option value="">Select a merchandise department</option>
                <option value="Refurbished Electronics">Refurbished Electronics</option>
                <option value="Artisanal & Kente">Artisanal & Kente</option>
                <option value="Luxury Fashion">Luxury Fashion</option>
                <option value="Home & Studio">Home & Studio</option>
                <option value="Traditional Apparel">Traditional Apparel</option>
                <option value="General Marketplace">General Marketplace</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className={lbl}>Selling Price (GH₵) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">GH₵</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="24500.00"
                  className={`${inp} pl-16 font-mono text-lg font-black`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={lbl}>Initial Stock Unit Count *</label>
              <div className="relative">
                <input
                  type="number"
                  name="stockCount"
                  value={formData.stockCount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                  placeholder="50"
                  className={`${inp} pr-24 font-mono text-lg font-black`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Units Live</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className={lbl}>Full Product Description & Specifications</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              placeholder="Provide complete hardware specifications, craftsmanship details, dimensions, and warranty coverage..."
              className={`${inp} resize-y leading-relaxed text-base`}
            ></textarea>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end items-center gap-5">
            <button
              type="button"
              onClick={() => navigate("/merchant/inventory")}
              className="px-8 py-4 border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[15px] font-bold uppercase tracking-wider rounded-2xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-10 py-4 bg-[#4343C7] hover:bg-[#3232a8] text-white text-[15px] font-black uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-[#4343C7]/30 border border-[#D4F613]/50 hover:scale-102 active:scale-98 disabled:opacity-50 cursor-pointer flex items-center gap-2.5"
            >
              <span className="material-symbols-outlined text-[22px] text-[#D4F613]">verified</span>
              {saving ? "Publishing & Saving Photos..." : isEditMode ? "Update SKU Changes" : "Publish to Catalog"}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default MerchantProductForm;
