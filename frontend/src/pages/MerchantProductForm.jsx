import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

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

  const [imageUploading, setImageUploading] = useState(false);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        price: parseFloat(formData.price),
        stockCount: parseInt(formData.stockCount, 10),
        description: formData.description,
        imageUrl: formData.imageUrl,
      };

      if (isEditMode) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      
      navigate("/merchant/inventory");
    } catch (err) {
      console.error("Failed to save product", err);
      setError(err.response?.data?.error || "An error occurred while saving the product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-on-surface-variant">Loading product data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h2>
          <p className="text-on-surface-variant mt-1">
            {isEditMode ? "Update your product details below." : "Fill in the details to list a new item on the native store."}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg font-label-md">
          {error}
        </div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 mb-8">
        <h3 className="font-headline-sm text-on-surface font-bold mb-4">Product Image</h3>
        <div className="flex items-start gap-6">
          <div className="w-40 h-40 bg-surface-container-high rounded-xl border-2 border-dashed border-outline-variant flex items-center justify-center overflow-hidden flex-shrink-0">
            {formData.imageUrl ? (
              <img src={`http://localhost:5000${formData.imageUrl}`} alt="Product Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant/50">image</span>
            )}
          </div>
          <div className="space-y-4 flex-1">
            <p className="text-sm text-on-surface-variant">Upload a high-quality image of your product. Recommended size: 800x800px. Max size: 5MB.</p>
            <label className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold cursor-pointer transition-colors ${imageUploading ? "bg-surface-container border border-outline-variant text-on-surface-variant" : "bg-primary/10 text-primary hover:bg-primary/20"}`}>
              <span className="material-symbols-outlined text-[20px]">{imageUploading ? "hourglass_empty" : "upload"}</span>
              {imageUploading ? "Uploading..." : "Choose Image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={imageUploading}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setImageUploading(true);
                  setError(null);
                  
                  const reader = new FileReader();
                  reader.onloadend = async () => {
                    try {
                      const res = await api.post("/upload", { image: reader.result, folder: "products" });
                      if (res.data.status === "success") {
                        setFormData({ ...formData, imageUrl: res.data.url });
                      }
                    } catch (err) {
                      console.error(err);
                      setError("Failed to upload image. Image may be too large.");
                    } finally {
                      setImageUploading(false);
                    }
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-label-md font-bold text-on-surface">Product Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Kente Cloth"
                className="w-full bg-surface border border-outline-variant text-on-surface px-4 py-3 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-label-md font-bold text-on-surface">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-surface border border-outline-variant text-on-surface px-4 py-3 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              >
                <option value="">Select a category</option>
                <option value="Traditional Apparel">Traditional Apparel</option>
                <option value="Electronics">Electronics</option>
                <option value="Food & Beverages">Food & Beverages</option>
                <option value="Home Goods">Home Goods</option>
                <option value="Art & Crafts">Art & Crafts</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-label-md font-bold text-on-surface">Price (GHS) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full bg-surface border border-outline-variant text-on-surface px-4 py-3 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-label-md font-bold text-on-surface">Stock Count *</label>
              <input
                type="number"
                name="stockCount"
                value={formData.stockCount}
                onChange={handleChange}
                required
                min="0"
                step="1"
                placeholder="0"
                className="w-full bg-surface border border-outline-variant text-on-surface px-4 py-3 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-label-md font-bold text-on-surface">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              placeholder="Describe your product..."
              className="w-full bg-surface border border-outline-variant text-on-surface px-4 py-3 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-y"
            ></textarea>
          </div>

          <div className="pt-6 border-t border-outline-variant flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/merchant/inventory")}
              className="px-6 py-3 border border-outline-variant text-on-surface-variant font-bold rounded-xl hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : isEditMode ? "Update Product" : "Publish Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MerchantProductForm;
