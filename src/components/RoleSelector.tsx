/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserRole } from '../types';
import { Shield, Wrench, BadgeDollarSign, Laptop } from 'lucide-react';

interface RoleSelectorProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isMobileSimulated: boolean;
  onToggleMobileSim: () => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  currentRole,
  onRoleChange,
  isMobileSimulated,
  onToggleMobileSim,
}) => {
  return (
    <div id="role-selector-bar" className="bg-slate-900 border-b border-slate-800 text-white px-4 py-3 flex flex-wrap gap-3 items-center justify-between shadow-md relative z-40">
      <div className="flex items-center gap-2">
        <div className="bg-amber-500 text-slate-950 p-1.5 rounded-lg font-bold text-xs tracking-wider flex items-center gap-1 shadow-sm">
          <Laptop className="h-3.5 w-3.5" />
          SIMULADOR
        </div>
        <p className="text-xs text-slate-300 hidden md:inline">
          Alterne os cargos para testar as permissões e o fluxo de trabalho da oficina:
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Recepção Toggle */}
        <button
          id="role-btn-recepcao"
          onClick={() => onRoleChange('recepcao')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            currentRole === 'recepcao'
              ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-300 ring-offset-2 ring-offset-slate-900'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Laptop className="h-3.5 w-3.5" />
          Recepção (Mariana)
        </button>

        {/* Mecânico Toggle */}
        <button
          id="role-btn-mecanico"
          onClick={() => onRoleChange('mecanico')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            currentRole === 'mecanico'
              ? 'bg-amber-500 text-slate-950 font-bold ring-2 ring-amber-300 ring-offset-2 ring-offset-slate-900'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Wrench className="h-3.5 w-3.5" />
          Mecânico (Logan)
        </button>

        {/* Vendedor Toggle */}
        <button
          id="role-btn-vendedor"
          onClick={() => onRoleChange('vendedor')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            currentRole === 'vendedor'
              ? 'bg-blue-500 text-white font-bold ring-2 ring-blue-300 ring-offset-2 ring-offset-slate-900'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <BadgeDollarSign className="h-3.5 w-3.5" />
          Vendedor (Carlos)
        </button>

        {/* Gerente Toggle */}
        <button
          id="role-btn-gerente"
          onClick={() => onRoleChange('gerente')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            currentRole === 'gerente'
              ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          Gerente / Admin (Ana)
        </button>

        {/* Screen size simulation toggle */}
        <div className="h-6 w-[1px] bg-slate-800 mx-2 hidden sm:block"></div>

        <button
          id="toggle-mobile-view-btn"
          onClick={onToggleMobileSim}
          className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            isMobileSimulated
              ? 'bg-purple-600 text-white font-bold'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Simular visualização de celular"
        >
          <span>{isMobileSimulated ? 'Visualizar Desktop 💻' : 'Simular Celular 📱'}</span>
        </button>
      </div>
    </div>
  );
};
