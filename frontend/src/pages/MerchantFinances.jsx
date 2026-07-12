import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const MerchantFinances = () => {
  const navigate = useNavigate();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingEscrow, setPendingEscrow] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFinances = async () => {
      if (!user?.id) return;
      try {
        const res = await api.get(`/finances/${user.id}`);
        setAvailableBalance(res.data.balances.availableBalance || 0);
        setPendingEscrow(res.data.balances.pendingEscrow || 0);
        setTotalRevenue(res.data.balances.lifetimeRevenue || 0);
        setTransactions(res.data.transactions || []);
      } catch (err) {
        console.error("Error fetching finances", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFinances();
  }, [user]);

  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(withdrawAmount) || Number(withdrawAmount) <= 0) return;
    if (Number(withdrawAmount) > availableBalance) {
      alert("Insufficient funds!");
      return;
    }
    
    setIsWithdrawing(true);
    
    try {
      const res = await api.post(`/finances/${user.id}/withdraw`, { amount: Number(withdrawAmount) });
      setAvailableBalance(res.data.availableBalance);
      setTransactions([res.data.transaction, ...transactions]);
      
      setIsWithdrawing(false);
      setWithdrawSuccess(true);
      
      // Close success modal after 3 seconds
      setTimeout(() => {
        setIsWithdrawModalOpen(false);
        setWithdrawSuccess(false);
        setWithdrawAmount("");
      }, 3000);
    } catch (err) {
      console.error(err);
      setIsWithdrawing(false);
      alert("Withdrawal failed. Please try again.");
    }
  };

  return (
    <div className="max-w-container-max mx-auto space-y-gutter relative min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight mb-1">Financial Dashboard</h1>
          <p className="text-on-surface-variant font-body-md">Manage your available funds, pending payouts, and MoMo withdrawals.</p>
        </div>
        <button onClick={() => navigate("/merchant")} className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md flex items-center gap-2 hover:opacity-90 transition-soft active:scale-[0.98]">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Dashboard
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* Available Balance Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-8">
            <div className="font-label-sm text-on-surface-variant uppercase tracking-widest">Available Balance</div>
            <span className="material-symbols-outlined text-success bg-success/10 p-2 rounded-lg">account_balance_wallet</span>
          </div>
          <div className="text-3xl font-black text-on-surface tabular-nums tracking-tight mb-6">
            GH₵ {availableBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}
          </div>
          <button 
            onClick={() => setIsWithdrawModalOpen(true)}
            className="w-full bg-primary text-on-primary font-bold py-2.5 rounded-xl hover:opacity-90 transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">payments</span>
            Withdraw to MoMo
          </button>
        </div>

        {/* Pending Escrow Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-8">
            <div className="font-label-sm text-on-surface-variant uppercase tracking-widest">Pending in Escrow</div>
            <span className="material-symbols-outlined text-brand-gold bg-brand-gold/10 p-2 rounded-lg">lock</span>
          </div>
          <div className="text-3xl font-black text-on-surface tabular-nums tracking-tight mb-2">
            GH₵ {pendingEscrow.toLocaleString(undefined, {minimumFractionDigits: 2})}
          </div>
          <p className="text-label-sm text-on-surface-variant">Awaiting buyer confirmation</p>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-8">
            <div className="font-label-sm text-on-surface-variant uppercase tracking-widest">Lifetime Revenue</div>
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">monitoring</span>
          </div>
          <div className="text-3xl font-black text-on-surface tabular-nums tracking-tight mb-2">
            GH₵ {totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}
          </div>
          <p className="text-label-sm text-on-surface-variant">All-time earnings across all channels</p>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <h2 className="text-xl font-bold text-on-surface mt-8 mb-4">Recent Transactions</h2>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant">
              <th className="px-6 py-4 text-left text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Transaction ID</th>
              <th className="px-6 py-4 text-left text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-left text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-right text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-center text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {transactions.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">No transactions yet.</td></tr>
            ) : (
              transactions.map((txn) => {
                const isPositive = Number(txn.amount) > 0;
                return (
                  <tr key={txn.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-on-surface">TXN-{txn.id}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-on-surface flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[18px] ${isPositive ? 'text-success' : 'text-error'}`}>
                          {isPositive ? 'arrow_downward' : 'arrow_upward'}
                        </span>
                        {txn.type}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-on-surface-variant text-sm">{new Date(txn.createdAt).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className={`font-bold ${isPositive ? 'text-success' : 'text-on-surface'}`}>
                        {isPositive ? '+' : ''}GH₵ {Math.abs(txn.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="bg-success/10 text-success px-3 py-1 rounded-full text-label-sm font-bold flex items-center justify-center gap-1 w-fit mx-auto">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Withdraw Modal Overlay */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
            
            {/* Modal Close Button */}
            {!isWithdrawing && !withdrawSuccess && (
              <button 
                onClick={() => setIsWithdrawModalOpen(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}

            {/* Modal Content - Initial State */}
            {!isWithdrawing && !withdrawSuccess && (
              <div className="p-8">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-3xl">account_balance</span>
                </div>
                <h2 className="text-2xl font-bold text-on-surface mb-2">Withdraw to MoMo</h2>
                <p className="text-on-surface-variant mb-6">Transfer your available balance to your registered Mobile Money wallet.</p>
                
                <div className="bg-surface-container p-4 rounded-xl mb-6 border border-outline-variant">
                  <div className="flex justify-between items-center">
                    <span className="text-label-sm font-bold text-on-surface-variant">Available Balance</span>
                    <span className="font-bold text-primary">GH₵ {availableBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-label-sm font-bold text-on-surface mb-2">Amount to Withdraw (GH₵)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">GH₵</span>
                    <input 
                      type="number" 
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-transparent border-2 border-outline-variant rounded-xl py-3 pl-14 pr-4 text-lg font-bold text-on-surface focus:border-primary focus:ring-0 outline-none transition-colors"
                    />
                  </div>
                  {Number(withdrawAmount) > availableBalance && (
                    <p className="text-error text-label-sm mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      Amount exceeds available balance
                    </p>
                  )}
                </div>

                <button 
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > availableBalance}
                  className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  Confirm Withdrawal
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            )}

            {/* Modal Content - Loading State */}
            {isWithdrawing && (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 border-4 border-surface-container border-t-primary rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-on-surface mb-2">Processing Withdrawal</h3>
                <p className="text-on-surface-variant">Securely transferring funds to your MoMo wallet...</p>
              </div>
            )}

            {/* Modal Content - Success State */}
            {withdrawSuccess && (
              <div className="p-12 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
                <div className="w-24 h-24 bg-success/10 text-success rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-5xl">check_circle</span>
                </div>
                <h3 className="text-2xl font-bold text-on-surface mb-2">Withdrawal Successful!</h3>
                <p className="text-on-surface-variant mb-6">
                  <strong className="text-on-surface">GH₵ {Number(withdrawAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</strong> has been sent to your MoMo wallet.
                </p>
                <div className="text-sm text-on-surface-variant flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                  Redirecting...
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default MerchantFinances;
