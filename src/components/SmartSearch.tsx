import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, X, ArrowUpRight, Tag, Zap, ArrowRight } from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { formatCurrency } from '../utils/storage';

interface SmartSearchProps {
  products: Product[];
  settings: StoreSettings;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (category: string) => void;
  placeholder?: string;
  isMobile?: boolean;
}

export const SmartSearch: React.FC<SmartSearchProps> = ({
  products,
  settings,
  searchTerm,
  onSearchChange,
  onSelectProduct,
  onSelectCategory,
  placeholder = "Buscar por código (ej: NT-7), muñeco, luces LED...",
  isMobile = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter products smartly
  const normalizedQuery = searchTerm.trim().toLowerCase();
  
  const searchResults = normalizedQuery
    ? products
        .filter((p) => {
          if (!p.active) return false;
          const codeMatch = p.code.toLowerCase().includes(normalizedQuery);
          const nameMatch = p.name.toLowerCase().includes(normalizedQuery);
          const catMatch = p.category.toLowerCase().includes(normalizedQuery);
          const descMatch = p.description.toLowerCase().includes(normalizedQuery);
          const lightMatch = p.technicalSheet.lights?.toLowerCase().includes(normalizedQuery);
          const materialMatch = p.technicalSheet.material?.toLowerCase().includes(normalizedQuery);
          return codeMatch || nameMatch || catMatch || descMatch || lightMatch || materialMatch;
        })
        .slice(0, 6)
    : [];

  const popularTags = ['NT-7', 'Luces LED', 'Muñecos', 'Acrílico', 'Caja Mayorista'];

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        e.preventDefault();
        onSelectProduct(searchResults[selectedIndex]);
        setIsOpen(false);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Container with vibrant focus glow */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 flex items-center pointer-events-none">
          <Search className={`w-4 h-4 transition-colors duration-200 ${isOpen ? 'text-amber-500' : 'text-slate-400'}`} />
        </div>

        <input
          ref={inputRef}
          id={isMobile ? "search-input-mobile" : "search-input-desktop"}
          type="text"
          value={searchTerm}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 rounded-2xl outline-hidden transition-all duration-200 text-slate-900 placeholder:text-slate-500 font-medium"
        />

        {searchTerm ? (
          <button
            onClick={() => {
              onSearchChange('');
              setSelectedIndex(-1);
              inputRef.current?.focus();
            }}
            className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Borrar búsqueda"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="hidden lg:flex items-center absolute right-3 pointer-events-none">
            <span className="text-[10px] font-mono text-slate-400 bg-slate-200/80 px-1.5 py-0.5 rounded border border-slate-300">
              Buscar
            </span>
          </div>
        )}
      </div>

      {/* Smart Suggestions & Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full mt-2 z-50 bg-white/98 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden divide-y divide-slate-100"
          >
            {/* When typing with results */}
            {normalizedQuery && searchResults.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Sugerencias instantáneas
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {searchResults.length} {searchResults.length === 1 ? 'coincidencia' : 'coincidencias'}
                  </span>
                </div>

                <div className="space-y-1 mt-1">
                  {searchResults.map((product, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <div
                        key={`smart-res-${product.id}`}
                        onClick={() => {
                          onSelectProduct(product);
                          setIsOpen(false);
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex items-center gap-3 p-2 rounded-xl transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'hover:bg-slate-100 text-slate-900'
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Title and Code */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                              }`}
                            >
                              {product.code}
                            </span>
                            <span
                              className={`text-[11px] truncate font-medium ${
                                isSelected ? 'text-slate-300' : 'text-slate-500'
                              }`}
                            >
                              {product.category}
                            </span>
                          </div>
                          <p className="text-xs font-semibold truncate mt-0.5">
                            {product.name}
                          </p>
                        </div>

                        {/* Price & Action Arrow */}
                        <div className="text-right shrink-0">
                          <span
                            className={`text-xs font-extrabold ${
                              isSelected ? 'text-amber-400' : 'text-slate-900'
                            }`}
                          >
                            {formatCurrency(product.priceUnit, settings.currencySymbol)}
                          </span>
                          <div className="flex items-center justify-end text-[10px] opacity-70 mt-0.5 gap-0.5">
                            <span>Ver</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* When typing but no direct results */}
            {normalizedQuery && searchResults.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-xs text-slate-500">
                  No se encontraron productos para <strong className="text-slate-900">"{searchTerm}"</strong>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Prueba buscando por código (ej: NT-7), luces LED o categoría.
                </p>
              </div>
            )}

            {/* Quick Popular Tags & Smart Prompts */}
            <div className="p-3 bg-slate-50">
              <div className="flex items-center gap-2 mb-2 text-[11px] font-medium text-slate-500">
                <Tag className="w-3 h-3 text-slate-400" />
                <span>Búsquedas frecuentes:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      onSearchChange(tag);
                      inputRef.current?.focus();
                    }}
                    className="px-2.5 py-1 text-xs rounded-lg bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
