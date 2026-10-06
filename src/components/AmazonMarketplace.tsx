import React, { useState } from 'react';
import { ShoppingCart, Star, Zap, Shield, Search, Filter, Truck, Check, ChevronRight, Layers, ArrowRight, Tag, HelpCircle, Eye } from 'lucide-react';
import productsData from '../config/marketplace-products.json';

export type UserRole = 'buyer' | 'distributor' | 'supplier';

interface AmazonMarketplaceProps {
  onOpenCheckout: (product: any, role: UserRole, qty: number) => void;
  onNavigateToComparison: () => void;
  cartCount: number;
  onOpenCartModal: () => void;
}

export const AmazonMarketplace: React.FC<AmazonMarketplaceProps> = ({
  onOpenCheckout,
  onNavigateToComparison,
  cartCount,
  onOpenCartModal
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('buyer');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currency, setCurrency] = useState<'USD' | 'CNY' | 'EUR' | 'INR' | 'ICP'>('USD');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductDetails, setSelectedProductDetails] = useState<any | null>(null);

  const rates = {
    USD: 1,
    CNY: 7.24,
    EUR: 0.92,
    INR: 83.5,
    ICP: 9.8
  };

  const currencySymbols = {
    USD: '$',
    CNY: '¥',
    EUR: '€',
    INR: '₹',
    ICP: 'ICP '
  };

  const formatPrice = (usd: number) => {
    let price = usd;
    if (selectedRole === 'distributor') {
      price = usd * 0.82; // 18% wholesale distributor discount average
    }
    if (currency === 'ICP') {
      return (price / rates.ICP).toFixed(2);
    }
    const val = price * rates[currency];
    return val >= 1000 ? val.toLocaleString(undefined, { maximumFractionDigits: 0 }) : val.toFixed(2);
  };

  const filteredProducts = productsData.filter((p) => {
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Amazon-Style Nav Strip & Role Switcher */}
      <div className="bg-cyber-900 border border-cyan-800/50 rounded-3xl p-4 md:p-6 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        {/* Upper Amazon-Style Search Strip */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 font-bold text-lg tracking-wide text-white font-mono">
              <span className="text-cyan-400 text-2xl font-black">q</span>
              <span>moosa</span>
              <span className="text-amber-400 text-xs px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-600/50 uppercase">
                prime
              </span>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">| Global Tech Bazaar</span>
          </div>

          {/* Search Box */}
          <div className="flex items-center w-full md:flex-1 max-w-2xl bg-cyber-950 border border-cyan-700/60 rounded-2xl overflow-hidden shadow-inner">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-cyber-900 text-slate-300 text-xs px-3 py-2.5 border-r border-cyan-900 focus:outline-none font-mono"
            >
              <option value="all">All Departments</option>
              <option value="quantum-computers">Quantum Computers & QPUs</option>
              <option value="super-laptops">Super Laptops & AI Rigs</option>
              <option value="silicon-valley-gadgets">Silicon Valley Gadgets</option>
              <option value="accessories">Accessories & Cryo Fab</option>
            </select>
            <input
              type="text"
              placeholder="Search quantum QPUs, super laptops, dilution cryo-cables, ASML rigs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button className="bg-cyan-500 hover:bg-cyan-400 px-4 py-2.5 text-black font-bold transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Cart & Price Comparison Shortcut */}
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToComparison}
              className="px-3.5 py-2 rounded-xl bg-cyber-800 hover:bg-cyber-700 text-cyan-300 border border-cyan-700/60 text-xs font-mono transition-all flex items-center gap-1.5"
            >
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>USA vs China Prices</span>
            </button>

            <button
              onClick={onOpenCartModal}
              className="relative p-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="font-bold">Cart</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 bg-amber-400 text-black font-extrabold rounded-full flex items-center justify-center text-[10px]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Lower Strip: Stakeholder Roles & Currency Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-cyan-900/50 font-mono text-xs">
          {/* Role Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Buyer Tier:</span>
            <div className="flex gap-1 bg-cyber-950 p-1 rounded-xl border border-cyan-950">
              <button
                onClick={() => setSelectedRole('buyer')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedRole === 'buyer'
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Retail Buyer
              </button>
              <button
                onClick={() => setSelectedRole('distributor')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedRole === 'distributor'
                    ? 'bg-amber-400 text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Authorized Distributor (-18% MOQ)
              </button>
              <button
                onClick={() => setSelectedRole('supplier')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedRole === 'supplier'
                    ? 'bg-emerald-400 text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Foundry Supplier
              </button>
            </div>
          </div>

          {/* Currency Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Currency:</span>
            {(['USD', 'CNY', 'EUR', 'INR', 'ICP'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  currency === c
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-600'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredProducts.map((prod) => {
          const isChinaCheaper = prod.priceDifferencePercent < 0;
          const absDiff = Math.abs(prod.priceDifferencePercent).toFixed(0);

          return (
            <div
              key={prod.id}
              className="bg-cyber-800/60 border border-cyan-900/40 hover:border-cyan-500/70 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] group backdrop-blur-sm"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative aspect-[4/3] overflow-hidden bg-cyber-950">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/80 text-cyan-300 border border-cyan-800 backdrop-blur-sm">
                      {prod.badge}
                    </span>
                    {selectedRole === 'distributor' && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-700">
                        DISTRIBUTOR MOQ: {prod.distributorPricing.moq}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedProductDetails(prod)}
                    className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-cyan-500 hover:text-black text-white text-xs backdrop-blur-sm transition-all"
                    title="Quick Specs View"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{prod.brand}</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      <span>{prod.shipping.usaShippingDays}d US / {prod.shipping.chinaShippingDays}d CN</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
                    {prod.name}
                  </h3>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-xs">
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-cyan-400 font-mono text-[11px]">{prod.rating}</span>
                    <span className="text-slate-500 text-[10px]">({prod.reviewsCount})</span>
                  </div>

                  {/* Pricing Comparison Module */}
                  <div className="bg-cyber-900/90 p-2.5 rounded-xl border border-cyan-950 font-mono space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-extrabold text-white">
                        {currencySymbols[currency]}{formatPrice(prod.usaPriceUsd)}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isChinaCheaper ? 'bg-rose-950 text-rose-300' : 'bg-blue-950 text-cyan-300'
                      }`}>
                        {isChinaCheaper ? `CN -${absDiff}%` : `US -${absDiff}%`}
                      </span>
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>China Market:</span>
                      <span className="text-slate-200">
                        {currencySymbols[currency]}{formatPrice(prod.chinaPriceUsdEquivalent)} (¥{prod.chinaPriceCny.toLocaleString()})
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div className="p-4 pt-0 space-y-2">
                <button
                  onClick={() => onOpenCheckout(prod, selectedRole, selectedRole === 'distributor' ? prod.distributorPricing.moq : 1)}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-200" />
                  <span>Instant Buy with QR / Fiat</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Specs View Modal */}
      {selectedProductDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cyber-900 border border-cyan-500/50 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-[0_0_40px_rgba(6,182,212,0.25)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-cyan-900/60 pb-3">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  {selectedProductDetails.brand}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedProductDetails.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProductDetails(null)}
                className="text-slate-400 hover:text-white text-xs font-mono p-1 rounded bg-cyber-800"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <img
                src={selectedProductDetails.image}
                alt={selectedProductDetails.name}
                className="w-full h-48 rounded-2xl object-cover border border-cyan-800/60"
              />
              <div className="space-y-2 text-xs font-mono bg-cyber-950 p-4 rounded-2xl border border-cyan-950">
                <span className="text-cyan-300 font-bold block mb-1">Technical Specifications:</span>
                {Object.entries(selectedProductDetails.specs).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-slate-300">
                    <span className="text-slate-500">{k}:</span>
                    <span className="text-slate-200 text-right">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-black/50 rounded-xl border border-cyan-950 space-y-1 text-xs font-mono">
              <div className="text-slate-400">
                Export & Sanctions Status: <span className="text-amber-400 font-bold">{selectedProductDetails.exportControlStatus}</span>
              </div>
              <div className="text-slate-400">
                Distributor Tier: <span className="text-emerald-400 font-bold">MOQ {selectedProductDetails.distributorPricing.moq} Units ({selectedProductDetails.distributorPricing.buyerRole})</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  const p = selectedProductDetails;
                  setSelectedProductDetails(null);
                  onOpenCheckout(p, selectedRole, 1);
                }}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
