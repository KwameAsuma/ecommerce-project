import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const getStatusBadge = (auction) => {
  const now = new Date();
  const endTime = new Date(auction.endTime || auction.end_time);
  if (auction.status === "closed") {
    return { label: "ENDED", classes: "bg-error-container text-on-error-container" };
  }
  if (endTime < now) {
    return { label: "EXPIRED", classes: "bg-error-container text-on-error-container" };
  }
  return { label: "LIVE", classes: "bg-tertiary-fixed text-on-tertiary-fixed-variant" };
};

const getTimeRemaining = (endTime) => {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end - now;
  if (diff <= 0) return "Ended";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h ${mins}m`;
};

const MerchantAuctions = () => {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedAuction, setExpandedAuction] = useState(null);
  const [filter, setFilter] = useState("all"); // all, active, closed

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newBasePrice, setNewBasePrice] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    fetchAuctions();
  }, [user]);

  const fetchAuctions = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get("/auctions/vendor");
      setAuctions(res.data.auctions || []);
    } catch (e) {
      console.error("Failed to fetch auctions:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAuction = async (e) => {
    e.preventDefault();
    setCreateError("");
    if (!newTitle.trim() || !newBasePrice || !newEndTime) {
      setCreateError("All fields are required.");
      return;
    }
    setCreating(true);
    try {
      await api.post("/auctions", {
        title: newTitle,
        basePrice: parseFloat(newBasePrice),
        endTime: new Date(newEndTime).toISOString(),
      });
      setShowCreateModal(false);
      setNewTitle("");
      setNewBasePrice("");
      setNewEndTime("");
      fetchAuctions();
    } catch (err) {
      setCreateError(err.response?.data?.error || "Failed to create auction.");
    } finally {
      setCreating(false);
    }
  };

  const handleCloseAuction = async (auctionId) => {
    if (!window.confirm("Are you sure you want to close this auction? This cannot be undone.")) return;
    try {
      await api.put(`/auctions/${auctionId}/close`);
      fetchAuctions();
    } catch (err) {
      console.error("Failed to close auction:", err);
      alert("Failed to close auction.");
    }
  };

  const filteredAuctions = auctions.filter((a) => {
    if (filter === "active") return a.status === "active" && new Date(a.endTime || a.end_time) > new Date();
    if (filter === "closed") return a.status === "closed" || new Date(a.endTime || a.end_time) <= new Date();
    return true;
  });

  const totalBids = auctions.reduce((sum, a) => sum + (a.bids?.length || 0), 0);
  const activeCount = auctions.filter((a) => a.status === "active" && new Date(a.endTime || a.end_time) > new Date()).length;
  const closedCount = auctions.length - activeCount;
  const totalRevenue = auctions.reduce((sum, a) => sum + parseFloat(a.currentHighestBid || a.current_highest_bid || 0), 0);

  // Min datetime for the auction end time picker (1 hour from now)
  const minEndTime = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="max-w-container-max mx-auto space-y-gutter">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Auction Management</h2>
          <p className="text-on-surface-variant font-body-md mt-1">Create, manage, and monitor your live auctions and bid activity.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md flex items-center gap-2 hover:bg-primary/90 transition-soft active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Create Auction
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[22px]">gavel</span>
            </div>
            <span className="text-on-surface-variant font-label-md font-medium">Total Auctions</span>
          </div>
          <p className="text-2xl font-bold text-on-surface">{auctions.length}</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary text-[22px]">bolt</span>
            </div>
            <span className="text-on-surface-variant font-label-md font-medium">Live Now</span>
          </div>
          <p className="text-2xl font-bold text-on-surface">{activeCount}</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-[22px]">groups</span>
            </div>
            <span className="text-on-surface-variant font-label-md font-medium">Total Bids</span>
          </div>
          <p className="text-2xl font-bold text-on-surface">{totalBids}</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-500 text-[22px]">payments</span>
            </div>
            <span className="text-on-surface-variant font-label-md font-medium">Highest Bids Total</span>
          </div>
          <p className="text-2xl font-bold text-on-surface">GHS {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {["all", "active", "closed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full font-label-md font-bold transition-all capitalize ${filter === f ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant border border-outline-variant hover:bg-surface-container"}`}
          >
            {f === "all" ? `All (${auctions.length})` : f === "active" ? `Live (${activeCount})` : `Ended (${closedCount})`}
          </button>
        ))}
      </div>

      {/* Auctions Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="p-4 font-label-md text-on-surface font-bold">Auction</th>
                <th className="p-4 font-label-md text-on-surface font-bold">Base Price</th>
                <th className="p-4 font-label-md text-on-surface font-bold">Highest Bid</th>
                <th className="p-4 font-label-md text-on-surface font-bold">Bids</th>
                <th className="p-4 font-label-md text-on-surface font-bold">Time Left</th>
                <th className="p-4 font-label-md text-on-surface font-bold">Status</th>
                <th className="p-4 font-label-md text-on-surface font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-on-surface-variant">Loading auctions...</td></tr>
              ) : filteredAuctions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-2 block">gavel</span>
                    <p className="text-on-surface-variant font-medium">No auctions found</p>
                    <p className="text-on-surface-variant/60 text-sm mt-1">Create your first auction to get started!</p>
                  </td>
                </tr>
              ) : filteredAuctions.map((auction) => {
                const status = getStatusBadge(auction);
                const isExpanded = expandedAuction === auction.id;
                return (
                  <React.Fragment key={auction.id}>
                    <tr className="hover:bg-surface-container-low transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {auction.title.charAt(0)}
                          </div>
                          <div>
                            <p className="font-label-md font-bold text-on-surface group-hover:text-primary transition-colors">{auction.title}</p>
                            <p className="text-[11px] text-on-surface-variant mt-0.5">AUC-{auction.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-label-md font-bold text-on-surface">GHS {parseFloat(auction.basePrice || auction.base_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-label-md font-bold text-primary">
                          GHS {parseFloat(auction.currentHighestBid || auction.current_highest_bid || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-label-md font-bold text-on-surface">{auction.bids?.length || 0}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-label-md text-on-surface-variant">{getTimeRemaining(auction.endTime || auction.end_time)}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.classes}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setExpandedAuction(isExpanded ? null : auction.id)}
                            className="text-on-surface-variant hover:text-primary p-2 transition-colors rounded-full hover:bg-surface-container"
                            title="View Bids"
                          >
                            <span className="material-symbols-outlined text-[20px]">{isExpanded ? "expand_less" : "expand_more"}</span>
                          </button>
                          {status.label === "LIVE" && (
                            <button
                              onClick={() => handleCloseAuction(auction.id)}
                              className="text-error hover:text-error/80 p-2 transition-colors rounded-full hover:bg-error-container/20"
                              title="Close Auction"
                            >
                              <span className="material-symbols-outlined text-[20px]">stop_circle</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {/* Expanded Bids Panel */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="7" className="p-0">
                          <div className="bg-surface-container-low border-t border-outline-variant px-6 py-4">
                            <h4 className="font-label-md font-bold text-on-surface mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px] text-primary">leaderboard</span>
                              Bid Leaderboard — {auction.bids?.length || 0} total bids
                            </h4>
                            {auction.bids?.length > 0 ? (
                              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                                {auction.bids.map((bid, idx) => (
                                  <div key={bid.id} className="flex items-center justify-between bg-surface rounded-xl px-4 py-3 border border-outline-variant">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? "bg-amber-500 text-white" : idx === 1 ? "bg-gray-400 text-white" : idx === 2 ? "bg-amber-700 text-white" : "bg-surface-container text-on-surface-variant"}`}>
                                        {idx + 1}
                                      </div>
                                      <div>
                                        <p className="font-label-md font-bold text-on-surface">{bid.user?.name || `Bidder #${bid.userId || bid.user_id}`}</p>
                                        <p className="text-[11px] text-on-surface-variant">{new Date(bid.timestamp).toLocaleString()}</p>
                                      </div>
                                    </div>
                                    <span className={`font-label-md font-bold ${idx === 0 ? "text-primary" : "text-on-surface"}`}>
                                      GHS {parseFloat(bid.bidAmount || bid.bid_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-on-surface-variant text-sm">No bids yet on this auction.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Auction Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-lg border border-outline-variant overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-outline-variant flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-on-surface">Create New Auction</h3>
                <p className="text-on-surface-variant text-sm mt-1">Set a title, base price, and end time for your auction.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateAuction} className="p-6 space-y-4">
              {createError && (
                <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-xl text-sm font-medium">{createError}</div>
              )}

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Auction Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  placeholder="e.g. Samsung Galaxy S25 Ultra — Import Pool"
                  className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface placeholder-on-surface-variant/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Base Price (GHS)</label>
                <input
                  type="number"
                  value={newBasePrice}
                  onChange={(e) => setNewBasePrice(e.target.value)}
                  required
                  min="1"
                  step="0.01"
                  placeholder="e.g. 500.00"
                  className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface placeholder-on-surface-variant/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Auction End Time</label>
                <input
                  type="datetime-local"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  required
                  min={minEndTime}
                  className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newTitle.trim() || !newBasePrice || !newEndTime}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${creating || !newTitle.trim() || !newBasePrice || !newEndTime ? "bg-outline-variant/50 text-on-surface-variant/50 cursor-not-allowed" : "bg-primary text-on-primary shadow-md shadow-primary/20 hover:opacity-90 active:scale-[0.98]"}`}
                >
                  {creating ? "Creating..." : "Launch Auction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantAuctions;
