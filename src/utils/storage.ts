import { Product, StoreSettings, CartItem, OrderCheckoutData } from '../types';
import { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS } from '../data/initialProducts';

const PRODUCTS_KEY = 'tienda_catalog_products_v2';
const SETTINGS_KEY = 'tienda_store_settings_v1';
const ADMIN_AUTH_KEY = 'tienda_admin_session_v1';

export function getStoredProducts(): Product[] {
  try {
    // Clear legacy v1 key if present
    localStorage.removeItem('tienda_catalog_products_v1');
    const saved = localStorage.getItem(PRODUCTS_KEY);
    if (!saved) {
      saveProducts(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveProducts(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    // If any saved product has unsplash image or outdated paths, refresh with INITIAL_PRODUCTS
    const hasLegacyImages = parsed.some(p => !p.image || p.image.includes('unsplash.com'));
    if (hasLegacyImages) {
      saveProducts(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    return parsed;
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

export const DEFAULT_WHATSAPP_TEMPLATE = `🎄✨ *NUEVO PEDIDO OFICIAL - {storeName}* ✨🎄
━━━━━━━━━━━━━━━━━━━━━━━━
🛒 *SOLICITUD DE COMPRA WEB*
📅 *Fecha y Hora:* {date}
━━━━━━━━━━━━━━━━━━━━━━━━
👤 *DATOS DEL CLIENTE:*
• 👤 *Nombre:* {customerName}
• 📱 *WhatsApp:* {customerPhone}
• 🚚 *Modalidad:* {deliveryType}
• 📍 *Destino:* {deliveryAddress}
• 💳 *Forma de Pago:* {paymentMethod}
━━━━━━━━━━━━━━━━━━━━━━━━
📦 *PRODUCTOS SELECCIONADOS:*

{items}
━━━━━━━━━━━━━━━━━━━━━━━━
💰 *RESUMEN DE LIQUIDACIÓN:*
• 🧾 *Subtotal:* {subtotal}
• 🚚 *Envío / Despacho:* {shipping}
{promo}
━━━━━━━━━━━━━━━━━━━━━━━━
⭐ *TOTAL A PAGAR: {total}*
━━━━━━━━━━━━━━━━━━━━━━━━
{notes}
{closing}`;

export const PRESET_WHATSAPP_TEMPLATES = [
  {
    id: 'navidad',
    title: '🎄 Navidad & Fiestas (Con Cupón y Saludo Festivo)',
    greeting: '🎄🎅 ¡Felices Fiestas de parte de LOS FARRUS HUB!',
    promoCode: 'NAVIDAD2026',
    promoMessage: 'Descuento navideño aplicado en catálogo',
    closing: '✨ ¡Gracias por iluminar la Navidad con nosotros! Esperamos su confirmación de stock para despacho inmediato.',
    template: `🎄✨ *NUEVO PEDIDO OFICIAL - {storeName}* ✨🎄
━━━━━━━━━━━━━━━━━━━━━━━━
🛒 *SOLICITUD DE COMPRA NAVIDEÑA*
📅 *Fecha y Hora:* {date}
━━━━━━━━━━━━━━━━━━━━━━━━
👤 *DATOS DEL CLIENTE:*
• 👤 *Nombre:* {customerName}
• 📱 *WhatsApp:* {customerPhone}
• 🚚 *Modalidad:* {deliveryType}
• 📍 *Destino:* {deliveryAddress}
• 💳 *Forma de Pago:* {paymentMethod}
━━━━━━━━━━━━━━━━━━━━━━━━
📦 *PRODUCTOS SELECCIONADOS:*

{items}
━━━━━━━━━━━━━━━━━━━━━━━━
💰 *RESUMEN DE LIQUIDACIÓN:*
• 🧾 *Subtotal:* {subtotal}
• 🚚 *Envío / Despacho:* {shipping}
{promo}
━━━━━━━━━━━━━━━━━━━━━━━━
⭐ *TOTAL A PAGAR: {total}*
━━━━━━━━━━━━━━━━━━━━━━━━
{notes}
{closing}`,
  },
  {
    id: 'mayorista',
    title: '📦 Venta Mayorista & Campaña por Lotes',
    greeting: '🏢📦 ¡Atención Comercial - Cotización y Pedido Mayorista!',
    promoCode: 'MAYORISTA2026',
    promoMessage: 'Precios especiales por embalaje/bulto y flete preferencial',
    closing: '⚡ Despacho express por agencia o almacén central. Solicitamos confirmación de stock para emitir guía de remisión.',
    template: `🏢📦 *PEDIDO MAYORISTA - {storeName}* 📦🏢
━━━━━━━━━━━━━━━━━━━━━━━━
📋 *COTIZACIÓN Y DESPACHO POR LOTES*
📅 *Fecha y Hora:* {date}
━━━━━━━━━━━━━━━━━━━━━━━━
👤 *CONTACTO COMERCIAL:*
• 👤 *Cliente / Empresa:* {customerName}
• 📱 *WhatsApp:* {customerPhone}
• 🚚 *Modalidad:* {deliveryType}
• 📍 *Destino / Agencia:* {deliveryAddress}
• 💳 *Forma de Pago:* {paymentMethod}
━━━━━━━━━━━━━━━━━━━━━━━━
📦 *DETALLE DE MERCADERÍA POR CAJA/LOTE:*

{items}
━━━━━━━━━━━━━━━━━━━━━━━━
💵 *LIQUIDACIÓN MAYORISTA:*
• 🧾 *Valor Mercadería:* {subtotal}
• 🚚 *Flete / Despacho:* {shipping}
{promo}
━━━━━━━━━━━━━━━━━━━━━━━━
⭐ *TOTAL FINAL: {total}*
━━━━━━━━━━━━━━━━━━━━━━━━
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
    template: `⭐ *PEDIDO WEB - {storeName}* ⭐
📅 {date}
👤 {customerName} ({customerPhone})
📍 {deliveryType} • {deliveryAddress}
💳 {paymentMethod}

📦 *Artículos:*
{items}
💰 *Total:* {total} ({shipping} de envío)
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

  const numberBadges = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

  let itemsText = '';
  items.forEach((item, index) => {
    const isBox = item.buyMode === 'box';
    const unitPrice = isBox ? (item.product.priceBox || item.product.priceUnit) : item.product.priceUnit;
    const itemTotal = unitPrice * item.quantity;
    const numBadge = numberBadges[index] || `🔹`;
    const modeLabel = isBox
      ? `📦 Caja Mayorista (${item.product.boxQuantity ? item.product.boxQuantity + ' und' : 'x Mayor'})`
      : '🏷️ Unidad';

    itemsText += `${numBadge} *[${item.product.code}] ${item.product.name}*\n`;
    itemsText += `   ▫️ *Modalidad:* ${modeLabel}\n`;
    itemsText += `   ▫️ *Cantidad:* ${item.quantity} ${isBox ? 'caja(s)' : 'unidad(es)'}\n`;
    itemsText += `   ▫️ *Precio Unitario:* ${formatCurrency(unitPrice, settings.currencySymbol)}\n`;
    itemsText += `   ▫️ *Subtotal:* *${formatCurrency(itemTotal, settings.currencySymbol)}*\n`;
    
    const specs: string[] = [];
    if (item.product.technicalSheet.dimensions) specs.push(`📐 Medida: ${item.product.technicalSheet.dimensions}`);
    if (item.product.technicalSheet.lights) specs.push(`💡 Luces: ${item.product.technicalSheet.lights}`);
    if (item.product.technicalSheet.voltage) specs.push(`⚡ Voltaje: ${item.product.technicalSheet.voltage}`);
    if (specs.length > 0) {
      itemsText += `   ▫️ *Ficha Técnica:* ${specs.join(' | ')}\n`;
    }
    itemsText += `\n`;
  });

  // Promotional line formatting
  let promoLine = '';
  const activePromoCode = checkout.appliedPromoCode || (settings.promoActive !== false ? settings.promoCode : '');
  if (activePromoCode) {
    if (discount > 0) {
      promoLine = `• 🎁 *Cupón / Descuento:* *${activePromoCode}* (-${formatCurrency(discount, settings.currencySymbol)})`;
    } else if (settings.promoMessage) {
      promoLine = `• 🎁 *Cupón / Promoción:* *${activePromoCode}* (${settings.promoMessage})`;
    } else {
      promoLine = `• 🎁 *Cupón de Temporada:* *${activePromoCode}*`;
    }
  }

  // Greeting and closing text
  const greetingText = settings.whatsappGreeting ? settings.whatsappGreeting.trim() : '';
  const closingText = settings.whatsappClosingNotes
    ? settings.whatsappClosingNotes.trim()
    : '💬 ¡Hola! Acabo de armar mi pedido en la tienda web. ¿Me confirman disponibilidad y datos de despacho por favor? ¡Muchas gracias! 😊🎅';

  const notesText = checkout.deliveryNotes
    ? `📝 *Observaciones:* ${checkout.deliveryNotes}`
    : '';

  const addressText = checkout.deliveryType === 'delivery'
    ? (checkout.deliveryAddress ? `${checkout.deliveryAddress}${checkout.deliveryCity ? ` (${checkout.deliveryCity})` : ''}` : 'Por coordinar')
    : '🏬 Retiro presencial en tienda / almacén';

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

/**
 * Builds direct WhatsApp consultation link for a single product with rich emojis and structured specs
 */
export function generateProductConsultUrl(
  product: Product,
  quantity: number = 1,
  mode: 'unit' | 'box' = 'unit',
  settings: StoreSettings
): string {
  const cleanPhone = settings.whatsappPhone.replace(/\D/g, '');
  const isBox = mode === 'box' && !!product.priceBox;
  const currentPrice = isBox ? product.priceBox! : product.priceUnit;
  const totalAmount = currentPrice * quantity;
  
  let msg = `👋 ¡Hola *${settings.storeName.toUpperCase()}*! 🎄✨\n\n`;
  
  if (isBox) {
    msg += `🏢📦 *CONSULTA POR LOTE / MAYORISTA*\n`;
    msg += `Deseo cotizar disponibilidad y envío por caja para este artículo:\n\n`;
    msg += `📌 *[${product.code}] ${product.name}*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `• 📦 *Modalidad:* Caja Mayorista (${product.boxQuantity ? product.boxQuantity + ' und por caja' : 'Lote por mayor'})\n`;
    msg += `• 🔢 *Cantidad de Cajas:* ${quantity} caja(s)\n`;
    msg += `• 💵 *Precio por Caja:* ${formatCurrency(currentPrice, settings.currencySymbol)}\n`;
    msg += `• 💰 *Inversión Total Estimada:* *${formatCurrency(totalAmount, settings.currencySymbol)}*\n`;
  } else {
    msg += `🛍️✨ *CONSULTA DE PRODUCTO / CATÁLOGO*\n`;
    msg += `Deseo consultar stock y detalles de este artículo:\n\n`;
    msg += `📌 *[${product.code}] ${product.name}*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `• 🏷️ *Modalidad:* Venta por Unidad\n`;
    msg += `• 🔢 *Cantidad:* ${quantity} unidad(es)\n`;
    msg += `• 💵 *Precio de Catálogo:* ${formatCurrency(currentPrice, settings.currencySymbol)} c/u\n`;
    msg += `• 💰 *Total:* *${formatCurrency(totalAmount, settings.currencySymbol)}*\n`;
  }
  
  // Technical specs
  const specs: string[] = [];
  if (product.technicalSheet.dimensions) specs.push(`📐 Medida: ${product.technicalSheet.dimensions}`);
  if (product.technicalSheet.lights) specs.push(`💡 Luces: ${product.technicalSheet.lights}`);
  if (product.technicalSheet.voltage) specs.push(`⚡ Voltaje: ${product.technicalSheet.voltage}`);
  if (product.technicalSheet.material) specs.push(`✨ Material: ${product.technicalSheet.material}`);
  
  if (specs.length > 0) {
    msg += `• 📋 *Ficha Técnica:* ${specs.join(' | ')}\n`;
  }
  msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🚚 ¿Cuentan con stock para despacho inmediato o entrega? ¡Quedo atento(a), muchas gracias! 😊🎅`;
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}

