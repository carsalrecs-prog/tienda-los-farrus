import React, { useState } from 'react';
import { X, ShoppingBag, Check, MessageCircle, Tag, Zap, Sparkles, TrendingDown, Eye, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, StoreSettings } from '../types';
import { formatCurrency, generateProductConsultUrl } from '../utils/storage';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, mode: 'unit' | 'box') => void;
  settings: StoreSettings;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onAddToCart,
  settings,
}) => {
  if (!product) return null;

  const [mode, setMode] = useState<'unit' | 'box'>(product.priceBox ? 'unit' : 'unit');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showNightView, setShowNightView] = useState(false);

  const isBox = mode === 'box' && !!product.priceBox;
  const currentPrice = isBox ? product.priceBox! : product.priceUnit;
  const hasNightImage = !!product.nightImage;

  // Wholesale calculation
  let unitEquivalentInBox = 0;
  let savingsPercent = 0;
  if (product.priceBox && product.boxQuantity && product.boxQuantity > 0) {
    unitEquivalentInBox = product.priceBox / product.boxQuantity;
    if (product.priceUnit > 0) {
      savingsPercent = Math.round(
        ((product.priceUnit - unitEquivalentInBox) / product.priceUnit) * 100
      );
    }
  }

  const handleAdd = (e: React.MouseEvent) => {
    onAddToCart(product, quantity, mode);
    setAdded(true);

    try {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { x, y },
        colors: ['#06b6d4', '#f59e0b', '#f97316', '#ffffff'],
        ticks: 200,
      });
    } catch {
      // Ignore
    }

    setTimeout(() => setAdded(false), 1500);
  };

  const handleDirectWhatsApp = () => {
    const url = generateProductConsultUrl(product, quantity, mode, settings);
    window.open(url, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden"
      onClick={onClose}
    >
      <div
        id={`product-details-modal-${product.id}`}
        className="relative bg-white w-full max-w-4xl h-[94dvh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Dedicated Fixed Header (Visible on phones < md) */}
        <div className="flex md:hidden items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold bg-cyan-50 text-cyan-800 rounded-lg border border-cyan-200">
              {product.code}
            </span>
            <span className="text-xs font-bold text-slate-600 truncate max-w-[170px]">
              {product.category}
            </span>
          </div>

          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto" />

          <button
            id="close-details-modal-mobile-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Close Button (Visible on >= md) */}
        <button
          id="close-details-modal-btn"
          onClick={onClose}
          className="hidden md:flex absolute top-4 right-4 z-30 p-2.5 bg-white/90 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full transition-all cursor-pointer backdrop-blur-md border border-slate-200 shadow-sm"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Unified Scrollable Container */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Product Image Stage */}
            <div className="relative bg-slate-50 min-h-[260px] sm:min-h-[340px] md:min-h-[480px] flex items-center justify-center p-4 sm:p-6 overflow-hidden border-b md:border-b-0 md:border-r border-slate-200">
              {/* Day Image */}
              <img
                src={product.image}
                alt={`${product.name} - Acabado de día`}
                className={`max-h-[230px] sm:max-h-[300px] md:max-h-[380px] w-auto object-contain rounded-2xl shadow-sm transition-all duration-500 ${
                  showNightView ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    '/products/hero-showcase.png';
                }}
              />

              {/* Night Image */}
              {hasNightImage && (
                <img
                  src={product.nightImage}
                  alt={`${product.name} - Iluminación encendida`}
                  className={`absolute inset-0 m-auto max-h-[230px] sm:max-h-[300px] md:max-h-[380px] w-auto object-contain rounded-2xl shadow-xl transition-all duration-500 ${
                    showNightView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}

              {/* Badges on desktop / tablet */}
              <div className="hidden md:flex absolute top-4 left-4 flex-wrap gap-2 z-10">
                <span className="px-3 py-1 text-xs font-mono font-black bg-white/95 text-cyan-800 rounded-xl border border-cyan-200 shadow-sm backdrop-blur-xs">
                  {product.code}
                </span>
                {product.technicalSheet.lights && (
                  <span className="px-2.5 py-1 text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-sm flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-white" />
                    {product.technicalSheet.lights.split(' ')[0]} LED
                  </span>
                )}
              </div>

              {/* Day / Night Switcher Button */}
              {hasNightImage && (
                <div className="absolute bottom-3 left-4 right-4 z-10 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowNightView(!showNightView)}
                    className="px-4 py-2 rounded-full bg-white/95 hover:bg-white text-slate-800 border border-slate-300 shadow-md text-xs font-bold flex items-center gap-2 transition-all cursor-pointer hover:border-amber-400 active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{showNightView ? '☀️ Ver Acabado de Día' : '🌙 Ver Efecto LED Encendido'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Product Details and Specs */}
            <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-between bg-white">
              <div>
                <div className="text-[11px] sm:text-xs font-black text-cyan-700 uppercase tracking-widest mb-1">
                  {product.category}
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
                  {product.name}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </p>

                {/* Ficha Técnica Oficial */}
                <div className="mt-4 sm:mt-5 bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-200">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2.5 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Ficha Técnica Oficial</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5 text-xs">
                    {product.technicalSheet.dimensions && (
                      <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Dimensiones</span>
                        <span className="font-bold text-slate-800">
                          {product.technicalSheet.dimensions}
                        </span>
                      </div>
                    )}

                    {product.technicalSheet.material && (
                      <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Material</span>
                        <span className="font-bold text-slate-800">
                          {product.technicalSheet.material}
                        </span>
                      </div>
                    )}

                    {product.technicalSheet.lights && (
                      <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Iluminación</span>
                        <span className="font-bold text-amber-600 flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-amber-500" />
                          {product.technicalSheet.lights}
                        </span>
                      </div>
                    )}

                    {product.technicalSheet.voltage && (
                      <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Voltaje</span>
                        <span className="font-bold text-slate-800">
                          {product.technicalSheet.voltage}
                        </span>
                      </div>
                    )}

                    {product.technicalSheet.weight && (
                      <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Peso Aprox.</span>
                        <span className="font-bold text-slate-800">
                          {product.technicalSheet.weight}
                        </span>
                      </div>
                    )}

                    {product.technicalSheet.models && (
                      <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Modelos</span>
                        <span className="font-bold text-slate-800">
                          {product.technicalSheet.models}
                        </span>
                      </div>
                    )}

                    {product.technicalSheet.packaging && (
                      <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs col-span-2">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Empaque / Presentación</span>
                        <span className="font-bold text-slate-800">
                          {product.technicalSheet.packaging}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Desktop Buying & Pricing Section (Hidden on mobile < md) */}
              <div className="hidden md:block mt-6 pt-5 border-t border-slate-200">
                {product.priceBox && (
                  <div className="flex gap-2 mb-3 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    <button
                      id="modal-mode-unit"
                      type="button"
                      onClick={() => setMode('unit')}
                      className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                        mode === 'unit'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Por Unidad ({formatCurrency(product.priceUnit, settings.currencySymbol)})
                    </button>
                    <button
                      id="modal-mode-box"
                      type="button"
                      onClick={() => setMode('box')}
                      className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        mode === 'box'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Por Caja ({formatCurrency(product.priceBox, settings.currencySymbol)})</span>
                      {savingsPercent > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px] font-bold">
                          -{savingsPercent}%
                        </span>
                      )}
                    </button>
                  </div>
                )}

                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="text-[11px] text-slate-500 uppercase font-bold block">Precio de Venta:</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900 tracking-tight">
                        {formatCurrency(currentPrice, settings.currencySymbol)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {isBox ? `/ Caja (${product.boxQuantity} und)` : '/ unidad'}
                      </span>
                    </div>

                    {isBox && unitEquivalentInBox > 0 ? (
                      <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>
                          Sale a {formatCurrency(unitEquivalentInBox, settings.currencySymbol)} c/u
                          {savingsPercent > 0 ? ` (Ahorro del ${savingsPercent}% por volumen)` : ''}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-200 rounded-2xl bg-slate-100 h-11 overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 h-full text-slate-600 hover:bg-slate-200 hover:text-slate-900 text-xs font-bold cursor-pointer transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-black text-slate-900 text-xs">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-4 h-full text-slate-600 hover:bg-slate-200 hover:text-slate-900 text-xs font-bold cursor-pointer transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <button
                      id="modal-add-to-cart-btn"
                      onClick={handleAdd}
                      className={`flex-1 h-11 font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                        added
                          ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25'
                      }`}
                    >
                      {added ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>¡Agregado al Carrito!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 text-white" />
                          <span>Agregar al Carrito</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    id="modal-direct-whatsapp-btn"
                    onClick={handleDirectWhatsApp}
                    className="w-full h-11 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Consultar Stock & Despacho por WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action Bar on Mobile (Visible on < md) */}
        <div className="block md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md p-3 shadow-xl shrink-0">
          {/* Mode Switcher on Mobile */}
          {product.priceBox && (
            <div className="flex gap-1.5 mb-2.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setMode('unit')}
                className={`flex-1 py-1.5 font-bold rounded-lg transition-all text-center cursor-pointer ${
                  mode === 'unit'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Unidad ({formatCurrency(product.priceUnit, settings.currencySymbol)})
              </button>
              <button
                type="button"
                onClick={() => setMode('box')}
                className={`flex-1 py-1.5 font-bold rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                  mode === 'box'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                <span>Caja ({formatCurrency(product.priceBox, settings.currencySymbol)})</span>
                {savingsPercent > 0 && (
                  <span className="px-1 py-0.2 rounded-full bg-white/20 text-white text-[9px]">
                    -{savingsPercent}%
                  </span>
                )}
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Price Tag on mobile */}
            <div className="shrink-0 pr-1">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Total:</span>
              <span className="text-lg font-black text-slate-900 leading-none">
                {formatCurrency(currentPrice * quantity, settings.currencySymbol)}
              </span>
            </div>

            {/* Stepper on mobile */}
            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-100 h-10 overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-full text-slate-600 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                -
              </button>
              <span className="w-6 text-center font-black text-slate-900 text-xs">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-full text-slate-600 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              id="modal-add-to-cart-mobile-btn"
              onClick={handleAdd}
              className={`flex-1 h-10 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                added
                  ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                  : 'bg-amber-500 hover:bg-amber-600 active:scale-95 text-white shadow-amber-500/25'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>¡Listo!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-white" />
                  <span>Agregar</span>
                </>
              )}
            </button>

            {/* Direct WhatsApp button on mobile */}
            <button
              id="modal-whatsapp-mobile-btn"
              onClick={handleDirectWhatsApp}
              className="w-10 h-10 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-700 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0"
              title="Consultar por WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

