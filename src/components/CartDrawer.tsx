import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Truck, Store, ShieldCheck, Sparkles } from 'lucide-react';
import { CartItem, DeliveryType, StoreSettings } from '../types';
import { formatCurrency } from '../utils/storage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  deliveryType: DeliveryType;
  onDeliveryTypeChange: (type: DeliveryType) => void;
  onUpdateQuantity: (productId: string, buyMode: 'unit' | 'box', newQty: number) => void;
  onRemoveItem: (productId: string, buyMode: 'unit' | 'box') => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  settings: StoreSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  deliveryType,
  onDeliveryTypeChange,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  settings,
}) => {
  if (!isOpen) return null;

  // Calculate costs
  const subtotal = items.reduce((acc, item) => {
    const isBox = item.buyMode === 'box';
    const price = isBox ? (item.product.priceBox || item.product.priceUnit) : item.product.priceUnit;
    return acc + price * item.quantity;
  }, 0);

  const isFreeShipping = subtotal >= settings.freeDeliveryThreshold;
  const shippingCost = deliveryType === 'pickup' ? 0 : (isFreeShipping ? 0 : settings.deliveryCost);
  const total = subtotal + shippingCost;
  const missingForFreeShipping = Math.max(0, settings.freeDeliveryThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 w-full sm:max-w-md flex flex-col pointer-events-none">
        <div className="w-full h-full bg-white sm:border-l border-slate-200 shadow-2xl flex flex-col text-slate-800 pointer-events-auto overflow-hidden">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0 pt-[max(1rem,env(safe-area-inset-top))]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center font-black">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 leading-tight">
                  Tu Carrito de Pedidos
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  {items.length} {items.length === 1 ? 'modelo seleccionado' : 'modelos seleccionados'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  id="btn-clear-cart"
                  onClick={onClearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2.5 py-1 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Vaciar carrito"
                >
                  Vaciar
                </button>
              )}
              <button
                id="btn-close-cart-drawer"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                aria-label="Cerrar carrito"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Free shipping banner / progress */}
          {items.length > 0 && deliveryType === 'delivery' && (
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs">
              {isFreeShipping ? (
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>¡Felicidades! Tienes <strong>ENVÍO GRATIS</strong> en este pedido.</span>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between text-slate-600 font-medium mb-1.5">
                    <span>Envío Gratis superando {formatCurrency(settings.freeDeliveryThreshold, settings.currencySymbol)}:</span>
                    <span className="font-bold text-amber-600">Faltan {formatCurrency(missingForFreeShipping, settings.currencySymbol)}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-emerald-500 h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (subtotal / settings.freeDeliveryThreshold) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 no-scrollbar bg-slate-50/50">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Tu lista de pedido está vacía
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Explora nuestro catálogo con figuras LED acrílicas y adornos navideños exclusivos al por mayor y menor.
                </p>
                <button
                  id="btn-explore-empty-cart"
                  onClick={onClose}
                  className="mt-5 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-amber-500/25 transition-all cursor-pointer hover:scale-102"
                >
                  Ver Catálogo de Productos
                </button>
              </div>
            ) : (
              items.map((item) => {
                const isBox = item.buyMode === 'box';
                const unitPrice = isBox
                  ? (item.product.priceBox || item.product.priceUnit)
                  : item.product.priceUnit;
                const itemTotal = unitPrice * item.quantity;

                return (
                  <div
                    key={`${item.product.id}-${item.buyMode}`}
                    className="flex gap-3 p-3 bg-white hover:border-slate-300 rounded-2xl border border-slate-200 shadow-xs transition-all"
                  >
                    {/* Item Thumbnail */}
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shrink-0 bg-slate-100 border border-slate-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          '/products/hero-showcase.png';
                      }}
                    />

                    {/* Content & Actions */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[11px] font-mono font-black bg-slate-50 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded-lg">
                            {item.product.code}
                          </span>
                          <button
                            id={`btn-remove-${item.product.id}-${item.buyMode}`}
                            onClick={() => onRemoveItem(item.product.id, item.buyMode)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 truncate mt-1">
                          {item.product.name}
                        </h4>

                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                          <span
                            className={`font-semibold px-1.5 py-0.2 rounded-md text-[10px] ${
                              isBox
                                ? 'bg-amber-50 text-amber-800 border border-amber-200 font-bold'
                                : 'bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold'
                            }`}
                          >
                            {isBox
                              ? `Caja (${item.product.boxQuantity || 'Mayor'})`
                              : 'Unidad'}
                          </span>
                          <span>•</span>
                          <span>{formatCurrency(unitPrice, settings.currencySymbol)} c/u</span>
                        </div>
                      </div>

                      {/* Quantity Stepper & Subtotal */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-100 overflow-hidden h-8">
                          <button
                            onClick={() =>
                              onUpdateQuantity(
                                item.product.id,
                                item.buyMode,
                                item.quantity - 1
                              )
                            }
                            className="w-7 h-full text-slate-600 hover:bg-slate-200 hover:text-slate-900 font-bold text-xs cursor-pointer flex items-center justify-center transition-colors"
                          >
                            -
                          </button>
                          <span className="w-7 text-center font-black text-xs text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              onUpdateQuantity(
                                item.product.id,
                                item.buyMode,
                                item.quantity + 1
                              )
                            }
                            className="w-7 h-full text-slate-600 hover:bg-slate-200 hover:text-slate-900 font-bold text-xs cursor-pointer flex items-center justify-center transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-sm font-black text-slate-900">
                          {formatCurrency(itemTotal, settings.currencySymbol)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer with Transparent Cost Breakdown */}
          {items.length > 0 && (
            <div className="p-3.5 sm:p-5 border-t border-slate-200 bg-white space-y-2.5 sm:space-y-3 shadow-lg shrink-0 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-5">
              {/* Delivery method selector */}
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block mb-1.5">
                  Método de Despacho
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    id="btn-select-delivery"
                    type="button"
                    onClick={() => onDeliveryTypeChange('delivery')}
                    className={`p-2.5 rounded-2xl border flex items-center gap-2 transition-all cursor-pointer ${
                      deliveryType === 'delivery'
                        ? 'bg-cyan-50/80 border-cyan-500 text-cyan-950 font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-cyan-600 shrink-0" />
                    <div className="text-left leading-tight">
                      <div className="font-semibold text-slate-900">Envío a Domicilio</div>
                      <div className="text-[10px] text-slate-500">
                        {isFreeShipping ? 'GRATIS' : formatCurrency(settings.deliveryCost, settings.currencySymbol)}
                      </div>
                    </div>
                  </button>

                  <button
                    id="btn-select-pickup"
                    type="button"
                    onClick={() => onDeliveryTypeChange('pickup')}
                    className={`p-2.5 rounded-2xl border flex items-center gap-2 transition-all cursor-pointer ${
                      deliveryType === 'pickup'
                        ? 'bg-cyan-50/80 border-cyan-500 text-cyan-950 font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Store className="w-4 h-4 text-slate-500 shrink-0" />
                    <div className="text-left leading-tight">
                      <div className="font-semibold text-slate-900">Retiro en Tienda</div>
                      <div className="text-[10px] text-emerald-700 font-bold">GRATIS</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal productos:</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(subtotal, settings.currencySymbol)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Costo de despacho:</span>
                  <span className="font-semibold">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-700 font-bold">GRATIS</span>
                    ) : (
                      formatCurrency(shippingCost, settings.currencySymbol)
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-black text-slate-900 block">
                      TOTAL A PAGAR:
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Precios mayoristas y minoristas
                    </span>
                  </div>
                  <span className="text-2xl font-black text-slate-900">
                    {formatCurrency(total, settings.currencySymbol)}
                  </span>
                </div>
              </div>

              {/* Proceed to Checkout & WhatsApp Button */}
              <button
                id="btn-proceed-checkout"
                onClick={onProceedToCheckout}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-98 text-white font-black text-sm rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Finalizar Pedido vía WhatsApp</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Compra 100% segura • Coordinación directa por WhatsApp</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
