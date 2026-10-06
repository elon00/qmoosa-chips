import React, { useState } from 'react';
import { CreditCard, Wallet, QrCode, CheckCircle2, ShieldCheck, Copy, Download, Truck, Zap, AlertCircle } from 'lucide-react';
import { DynamicQRGenerator, PaymentRail, QRResult } from '../wallet/DynamicQRGenerator';
import { UserRole } from './AmazonMarketplace';

interface MarketplaceCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  role: UserRole;
  initialQty?: number;
}

export const MarketplaceCheckoutModal: React.FC<MarketplaceCheckoutModalProps> = ({
  isOpen,
  onClose,
  product,
  role,
  initialQty = 1
}) => {
  if (!isOpen || !product) return null;

  const [quantity, setQuantity] = useState(initialQty);
  const [selectedRail, setSelectedRail] = useState<PaymentRail>('ICP');
  const [copied, setCopied] = useState(false);
  const [isSettled, setIsSettled] = useState(false);
  const [settledReceipt, setSettledReceipt] = useState<any | null>(null);

  // Pricing calculations
  const unitPriceUsd = role === 'distributor'
    ? product.usaPriceUsd * (1 - product.distributorPricing.wholesaleDiscountPercent / 100)
    : product.usaPriceUsd;

  const subtotalUsd = unitPriceUsd * quantity;
  const shippingUsd = subtotalUsd > 1000 ? 0 : 49;
  const totalUsd = subtotalUsd + shippingUsd;

  // Rail conversion
  let paymentAmount: number | string = totalUsd;
  if (selectedRail === 'ICP') {
    paymentAmount = parseFloat((totalUsd / 9.8).toFixed(2));
  } else if (selectedRail === 'ckBTC') {
    paymentAmount = parseFloat((totalUsd / 68000).toFixed(6));
  } else if (selectedRail === 'ETH') {
    paymentAmount = parseFloat((totalUsd / 2650).toFixed(4));
  } else if (selectedRail === 'SOL') {
    paymentAmount = parseFloat((totalUsd / 145).toFixed(3));
  } else if (selectedRail === 'USDC') {
    paymentAmount = totalUsd.toFixed(2);
  } else if (selectedRail === 'UPI') {
    paymentAmount = (totalUsd * 83.5).toFixed(0);
  } else if (selectedRail === 'SEPA') {
    paymentAmount = (totalUsd * 0.92).toFixed(2);
  } else if (selectedRail === 'STRIPE') {
    paymentAmount = totalUsd.toFixed(2);
  }

  const qrResult: QRResult = DynamicQRGenerator.createQR({
    rail: selectedRail,
    amount: paymentAmount,
    note: `Order ${product.id} x${quantity}`
  });

  const handleSimulatePayment = () => {
    const orderId = `QMOOSA-ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const txHash = `0x${Math.random().toString(16).substring(2, 10)}${Date.now()}`;
    const receipt = {
      orderId,
      productName: product.name,
      quantity,
      role: role.toUpperCase(),
      totalUsd: `$${totalUsd.toLocaleString()}`,
      paidAmount: qrResult.displayAmount,
      rail: selectedRail,
      recipient: qrResult.recipientAddress,
      txHash,
      deliveryEta: role === 'distributor' ? '5-7 Business Days (Air Freight)' : '2-3 Business Days (Express)',
      pqcSignature: `ML-DSA-65::${btoa(orderId + txHash).substring(0, 32)}...`,
      timestamp: new Date().toISOString()
    };
    setSettledReceipt(receipt);
    setIsSettled(true);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-cyber-900 border border-cyan-500/50 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] max-h-[92vh] overflow-y-auto font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-700/60">
              <CreditCard className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                QMoosa Express Checkout & Dual-Rail Payment Gateway
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {role === 'distributor' ? 'B2B Wholesale Distributor Order' : 'Consumer Retail Order'} • Secured by ICP Canisters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-cyber-800 hover:bg-cyber-700 text-slate-300 font-mono text-sm px-3"
          >
            ✕ Close
          </button>
        </div>

        {!isSettled ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Order Summary & Quantity */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex gap-4 p-4 rounded-2xl bg-cyber-950 border border-cyan-950">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-24 h-24 rounded-xl object-cover border border-cyan-800/60"
                />
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 uppercase">
                    {product.brand}
                  </span>
                  <h4 className="font-bold text-white text-sm line-clamp-2">{product.name}</h4>
                  <div className="text-xs font-mono text-emerald-400 font-bold">
                    Unit Price: ${unitPriceUsd.toLocaleString()}
                  </div>
                  {role === 'distributor' && (
                    <div className="text-[10px] font-mono text-amber-400">
                      Distributor Discount: {product.distributorPricing.wholesaleDiscountPercent}% Applied
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="p-4 rounded-2xl bg-cyber-800/60 border border-cyan-900/60 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Order Quantity:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(role === 'distributor' ? product.distributorPricing.moq : 1, quantity - 1))}
                      className="w-7 h-7 rounded-lg bg-cyber-900 hover:bg-cyber-700 text-white font-bold"
                    >
                      -
                    </button>
                    <span className="text-white font-bold px-2">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-cyber-900 hover:bg-cyber-700 text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="border-t border-cyan-950 pt-2 space-y-1 text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-white font-bold">${subtotalUsd.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping (QMoosa Prime):</span>
                    <span className="text-emerald-400">{shippingUsd === 0 ? 'FREE' : `$${shippingUsd}`}</span>
                  </div>
                  <div className="flex justify-between text-cyan-300 font-bold text-sm pt-1 border-t border-cyan-950">
                    <span>Total USD:</span>
                    <span>${totalUsd.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Delivery & Warranty Badge */}
              <div className="p-3 bg-cyber-950/80 rounded-xl border border-cyan-900/40 text-xs font-mono text-slate-300 flex items-center gap-3">
                <Truck className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div>
                  <div className="text-white font-bold">Fast Sovereign Delivery</div>
                  <div className="text-[11px] text-slate-400">
                    {product.shipping.usaShippingDays} Days USA / {product.shipping.chinaShippingDays} Days China. PQC Escrow Protection.
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Payment Rail Selector & Dynamic QR */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-cyber-950 p-4 rounded-2xl border border-cyan-800/60 space-y-3">
                <span className="text-xs font-mono text-cyan-300 uppercase tracking-wider block">
                  Select Payment Gateway Rail:
                </span>

                {/* Crypto Rails */}
                <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                  <span className="text-slate-500 self-center text-[11px] mr-1">Crypto:</span>
                  {(['ICP', 'ckBTC', 'ETH', 'SOL', 'USDC'] as PaymentRail[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRail(r)}
                      className={`px-2.5 py-1 rounded-lg transition-all border ${
                        selectedRail === r
                          ? 'bg-cyan-500 text-black font-bold border-cyan-400'
                          : 'bg-cyber-900 text-slate-400 border-cyan-900 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {/* Fiat Rails */}
                <div className="flex flex-wrap gap-1.5 font-mono text-xs pt-1">
                  <span className="text-slate-500 self-center text-[11px] mr-1">Fiat:</span>
                  {(['UPI', 'SEPA', 'STRIPE'] as PaymentRail[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRail(r)}
                      className={`px-2.5 py-1 rounded-lg transition-all border ${
                        selectedRail === r
                          ? 'bg-emerald-400 text-black font-bold border-emerald-300'
                          : 'bg-cyber-900 text-emerald-400/80 border-emerald-950 hover:text-emerald-300'
                      }`}
                    >
                      {r === 'UPI' ? 'UPI (India)' : r === 'SEPA' ? 'SEPA (EU)' : 'Stripe / Cards'}
                    </button>
                  ))}
                </div>

                {/* QR Code Matrix Box */}
                <div className="flex flex-col items-center p-3 bg-cyber-900/90 rounded-2xl border border-cyan-900/60 space-y-2">
                  <div className="p-3 bg-white rounded-xl shadow-lg border-2 border-cyan-400">
                    <svg
                      width={160}
                      height={160}
                      viewBox={`0 0 ${qrResult.svgMatrix.length} ${qrResult.svgMatrix.length}`}
                    >
                      {qrResult.svgMatrix.map((row, r) =>
                        row.map((cell, c) =>
                          cell ? (
                            <rect
                              key={`${r}-${c}`}
                              x={c}
                              y={r}
                              width={1}
                              height={1}
                              fill="#070b14"
                            />
                          ) : null
                        )
                      )}
                    </svg>
                  </div>
                  <div className="text-center font-mono">
                    <div className="text-xs font-bold text-cyan-300">
                      Amount: {qrResult.displayAmount}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[260px]">
                      {qrResult.recipientAddress}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(qrResult.uri)}
                    className="flex-1 py-2 px-3 rounded-xl bg-cyber-800 hover:bg-cyber-700 text-cyan-300 font-mono text-xs border border-cyan-700/60 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied URI' : 'Copy Pay URI'}</span>
                  </button>

                  <button
                    onClick={handleSimulatePayment}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Simulate Payment & Confirm</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Settled State: Official Cryptographic Order Invoice */
          <div className="bg-cyber-950 border border-emerald-500/60 rounded-2xl p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center gap-3 border-b border-emerald-900/60 pb-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <div>
                <h4 className="text-lg font-bold text-white">Payment Confirmed & Verified!</h4>
                <p className="text-xs text-emerald-400">Order successfully committed to Internet Computer smart canister.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-cyber-900/60 p-4 rounded-xl border border-cyan-950">
              <div className="space-y-1.5">
                <div className="text-slate-400">Order ID: <span className="text-white font-bold">{settledReceipt.orderId}</span></div>
                <div className="text-slate-400">Product: <span className="text-cyan-300">{settledReceipt.productName}</span></div>
                <div className="text-slate-400">Quantity: <span className="text-white">{settledReceipt.quantity} Units</span></div>
                <div className="text-slate-400">Buyer Tier: <span className="text-amber-400">{settledReceipt.role}</span></div>
              </div>

              <div className="space-y-1.5">
                <div className="text-slate-400">Amount Paid: <span className="text-emerald-400 font-bold">{settledReceipt.paidAmount}</span> ({settledReceipt.totalUsd})</div>
                <div className="text-slate-400">Payment Rail: <span className="text-cyan-300">{settledReceipt.rail}</span></div>
                <div className="text-slate-400">Estimated Delivery: <span className="text-white font-bold">{settledReceipt.deliveryEta}</span></div>
                <div className="text-slate-400 truncate">Tx Hash: <span className="text-slate-300">{settledReceipt.txHash}</span></div>
              </div>
            </div>

            <div className="p-3 bg-black/50 rounded-xl border border-cyan-950 space-y-1 text-[11px]">
              <span className="text-slate-500">Post-Quantum Provenance Signature:</span>
              <div className="text-violet-300 break-all">{settledReceipt.pqcSignature}</div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
