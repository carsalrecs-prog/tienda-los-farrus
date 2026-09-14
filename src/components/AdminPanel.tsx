import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Save,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Search,
  Upload,
  RefreshCw,
  Download,
  FileJson,
  Check,
  AlertTriangle,
  Eye,
  Settings as SettingsIcon,
  Package,
  Phone,
  DollarSign,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { formatCurrency, resetToInitialProducts } from '../utils/storage';
import { WhatsAppTemplateEditor } from './WhatsAppTemplateEditor';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  settings: StoreSettings;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onSaveSettings: (newSettings: StoreSettings) => void;
  onResetCatalog: () => void;
  onImportCatalog: (importedProducts: Product[]) => void;
}

const PRESET_IMAGES = [
  { label: 'Muñecos Surtidos', url: 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=800&q=80' },
  { label: 'Luces LED Acrílicas 120cm', url: 'https://images.unsplash.com/photo-1513297887119-d46091b24bfa?auto=format&fit=crop&w=800&q=80' },
  { label: 'Figura LED 130cm', url: 'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?auto=format&fit=crop&w=800&q=80' },
  { label: 'Figura LED 40cm', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80' },
  { label: 'Adornos Colgantes 41cm', url: 'https://images.unsplash.com/photo-1577041793739-e93cf8735515?auto=format&fit=crop&w=800&q=80' },
  { label: 'Adornos 36cm', url: 'https://images.unsplash.com/photo-1512474932049-78ac69ede12c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Estrella Luminosa', url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=800&q=80' },
  { label: 'Adorno Decorativo 90cm', url: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80' },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  products,
  settings,
  onSaveProduct,
  onDeleteProduct,
  onSaveSettings,
  onResetCatalog,
  onImportCatalog,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // View state: 'products' | 'whatsapp' | 'settings'
  const [activeTab, setActiveTab] = useState<'products' | 'whatsapp' | 'settings'>('products');
  const [searchTerm, setSearchTerm] = useState('');

  // Editing Product Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [imagePreviewMode, setImagePreviewMode] = useState<'url' | 'file' | 'presets'>('url');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Settings form copy
  const [localSettings, setLocalSettings] = useState<StoreSettings>({ ...settings });

  useEffect(() => {
    setLocalSettings({ ...settings });
  }, [settings]);

  if (!isOpen) return null;

  // PIN validation
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin.trim() === settings.adminPin) {
      setIsAuthenticated(true);
      setPinError(false);
      setEnteredPin('');
    } else {
      setPinError(true);
    }
  };

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleStartCreate = () => {
    const newProd: Product = {
      id: `NT-${Math.floor(100 + Math.random() * 900)}`,
      code: `NT-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'Muñecos y Figuras',
      description: '',
      technicalSheet: {
        dimensions: '',
        lights: '',
        voltage: '220V',
        material: '100% poliester',
        weight: '',
        models: '',
        packaging: '',
      },
      priceUnit: 10.0,
      priceBox: undefined,
      boxQuantity: undefined,
      stock: 50,
      image: PRESET_IMAGES[0].url,
      active: true,
      isFeatured: false,
    };
    setEditingProduct(newProd);
    setIsCreating(true);
  };

  const handleStartEdit = (prod: Product) => {
    setEditingProduct({
      ...prod,
      technicalSheet: { ...prod.technicalSheet },
    });
    setIsCreating(false);
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editingProduct.code.trim() || !editingProduct.name.trim()) {
      alert('Por favor completa al menos el código y nombre del producto.');
      return;
    }
    onSaveProduct(editingProduct);
    setEditingProduct(null);
    notify('Producto guardado exitosamente.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditingProduct({
          ...editingProduct,
          image: reader.result,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `catalogo_productos_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    notify('Catálogo exportado en archivo JSON.');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportCatalog(parsed);
          notify('Catálogo importado correctamente.');
        } else {
          alert('El archivo JSON no tiene un formato de lista válido.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const filteredProducts = products.filter((p) => {
    const s = searchTerm.toLowerCase();
    return (
      p.code.toLowerCase().includes(s) ||
      p.name.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
      <div
        id="admin-panel-container"
        className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-4 flex flex-col max-h-[92vh]"
      >
        {/* Top bar */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight leading-none">
                Panel Administrativo Seguro
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Gestión de precios, productos y configuración oficial de tienda
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                id="btn-admin-logout"
                onClick={() => setIsAuthenticated(false)}
                className="text-xs text-stone-300 hover:text-white px-2.5 py-1 bg-stone-800 rounded-lg transition-colors cursor-pointer"
              >
                Bloquear
              </button>
            )}
            <button
              id="close-admin-panel-btn"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice Toast */}
        {actionNotice && (
          <div className="bg-emerald-600 text-white text-xs py-2 px-4 text-center font-bold flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* NOT AUTHENTICATED: PIN LOGIN SCREEN */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto">
            <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-700 mb-4 border border-stone-200">
              <Lock className="w-7 h-7 text-emerald-700" />
            </div>

            <h4 className="text-xl font-black text-stone-900">
              Acceso Restringido para el Vendedor
            </h4>
            <p className="text-xs text-stone-500 mt-1 mb-6">
              Los clientes no pueden editar datos. Ingresa tu PIN de seguridad para gestionar precios e inventario.
              <br />
              <span className="text-stone-400 font-mono text-[11px]">(PIN por defecto: 1234)</span>
            </p>

            <form onSubmit={handlePinSubmit} className="w-full space-y-3">
              <div>
                <input
                  id="admin-pin-input"
                  type="password"
                  maxLength={6}
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Ingresa tu PIN"
                  className="w-full px-4 py-3 text-center tracking-widest text-lg font-mono font-bold bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-emerald-600 outline-hidden"
                  autoFocus
                />
                {pinError && (
                  <span className="text-xs text-rose-600 font-medium mt-1 block">
                    PIN incorrecto. Vuelve a intentarlo.
                  </span>
                )}
              </div>

              <button
                id="btn-admin-login-submit"
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
              >
                Ingresar al Panel
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED: ADMIN WORKSPACE */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs & Top Controls */}
            <div className="p-3 sm:p-4 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200 text-xs">
                <button
                  id="tab-btn-products"
                  onClick={() => setActiveTab('products')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'products'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Productos ({products.length})</span>
                </button>

                <button
                  id="tab-btn-whatsapp-template"
                  onClick={() => setActiveTab('whatsapp')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'whatsapp'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Plantilla WhatsApp & Promos</span>
                </button>

                <button
                  id="tab-btn-settings"
                  onClick={() => setActiveTab('settings')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'settings'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span>Configuración & Pagos</span>
                </button>
              </div>

              {activeTab === 'products' && (
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative w-44 sm:w-60">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Filtrar por código o nombre..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl outline-hidden focus:border-emerald-600"
                    />
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
                  </div>

                  <button
                    id="btn-admin-new-product"
                    onClick={handleStartCreate}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nuevo Producto</span>
                  </button>
                </div>
              )}
            </div>

            {/* TAB 1: PRODUCT LIST & INLINE PRICING */}
            {activeTab === 'products' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-stone-700">
                      <thead className="bg-stone-100 text-stone-500 font-bold uppercase tracking-wider text-[10px] border-b border-stone-200">
                        <tr>
                          <th className="py-3 px-3">Foto</th>
                          <th className="py-3 px-3">Código</th>
                          <th className="py-3 px-3">Nombre & Categoría</th>
                          <th className="py-3 px-3">Precio Unidad (S/)</th>
                          <th className="py-3 px-3">Precio Caja (S/)</th>
                          <th className="py-3 px-3">Stock</th>
                          <th className="py-3 px-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                            <td className="py-2.5 px-3">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-10 h-10 object-cover rounded-lg border border-stone-200 bg-stone-50"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=200&q=80';
                                }}
                              />
                            </td>

                            <td className="py-2.5 px-3">
                              <span className="font-mono font-black bg-stone-900 text-white px-2 py-0.5 rounded text-[11px]">
                                {p.code}
                              </span>
                            </td>

                            <td className="py-2.5 px-3 max-w-xs">
                              <div className="font-bold text-stone-900 truncate">{p.name}</div>
                              <div className="text-[11px] text-stone-400">{p.category}</div>
                            </td>

                            {/* Inline Unit Price */}
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1 font-bold text-stone-900">
                                <span>S/</span>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={p.priceUnit}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    onSaveProduct({ ...p, priceUnit: val });
                                  }}
                                  className="w-18 px-1.5 py-0.5 font-mono text-xs bg-stone-50 border border-stone-200 rounded font-bold focus:bg-white focus:border-emerald-600 outline-hidden"
                                />
                              </div>
                            </td>

                            {/* Inline Box Price */}
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1 font-bold text-stone-900">
                                <span>S/</span>
                                <input
                                  type="number"
                                  step="1"
                                  value={p.priceBox || ''}
                                  placeholder="—"
                                  onChange={(e) => {
                                    const val = e.target.value ? parseFloat(e.target.value) : undefined;
                                    onSaveProduct({ ...p, priceBox: val });
                                  }}
                                  className="w-20 px-1.5 py-0.5 font-mono text-xs bg-stone-50 border border-stone-200 rounded font-bold focus:bg-white focus:border-emerald-600 outline-hidden"
                                />
                                {p.boxQuantity && (
                                  <span className="text-[10px] text-stone-400">({p.boxQuantity}u)</span>
                                )}
                              </div>
                            </td>

                            {/* Inline Stock */}
                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                value={p.stock}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10) || 0;
                                  onSaveProduct({ ...p, stock: val });
                                }}
                                className="w-16 px-1.5 py-0.5 font-mono text-xs bg-stone-50 border border-stone-200 rounded text-center focus:bg-white focus:border-emerald-600 outline-hidden"
                              />
                            </td>

                            {/* Actions */}
                            <td className="py-2.5 px-3 text-right space-x-1">
                              <button
                                onClick={() => handleStartEdit(p)}
                                className="p-1.5 text-stone-600 hover:text-emerald-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                title="Editar detalles, imagen y ficha técnica"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`¿Estás seguro de eliminar el producto ${p.code} - ${p.name}?`)) {
                                    onDeleteProduct(p.id);
                                    notify(`Producto ${p.code} eliminado.`);
                                  }
                                }}
                                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                title="Eliminar producto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: WHATSAPP ORDER MESSAGE TEMPLATE & SEASONAL PROMOTIONS */}
            {activeTab === 'whatsapp' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <WhatsAppTemplateEditor
                  settings={localSettings}
                  onSave={(updated) => {
                    setLocalSettings(updated);
                    onSaveSettings(updated);
                  }}
                  onNotify={(msg) => notify(msg)}
                />
              </div>
            )}

            {/* TAB 3: STORE SETTINGS & DATA TOOLS */}
            {activeTab === 'settings' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onSaveSettings(localSettings);
                    notify('Configuración guardada correctamente.');
                  }}
                  className="space-y-5"
                >
                  <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span>Contacto y WhatsApp de Recepción de Pedidos</span>
                      </h4>

                      <button
                        type="button"
                        onClick={() => setActiveTab('whatsapp')}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Personalizar Plantilla de Mensaje</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">
                          Número de WhatsApp para Enlaces (Solo dígitos con código de país) *
                        </label>
                        <input
                          type="text"
                          required
                          value={localSettings.whatsappPhone}
                          onChange={(e) => setLocalSettings({ ...localSettings, whatsappPhone: e.target.value })}
                          placeholder="51949077281"
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-mono text-sm"
                        />
                        <span className="text-[11px] text-stone-400 mt-0.5 block">
                          Ejemplo para Perú: 51949077281
                        </span>
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">
                          Teléfono Visible al Público
                        </label>
                        <input
                          type="text"
                          required
                          value={localSettings.contactDisplayPhone}
                          onChange={(e) => setLocalSettings({ ...localSettings, contactDisplayPhone: e.target.value })}
                          placeholder="+51 949 077 281"
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span className="text-xs text-emerald-950 font-semibold">
                              ¿Deseas incluir códigos promocionales, ofertas o saludos de Navidad en el mensaje de pedido?
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTab('whatsapp')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Abrir Editor de Mensaje</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">
                          Nombre Comercial de la Tienda
                        </label>
                        <input
                          type="text"
                          required
                          value={localSettings.storeName}
                          onChange={(e) => setLocalSettings({ ...localSettings, storeName: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">
                          PIN Secreto de Administración
                        </label>
                        <input
                          type="text"
                          required
                          value={localSettings.adminPin}
                          onChange={(e) => setLocalSettings({ ...localSettings, adminPin: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery and payment configuration */}
                  <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200">
                    <h4 className="font-bold text-stone-900 text-sm mb-3 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span>Costos de Envío y Cuentas de Pago</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">
                          Costo de Envío Estándar (S/)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={localSettings.deliveryCost}
                          onChange={(e) => setLocalSettings({ ...localSettings, deliveryCost: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">
                          Envío Gratis a partir de (S/)
                        </label>
                        <input
                          type="number"
                          step="10"
                          value={localSettings.freeDeliveryThreshold}
                          onChange={(e) => setLocalSettings({ ...localSettings, freeDeliveryThreshold: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">
                          Número Yape / Plin
                        </label>
                        <input
                          type="text"
                          value={localSettings.yapeNumber}
                          onChange={(e) => setLocalSettings({ ...localSettings, yapeNumber: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      id="btn-save-settings-submit"
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar Cambios de Configuración</span>
                    </button>
                  </div>
                </form>

                {/* Backups & Restore tools */}
                <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200">
                  <h4 className="font-bold text-stone-900 text-sm mb-2 flex items-center gap-1.5">
                    <FileJson className="w-4 h-4 text-emerald-600" />
                    <span>Copia de Seguridad y Restauración de Catálogo</span>
                  </h4>
                  <p className="text-xs text-stone-500 mb-4">
                    Puedes descargar tu inventario completo con precios modificados o restaurar la lista inicial provista en el Excel.
                  </p>

                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={handleExportJSON}
                      className="px-4 py-2 bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Download className="w-4 h-4 text-emerald-600" />
                      <span>Descargar Catálogo (JSON)</span>
                    </button>

                    <label className="px-4 py-2 bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span>Importar Catálogo (JSON)</span>
                      <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                    </label>

                    <button
                      onClick={() => {
                        if (confirm('¿Restablecer el catálogo con los 12 productos originales del documento inicial? Se perderán productos añadidos manualmente.')) {
                          onResetCatalog();
                          notify('Catálogo inicial restaurado.');
                        }
                      }}
                      className="px-4 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer ml-auto"
                    >
                      <RefreshCw className="w-4 h-4 text-rose-600" />
                      <span>Restablecer Catálogo Original</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODAL: EDIT / CREATE PRODUCT */}
        {editingProduct && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
            <div
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
                <h3 className="font-black text-stone-900 text-base">
                  {isCreating ? 'Agregar Nuevo Producto' : `Editar Producto [${editingProduct.code}]`}
                </h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProductForm} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Código *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProduct.code}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="Ej: NT-7"
                      className="w-full px-3 py-2 text-xs font-mono font-bold bg-stone-50 border border-stone-300 rounded-xl"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          name: e.target.value,
                        })
                      }
                      placeholder="Ej: Muñecos Navideños 55-60cm"
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Categoría
                    </label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          category: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl"
                    >
                      <option value="Muñecos y Figuras">Muñecos y Figuras</option>
                      <option value="Luces LED Acrílicas">Luces LED Acrílicas</option>
                      <option value="Adornos Navideños">Adornos Navideños</option>
                      <option value="Decoración Premium">Decoración Premium</option>
                      <option value="Novedades">Novedades</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Stock Disponible
                    </label>
                    <input
                      type="number"
                      value={editingProduct.stock}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          stock: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl"
                    />
                  </div>
                </div>

                {/* Pricing Fields */}
                <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-950 mb-1">
                      Precio Unidad (S/) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={editingProduct.priceUnit}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          priceUnit: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-xs font-mono font-black bg-white border border-emerald-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-emerald-950 mb-1">
                      Precio por Caja (S/)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={editingProduct.priceBox || ''}
                      placeholder="Ej: 2250"
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          priceBox: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      className="w-full px-3 py-2 text-xs font-mono font-black bg-white border border-emerald-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-emerald-950 mb-1">
                      Unidades por Caja
                    </label>
                    <input
                      type="number"
                      value={editingProduct.boxQuantity || ''}
                      placeholder="Ej: 300"
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          boxQuantity: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-xl"
                    />
                  </div>
                </div>

                {/* Image configuration section */}
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-stone-800">
                      Imagen del Producto (URL, Subir Foto o Preset)
                    </label>
                    <div className="flex gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setImagePreviewMode('url')}
                        className={`px-2 py-0.5 rounded ${imagePreviewMode === 'url' ? 'bg-stone-800 text-white' : 'text-stone-500'}`}
                      >
                        URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setImagePreviewMode('file')}
                        className={`px-2 py-0.5 rounded ${imagePreviewMode === 'file' ? 'bg-stone-800 text-white' : 'text-stone-500'}`}
                      >
                        Subir Archivo
                      </button>
                      <button
                        type="button"
                        onClick={() => setImagePreviewMode('presets')}
                        className={`px-2 py-0.5 rounded ${imagePreviewMode === 'presets' ? 'bg-stone-800 text-white' : 'text-stone-500'}`}
                      >
                        Elegir Preset
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 items-center">
                    <img
                      src={editingProduct.image}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-xl border border-stone-300 shrink-0 bg-white"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=200&q=80';
                      }}
                    />

                    <div className="flex-1">
                      {imagePreviewMode === 'url' && (
                        <input
                          type="text"
                          value={editingProduct.image}
                          onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl"
                        />
                      )}

                      {imagePreviewMode === 'file' && (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                        />
                      )}

                      {imagePreviewMode === 'presets' && (
                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                          {PRESET_IMAGES.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setEditingProduct({ ...editingProduct, image: preset.url })}
                              className="shrink-0 text-center"
                            >
                              <img
                                src={preset.url}
                                alt={preset.label}
                                className="w-12 h-12 object-cover rounded-lg border border-stone-300 hover:border-emerald-600"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Technical Sheet details */}
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <span className="text-[11px] font-bold text-stone-800 block">
                    Ficha Técnica y Medidas
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      value={editingProduct.technicalSheet.dimensions || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          technicalSheet: { ...editingProduct.technicalSheet, dimensions: e.target.value },
                        })
                      }
                      placeholder="Dimensiones (ej: Alto: 60 cm x Ancho: 20 cm)"
                      className="px-3 py-1.5 bg-white border border-stone-300 rounded-xl"
                    />
                    <input
                      type="text"
                      value={editingProduct.technicalSheet.material || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          technicalSheet: { ...editingProduct.technicalSheet, material: e.target.value },
                        })
                      }
                      placeholder="Material (ej: 100% acrílico)"
                      className="px-3 py-1.5 bg-white border border-stone-300 rounded-xl"
                    />
                    <input
                      type="text"
                      value={editingProduct.technicalSheet.lights || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          technicalSheet: { ...editingProduct.technicalSheet, lights: e.target.value },
                        })
                      }
                      placeholder="Luces LED (ej: 348 pcs LED)"
                      className="px-3 py-1.5 bg-white border border-stone-300 rounded-xl"
                    />
                    <input
                      type="text"
                      value={editingProduct.technicalSheet.models || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          technicalSheet: { ...editingProduct.technicalSheet, models: e.target.value },
                        })
                      }
                      placeholder="Modelos surtidos (ej: 3 modelos)"
                      className="px-3 py-1.5 bg-white border border-stone-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    Guardar Producto
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
