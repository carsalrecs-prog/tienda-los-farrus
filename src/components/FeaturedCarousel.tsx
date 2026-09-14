import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { formatCurrency } from '../utils/storage';

interface FeaturedCarouselProps {
  products: Product[];
  settings: StoreSettings;
  onOpenDetails: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, mode: 'unit' | 'box') => void;
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  products,
  settings,
  onOpenDetails,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const featured = products.filter((p) => p.isFeatured && p.active);
  const items = featured.length > 0 ? featured : products.slice(0, 8);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!items.length) return null;

  return (
    <div className="w-full py-8 relative group/carousel bg-slate-50 text-slate-900 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Flame className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black tracking-tight uppercase text-slate-900">
                Farrus Trending Hub
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-mono font-bold uppercase tracking-wider border border-cyan-200">
                Top Ventas
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Los modelos más solicitados para entrega inmediata y negocio
            </p>
          </div>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-9 h-9 rounded-full border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-all duration-150 shadow-xs cursor-pointer active:scale-95"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-9 h-9 rounded-full border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-all duration-150 shadow-xs cursor-pointer active:scale-95"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track with complete scrollbar hiding */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-3 scrollbar-none no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
      >
        {items.map((product) => {
          return (
            <div
              key={`featured-${product.id}`}
              onClick={() => onOpenDetails(product)}
              className="group/item relative flex-none w-[230px] sm:w-[280px] md:w-[320px] aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-white hover:border-amber-400 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
            >
              {/* Image */}
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    '/products/hero-showcase.png';
                }}
              />

              {/* Ambient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/10 opacity-70 group-hover/item:opacity-85 transition-opacity duration-200" />

              {/* Code Pill Badge Top Left */}
              <div className="absolute top-3.5 left-3.5 z-10">
                <span className="px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider bg-white/95 text-slate-900 rounded-lg shadow-sm border border-slate-200">
                  {product.code}
                </span>
              </div>

              {/* Glassmorphic Floating Pill Label */}
              <div className="absolute bottom-0 left-0 w-full p-3.5 z-10">
                <div className="flex items-center justify-between rounded-xl border border-white/20 bg-slate-950/80 p-1.5 pl-3 shadow-lg backdrop-blur-md">
                  <h4 className="mr-2 text-xs font-bold text-white truncate flex-1">
                    {product.name}
                  </h4>
                  <span className="flex-none rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-black text-white shadow-xs">
                    {formatCurrency(product.priceUnit, settings.currencySymbol)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

