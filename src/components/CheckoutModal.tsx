import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  CreditCard,
  QrCode,
  Building2,
  Banknote,
  CheckCircle2,
  Copy,
  MessageCircle,
  Truck,
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
  Store,
  Check,
  AlertCircle,
  Tag
} from 'lucide-react';
import { CartItem, DeliveryType, PaymentMethod, OrderCheckoutData, StoreSettings } from '../types';
import { formatCurrency, generateWhatsAppOrderUrl } from '../utils/storage';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  deliveryType: DeliveryType;
  settings: StoreSettings;
  onOrderSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  deliveryType,
  settings,
  onOrderSuccess,
}) => {
  // Checkout form state
  const [formData, setFormData] = useState<OrderCheckoutData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryType,
    deliveryAddress: '',
    deliveryCity: 'Lima',
    deliveryNotes: '',
    paymentMethod: 'yape',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
  });

  const [currentStep, setCurrentStep] = useState<'info' | 'payment' | 'completed'>('info');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [orderSummary, setOrderSummary] = useState<{
    whatsappUrl: string;
    whatsappText: string;
    total: number;
    subtotal: number;
    shipping: number;
    orderNumber: string;
  } | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Promotional code state
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoFeedback, setPromoFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  // Cost calculations
  const subtotal = items.reduce((acc, item) => {
    const isBox = item.buyMode === 'box';
    const price = isBox ? (item.product.priceBox || item.product.priceUnit) : item.product.priceUnit;
    return acc + price * item.quantity;
  }, 0);

  const discountPercent = appliedPromo && settings.promoDiscountPercent ? settings.promoDiscountPercent : 0;
  const discount = (subtotal * discountPercent) / 100;

  const isFreeShipping = subtotal >= settings.freeDeliveryThreshold;
  const shipping = deliveryType === 'pickup' ? 0 : (isFreeShipping ? 0 : settings.deliveryCost);
  const total = Math.max(0, subtotal - discount + shipping);

  const handleApplyPromo = (codeToApply: string) => {
    const clean = codeToApply.trim().toUpperCase();
    if (!clean) {
      setPromoFeedback({ type: 'error', text: 'Por favor ingresa un código promocional' });
      return;
    }
    const configuredCode = settings.promoCode?.trim().toUpperCase();
    if (configuredCode && clean === configuredCode && settings.promoActive !== false) {
      setAppliedPromo(clean);
      setPromoCodeInput(clean);
      const discountText = settings.promoDiscountPercent
        ? `${settings.promoDiscountPercent}% de descuento aplicado`
        : (settings.promoMessage || 'Promoción aplicada con éxito');
      setPromoFeedback({ type: 'success', text: `¡Cupón ${clean} activado! (${discountText})` });
    } else if (clean.length > 0) {
      setAppliedPromo(clean);
      setPromoCodeInput(clean);
      setPromoFeedback({ type: 'success', text: `Código ${clean} registrado para tu pedido` });
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoFeedback(null);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const validateInfoStep = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!formData.customerName.trim()) {
      errors.customerName = 'Por favor ingresa tu nombre completo';
    }
    if (!formData.customerPhone.trim() || formData.customerPhone.trim().length < 8) {
      errors.customerPhone = 'Ingresa un número de celular/WhatsApp válido';
    }
    if (deliveryType === 'delivery' && !formData.deliveryAddress?.trim()) {
      errors.deliveryAddress = 'Ingresa tu dirección o referencia para la entrega';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateInfoStep()) {
      setCurrentStep('payment');
    }
  };

  const handleCompleteOrder = () => {
    // Generate order identifier
    const orderNumber = `PED-${Math.floor(100000 + Math.random() * 900000)}`;
    const { url, text } = generateWhatsAppOrderUrl(
      items,
      {
        ...formData,
        deliveryType,
        appliedPromoCode: appliedPromo || (settings.promoActive !== false ? settings.promoCode : undefined),
        discountAmount: discount,
      },
      settings,
      subtotal,
      shipping,
      total,
      discount
    );

    finishOrder(orderNumber, url, text);
  };

  const finishOrder = (orderNumber: string, url: string, text: string) => {
    setOrderSummary({
      whatsappUrl: url,
      whatsappText: text,
      total,
      subtotal,
      shipping,
      orderNumber,
    });
    setCurrentStep('completed');

    // Confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    // Auto open WhatsApp on order completion as requested
    setTimeout(() => {
      window.open(url, '_blank');
    }, 600);

    onOrderSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-xs overflow-y-auto">
      <div
        id="checkout-modal-card"
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-4 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with step indicators */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
              {currentStep === 'completed' ? '✓' : currentStep === 'payment' ? '2' : '1'}
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900 leading-tight">
                {currentStep === 'info' && '1. Datos de Entrega y Contacto'}
                {currentStep === 'payment' && '2. Métodos de Pago & Coordinación por WhatsApp'}
                {currentStep === 'completed' && '¡Pedido Registrado con Éxito!'}
              </h3>
              <p className="text-xs text-stone-500">
                {currentStep === 'info' && 'Completa tus datos para coordinar el despacho'}
                {currentStep === 'payment' && `Conoce las opciones disponibles • Total: ${formatCurrency(total, settings.currencySymbol)}`}
                {currentStep === 'completed' && 'Envío directo y automático a nuestro WhatsApp Oficial'}
              </p>
            </div>
          </div>

          <button
            id="close-checkout-modal-btn"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body based on current step */}
        <div className="p-5 sm:p-6 max-h-[78vh] overflow-y-auto">
          {/* STEP 1: CUSTOMER & DELIVERY DATA */}
          {currentStep === 'info' && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              {/* Delivery method summary tag */}
              <div className="flex items-center justify-between p-3 bg-stone-100 rounded-2xl text-xs">
                <div className="flex items-center gap-2 text-stone-800 font-semibold">
                  {deliveryType === 'delivery' ? (
                    <>
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>Envío a Domicilio ({shipping === 0 ? 'Envío GRATIS' : formatCurrency(shipping, settings.currencySymbol)})</span>
                    </>
                  ) : (
                    <>
                      <Store className="w-4 h-4 text-emerald-600" />
                      <span>Retiro en Tienda / Almacén (GRATIS)</span>
                    </>
                  )}
                </div>
                <span className="font-extrabold text-stone-900 text-sm">
                  Total: {formatCurrency(total, settings.currencySymbol)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Full name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nombres y Apellidos *
                  </label>
                  <input
                    id="checkout-input-name"
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Ej: Carlos Salazar"
                    className={`w-full px-3.5 py-2.5 text-sm bg-stone-50 border rounded-xl outline-hidden focus:bg-white transition-all ${
                      formErrors.customerName
                        ? 'border-rose-500 focus:border-rose-600'
                        : 'border-stone-200 focus:border-emerald-600'
                    }`}
                  />
                  {formErrors.customerName && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">
                      {formErrors.customerName}
                    </span>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Celular / WhatsApp *
                  </label>
                  <input
                    id="checkout-input-phone"
                    type="tel"
                    required
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="Ej: 987 654 321"
                    className={`w-full px-3.5 py-2.5 text-sm bg-stone-50 border rounded-xl outline-hidden focus:bg-white transition-all ${
                      formErrors.customerPhone
                        ? 'border-rose-500 focus:border-rose-600'
                        : 'border-stone-200 focus:border-emerald-600'
                    }`}
                  />
                  {formErrors.customerPhone && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">
                      {formErrors.customerPhone}
                    </span>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Distrito / Ciudad
                  </label>
                  <input
                    id="checkout-input-city"
                    type="text"
                    value={formData.deliveryCity}
                    onChange={(e) => setFormData({ ...formData, deliveryCity: e.target.value })}
                    placeholder="Ej: San Isidro, Lima / Trujillo / Arequipa"
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:bg-white focus:border-emerald-600 transition-all"
                  />
                </div>

                {/* Address (only for delivery) */}
                {deliveryType === 'delivery' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Dirección exacta de entrega y referencia *
                    </label>
                    <input
                      id="checkout-input-address"
                      type="text"
                      required
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                      placeholder="Ej: Av. Principal 450 Dpto 302, frente al parque"
                      className={`w-full px-3.5 py-2.5 text-sm bg-stone-50 border rounded-xl outline-hidden focus:bg-white transition-all ${
                        formErrors.deliveryAddress
                          ? 'border-rose-500 focus:border-rose-600'
                          : 'border-stone-200 focus:border-emerald-600'
                      }`}
                    />
                    {formErrors.deliveryAddress && (
                      <span className="text-[11px] text-rose-600 mt-0.5 block">
                        {formErrors.deliveryAddress}
                      </span>
                    )}
                  </div>
                )}

                {/* Delivery notes / questions */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Notas u observaciones para el pedido (Opcional)
                  </label>
                  <textarea
                    id="checkout-input-notes"
                    rows={2}
                    value={formData.deliveryNotes}
                    onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                    placeholder="Ej: Deseo factura con RUC, o entregar después de las 2pm"
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-hidden focus:bg-white focus:border-emerald-600 transition-all resize-none"
                  />
                </div>

                {/* Promotional code & seasonal offers block */}
                <div className="sm:col-span-2 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="text-xs font-bold text-emerald-950">
                        Código Promocional o de Temporada
                      </span>
                    </div>
                    {appliedPromo && (
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-700" />
                        <span>Cupón Activo</span>
                      </span>
                    )}
                  </div>

                  {/* Preset seasonal banner if configured in settings */}
                  {settings.promoActive !== false && settings.promoCode && !appliedPromo && (
                    <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-emerald-200/80 text-xs">
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-[11px]">Código disponible:</span>
                        <strong className="font-mono text-emerald-800 font-black text-xs">{settings.promoCode}</strong>
                        {settings.promoDiscountPercent ? (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            -{settings.promoDiscountPercent}%
                          </span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyPromo(settings.promoCode!)}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                      >
                        Aplicar
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      id="checkout-promo-input"
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) => {
                        setPromoCodeInput(e.target.value.toUpperCase());
                        setPromoFeedback(null);
                      }}
                      placeholder="Ingresa código (ej: NAVIDAD2026)"
                      className="flex-1 px-3 py-1.5 text-xs font-mono font-bold uppercase bg-white border border-stone-300 rounded-xl focus:border-emerald-600 outline-hidden"
                    />
                    {appliedPromo ? (
                      <button
                        id="btn-remove-promo"
                        type="button"
                        onClick={handleRemovePromo}
                        className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                      >
                        Quitar
                      </button>
                    ) : (
                      <button
                        id="btn-apply-promo"
                        type="button"
                        onClick={() => handleApplyPromo(promoCodeInput)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
                      >
                        Aplicar
                      </button>
                    )}
                  </div>

                  {promoFeedback && (
                    <span
                      className={`text-[11px] font-semibold block ${
                        promoFeedback.type === 'success' ? 'text-emerald-800' : 'text-rose-600'
                      }`}
                    >
                      {promoFeedback.text}
                    </span>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800"
                >
                  Volver al carrito
                </button>

                <button
                  id="checkout-btn-to-payment"
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-700/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Continuar a Métodos de Pago</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PAYMENT METHODS MENTION & DIRECT WHATSAPP CONFIRMATION */}
          {currentStep === 'payment' && (
            <div className="space-y-4">
              {/* Trust & Transparency Banner */}
              <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-4 flex items-start gap-3.5 shadow-xs">
                <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5 shadow-2xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                  <h4 className="font-extrabold text-emerald-950 text-sm flex items-center gap-1.5">
                    <span>Atención Personalizada y Compra 100% Segura</span>
                  </h4>
                  <p className="text-emerald-900 text-xs leading-relaxed">
                    Aún estamos iniciando operaciones y tu total tranquilidad es nuestra prioridad: <strong>no realizamos ningún cobro automático en esta web ni te pedimos números de tarjeta</strong>.
                  </p>
                  <p className="text-emerald-900 text-xs leading-relaxed">
                    Selecciona abajo cómo te gustaría abonar. Al hacer clic en <strong>Confirmar y Enviar a WhatsApp</strong>, coordinaremos contigo de persona a persona al <strong>{settings.contactDisplayPhone}</strong> para verificar stock, coordinar entrega y facilitarte los datos de pago oficiales.
                  </p>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  ¿Cómo prefieres realizar el pago? (Solo para indicarlo en tu pedido)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* YAPE / PLIN */}
                  <button
                    id="pay-tab-yape"
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'yape' })}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      formData.paymentMethod === 'yape'
                        ? 'bg-purple-50 border-purple-600 text-purple-900 ring-2 ring-purple-600/20 font-bold shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-purple-600" />
                    <span className="text-xs">Yape / Plin</span>
                  </button>

                  {/* TARJETA LINK */}
                  <button
                    id="pay-tab-card"
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      formData.paymentMethod === 'card'
                        ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-600/20 font-bold shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="text-xs">Tarjeta (Link Seguro)</span>
                  </button>

                  {/* TRANSFERENCIA */}
                  <button
                    id="pay-tab-transfer"
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'transfer' })}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      formData.paymentMethod === 'transfer'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-600/20 font-bold shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs">Transferencia BCP/BBVA</span>
                  </button>

                  {/* CONTRAENTREGA */}
                  <button
                    id="pay-tab-cash"
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'cash' })}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      formData.paymentMethod === 'cash'
                        ? 'bg-amber-50 border-amber-600 text-amber-900 ring-2 ring-amber-600/20 font-bold shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-amber-600" />
                    <span className="text-xs">Contraentrega</span>
                  </button>
                </div>
              </div>

              {/* Informative Payment Details Panel */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5">
                {/* OPTION 1: YAPE / PLIN */}
                {formData.paymentMethod === 'yape' && (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Stylized QR representation */}
                      <div className="w-28 h-28 bg-white p-2 rounded-2xl border border-purple-200 shadow-xs flex flex-col items-center justify-center shrink-0">
                        <div className="w-full h-full bg-gradient-to-br from-purple-700 to-fuchsia-600 rounded-xl flex flex-col items-center justify-center text-white text-center p-2">
                          <QrCode className="w-8 h-8 text-white mb-1" />
                          <span className="text-[10px] font-black tracking-widest uppercase">YAPE / PLIN</span>
                          <span className="text-[9px] font-mono text-purple-100">{settings.yapeNumber}</span>
                        </div>
                      </div>

                      <div className="flex-1 text-xs space-y-2.5">
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-200">
                          <div>
                            <span className="text-stone-400 block text-[10px]">Número oficial para Yape o Plin</span>
                            <span className="text-base font-extrabold text-stone-900 font-mono">
                              {settings.yapeNumber}
                            </span>
                            <span className="text-stone-500 block text-[11px]">
                              Titular de cuenta: <strong>{settings.yapeName}</strong>
                            </span>
                          </div>
                          <button
                            id="btn-copy-yape-number"
                            type="button"
                            onClick={() => handleCopy(settings.yapeNumber, 'yape')}
                            className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            {copiedItem === 'yape' ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>¡Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        </div>

                        <p className="text-stone-600 text-[11px] leading-relaxed">
                          💬 <strong>¿Cómo funciona?</strong> Al pulsar el botón verde, se abrirá WhatsApp con el resumen de tu compra. Te confirmaremos el stock y podrás enviarnos la captura de tu voucher en el mismo chat.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* OPTION 2: TARJETA DE DÉBITO O CRÉDITO (LINK SEGURO) */}
                {formData.paymentMethod === 'card' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 bg-white border border-blue-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5 text-blue-900 text-sm">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                          <span>Pago Seguro con Tarjeta vía WhatsApp</span>
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-bold">
                          <span className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200 text-stone-700">VISA</span>
                          <span className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200 text-stone-700">MASTERCARD</span>
                          <span className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200 text-stone-700">AMEX</span>
                        </div>
                      </div>

                      <p className="text-[11px] leading-relaxed text-stone-600">
                        🔒 <strong>Máxima protección:</strong> No necesitas ingresar los 16 dígitos de tu tarjeta ni tu CVV en esta web. Al enviar el pedido por WhatsApp, te compartiremos un enlace de pago oficial y protegido (Izipay / Niubiz / Mercado Pago) para que pagues cómodamente desde tu banco.
                      </p>
                    </div>
                  </div>
                )}

                {/* OPTION 3: TRANSFERENCIA BANCARIA */}
                {formData.paymentMethod === 'transfer' && (
                  <div className="space-y-2.5 text-xs">
                    <p className="text-stone-600 text-[11px]">
                      Monto a transferir: <strong>{formatCurrency(total, settings.currencySymbol)}</strong>. Cuentas bancarias verificadas:
                    </p>

                    {/* BCP */}
                    <div className="p-2.5 bg-white rounded-xl border border-stone-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-stone-900">Banco BCP (Soles)</div>
                        <div className="font-mono text-stone-700 text-xs mt-0.5">
                          {settings.bcpAccount}
                        </div>
                        <div className="text-[10px] text-stone-400">CCI: {settings.bcpCci}</div>
                      </div>
                      <button
                        id="btn-copy-bcp-account"
                        type="button"
                        onClick={() => handleCopy(settings.bcpAccount, 'bcp')}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-semibold text-stone-700 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedItem === 'bcp' ? '¡Copiado!' : 'Copiar'}
                      </button>
                    </div>

                    {/* BBVA */}
                    <div className="p-2.5 bg-white rounded-xl border border-stone-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-stone-900">Banco BBVA (Soles)</div>
                        <div className="font-mono text-stone-700 text-xs mt-0.5">
                          {settings.bbvaAccount}
                        </div>
                      </div>
                      <button
                        id="btn-copy-bbva-account"
                        type="button"
                        onClick={() => handleCopy(settings.bbvaAccount, 'bbva')}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-semibold text-stone-700 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedItem === 'bbva' ? '¡Copiado!' : 'Copiar'}
                      </button>
                    </div>

                    <p className="text-[11px] text-stone-500 italic mt-1">
                      * Al presionar enviar a WhatsApp, coordinaremos la validación de tu abono con el comprobante.
                    </p>
                  </div>
                )}

                {/* OPTION 4: CASH ON DELIVERY */}
                {formData.paymentMethod === 'cash' && (
                  <div className="text-xs text-stone-700 space-y-2">
                    <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900">
                      <p className="font-bold mb-1">Pago Contraentrega / Efectivo:</p>
                      <p className="text-[11px] leading-relaxed">
                        Pagarás <strong>{formatCurrency(total, settings.currencySymbol)}</strong> directamente al recibir tu paquete o al recogerlo en tienda. Por favor indicar en WhatsApp si necesitarás vuelto de billete grande para que el repartidor lleve cambio exacto.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Total Summary Footer */}
              <div className="bg-stone-100 p-3.5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>Subtotal ({items.length} productos):</span>
                  <span className="font-semibold">{formatCurrency(subtotal, settings.currencySymbol)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Cupón {appliedPromo} (-{discountPercent}%):</span>
                    </span>
                    <span className="font-bold">-{formatCurrency(discount, settings.currencySymbol)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>Costo de Envío:</span>
                  <span className="font-semibold">{shipping === 0 ? 'GRATIS' : formatCurrency(shipping, settings.currencySymbol)}</span>
                </div>
                <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-stone-500 text-xs block font-medium">Monto total del pedido:</span>
                    <span className="text-[11px] text-stone-500">
                      {deliveryType === 'delivery' ? 'Con entrega a domicilio' : 'Retiro en almacén'}
                    </span>
                  </div>
                  <span className="text-2xl font-black text-emerald-800">
                    {formatCurrency(total, settings.currencySymbol)}
                  </span>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep('info')}
                  className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800"
                >
                  Volver a datos
                </button>

                <button
                  id="checkout-btn-finish-order"
                  type="button"
                  onClick={handleCompleteOrder}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-700/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 text-white" />
                  <span>Enviar Pedido a WhatsApp y Coordinar Pago</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ORDER SUCCESS & WHATSAPP AUTO-DISPATCH */}
          {currentStep === 'completed' && orderSummary && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-black text-xs rounded-full">
                  {orderSummary.orderNumber}
                </span>
                <h3 className="text-2xl font-black text-stone-900 mt-2">
                  ¡Muchas gracias por tu compra!
                </h3>
                <p className="text-xs text-stone-600 mt-1 max-w-md mx-auto">
                  Tu pedido ha sido preparado para ser enviado de forma inmediata al WhatsApp del vendedor (<strong>{settings.contactDisplayPhone}</strong>).
                </p>
              </div>

              {/* Action WhatsApp Button */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-left space-y-3 max-w-lg mx-auto">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-emerald-950">
                    <strong className="block font-bold text-sm">
                      Envío automático a WhatsApp Oficial
                    </strong>
                    <span>
                      Si la ventana de WhatsApp no se abrió automáticamente, haz clic en el siguiente botón:
                    </span>
                  </div>
                </div>

                <a
                  id="btn-whatsapp-open-direct"
                  href={orderSummary.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all block text-center"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Abrir WhatsApp con mi Pedido</span>
                </a>

                <button
                  id="btn-copy-order-text"
                  type="button"
                  onClick={() => handleCopy(orderSummary.whatsappText, 'summary')}
                  className="w-full py-2 bg-white hover:bg-stone-50 border border-emerald-300 text-emerald-900 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedItem === 'summary' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>¡Mensaje copiado al portapapeles!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-emerald-600" />
                      <span>Copiar texto del pedido</span>
                    </>
                  )}
                </button>
              </div>

              {/* Close and continue shopping */}
              <button
                id="btn-finish-dialog"
                onClick={onClose}
                className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cerrar y seguir navegando
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
