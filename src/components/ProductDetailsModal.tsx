import React, { useState } from 'react';
import { X, ShoppingBag, Check, MessageCircle, Tag, Zap, Sparkles, TrendingDown, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, StoreSettings } from '../types';
import { formatCurrency } from '../utils/storage';

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

  const cleanPhone = settings.whatsappPhone.replace(/\D/g, '');
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
    const text = `Hola LOS FARRUS HUB! Deseo consultar/adquirir el producto *[${product.code}] ${product.name}*\n• Cantidad: ${quantity} ${isBox ? 'Caja(s)' : 'Unidad(es)'}\n• Precio Unitario: ${formatCurrency(currentPrice, settings.currencySymbol)}\n• Total: ${formatCurrency(currentPrice * quantity, settings.currencySymbol)}`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        id={`product-details-modal-${product.id}`}
        className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 transition-all text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          id="close-details-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 bg-white/90 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full transition-all cursor-pointer backdrop-blur-md border border-slate-200 shadow-sm"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image Stage */}
          <div className="relative bg-slate-50 min-h-[320px] md:min-h-[480px] flex items-center justify-center p-6 overflow-hidden border-b md:border-b-0 md:border-r border-slate-200">
            {/* Day Image */}
            <img
              src={product.image}
              alt={`${product.name} - Acabado de día`}
              className={`max-h-[380px] w-auto object-contain rounded-2xl shadow-md transition-all duration-500 ${
                showNightView ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=800&q=80';
              }}
            />

            {/* Night Image */}
            {hasNightImage && (
              <img
                src={product.nightImage}
                alt={`${product.name} - Iluminación encendida`}
                className={`absolute inset-0 m-auto max-h-[380px] w-auto object-contain rounded-2xl shadow-xl transition-all duration-500 ${
                  showNightView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}

            {/* Ambient flare */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-100/40 via-transparent to-transparent pointer-events-none" />

            {/* Badges top left */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
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

            {/* Day / Night Switcher */}
            {hasNightImage && (
              <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowNightView(!showNightView)}
                  className="px-4 py-2 rounded-2xl bg-white/95 hover:bg-white text-slate-800 border border-slate-300 shadow-md text-xs font-bold flex items-center gap-2 transition-all cursor-pointer hover:border-amber-400"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{showNightView ? '☀️ Ver Acabado de Día' : '🌙 Ver Efecto LED Encendido'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Product Details and Specs */}
          <div className="p-6 md:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto no-scrollbar bg-white">
            <div>
              <div className="text-xs font-black text-cyan-700 uppercase tracking-widest mb-1">
                {product.category}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {product.name}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>

              {/* Ficha Técnica Oficial */}
              <div className="mt-5 bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Ficha Técnica Oficial</span>
                </h4>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  {product.technicalSheet.dimensions && (
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Dimensiones</span>
                      <span className="font-bold text-slate-800">
                        {product.technicalSheet.dimensions}
                      </span>
                    </div>
                  )}

                  {product.technicalSheet.material && (
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Material</span>
                      <span className="font-bold text-slate-800">
                        {product.technicalSheet.material}
                      </span>
                    </div>
                  )}

                  {product.technicalSheet.lights && (
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Iluminación</span>
                      <span className="font-bold text-amber-600 flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-amber-500" />
                        {product.technicalSheet.lights}
                      </span>
                    </div>
                  )}

                  {product.technicalSheet.voltage && (
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Voltaje</span>
                      <span className="font-bold text-slate-800">
                        {product.technicalSheet.voltage}
                      </span>
                    </div>
                  )}

                  {product.technicalSheet.weight && (
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Peso Aprox.</span>
                      <span className="font-bold text-slate-800">
                        {product.technicalSheet.weight}
                      </span>
                    </div>
                  )}

                  {product.technicalSheet.models && (
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Modelos</span>
                      <span className="font-bold text-slate-800">
                        {product.technicalSheet.models}
                      </span>
                    </div>
                  )}

                  {product.technicalSheet.packaging && (
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs col-span-2">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Empaque / Presentación</span>
                      <span className="font-bold text-slate-800">
                        {product.technicalSheet.packaging}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Buying & Pricing Section */}
            <div className="mt-6 pt-5 border-t border-slate-200">
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
    </div>
  );
};
