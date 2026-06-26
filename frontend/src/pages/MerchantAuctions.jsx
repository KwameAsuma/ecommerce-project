import React from "react";

const MerchantAuctions = () => {
  return (
    <div className="max-w-container-max mx-auto space-y-gutter flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-24 h-24 rounded-full bg-surface-container-low flex items-center justify-center text-secondary mb-6 shadow-sm border border-outline-variant">
        <span className="material-symbols-outlined text-[48px]" data-icon="gavel">gavel</span>
      </div>
      <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight text-center">Live Auctions</h2>
      <p className="text-on-surface-variant font-body-md text-center max-w-md mt-2">
        Manage your active bids, review bidder histories, and launch new products into the Auction Engine.
      </p>
      <div className="mt-8 px-6 py-4 bg-secondary-container text-on-secondary-container rounded-xl font-label-md">
        Coming Soon
      </div>
    </div>
  );
};

export default MerchantAuctions;
