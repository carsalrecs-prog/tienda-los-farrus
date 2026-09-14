import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Sparkles,
  Save,
  RotateCcw,
  Copy,
  ExternalLink,
  Check,
  Tag,
  Gift,
  Calendar,
  Layers,
  HelpCircle,
  Eye,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { StoreSettings } from '../types';
import {
  DEFAULT_WHATSAPP_TEMPLATE,
  PRESET_WHATSAPP_TEMPLATES,
  getSampleWhatsAppMessage
} from '../utils/storage';

interface WhatsAppTemplateEditorProps {
  settings: StoreSettings;
  onSave: (updatedSettings: StoreSettings) => void;
  onNotify: (msg: string) => void;
}

export const WhatsAppTemplateEditor: React.FC<WhatsAppTemplateEditorProps> = ({
  settings,
  onSave,
  onNotify,
}) => {
  const [localGreeting, setLocalGreeting] = useState(
    settings.whatsappGreeting ?? '🎄 ¡Felices Fiestas y Próspero Año Nuevo!'
  );
  const [localPromoCode, setLocalPromoCode] = useState(
    settings.promoCode ?? 'NAVIDAD2026'
  );
  const [localPromoPercent, setLocalPromoPercent] = useState<number>(
    settings.promoDiscountPercent ?? 10
  );
  const [localPromoMessage, setLocalPromoMessage] = useState(
    settings.promoMessage ?? '10% de descuento navideño en compras por caja o superiores a S/ 200'
  );
  const [localPromoActive, setLocalPromoActive] = useState<boolean>(
    settings.promoActive !== false
  );
  const [localClosing, setLocalClosing] = useState(
    settings.whatsappClosingNotes ??
      '🎅 ¡Gracias por iluminar la Navidad con nosotros! Esperamos su confirmación para despacho inmediato.'
  );
  const [localTemplate, setLocalTemplate] = useState(
    settings.whatsappTemplate ?? DEFAULT_WHATSAPP_TEMPLATE
  );

  const [copiedPreview, setCopiedPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state if settings prop changes from external reset/import
  useEffect(() => {
    setLocalGreeting(settings.whatsappGreeting ?? '🎄 ¡Felices Fiestas y Próspero Año Nuevo!');
    setLocalPromoCode(settings.promoCode ?? 'NAVIDAD2026');
    setLocalPromoPercent(settings.promoDiscountPercent ?? 10);
    setLocalPromoMessage(settings.promoMessage ?? '');
    setLocalPromoActive(settings.promoActive !== false);
    setLocalClosing(
      settings.whatsappClosingNotes ??
        '🎅 ¡Gracias por iluminar la Navidad con nosotros! Esperamos su confirmación para despacho inmediato.'
    );
    setLocalTemplate(settings.whatsappTemplate ?? DEFAULT_WHATSAPP_TEMPLATE);
  }, [settings]);

  // Current effective settings for live preview calculation
  const currentPreviewSettings: StoreSettings = {
    ...settings,
    whatsappGreeting: localGreeting,
    promoCode: localPromoCode,
    promoDiscountPercent: localPromoPercent,
    promoMessage: localPromoMessage,
    promoActive: localPromoActive,
    whatsappClosingNotes: localClosing,
    whatsappTemplate: localTemplate,
  };

  const samplePreviewText = getSampleWhatsAppMessage(currentPreviewSettings);

  const handleInsertTag = (tag: string) => {
    if (!textareaRef.current) {
      setLocalTemplate((prev) => prev + tag);
      return;
    }
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const nextText = text.substring(0, start) + tag + text.substring(end);
    setLocalTemplate(nextText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = PRESET_WHATSAPP_TEMPLATES.find((p) => p.id === presetId);
    if (!preset) return;
    setLocalGreeting(preset.greeting);
    setLocalPromoCode(preset.promoCode);
    setLocalPromoMessage(preset.promoMessage);
    setLocalClosing(preset.closing);
    setLocalTemplate(preset.template);
    onNotify(`Plantilla "${preset.title}" cargada.`);
  };

  const handleResetToDefault = () => {
    setLocalGreeting('🎄 ¡Felices Fiestas y Próspero Año Nuevo!');
    setLocalPromoCode('NAVIDAD2026');
    setLocalPromoPercent(10);
    setLocalPromoMessage('10% de descuento navideño en compras por caja o superiores a S/ 200');
    setLocalPromoActive(true);
    setLocalClosing(
      '🎅 ¡Gracias por iluminar la Navidad con nosotros! Esperamos su confirmación para despacho inmediato.'
    );
    setLocalTemplate(DEFAULT_WHATSAPP_TEMPLATE);
    onNotify('Plantilla restablecida a los valores predeterminados.');
  };

  const handleSaveAll = () => {
    const updated: StoreSettings = {
      ...settings,
      whatsappGreeting: localGreeting.trim(),
      promoCode: localPromoCode.trim().toUpperCase(),
      promoDiscountPercent: Number(localPromoPercent) || 0,
      promoMessage: localPromoMessage.trim(),
      promoActive: localPromoActive,
      whatsappClosingNotes: localClosing.trim(),
      whatsappTemplate: localTemplate.trim(),
    };
    onSave(updated);
    onNotify('¡Plantilla y mensajes de WhatsApp guardados exitosamente!');
  };

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(samplePreviewText);
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 2000);
  };

  const cleanPhone = settings.whatsappPhone.replace(/\D/g, '');
  const testWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(samplePreviewText)}`;

  const AVAILABLE_TAGS = [
    { tag: '{greeting}', desc: 'Saludo festivo' },
    { tag: '{storeName}', desc: 'Nombre tienda' },
    { tag: '{date}', desc: 'Fecha y hora' },
    { tag: '{customerName}', desc: 'Nombre cliente' },
    { tag: '{customerPhone}', desc: 'Teléfono cliente' },
    { tag: '{deliveryType}', desc: 'Tipo de entrega' },
    { tag: '{deliveryAddress}', desc: 'Dirección o tienda' },
    { tag: '{paymentMethod}', desc: 'Método de pago' },
    { tag: '{items}', desc: 'Lista de productos' },
    { tag: '{subtotal}', desc: 'Subtotal' },
    { tag: '{shipping}', desc: 'Costo de envío' },
    { tag: '{promo}', desc: 'Línea de cupón/promo' },
    { tag: '{total}', desc: 'Total a pagar' },
    { tag: '{notes}', desc: 'Observaciones' },
    { tag: '{closing}', desc: 'Mensaje de despedida' },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-stone-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalización de Mensajes y Cupones</span>
          </div>
          <h3 className="text-lg font-black text-white">
            Plantilla Oficial de Pedidos WhatsApp
          </h3>
          <p className="text-xs text-stone-300 mt-0.5 leading-relaxed max-w-2xl">
            Personaliza los saludos de temporada (Navidad, Año Nuevo), configura códigos de descuento o promociones para tus clientes, y adapta el formato del mensaje que se envía automáticamente al <strong>{settings.contactDisplayPhone}</strong>.
          </p>
        </div>

        <button
          id="btn-save-whatsapp-template"
          onClick={handleSaveAll}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 shrink-0 cursor-pointer transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Cambios</span>
        </button>
      </div>

      {/* Main Grid: Left Editor & Right Live WhatsApp Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: SETTINGS & TEMPLATE EDITOR */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Seasonal Greetings */}
          <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>1. Saludo Festivo o de Temporada</span>
              </h4>
              <span className="text-[10px] text-stone-400 font-mono">
                {`{greeting}`}
              </span>
            </div>

            <p className="text-xs text-stone-500">
              Texto que encabeza el mensaje de WhatsApp. Ideal para fechas navideñas, campañas o felicitaciones.
            </p>

            <input
              id="input-whatsapp-greeting"
              type="text"
              value={localGreeting}
              onChange={(e) => setLocalGreeting(e.target.value)}
              placeholder="Ej: 🎄 ¡Felices Fiestas y Próspero Año Nuevo!"
              className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:border-emerald-600 outline-hidden font-medium"
            />

            {/* Quick Greeting Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-stone-400 self-center mr-1">Sugerencias:</span>
              <button
                type="button"
                onClick={() => setLocalGreeting('🎄 ¡Felices Fiestas y Próspero Año Nuevo!')}
                className="px-2 py-1 bg-white hover:bg-emerald-50 border border-stone-200 rounded-lg text-[11px] text-stone-700 font-medium cursor-pointer"
              >
                🎄 Navidad & Año Nuevo
              </button>
              <button
                type="button"
                onClick={() => setLocalGreeting('🌟 ¡Gran Campaña Navideña 2026 - Novedades Exclusivas!')}
                className="px-2 py-1 bg-white hover:bg-emerald-50 border border-stone-200 rounded-lg text-[11px] text-stone-700 font-medium cursor-pointer"
              >
                🌟 Campaña 2026
              </button>
              <button
                type="button"
                onClick={() => setLocalGreeting('📦 ¡Atención Especial Clientes Mayoristas!')}
                className="px-2 py-1 bg-white hover:bg-emerald-50 border border-stone-200 rounded-lg text-[11px] text-stone-700 font-medium cursor-pointer"
              >
                📦 Atención Mayorista
              </button>
              <button
                type="button"
                onClick={() => setLocalGreeting('')}
                className="px-2 py-1 bg-white hover:bg-stone-200 border border-stone-200 rounded-lg text-[11px] text-stone-500 cursor-pointer"
              >
                Sin saludo
              </button>
            </div>
          </div>

          {/* Section 2: Promotional Codes and Discounts */}
          <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>2. Código Promocional y Descuentos</span>
              </h4>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={localPromoActive}
                  onChange={(e) => setLocalPromoActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                />
                <span className={`text-xs font-bold ${localPromoActive ? 'text-emerald-700' : 'text-stone-400'}`}>
                  {localPromoActive ? 'Promoción Activa' : 'Pausada'}
                </span>
              </label>
            </div>

            <p className="text-xs text-stone-500">
              Permite a los clientes aplicar este código en el proceso de compra o recibirlo directamente detallado en su mensaje de WhatsApp.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Código de Cupón (Ej: NAVIDAD2026)
                </label>
                <div className="relative">
                  <input
                    id="input-promo-code"
                    type="text"
                    value={localPromoCode}
                    onChange={(e) => setLocalPromoCode(e.target.value.toUpperCase())}
                    placeholder="NAVIDAD2026"
                    className="w-full px-3 py-2 text-xs font-mono font-bold uppercase bg-white border border-stone-300 rounded-xl focus:border-emerald-600 outline-hidden"
                  />
                  <Tag className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Porcentaje de Descuento (%)
                </label>
                <div className="relative">
                  <input
                    id="input-promo-percent"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={localPromoPercent}
                    onChange={(e) => setLocalPromoPercent(Number(e.target.value) || 0)}
                    placeholder="10"
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-stone-300 rounded-xl focus:border-emerald-600 outline-hidden"
                  />
                  <span className="text-xs font-bold text-stone-400 absolute right-3 top-2">%</span>
                </div>
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  Usa 0 si el código es para regalo sorpresa o envío.
                </span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Descripción o Condición de la Promoción
                </label>
                <input
                  id="input-promo-message"
                  type="text"
                  value={localPromoMessage}
                  onChange={(e) => setLocalPromoMessage(e.target.value)}
                  placeholder="Ej: 10% de descuento navideño en compras por caja o superiores a S/ 200"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:border-emerald-600 outline-hidden"
                />
              </div>
            </div>

            {/* Quick Promo Preset Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-stone-400 self-center mr-1">Sugeridos:</span>
              <button
                type="button"
                onClick={() => {
                  setLocalPromoCode('NAVIDAD2026');
                  setLocalPromoPercent(10);
                  setLocalPromoMessage('10% de descuento especial por campaña navideña');
                  setLocalPromoActive(true);
                }}
                className="px-2 py-1 bg-white hover:bg-emerald-50 border border-stone-200 rounded-lg text-[11px] text-stone-700 font-medium cursor-pointer"
              >
                🎄 NAVIDAD2026 (-10%)
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocalPromoCode('MAYORISTA2026');
                  setLocalPromoPercent(15);
                  setLocalPromoMessage('15% de descuento adicional por compra de 2 o más cajas');
                  setLocalPromoActive(true);
                }}
                className="px-2 py-1 bg-white hover:bg-emerald-50 border border-stone-200 rounded-lg text-[11px] text-stone-700 font-medium cursor-pointer"
              >
                📦 MAYORISTA2026 (-15%)
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocalPromoCode('REGALOFIESTAS');
                  setLocalPromoPercent(0);
                  setLocalPromoMessage('Incluye luces o adorno sorpresa de regalo en tu pedido');
                  setLocalPromoActive(true);
                }}
                className="px-2 py-1 bg-white hover:bg-emerald-50 border border-stone-200 rounded-lg text-[11px] text-stone-700 font-medium cursor-pointer"
              >
                🎁 REGALOFIESTAS (Regalo sorpresa)
              </button>
            </div>
          </div>

          {/* Section 3: Closing & Farewell Note */}
          <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-600" />
                <span>3. Mensaje Final y Despedida</span>
              </h4>
              <span className="text-[10px] text-stone-400 font-mono">
                {`{closing}`}
              </span>
            </div>

            <p className="text-xs text-stone-500">
              Frase de cierre que el cliente envía al final del mensaje para solicitar despacho y confirmación.
            </p>

            <textarea
              id="input-whatsapp-closing"
              rows={2}
              value={localClosing}
              onChange={(e) => setLocalClosing(e.target.value)}
              placeholder="Ej: 🎅 ¡Gracias por iluminar la Navidad con nosotros! Esperamos su confirmación para despacho inmediato."
              className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:border-emerald-600 outline-hidden leading-relaxed"
            />
          </div>

          {/* Section 4: Full Template Layout Customization */}
          <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>4. Estructura Completa de la Plantilla</span>
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Puedes ordenar las secciones, agregar emojis, saltos de línea y formatear con asteriscos (*negrita*).
                </p>
              </div>

              {/* Template Preset Dropdown/Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {PRESET_WHATSAPP_TEMPLATES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleApplyPreset(p.id)}
                    className="px-2.5 py-1 bg-white hover:bg-stone-200 text-stone-700 text-[11px] font-bold rounded-lg border border-stone-200 cursor-pointer shadow-2xs"
                  >
                    {p.id === 'navidad' ? '🎄 Navideña' : p.id === 'mayorista' ? '📦 Mayorista' : '⚡ Rápida'}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleResetToDefault}
                  title="Restablecer plantilla inicial"
                  className="p-1.5 bg-white hover:bg-stone-200 text-stone-500 hover:text-stone-800 rounded-lg border border-stone-200 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Clickable Tag Badges */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-stone-700">
                  Haz clic en una etiqueta para insertarla en la plantilla:
                </span>
              </div>
              <div className="flex flex-wrap gap-1 p-2 bg-white rounded-xl border border-stone-200">
                {AVAILABLE_TAGS.map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => handleInsertTag(item.tag)}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 hover:bg-emerald-100 hover:text-emerald-900 border border-stone-200 rounded-lg text-[11px] font-mono font-semibold text-stone-800 transition-colors cursor-pointer"
                  >
                    <span>{item.tag}</span>
                    <span className="text-[9px] text-stone-500 font-sans">({item.desc})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* The Textarea */}
            <div className="relative">
              <textarea
                id="input-custom-whatsapp-template"
                ref={textareaRef}
                rows={11}
                value={localTemplate}
                onChange={(e) => setLocalTemplate(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-white border border-stone-300 rounded-xl focus:border-emerald-600 outline-hidden leading-relaxed resize-y"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME WHATSAPP LIVE PREVIEW */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="font-bold text-stone-900 text-sm">
                  Vista Previa en Vivo de WhatsApp
                </h4>
              </div>
              <span className="text-[11px] text-stone-500">
                Simulación de pedido real
              </span>
            </div>

            {/* Phone Screen Mockup */}
            <div className="bg-[#efeae2] rounded-3xl border border-stone-300 shadow-xl overflow-hidden flex flex-col max-h-[680px]">
              {/* WhatsApp Header Bar */}
              <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center font-black text-sm border border-white/20">
                    🎅
                  </div>
                  <div>
                    <h5 className="font-bold text-xs leading-tight text-white">
                      {settings.storeName}
                    </h5>
                    <span className="text-[10px] text-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      En línea • {settings.contactDisplayPhone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPreview}
                    title="Copiar texto del mensaje simulado"
                    className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-100 hover:text-white cursor-pointer transition-colors"
                  >
                    {copiedPreview ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={testWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Probar en WhatsApp Web / App"
                    className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-100 hover:text-white cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Chat Canvas with Wallpaper Background */}
              <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-3 text-xs">
                {/* Day Badge */}
                <div className="flex justify-center">
                  <span className="bg-white/80 shadow-2xs backdrop-blur-xs text-[10px] text-stone-600 px-2.5 py-0.5 rounded-md uppercase font-semibold">
                    Hoy
                  </span>
                </div>

                {/* WhatsApp Chat Message Bubble */}
                <div className="flex justify-end">
                  <div className="bg-[#d9fdd3] max-w-[95%] rounded-2xl rounded-tr-xs p-3 shadow-xs border border-emerald-200/50 text-[#111b21] space-y-1 relative">
                    <pre className="font-sans whitespace-pre-wrap text-[11px] sm:text-xs leading-relaxed break-words font-medium">
                      {samplePreviewText}
                    </pre>

                    {/* Timestamp & Double Blue Check */}
                    <div className="flex items-center justify-end gap-1 text-[9px] text-stone-500 pt-1">
                      <span>10:45 p.m.</span>
                      <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Input Mock Bar */}
              <div className="bg-[#f0f2f5] px-3 py-2 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
                <span className="text-[11px]">Mensaje estructurado listo para enviar</span>
                <span className="font-bold text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  100% Automático
                </span>
              </div>
            </div>

            {/* Quick Actions Under Phone */}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPreview}
                className="flex-1 py-2 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                {copiedPreview ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-stone-500" />
                    <span>Copiar Texto de Prueba</span>
                  </>
                )}
              </button>

              <a
                href={testWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Probar en WhatsApp</span>
              </a>
            </div>

            <p className="text-[11px] text-stone-400 text-center mt-2">
              Los cambios que realices se reflejan en tiempo real en esta vista previa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
