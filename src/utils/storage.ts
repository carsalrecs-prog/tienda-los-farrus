import { Product, StoreSettings, CartItem, OrderCheckoutData } from '../types';
import { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS } from '../data/initialProducts';

const PRODUCTS_KEY = 'tienda_catalog_products_v1';
const SETTINGS_KEY = 'tienda_store_settings_v1';
const ADMIN_AUTH_KEY = 'tienda_admin_session_v1';

export function getStoredProducts(): Product[] {
  try {
    const saved = localStorage.getItem(PRODUCTS_KEY);
    if (!saved) return INITIAL_PRODUCTS;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PRODUCTS;
  } catch (error) {
    console.error('Error loading products from storage:', error);
    return INITIAL_PRODUCTS;
  }
}

export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Error saving products to storage:', error);
  }
}

export function resetToInitialProducts(): Product[] {
  saveProducts(INITIAL_PRODUCTS);
  return INITIAL_PRODUCTS;
}

export function getStoredSettings(): StoreSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (!saved) return DEFAULT_STORE_SETTINGS;
    return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(saved) };
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_STORE_SETTINGS;
  }
}

export function saveSettings(settings: StoreSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

export function getAdminAuthSession(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAdminAuthSession(isAuth: boolean): void {
  try {
    if (isAuth) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    } else {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
    }
  } catch {
    // Ignore
  }
}

export function formatCurrency(amount: number, symbol: string = 'S/'): string {
  return `${symbol} ${amount.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const DEFAULT_WHATSAPP_TEMPLATE = `{greeting}
✨ *NUEVO PEDIDO - {storeName}* ✨
📅 Fecha: {date}
━━━━━━━━━━━━━━━━━━━━━━
👤 *DATOS DEL CLIENTE:*
• *Nombre:* {customerName}
• *Teléfono:* {customerPhone}
• *Modalidad:* {deliveryType}
• *Dirección:* {deliveryAddress}
• *Método de Pago:* {paymentMethod}
━━━━━━━━━━━━━━━━━━━━━━
🛒 *PRODUCTOS DEL PEDIDO:*
{items}
━━━━━━━━━━━━━━━━━━━━━━
📊 *RESUMEN DE COSTOS:*
• Subtotal: *{subtotal}*
• Costo de Envío: *{shipping}*
{promo}
💰 *TOTAL A PAGAR: {total}*
━━━━━━━━━━━━━━━━━━━━━━
{notes}
{closing}`;

export const PRESET_WHATSAPP_TEMPLATES = [
  {
    id: 'navidad',
    title: '🎄 Navidad & Fiestas (Con Cupón y Saludo Festivo)',
    greeting: '🎄 ¡Felices Fiestas y Próspero Año Nuevo!',
    promoCode: 'NAVIDAD2026',
    promoMessage: '10% de descuento navideño en compras seleccionadas',
    closing: '🎅 ¡Gracias por iluminar la Navidad con nosotros! Esperamos su confirmación para despacho inmediato.',
    template: `{greeting}
✨ *NUEVO PEDIDO - {storeName}* ✨
📅 Fecha: {date}
━━━━━━━━━━━━━━━━━━━━━━
👤 *DATOS DEL CLIENTE:*
• *Nombre:* {customerName}
• *Teléfono:* {customerPhone}
• *Modalidad:* {deliveryType}
• *Dirección:* {deliveryAddress}
• *Método de Pago:* {paymentMethod}
━━━━━━━━━━━━━━━━━━━━━━
🛒 *PRODUCTOS DEL PEDIDO:*
{items}
━━━━━━━━━━━━━━━━━━━━━━
📊 *RESUMEN DE COSTOS:*
• Subtotal: *{subtotal}*
• Costo de Envío: *{shipping}*
{promo}
💰 *TOTAL A PAGAR: {total}*
━━━━━━━━━━━━━━━━━━━━━━
{notes}
{closing}`,
  },
  {
    id: 'mayorista',
    title: '📦 Venta Mayorista & Campaña por Lotes',
    greeting: '📦 ¡Atención Especial - Cotización y Pedido Mayorista!',
    promoCode: 'MAYORISTA2026',
    promoMessage: 'Precios especiales por embalaje y flete preferencial',
    closing: '⚡ Despacho express por agencia. Solicitamos confirmación de stock por bulto/caja para emitir guía de remisión.',
    template: `{greeting}
🏢 *SOLICITUD DE PEDIDO - {storeName}*
📅 Fecha y Hora: {date}
━━━━━━━━━━━━━━━━━━━━━━
👤 *CONTACTO COMERCIAL:*
• *Cliente:* {customerName}
• *WhatsApp:* {customerPhone}
• *Entrega:* {deliveryType}
• *Destino / Agencia:* {deliveryAddress}
• *Forma de Pago:* {paymentMethod}
━━━━━━━━━━━━━━━━━━━━━━
📦 *DETALLE DE MERCADERÍA:*
{items}
━━━━━━━━━━━━━━━━━━━━━━
💵 *LIQUIDACIÓN:*
• Valor de Mercadería: *{subtotal}*
• Flete / Envío: *{shipping}*
{promo}
⭐ *TOTAL FINAL: {total}*
━━━━━━━━━━━━━━━━━━━━━━
{notes}
{closing}`,
  },
  {
    id: 'compacto',
    title: '⚡ Rápido y Directo',
    greeting: '⭐ *Nuevo Pedido Web*',
    promoCode: 'OFERTAWEB',
    promoMessage: 'Beneficio exclusivo web',
    closing: 'Quedo atento a la confirmación de mi pedido. ¡Muchas gracias!',
    template: `{greeting}
*Tienda:* {storeName} ({date})
*Cliente:* {customerName} ({customerPhone})
*Entrega:* {deliveryType} - {deliveryAddress}
*Pago:* {paymentMethod}

*Pedido:*
{items}

*Total a Pagar:* {total} ({shipping} de envío)
{promo}
{notes}
{closing}`,
  },
];

/**
 * Builds the automatic WhatsApp order URL and message text
 */
export function generateWhatsAppOrderUrl(
  items: CartItem[],
  checkout: OrderCheckoutData,
  settings: StoreSettings,
  subtotal: number,
  shipping: number,
  total: number,
  discount: number = 0
): { url: string; text: string } {
  const cleanPhone = settings.whatsappPhone.replace(/\D/g, '');
  
  const dateStr = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const paymentLabels: Record<string, string> = {
    yape: '📱 Yape (Voucher adjunto)',
    plin: '📱 Plin (Voucher adjunto)',
    transfer: '🏦 Transferencia Bancaria BCP/BBVA',
    card: '💳 Pasarela de Pago con Tarjeta (Procesado)',
    cash: '💵 Pago Contraentrega / Efectivo',
  };

  const deliveryLabel =
    checkout.deliveryType === 'delivery'
      ? '🚚 Envío a Domicilio'
      : '🏬 Retiro en Tienda / Almacén';

  let itemsText = '';
  items.forEach((item, index) => {
    const isBox = item.buyMode === 'box';
    const unitPrice = isBox ? (item.product.priceBox || item.product.priceUnit) : item.product.priceUnit;
    const itemTotal = unitPrice * item.quantity;
    const modeLabel = isBox
      ? `📦 Caja/Lote (${item.product.boxQuantity ? item.product.boxQuantity + ' und' : 'x Mayor'})`
      : '🏷️ Unidad';

    itemsText += `${index + 1}. *[${item.product.code}]* ${item.product.name}\n`;
    itemsText += `   • Cantidad: *${item.quantity}* (${modeLabel})\n`;
    itemsText += `   • Precio: ${formatCurrency(unitPrice, settings.currencySymbol)} c/u  ➔  *${formatCurrency(itemTotal, settings.currencySymbol)}*\n`;
    if (item.product.technicalSheet.dimensions) {
      itemsText += `   • Medida: ${item.product.technicalSheet.dimensions}\n`;
    }
  });

  // Promotional line formatting
  let promoLine = '';
  const activePromoCode = checkout.appliedPromoCode || (settings.promoActive !== false ? settings.promoCode : '');
  if (activePromoCode) {
    if (discount > 0) {
      promoLine = `• Cupón / Promoción: *${activePromoCode}* (-${formatCurrency(discount, settings.currencySymbol)} de descuento)`;
    } else if (settings.promoMessage) {
      promoLine = `• Cupón / Promoción: *${activePromoCode}* (${settings.promoMessage})`;
    } else {
      promoLine = `• Cupón de Temporada: *${activePromoCode}*`;
    }
  }

  // Greeting and closing text
  const greetingText = settings.whatsappGreeting ? settings.whatsappGreeting.trim() : '';
  const closingText = settings.whatsappClosingNotes
    ? settings.whatsappClosingNotes.trim()
    : 'Hola! Acabo de armar mi pedido en la web. ¿Me confirman la disponibilidad y datos de despacho por favor? ¡Gracias!';

  const notesText = checkout.deliveryNotes
    ? `📝 *Observaciones:* ${checkout.deliveryNotes}`
    : '';

  const addressText = checkout.deliveryType === 'delivery'
    ? (checkout.deliveryAddress ? `${checkout.deliveryAddress}${checkout.deliveryCity ? ` (${checkout.deliveryCity})` : ''}` : 'Por coordinar')
    : 'Retiro presencial en tienda / almacén';

  const templateToUse = settings.whatsappTemplate && settings.whatsappTemplate.trim().length > 10
    ? settings.whatsappTemplate
    : DEFAULT_WHATSAPP_TEMPLATE;

  // Replace placeholders
  let formattedMessage = templateToUse
    .replace(/\{greeting\}/g, greetingText)
    .replace(/\{storeName\}/g, settings.storeName.toUpperCase())
    .replace(/\{date\}/g, dateStr)
    .replace(/\{customerName\}/g, checkout.customerName)
    .replace(/\{customerPhone\}/g, checkout.customerPhone)
    .replace(/\{customerEmail\}/g, checkout.customerEmail || 'No especificado')
    .replace(/\{deliveryType\}/g, deliveryLabel)
    .replace(/\{deliveryAddress\}/g, addressText)
    .replace(/\{deliveryCity\}/g, checkout.deliveryCity || '')
    .replace(/\{paymentMethod\}/g, paymentLabels[checkout.paymentMethod] || checkout.paymentMethod)
    .replace(/\{items\}/g, itemsText.trim())
    .replace(/\{subtotal\}/g, formatCurrency(subtotal, settings.currencySymbol))
    .replace(/\{shipping\}/g, shipping === 0 ? 'GRATIS' : formatCurrency(shipping, settings.currencySymbol))
    .replace(/\{promo\}/g, promoLine)
    .replace(/\{total\}/g, formatCurrency(total, settings.currencySymbol))
    .replace(/\{notes\}/g, notesText)
    .replace(/\{closing\}/g, closingText);

  // Clean empty lines created when optional placeholders like {notes} or {promo} are blank
  formattedMessage = formattedMessage
    .split('\n')
    .filter((line, index, arr) => {
      // Remove consecutive blank lines
      if (line.trim() === '' && arr[index - 1]?.trim() === '') return false;
      return true;
    })
    .join('\n')
    .trim();

  const encodedText = encodeURIComponent(formattedMessage);
  const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;

  return { url, text: formattedMessage };
}

/**
 * Generates sample text for the live preview in Admin Panel
 */
export function getSampleWhatsAppMessage(settings: StoreSettings): string {
  const sampleItems: CartItem[] = [
    {
      product: {
        id: 'NT-7',
        code: 'NT-7',
        name: 'Muñecos Navideños Surtidos 55-60cm',
        category: 'Muñecos y Figuras',
        description: '3 modelos surtidos',
        technicalSheet: { dimensions: '60 cm x 20 cm' },
        priceUnit: 7.5,
        priceBox: 2250,
        boxQuantity: 300,
        stock: 500,
        image: '',
        active: true,
      },
      quantity: 2,
      buyMode: 'unit',
    },
    {
      product: {
        id: 'NT-8',
        code: 'NT-8',
        name: 'Figura Navideña Acrílica con Luz LED 120cm',
        category: 'Luces LED Acrílicas',
        description: 'Escultura acrílica 348 LED',
        technicalSheet: { dimensions: 'Alto: 120 cm' },
        priceUnit: 520,
        stock: 10,
        image: '',
        active: true,
      },
      quantity: 1,
      buyMode: 'unit',
    },
  ];

  const sampleCheckout: OrderCheckoutData = {
    customerName: 'María Fernanda Flores',
    customerPhone: '+51 987 654 321',
    customerEmail: 'maria@ejemplo.com',
    deliveryType: 'delivery',
    deliveryAddress: 'Av. Las Palmeras 450, Urb. Primavera',
    deliveryCity: 'Lima',
    deliveryNotes: 'Dejar en conserjería si no respondo el timbre.',
    paymentMethod: 'yape',
    appliedPromoCode: settings.promoActive !== false ? (settings.promoCode || 'NAVIDAD2026') : undefined,
  };

  const subtotal = 535.0;
  const shipping = 0;
  const discount = settings.promoActive !== false && settings.promoDiscountPercent ? (subtotal * settings.promoDiscountPercent) / 100 : 0;
  const total = subtotal - discount + shipping;

  return generateWhatsAppOrderUrl(
    sampleItems,
    sampleCheckout,
    settings,
    subtotal,
    shipping,
    total,
    discount
  ).text;
}
