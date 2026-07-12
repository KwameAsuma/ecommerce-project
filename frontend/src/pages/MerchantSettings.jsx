import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const MerchantSettings = () => {
  const { user, setUser } = useAuth();

  // Profile settings
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [momoNumber, setMomoNumber] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [returnPolicy, setReturnPolicy] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [storeBannerUrl, setStoreBannerUrl] = useState("");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [bidAlerts, setBidAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [lowStockWarnings, setLowStockWarnings] = useState(true);
  const [dailySalesDigest, setDailySalesDigest] = useState(false);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (user) {
      setStoreName(user.name || "");
      setStoreDescription(user.storeDescription || "");
      setPhone(user.phone || "");
      setMomoNumber(user.momoNumber || "");
      setSupportEmail(user.supportEmail || "");
      setSupportPhone(user.supportPhone || "");
      setStoreAddress(user.storeAddress || "");
      setTaxId(user.taxId || "");
      setReturnPolicy(user.returnPolicy || "");
      setAvatarUrl(user.avatarUrl || "");
      setStoreBannerUrl(user.storeBannerUrl || "");

      if (typeof user.emailNotifications === "boolean") setEmailNotifications(user.emailNotifications);
      if (typeof user.orderUpdates === "boolean") setOrderAlerts(user.orderUpdates);
      if (typeof user.bidAlerts === "boolean") setBidAlerts(user.bidAlerts);
      if (typeof user.marketingEmails === "boolean") setMarketingEmails(user.marketingEmails);
      if (typeof user.lowStockWarnings === "boolean") setLowStockWarnings(user.lowStockWarnings);
      if (typeof user.dailySalesDigest === "boolean") setDailySalesDigest(user.dailySalesDigest);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const payload = {
        name: storeName,
        storeDescription,
        phone,
        momoNumber,
        supportEmail,
        supportPhone,
        storeAddress,
        taxId,
        returnPolicy,
        avatarUrl,
        storeBannerUrl
      };
      const res = await api.patch("/users/profile", payload);
      if (res.data.status === "success") {
        setUser(res.data.user);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error("Failed to save profile:", e);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleNotification = async (key, value, setter) => {
    setter(value);
    try {
      // Re-map orderAlerts to orderUpdates to match schema
      const payloadKey = key === "orderAlerts" ? "orderUpdates" : key;
      const res = await api.patch("/users/profile", { [payloadKey]: value });
      if (res.data.status === "success") {
        setUser(res.data.user);
      }
    } catch (e) {
      console.error("Failed to save preference:", e);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword) return;
    
    try {
      await api.patch("/auth/password", { currentPassword, newPassword });
      alert("Password updated successfully!");
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update password");
    }
  };

  const tabs = [
    { id: "profile", label: "Store Profile", icon: "storefront" },
    { id: "notifications", label: "Notifications", icon: "notifications" },
    { id: "security", label: "Security", icon: "shield" },
  ];

  return (
    <div className="max-w-container-max mx-auto space-y-gutter">
      {/* Page Header */}
      <div>
        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Store Settings</h2>
        <p className="text-on-surface-variant font-body-md mt-1">Manage your merchant profile, notification preferences, and account security.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 text-left font-label-md font-medium transition-all border-b border-outline-variant last:border-b-0 ${activeTab === tab.id ? "bg-primary/5 text-primary font-bold" : "text-on-surface-variant hover:bg-surface-container-low"}`}
              >
                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-on-surface mb-1">Store Profile</h3>
                <p className="text-on-surface-variant text-sm">This information will be displayed on your public merchant profile.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 border-b border-outline-variant pb-6">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Store Avatar / Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-surface-container-high border-2 border-outline-variant flex items-center justify-center overflow-hidden flex-shrink-0">
                      {avatarUrl ? (
                        <img src={`http://localhost:5000${avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-primary">{storeName ? storeName.charAt(0) : "S"}</span>
                      )}
                    </div>
                    <label className="px-4 py-2 bg-surface-container rounded-lg text-sm font-bold cursor-pointer hover:bg-surface-container-high transition-colors">
                      Upload Avatar
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onloadend = async () => {
                          const res = await api.post("/upload", { image: reader.result, folder: "profiles" });
                          if (res.data.status === "success") setAvatarUrl(res.data.url);
                        };
                        reader.readAsDataURL(file);
                      }} />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Store Banner</label>
                  <div className="flex flex-col gap-3">
                    <div className="w-full h-20 rounded-xl bg-surface-container-high border-2 border-outline-variant flex items-center justify-center overflow-hidden flex-shrink-0">
                      {storeBannerUrl ? (
                        <img src={`http://localhost:5000${storeBannerUrl}`} alt="Banner" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-on-surface-variant/50">panorama</span>
                      )}
                    </div>
                    <label className="w-max px-4 py-2 bg-surface-container rounded-lg text-sm font-bold cursor-pointer hover:bg-surface-container-high transition-colors">
                      Upload Banner
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onloadend = async () => {
                          const res = await api.post("/upload", { image: reader.result, folder: "profiles" });
                          if (res.data.status === "success") setStoreBannerUrl(res.data.url);
                        };
                        reader.readAsDataURL(file);
                      }} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Store / Business Name</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface text-sm"
                    placeholder="Your store name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 outline-none text-on-surface-variant text-sm bg-surface-container-low cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    maxLength="10"
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface text-sm"
                    placeholder="0541234567"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">MoMo Payout Number</label>
                  <input
                    type="tel"
                    value={momoNumber}
                    onChange={(e) => setMomoNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    maxLength="10"
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-on-surface text-sm"
                    placeholder="MoMo number for payouts"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Public Support Email</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface text-sm"
                    placeholder="support@mystore.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Public Support Phone</label>
                  <input
                    type="tel"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    maxLength="10"
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface text-sm"
                    placeholder="0541234567"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Physical Store Address</label>
                  <input
                    type="text"
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface text-sm"
                    placeholder="e.g. Makola Market, Accra"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Business / Tax ID</label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface text-sm"
                    placeholder="TIN or Registration Number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Return Policy</label>
                <textarea
                  value={returnPolicy}
                  onChange={(e) => setReturnPolicy(e.target.value)}
                  rows="2"
                  className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface text-sm resize-none"
                  placeholder="e.g. No returns after 3 days. Must be in original packaging."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Store Description</label>
                <textarea
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  rows="3"
                  className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface text-sm resize-none"
                  placeholder="Tell customers about your store..."
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className={`px-8 py-3 rounded-xl font-bold transition-all ${saving ? "bg-outline-variant/50 text-on-surface-variant/50 cursor-not-allowed" : "bg-primary text-on-primary hover:opacity-90 active:scale-[0.98]"}`}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                {saveSuccess && (
                  <span className="text-tertiary font-medium text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Changes saved!
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 space-y-5">
              <div>
                <h3 className="text-lg font-bold text-on-surface mb-1">Notification Preferences</h3>
                <p className="text-on-surface-variant text-sm">Choose which notifications you want to receive.</p>
              </div>

              {[
                { key: "emailNotifications", label: "Email Notifications", desc: "Receive important updates via email", state: emailNotifications, setter: setEmailNotifications },
                { key: "orderAlerts", label: "Order Alerts", desc: "Get notified when a new order is placed", state: orderAlerts, setter: setOrderAlerts },
                { key: "lowStockWarnings", label: "Low Stock Warnings", desc: "Alert when inventory runs low", state: lowStockWarnings, setter: setLowStockWarnings },
                { key: "bidAlerts", label: "Bid Alerts", desc: "Get notified when someone bids on your auctions", state: bidAlerts, setter: setBidAlerts },
                { key: "dailySalesDigest", label: "Daily Sales Digest", desc: "Receive an end-of-day sales summary", state: dailySalesDigest, setter: setDailySalesDigest },
                { key: "marketingEmails", label: "Marketing Emails", desc: "Receive tips and promotional content", state: marketingEmails, setter: setMarketingEmails },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-outline-variant last:border-b-0">
                  <div>
                    <p className="font-label-md font-bold text-on-surface">{item.label}</p>
                    <p className="text-on-surface-variant text-xs mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggleNotification(item.key, !item.state, item.setter)}
                    className={`w-12 h-7 rounded-full transition-all relative ${item.state ? "bg-primary" : "bg-outline-variant"}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-all ${item.state ? "left-6" : "left-1"}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 space-y-5">
              <div>
                <h3 className="text-lg font-bold text-on-surface mb-1">Account Security</h3>
                <p className="text-on-surface-variant text-sm">Manage your password and account access settings.</p>
              </div>

              <div className="border border-outline-variant rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-label-md font-bold text-on-surface">Password</p>
                    <p className="text-on-surface-variant text-xs mt-0.5">Last changed: Never</p>
                  </div>
                  <button
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="px-5 py-2 rounded-xl border border-outline-variant text-on-surface-variant font-bold text-sm hover:bg-surface-container transition-colors"
                  >
                    {showPasswordForm ? "Cancel" : "Change Password"}
                  </button>
                </div>

                {showPasswordForm && (
                  <div className="mt-4 space-y-3 border-t border-outline-variant pt-4">
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current Password"
                      className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface text-sm"
                    />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New Password"
                      className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface text-sm"
                    />
                    <div>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm New Password"
                        className={`w-full border rounded-xl px-4 py-3 outline-none transition-all text-on-surface text-sm ${confirmPassword && newPassword !== confirmPassword ? "border-error focus:border-error focus:ring-1 focus:ring-error" : "border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary"}`}
                      />
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-error text-xs font-medium mt-1 ml-1">Passwords do not match</p>
                      )}
                    </div>
                    <button
                      onClick={handlePasswordChange}
                      disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                      className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${!currentPassword || !newPassword || newPassword !== confirmPassword ? "bg-outline-variant/50 text-on-surface-variant/50 cursor-not-allowed" : "bg-primary text-on-primary hover:opacity-90 active:scale-[0.98]"}`}
                    >
                      Update Password
                    </button>
                  </div>
                )}
              </div>

              <div className="border border-error/30 rounded-xl p-5 bg-error/5">
                <p className="font-label-md font-bold text-error">Danger Zone</p>
                <p className="text-on-surface-variant text-xs mt-1 mb-3">Permanently delete your merchant account and all associated data.</p>
                <button className="px-5 py-2 rounded-xl border border-error text-error font-bold text-sm hover:bg-error/10 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantSettings;
