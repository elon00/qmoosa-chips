import React, { useState } from 'react';
import { ArrowLeftRight, TrendingUp, AlertTriangle, Globe, DollarSign, ShieldAlert, CheckCircle2, Search, SlidersHorizontal } from 'lucide-react';
import productsData from '../config/marketplace-products.json';

interface MarketPriceComparisonProps {
  onSelectProductForCheckout?: (product: any) => void;
}

export const MarketPriceComparison: React.FC<MarketPriceComparisonProps> = ({ onSelectProductForCheckout }) => {
  const [currency, setCurrency] = useState<'USD' | 'CNY' | 'EUR' | 'INR' | 'ICP'>('USD');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Exchange rates relative to USD
  const rates = {
    USD: 1,
    CNY: 7.24,
    EUR: 0.92,
    INR: 83.5,
    ICP: 9.8 // 1 ICP = ~$9.80 USD
  };

  const currencySymbols = {
    USD: '$',
    CNY: '¥',
    EUR: '€',
    INR: '₹',
    ICP: 'ICP '
  };

  const convertPrice = (usd: number) => {
    if (currency === 'ICP') {
      return (usd / rates.ICP).toFixed(2);
    }
    const val = usd * rates[currency];
    return val >= 1000 ? val.toLocaleString(undefined, { maximumFractionDigits: 0 }) : val.toFixed(2);
  };

  const filteredProducts = productsData.filter((p) => {
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.exportControlStatus.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyber-900 via-cyber-800 to-cyber-900 border border-cyan-800/60 rounded-3xl p-6 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="p-2 rounded-xl bg-cyan-950 border border-cyan-700/60">
                <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-wide">
                USA vs. China Semiconductor & Quantum Market Price Comparison
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Real-time arbitrage telemetry comparing Silicon Valley MSRP (TSMC/ASML supply chain) with Shenzhen & Hefei domestic sovereign pricing. Evaluates export sanctions, Chinese domestic subsidies, and global distributor margins.
            </p>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center gap-2 bg-cyber-950/80 p-1.5 rounded-2xl border border-cyan-900/60">
            <span className="text-[11px] font-mono text-slate-400 px-2">Display Currency:</span>
            {(['USD', 'CNY', 'EUR', 'INR', 'ICP'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                  currency === curr
                    ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-cyan-200'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-cyber-800/50 p-3.5 rounded-2xl border border-cyan-900/40 font-mono text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-cyan-400" />
          <input
            type="text"
            placeholder="Search products, brands, or sanctions status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-cyber-950 border border-cyan-800/60 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-full sm:w-80"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Department:</span>
          {[
            { id: 'all', label: 'All Items' },
            { id: 'quantum-computers', label: 'Quantum QPUs' },
            { id: 'super-laptops', label: 'Super Laptops' },
            { id: 'silicon-valley-gadgets', label: 'Gadgets' },
            { id: 'accessories', label: 'Cryo & Fab Gear' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs whitespace-nowrap transition-all border ${
                filterCategory === cat.id
                  ? 'bg-cyber-700 text-cyan-300 border-cyan-500'
                  : 'bg-cyber-900/60 text-slate-400 border-cyan-950 hover:border-cyan-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProducts.map((p) => {
          const isChinaCheaper = p.priceDifferencePercent < 0;
          const absDiff = Math.abs(p.priceDifferencePercent).toFixed(1);

          return (
            <div
              key={p.id}
              className="bg-cyber-800/60 rounded-2xl border border-cyan-900/40 p-5 hover:border-cyan-700/60 transition-all backdrop-blur-sm space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-cyan-900/50 pb-3">
                <div className="flex items-start gap-3">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-16 h-16 rounded-xl object-cover border border-cyan-800/50 flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 uppercase">
                        {p.category.replace('-', ' ')}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{p.brand}</span>
                    </div>
                    <h3 className="font-bold text-white text-base hover:text-cyan-300 transition-colors">
                      {p.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start lg:self-center">
                  <div className={`px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border ${
                    isChinaCheaper
                      ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                      : 'bg-blue-950/60 text-cyan-300 border-cyan-800/60'
                  }`}>
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{isChinaCheaper ? `China -${absDiff}%` : `USA -${absDiff}%`}</span>
                  </div>

                  {onSelectProductForCheckout && (
                    <button
                      onClick={() => onSelectProductForCheckout(p)}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                    >
                      Instant Buy & QR
                    </button>
                  )}
                </div>
              </div>

              {/* Side-by-Side Market Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                {/* USA / Silicon Valley Column */}
                <div className="bg-cyber-900/90 rounded-xl p-3.5 border border-blue-900/50 space-y-2">
                  <div className="flex items-center justify-between text-cyan-300 font-bold border-b border-cyan-950 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span>🇺🇸</span>
                      <span>USA (Silicon Valley MSRP)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Domestic USD</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-400">Consumer Price:</span>
                    <span className="text-lg font-bold text-white">
                      {currencySymbols[currency]}{convertPrice(p.usaPriceUsd)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Original USD:</span>
                    <span>${p.usaPriceUsd.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>US Shipping:</span>
                    <span className="text-emerald-400 font-medium">{p.shipping.usaShippingDays} Business Days</span>
                  </div>
                </div>

                {/* China / Domestic Shenzhen Column */}
                <div className="bg-cyber-900/90 rounded-xl p-3.5 border border-rose-900/50 space-y-2">
                  <div className="flex items-center justify-between text-rose-300 font-bold border-b border-rose-950 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span>🇨🇳</span>
                      <span>China (Shenzhen / Hefei)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Domestic CNY</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-400">Consumer Price:</span>
                    <span className="text-lg font-bold text-white">
                      {currencySymbols[currency]}{convertPrice(p.chinaPriceUsdEquivalent)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Original CNY:</span>
                    <span>¥{p.chinaPriceCny.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>CN Shipping:</span>
                    <span className="text-emerald-400 font-medium">{p.shipping.chinaShippingDays} Business Days</span>
                  </div>
                </div>

                {/* Market Comparison & Policy Column */}
                <div className="bg-black/50 rounded-xl p-3.5 border border-cyan-950 space-y-2">
                  <div className="text-slate-300 font-bold border-b border-cyan-950 pb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Export & Strategic Telemetry</span>
                    </span>
                    <span className="text-[10px] text-cyan-400">Global Parity</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block">Sanctions & Export Status:</span>
                    <div className="text-[11px] text-amber-300 font-sans leading-tight bg-amber-950/40 p-1.5 rounded border border-amber-900/50 flex items-start gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>{p.exportControlStatus}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Distributor Wholesale:</span>
                    <span className="text-emerald-400 font-bold">-{p.distributorPricing.wholesaleDiscountPercent}% (MOQ {p.distributorPricing.moq})</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
