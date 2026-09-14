import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Product,
  CartItem,
  StoreSettings,
  DeliveryType
} from './types';
import {
  getStoredProducts,
  saveProducts,
  resetToInitialProducts,
  getStoredSettings,
  saveSettings,
  formatCurrency
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminPanel } from './components/AdminPanel';
import { QuickWhatsAppFloat } from './components/QuickWhatsAppFloat';
import { FeaturedCarousel } from './components/FeaturedCarousel';
import { BrandLogo } from './components/BrandLogo';
import {
  ShoppingBag,
  Sparkles,
  Truck,
  ShieldCheck,
  Zap,
  Filter,
  ArrowRight,
  PackageCheck,
  MessageCircle,
  Flame,
  CheckCircle2,
  Shield,
  CreditCard,
  Box
} from 'lucide-react';

const CART_STORAGE_KEY = 'tienda_cart_items_v1';

export default function App() {
  // Store Data & Settings
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [settings, setSettings] = useState<StoreSettings>(getStoredSettings);

  // Cart State with localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [viewMode, setViewMode] = useState<'all' | 'unit' | 'box'>('all');

  // WhatsApp link without exposing raw number in button text
  const cleanPhone = settings.whatsappPhone.replace(/\D/g, '');
  const directWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    'Hola! Deseo comunicarme para realizar una consulta y pedidos en el catálogo LOS FARRUS HUB.'
  )}`;

  // Save cart changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [cart]);

  // Derived Categories
  const categories = ['Todos', ...Array.from(new Set(products.map((p) => p.category)))];

  // Cart Totals
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => {
    const isBox = item.buyMode === 'box';
    const price = isBox ? (item.product.priceBox || item.product.priceUnit) : item.product.priceUnit;
    return acc + price * item.quantity;
  }, 0);

  // Add To Cart Handler
  const handleAddToCart = (product: Product, quantity: number, mode: 'unit' | 'box') => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.product.id === product.id && i.buyMode === mode
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity, buyMode: mode }];
    });
  };

  // Update Item Quantity
  const handleUpdateQuantity = (productId: string, buyMode: 'unit' | 'box', newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId, buyMode);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.buyMode === buyMode
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  // Remove Item From Cart
  const handleRemoveFromCart = (productId: string, buyMode: 'unit' | 'box') => {
    setCart((prev) =>
      prev.filter((i) => !(i.product.id === productId && i.buyMode === buyMode))
    );
  };

  // Clear Cart
  const handleClearCart = () => {
    setCart([]);
  };

  // Admin Product Operations
  const handleSaveProduct = (updatedProduct: Product) => {
    setProducts((prev) => {
      const index = prev.findIndex((p) => p.id === updatedProduct.id);
      let nextList: Product[];
      if (index >= 0) {
        nextList = [...prev];
        nextList[index] = updatedProduct;
      } else {
        nextList = [updatedProduct, ...prev];
      }
      saveProducts(nextList);
      return nextList;
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => {
      const nextList = prev.filter((p) => p.id !== productId);
      saveProducts(nextList);
      return nextList;
    });
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleResetCatalog = () => {
    const initial = resetToInitialProducts();
    setProducts(initial);
  };

  const handleImportCatalog = (imported: Product[]) => {
    saveProducts(imported);
    setProducts(imported);
  };

  const handleSaveSettings = (newSettings: StoreSettings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    if (!p.active) return false;

    // Search query
    const matchSearch =
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.technicalSheet.material &&
        p.technicalSheet.material.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.technicalSheet.dimensions &&
        p.technicalSheet.dimensions.toLowerCase().includes(searchTerm.toLowerCase()));

    // Category filter
    const matchCategory =
      selectedCategory === 'Todos' || p.category === selectedCategory;

    // View mode filter (unit vs box)
    let matchMode = true;
    if (viewMode === 'box') {
      matchMode = !!p.priceBox;
    }

    return matchSearch && matchCategory && matchMode;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-amber-500 selection:text-white font-sans antialiased">
      {/* Modern Retail Navbar with Smart Search and LOS FARRUS HUB Identity */}
      <Navbar
        products={products}
        settings={settings}
        cartCount={cartCount}
        cartTotal={cartSubtotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelectProduct={(p) => setSelectedProduct(p)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={categories}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content Body with Slate-50 Background */}
      <main className="flex-1 bg-slate-50">
        {/* CRO & Benefit-Driven Hero Section (Luminous Clean Gradient) */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200 py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
          {/* Soft ambient breathing decorative flares */}
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-80 h-80 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Benefit-Driven Value Proposition */}
              <div className="lg:col-span-7">
                {/* Trust Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-800 mb-5 shadow-xs"
                >
                  <BrandLogo size="sm" showBadge={false} theme="light" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 animate-ping" />
                  <span className="text-slate-600 font-mono text-[11px]">Stock 2026 para Negocio & Decoración</span>
                </motion.div>

                {/* High-Converting Benefit Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.08 }}
                  className="text-3xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight text-slate-900 leading-[1.14]"
                >
                  <span className="text-cyan-600">Iluminación Navideña</span> y{' '}
                  <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                    Figuras LED
                  </span>{' '}
                  de Alto Impacto
                </motion.h1>

                {/* Value Hook */}
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.14 }}
                  className="mt-4 text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl"
                >
                  Venta por unidad y tarifas preferenciales por caja para mayoristas. Modelos exclusivos de acrílico 220V listos para transformar vitrinas, fachadas y hogares con máxima luminosidad.
                </motion.p>

                {/* Immediate Hooks / Guarantees */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="mt-5 flex flex-wrap items-center gap-2.5 text-xs text-slate-700"
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs font-semibold text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" /> Envíos a todo el Perú
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs font-semibold text-slate-800">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Descuento por volumen
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs font-semibold text-slate-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Probados antes del despacho
                  </span>
                </motion.div>

                {/* Quick Hero Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.26 }}
                  className="mt-8 flex flex-wrap items-center gap-3"
                >
                  <a
                    href="#catalogo"
                    className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-sm shadow-amber-500/20 transition-all hover:scale-102 cursor-pointer flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4 text-white" />
                    <span>Explorar Catálogo</span>
                  </a>

                  <a
                    href={directWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 hover:border-emerald-500 text-slate-800 font-bold text-xs sm:text-sm transition-all hover:scale-102 shadow-xs cursor-pointer flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Consultar por WhatsApp</span>
                  </a>
                </motion.div>
              </div>

              {/* Right Column: Emotional Nighttime Product Showcase */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="lg:col-span-5 relative"
              >
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 shadow-xl group">
                  {/* Nighttime Ambience Preview */}
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-950">
                    <img
                      src="/products/hero-showcase.png"
                      alt="Papá Noel Acrílico 130cm con 440 LED encendido de noche"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/20" />

                    {/* Glowing Live Tag */}
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 font-bold text-xs border border-amber-400/30 flex items-center gap-1.5 shadow-lg">
                        <Zap className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>Efecto Nocturno 220V</span>
                      </span>
                    </div>

                    <div className="absolute bottom-3.5 left-3.5 right-3.5">
                      <div className="p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-white font-bold text-xs">Figuras Acrílicas con Luces LED</p>
                          <p className="text-[11px] text-slate-400">Alto brillo para vitrinas y negocios</p>
                        </div>
                        <a
                          href="#catalogo"
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors"
                        >
                          Ver Modelos
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Showcase Carousel (No native scrollbar) */}
        {!searchTerm && selectedCategory === 'Todos' && (
          <FeaturedCarousel
            products={products}
            settings={settings}
            onOpenDetails={(p) => setSelectedProduct(p)}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* 4-Column Trust & Confidence Bar (Modern Retail Style) */}
        <section className="bg-slate-50 py-6 sm:py-8 px-3 sm:px-6 lg:px-8 border-b border-slate-200">
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3.5 p-3 sm:p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 border border-cyan-100 font-bold">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-tight truncate">Envíos a Todo el Perú</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">Agencias o express</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3.5 p-3 sm:p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 font-bold">
                <Box className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-tight truncate">Precios Mayoristas</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">Por bulto y caja</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3.5 p-3 sm:p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 font-bold">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-tight truncate">Probados 100%</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">Revisión de luces LED</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3.5 p-3 sm:p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 font-bold">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-tight truncate">Medios de Pago</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">Yape, Plin y BCP</p>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Section Header & Info */}
        <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                  Catálogo de Productos
                </h2>
                <motion.span
                  key={filteredProducts.length}
                  initial={{ scale: 0.85, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs font-bold px-3 py-1 bg-cyan-600 text-white rounded-full shadow-xs"
                >
                  {filteredProducts.length} modelos
                </motion.span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Haz clic en cualquier producto para abrir la ficha técnica con medidas, voltajes y precios por mayor.
              </p>
            </div>

            {/* Filter Pill Indicator */}
            <AnimatePresence>
              {selectedCategory !== 'Todos' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: 8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="text-slate-500">Filtrando:</span>
                  <span className="font-bold bg-cyan-600 text-white px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-xs">
                    {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory('Todos')}
                      className="hover:text-slate-200 font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Active search filter feedback */}
          <AnimatePresence>
            {searchTerm && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="my-5 p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-700 shadow-xs overflow-hidden"
              >
                <span>
                  Resultados para: <strong className="text-slate-900 font-bold">"{searchTerm}"</strong>
                </span>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-amber-600 hover:text-amber-700 font-bold cursor-pointer underline"
                >
                  Limpiar búsqueda
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product Cards Grid with Light Retail Surfaces */}
          <AnimatePresence mode="wait">
            {filteredProducts.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="py-20 text-center"
              >
                <div className="w-16 h-16 bg-white border border-slate-200 rounded-3xl flex items-center justify-center mx-auto text-slate-400 mb-3.5 shadow-sm">
                  <Filter className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  No se encontraron productos con estos criterios
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Prueba buscando por código (ej: NT-7), luces LED o restableciendo los filtros.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('Todos');
                    setViewMode('all');
                  }}
                  className="mt-5 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-all"
                >
                  Restablecer Filtros
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={`grid-cat-${selectedCategory}-mode-${viewMode}`}
                layout
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.03,
                    },
                  },
                }}
                className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      settings={settings}
                      onAddToCart={handleAddToCart}
                      onOpenDetails={(p) => setSelectedProduct(p)}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Modern Retail Footer with Institutional Anchor */}
      <footer className="bg-slate-900 text-slate-300 text-xs py-14 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <BrandLogo size="md" theme="dark" />
            <p className="text-slate-400 text-xs leading-relaxed">
              Tu centro mayorista y minorista de figuras LED acrílicas 220V, muñecos y novedades exclusivas.
            </p>
            <div>
              <a
                href={directWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer text-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Escribir al WhatsApp Oficial</span>
              </a>
            </div>
          </div>

          {/* Quick Categories Col */}
          <div className="space-y-2.5">
            <h5 className="font-black text-white text-xs uppercase tracking-wider">
              Categorías
            </h5>
            <ul className="space-y-2 text-slate-400">
              {categories.filter((c) => c !== 'Todos').slice(0, 4).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => setSelectedCategory(cat)}
                    className="hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Methods Col */}
          <div className="space-y-2.5">
            <h5 className="font-black text-white text-xs uppercase tracking-wider">
              Pagos Aceptados
            </h5>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-slate-200">
                📱 Yape / Plin
              </span>
              <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-slate-200">
                🏦 BCP / BBVA
              </span>
              <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-slate-200">
                💳 Visa / MasterCard
              </span>
              <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-slate-200">
                💵 Contraentrega
              </span>
            </div>
          </div>

          {/* Admin Area Col */}
          <div className="space-y-3">
            <h5 className="font-black text-white text-xs uppercase tracking-wider">
              Gestión de Tienda
            </h5>
            <p className="text-[11px] text-slate-400">
              Acceso seguro con PIN para actualizar precios, inventario y catálogo.
            </p>
            <button
              id="footer-admin-btn"
              onClick={() => setIsAdminOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 hover:text-white transition-colors cursor-pointer text-xs font-bold"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Panel de Administración</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>
            © {new Date().getFullYear()} LOS FARRUS HUB. Todos los derechos reservados.
          </span>
          <span className="text-slate-400">
            Canal Oficial de Pedidos y Cotizaciones
          </span>
        </div>
      </footer>

      {/* MODALS & DRAWERS */}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        deliveryType={deliveryType}
        onDeliveryTypeChange={setDeliveryType}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        settings={settings}
      />

      {/* Checkout & WhatsApp Gateway Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cart}
          deliveryType={deliveryType}
          settings={settings}
          onOrderSuccess={() => {
            handleClearCart();
          }}
        />
      )}

      {/* Product Details & Full Specs Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          settings={settings}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Admin Panel */}
      {isAdminOpen && (
        <AdminPanel
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          products={products}
          settings={settings}
          onSaveProduct={handleSaveProduct}
          onDeleteProduct={handleDeleteProduct}
          onSaveSettings={handleSaveSettings}
          onResetCatalog={handleResetCatalog}
          onImportCatalog={handleImportCatalog}
        />
      )}

      {/* Quick Floating WhatsApp Call To Action */}
      <QuickWhatsAppFloat settings={settings} />
    </div>
  );
}
