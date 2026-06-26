import React from "react";

const MerchantSupport = () => {
  return (
    <div className="max-w-container-max mx-auto space-y-gutter flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-24 h-24 rounded-full bg-surface-container-low flex items-center justify-center text-tertiary mb-6 shadow-sm border border-outline-variant">
        <span className="material-symbols-outlined text-[48px]" data-icon="support_agent">support_agent</span>
      </div>
      <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight text-center">Merchant Support</h2>
      <p className="text-on-surface-variant font-body-md text-center max-w-md mt-2">
        Need help with a dispute, escrow release, or platform issue? Our dedicated merchant success team is here to assist.
      </p>
      <div className="mt-8 px-6 py-4 bg-tertiary-container text-on-tertiary-container rounded-xl font-label-md">
        Coming Soon
      </div>
    </div>
  );
};

export default MerchantSupport;
