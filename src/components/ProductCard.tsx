import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Eye, MessageCircle, Check, Zap, Sparkles, TrendingDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, StoreSettings } from '../types';
import { formatCurrency } from '../utils/storage';

interface ProductCardProps {
  product: Product;
  settings: StoreSettings;
  onAddToCart: (product: Product, quantity: number, mode: 'unit' | 'box') => void;
  onOpenDetails: (product: Product) => void;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  settings,
  onAddToCart,
  onOpenDetails,
  index = 0,
}) => {
  const [selectedMode, setSelectedMode] = useState<'unit' | 'box'>(
    product.priceBox ? 'unit' : 'unit'
  );
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [showNightView, setShowNightView] = useState(false);

  const cleanPhone = settings.whatsappPhone.replace(/\D/g, '');
  const isBoxMode = selectedMode === 'box' && !!product.priceBox;
  const currentPrice = isBoxMode ? product.priceBox! : product.priceUnit;
  const hasNightImage = !!product.nightImage;

  // Calculate Wholesale Savings Psychology
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
    onAddToCart(product, quantity, selectedMode);
    setAddedAnimation(true);

    // Interactive Confetti Burst with Brand Colors
    try {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { x, y },
        colors: ['#06b6d4', '#f59e0b', '#f97316', '#ffffff'],
        disableForReducedMotion: true,
        ticks: 180,
      });
    } catch {
      // Ignore if confetti fails
    }

    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const directConsultUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hola LOS FARRUS HUB! Deseo consultar detalles y disponibilidad de *[${product.code}] ${product.name}* (Precio: ${formatCurrency(currentPrice, settings.currencySymbol)}).`
  )}`;

  return (
    <motion.div
      layout
      variants={{
        hidden: { opacity: 0, y: 18, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.38,
            delay: Math.min(index * 0.03, 0.22),
            ease: [0.22, 1, 0.36, 1],
          },
        },
        exit: {
          opacity: 0,
          scale: 0.95,
          transition: { duration: 0.2 },
        },
      }}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ y: -5, transition: { duration: 0.22, ease: 'easeOut' } }}
      id={`product-card-${product.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-300/80 bg-slate-100 transition-all duration-200 hover:border-slate-400 hover:shadow-md shadow-xs"
    >
      {/* Product Image Area with Light Surface & Subtle Overlay */}
      <div
        className="relative aspect-square w-full overflow-hidden bg-slate-200/50 cursor-pointer"
        onClick={() => onOpenDetails(product)}
      >
        {/* Day photo (finish & material) */}
        <img
          src={product.image}
          alt={`${product.name} - Vista de día`}
          loading="lazy"
          className={`h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
            showNightView ? 'opacity-0' : 'opacity-100 group-hover:opacity-20'
          }`}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Night illuminated photo (encendido con luces LED) */}
        {hasNightImage && (
          <img
            src={product.nightImage}
            alt={`${product.name} - Vista nocturna encendido`}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
              showNightView ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}

        {/* Ambient Dark Gradient Shade on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          <span className="rounded-lg bg-white/95 px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-900 shadow-xs border border-slate-200">
            {product.code}
          </span>
          {product.technicalSheet.lights && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-bold shadow-xs">
              <Zap className="h-3 w-3 fill-amber-600 text-amber-600" />
              {product.technicalSheet.lights.split(' ')[0]} LED
            </span>
          )}
        </div>

        {/* Quick View Button */}
        <button
          id={`btn-view-quick-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(product);
          }}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-xs hover:bg-white hover:text-slate-900 hover:scale-105 transition-all cursor-pointer"
          title="Ver ficha técnica completa"
        >
          <Eye className="h-4 w-4" />
        </button>

        {/* Day / Night View Toggle Pill (when nightImage is available) */}
        {hasNightImage && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowNightView(!showNightView);
            }}
            className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-xl bg-white/90 hover:bg-white text-amber-800 border border-amber-200 shadow-sm text-[10px] font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="Cambiar entre vista de día y noche encendida"
          >
            <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>{showNightView ? '☀️ Ver de Día' : '🌙 Ver Encendido'}</span>
          </button>
        )}

        {/* Dimensions Pill Bottom Left */}
        {product.technicalSheet.dimensions && (
          <div className="absolute bottom-3 left-3 pointer-events-none z-10">
            <span className="inline-block rounded-lg bg-white/90 px-2 py-0.5 text-[10px] font-medium text-slate-700 shadow-xs border border-slate-200">
              📐 {product.technicalSheet.dimensions}
            </span>
          </div>
        )}
      </div>

      {/* Card Info & Pricing Body */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          {/* Category & Material Line */}
          <div className="flex items-center justify-between gap-1 text-xs mb-1">
            <span className="font-bold uppercase tracking-wider text-cyan-700 text-[11px]">
              {product.category}
            </span>
            {product.technicalSheet.material && (
              <span className="truncate max-w-[130px] text-slate-500 font-medium text-[11px]">
                {product.technicalSheet.material}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onOpenDetails(product)}
            className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 leading-snug hover:text-cyan-700 transition-colors cursor-pointer"
          >
            {product.name}
          </h3>
        </div>

        {/* Pricing Area with B2B/B2C Psychology */}
        <div className="mt-4 pt-3 border-t border-slate-200">
          {/* Unit vs Box Switcher (Segmented Control) */}
          {product.priceBox ? (
            <div className="mb-3 flex items-center rounded-xl bg-slate-200/80 p-1 text-xs font-semibold border border-slate-300/50">
              <button
                id={`btn-mode-unit-${product.id}`}
                type="button"
                onClick={() => setSelectedMode('unit')}
                className={`flex-1 rounded-lg py-1.5 transition-all cursor-pointer ${
                  selectedMode === 'unit'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Unidad
              </button>
              <button
                id={`btn-mode-box-${product.id}`}
                type="button"
                onClick={() => setSelectedMode('box')}
                className={`flex-1 rounded-lg py-1.5 transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  selectedMode === 'box'
                    ? 'bg-amber-500 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Caja ({product.boxQuantity || 'Mayor'})</span>
                {savingsPercent > 0 && selectedMode !== 'box' && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                    -{savingsPercent}%
                  </span>
                )}
              </button>
            </div>
          ) : null}

          {/* Active Price & Value Breakdown */}
          <div className="mb-3.5">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  {formatCurrency(currentPrice, settings.currencySymbol)}
                </span>
                <span className="ml-1.5 text-xs text-slate-500 font-medium">
                  {isBoxMode ? `/ caja (${product.boxQuantity} unds)` : '/ unidad'}
                </span>
              </div>
            </div>

            {/* Micro-breakdown of wholesale savings */}
            {isBoxMode && unitEquivalentInBox > 0 ? (
              <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Sale a {formatCurrency(unitEquivalentInBox, settings.currencySymbol)} c/u
                  {savingsPercent > 0 ? ` (Ahorras ${savingsPercent}%)` : ''}
                </span>
              </div>
            ) : !isBoxMode && product.priceBox && unitEquivalentInBox > 0 ? (
              <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                <span>Por mayor:</span>
                <span className="text-amber-600 font-bold">
                  {formatCurrency(unitEquivalentInBox, settings.currencySymbol)} c/u
                </span>
                <span className="text-slate-400 text-[10px]">(llevando caja)</span>
              </div>
            ) : null}
          </div>

          {/* Stepper & Primary Cart Action (Visual Hero CTA) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {/* Stepper on bg-white */}
              <div className="flex h-11 items-center rounded-xl border border-slate-300/80 bg-white overflow-hidden shadow-xs">
                <button
                  id={`btn-qty-minus-${product.id}`}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 h-full text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="w-7 text-center text-xs font-black text-slate-900">
                  {quantity}
                </span>
                <button
                  id={`btn-qty-plus-${product.id}`}
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 h-full text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Primary Visual Hero Button: Warm Amber/Orange */}
              <button
                id={`btn-add-cart-${product.id}`}
                onClick={handleAdd}
                className={`flex-1 h-11 flex items-center justify-center gap-2 px-4 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer shadow-xs ${
                  addedAnimation
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : 'bg-amber-500 hover:bg-amber-600 active:scale-95 text-white shadow-amber-500/20 hover:shadow-md'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>¡Agregado al Pedido!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-white" />
                    <span>Agregar al Carrito</span>
                  </>
                )}
              </button>
            </div>

            {/* Discrete Text Link for Consultation (No decision fatigue) */}
            <div className="text-center pt-1">
              <a
                href={directConsultUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-emerald-600 transition-colors py-0.5 cursor-pointer font-medium"
              >
                <MessageCircle className="w-3 h-3 text-emerald-600" />
                <span>¿Dudas? Consultar stock por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
