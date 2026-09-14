import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { StoreSettings } from '../types';

interface QuickWhatsAppFloatProps {
  settings: StoreSettings;
}

export const QuickWhatsAppFloat: React.FC<QuickWhatsAppFloatProps> = ({ settings }) => {
  const cleanPhone = settings.whatsappPhone.replace(/\D/g, '');
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    'Hola! Deseo comunicarme para realizar una consulta y pedidos del catálogo.'
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center pointer-events-auto">
      <a
        id="floating-whatsapp-trigger"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-xl shadow-emerald-900/25 transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer border border-emerald-400/30"
        aria-label="Contactar por WhatsApp"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-200"></span>
          </span>
        </div>
        <div className="text-left leading-tight hidden sm:block">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-200 block">
            Atención Rápida
          </span>
          <span className="text-xs font-black block">
            Consultar por WhatsApp
          </span>
        </div>
      </a>
    </div>
  );
};
