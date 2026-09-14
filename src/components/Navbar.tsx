import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Search,
  ShieldCheck,
  MessageCircle,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Tag,
  Layers
} from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { formatCurrency } from '../utils/storage';
import { SmartSearch } from './SmartSearch';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  products: Product[];
  settings: StoreSettings;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSelectProduct: (product: Product) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: string[];
  viewMode: 'all' | 'unit' | 'box';
  onViewModeChange: (mode: 'all' | 'unit' | 'box') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  products,
  settings,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenAdmin,
  searchTerm,
  onSearchChange,
  onSelectProduct,
  selectedCategory,
  onSelectCategory,
  categories,
  viewMode,
  onViewModeChange,
}) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const cleanPhone = settings.whatsappPhone.replace(/\D/g, '');
  const directWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hola, deseo realizar una consulta sobre sus productos del catálogo LOS FARRUS HUB.')}`;

  const hasActiveFilter = selectedCategory !== 'Todos' || viewMode !== 'all';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all text-slate-900">
      {/* Main Navbar Line */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand Logo with exact LOS FARRUS HUB branding for light theme */}
          <div className="flex items-center gap-3 shrink-0">
            <BrandLogo size="md" theme="light" />
            <div className="hidden xl:flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
              <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
                Catálogo Oficial 2026
              </span>
            </div>
          </div>

          {/* Desktop Smart Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-2 lg:mx-6">
            <SmartSearch
              products={products}
              settings={settings}
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
              onSelectProduct={onSelectProduct}
              onSelectCategory={onSelectCategory}
            />
          </div>

          {/* Right Actions: WhatsApp + Admin + Cart */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Mobile Search Toggle */}
            <button
              id="mobile-search-toggle"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden p-2.5 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Direct WhatsApp Pill in soft emerald outline */}
            <a
              id="whatsapp-chat-button"
              href={directWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-2xl transition-all shadow-xs cursor-pointer"
              title="Escribir por WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </a>

            {/* Admin Access Discrete Button */}
            <button
              id="header-admin-access-button"
              onClick={onOpenAdmin}
              className="p-2 sm:px-2.5 sm:py-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
              title="Panel de Administración"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            {/* Cart Button with Cyan surface & Amber badge */}
            <button
              id="open-cart-button"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2.5 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white font-black rounded-2xl shadow-sm shadow-cyan-600/20 transition-all cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-amber-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="text-left hidden xs:block">
                <span className="text-xs font-black block leading-tight text-white">
                  {formatCurrency(cartTotal, settings.currencySymbol)}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Smart Search Container */}
        {showMobileSearch && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-200">
            <SmartSearch
              products={products}
              settings={settings}
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
              onSelectProduct={(p) => {
                onSelectProduct(p);
                setShowMobileSearch(false);
              }}
              onSelectCategory={onSelectCategory}
              isMobile={true}
            />
          </div>
        )}

        {/* Acordeón de Filtros y Categorías */}
        <div className="mt-3 pt-2.5 border-t border-slate-200">
          {/* Barra de Encabezado del Acordeón */}
          <div className="flex items-center justify-between gap-3">
            <button
              id="filter-accordion-toggle-btn"
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-600" />
              <span>Filtros & Categorías</span>
              <motion.div
                animate={{ rotate: isAccordionOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </motion.div>
            </button>

            {/* Badges de filtros activos o resumen */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px] hidden sm:inline">
                Filtrado:
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-cyan-700 font-bold text-[11px] shadow-xs">
                {selectedCategory}
              </span>
              {viewMode !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[11px]">
                  {viewMode === 'unit' ? 'Por Unidad' : 'Por Caja'}
                </span>
              )}

              {hasActiveFilter && (
                <button
                  onClick={() => {
                    onSelectCategory('Todos');
                    onViewModeChange('all');
                  }}
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 px-2 py-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Restablecer filtros"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden xs:inline">Limpiar</span>
                </button>
              )}
            </div>
          </div>

          {/* Contenido Desplegable del Acordeón con Animación Suave */}
          <AnimatePresence>
            {isAccordionOpen && (
              <motion.div
                key="filter-accordion-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-3 pb-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bloque 1: Categorías */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      <Tag className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Categorías</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {categories.map((cat) => {
                        const isActive = selectedCategory === cat;
                        return (
                          <button
                            key={cat}
                            id={`accordion-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                            onClick={() => onSelectCategory(cat)}
                            className={`px-3 py-1 text-xs rounded-xl whitespace-nowrap transition-all duration-150 cursor-pointer font-bold ${
                              isActive
                                ? 'bg-cyan-600 text-white shadow-sm'
                                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bloque 2: Modalidad de Compra (Unidad vs Mayor) */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      <Layers className="w-3.5 h-3.5 text-amber-500" />
                      <span>Modalidad de Compra</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-200/70 p-1.5 rounded-xl text-xs font-bold">
                      <button
                        id="accordion-mode-all"
                        onClick={() => onViewModeChange('all')}
                        className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                          viewMode === 'all'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Todos
                      </button>
                      <button
                        id="accordion-mode-unit"
                        onClick={() => onViewModeChange('unit')}
                        className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                          viewMode === 'unit'
                            ? 'bg-cyan-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Por Unidad
                      </button>
                      <button
                        id="accordion-mode-box"
                        onClick={() => onViewModeChange('box')}
                        className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                          viewMode === 'box'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Por Caja / Mayor
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
