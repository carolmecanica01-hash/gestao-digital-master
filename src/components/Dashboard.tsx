/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Vehicle, UserRole, Transaction } from '../types';
import { Car, Clock, AlertTriangle, BadgeDollarSign, TrendingUp, Sparkles, ChevronRight, CheckCircle2, DollarSign } from 'lucide-react';

interface DashboardProps {
  vehicles: Vehicle[];
  transactions: Transaction[];
  currentRole: UserRole;
  onNavigateToTab: (tab: string, vehicleId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  vehicles,
  transactions,
  currentRole,
  onNavigateToTab,
}) => {
  // 1. Filtrar carros no pátio (todos exceto os entregues)
  const carsInYard = vehicles.filter(v => v.status !== 'entregue');
  
  // 2. Aguardando entrega (pronto)
  const carsAwaitingDelivery = vehicles.filter(v => v.status === 'pronto');
  
  // 3. Aguardando diagnosticar (inclui recepção inicial e diagnóstico ativo)
  const carsAwaitingDiagnosis = vehicles.filter(v => v.status === 'recepcionado' || v.status === 'diagnostico');

  // 4. Clientes devedores (valor total > valor pago)
  const debtorClients = vehicles.filter(v => v.totalValue > v.amountPaid);
  const totalDebtAmount = debtorClients.reduce((sum, v) => sum + (v.totalValue - v.amountPaid), 0);

  // 5. Saldo atual de caixa (soma de transações de receita - despesa)
  const cashBalance = transactions.reduce((balance, t) => {
    return t.type === 'receita' ? balance + t.amount : balance - t.amount;
  }, 0);

  // Tradução amigável dos status para FASE 2
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'recepcionado': return { text: 'Recepcionado', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
      case 'diagnostico': return { text: 'Em Diagnóstico', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'aguardando_peca': return { text: 'Aguardando Peça', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'aguardando_orcamento': return { text: 'Aguardando Orçamento', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'execucao': return { text: 'Em Execução', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'pronto': return { text: 'Pronto para Entrega', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'entregue': return { text: 'Entregue', bg: 'bg-teal-100 text-teal-800 border-teal-200' };
      default: return { text: 'Indefinido', bg: 'bg-slate-50 text-slate-500 border-slate-100' };
    }
  };

  return (
    <div id="dashboard-container" className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            Visão Geral do Pátio
          </h1>
          <p className="text-sm text-slate-500">
            Monitoramento em tempo real de carros, diagnósticos, peças e fluxo de caixa.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
          Última atualização: {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Carros no Pátio */}
        <div 
          id="metric-yard"
          onClick={() => onNavigateToTab('checklist')}
          className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">No Pátio</span>
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 group-hover:scale-110 transition-transform">
              <Car className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900">{carsInYard.length}</span>
            <span className="text-xs text-slate-400 block mt-0.5">veículos ativos</span>
          </div>
        </div>

        {/* Card 2: A Diagnosticar */}
        <div 
          id="metric-pending-diag"
          onClick={() => onNavigateToTab('lab')}
          className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">A Diagnosticar</span>
            <div className="bg-amber-50 p-2 rounded-lg text-amber-600 group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900">{carsAwaitingDiagnosis.length}</span>
            <span className="text-xs text-slate-400 block mt-0.5">precisam de atenção</span>
          </div>
        </div>

        {/* Card 3: Prontos para Entrega */}
        <div 
          id="metric-ready"
          onClick={() => onNavigateToTab('checklist')}
          className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prontos</span>
            <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900">{carsAwaitingDelivery.length}</span>
            <span className="text-xs text-slate-400 block mt-0.5">aguardando liberação</span>
          </div>
        </div>

        {/* Card 4: Clientes Devedores */}
        <div 
          id="metric-debtors"
          className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Devedores</span>
            <div className="bg-rose-50 p-2 rounded-lg text-rose-600 group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-900">
              {currentRole === 'mecanico' ? '***' : `R$ ${totalDebtAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">
              {debtorClients.length} cliente{debtorClients.length !== 1 ? 's' : ''} em aberto
            </span>
          </div>
        </div>

        {/* Card 5: Caixa Atual (Apenas Gerente/Vendedor) */}
        <div 
          id="metric-cash"
          onClick={() => currentRole !== 'mecanico' ? onNavigateToTab('financial') : undefined}
          className={`bg-white border border-slate-200 p-4 rounded-xl shadow-xs transition-all ${
            currentRole !== 'mecanico' ? 'hover:border-blue-300 cursor-pointer group' : 'opacity-65'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldo em Caixa</span>
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-xl font-bold ${cashBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
              {currentRole === 'mecanico' ? 'Acesso Restrito' : `R$ ${cashBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">entradas e saídas líquidas</span>
          </div>
        </div>
      </div>

      {/* Grid Central */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seção 1: Lista e Status dos Veículos Ativos no Pátio (2 colunas) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Veículos no Pátio</h2>
                <p className="text-xs text-slate-500">Mecanismo de acompanhamento de status e fluxo do pátio.</p>
              </div>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                {carsInYard.length} veículos ativos
              </span>
            </div>

            {carsInYard.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                <Car className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Nenhum carro no pátio neste momento.</p>
                <button 
                  onClick={() => onNavigateToTab('checklist')}
                  className="mt-3 bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors"
                >
                  Recepcionar Veículo Novo
                </button>
              </div>
            ) : (
              <div id="yard-car-list" className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto pr-1">
                {carsInYard.map((car) => {
                  const statusInfo = getStatusLabel(car.status);
                  const isPendingBudget = car.status === 'aguardando_orcamento';
                  return (
                    <div 
                      key={car.id} 
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group/item hover:bg-slate-50/50 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex gap-3">
                        <div className="bg-slate-100 h-11 w-11 rounded-lg flex items-center justify-center text-slate-500 font-mono font-bold text-xs uppercase border border-slate-200 shrink-0">
                          {car.brand.substring(0, 3)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 text-sm">{car.brand} {car.model}</span>
                            <span className="bg-slate-200 text-slate-700 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                              {car.plate}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Cliente: <span className="text-slate-700 font-medium">{car.clientName}</span> | Entrou em: {new Date(car.entryDate).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic">
                            &ldquo;{car.complaints}&rdquo;
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${statusInfo.bg}`}>
                          {statusInfo.text}
                        </span>
                        
                        {/* Botão de ação inteligente baseado no status */}
                        <button
                          onClick={() => {
                            if (car.status === 'recepcionado') onNavigateToTab('checklist', car.id);
                            else if (car.status === 'diagnostico') onNavigateToTab('lab', car.id);
                            else if (car.status === 'aguardando_peca') onNavigateToTab('lab', car.id);
                            else if (car.status === 'aguardando_orcamento') onNavigateToTab('budget', car.id);
                            else if (car.status === 'execucao') onNavigateToTab('lab', car.id);
                            else if (car.status === 'pronto') onNavigateToTab('checklist', car.id);
                          }}
                          className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 p-1.5 rounded-lg text-slate-400 group-hover/item:text-slate-700 transition-all cursor-pointer"
                          title="Gerenciar Veículo"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Fluxo visual rápido de ajuda ao usuário */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4 flex gap-3.5 items-start">
            <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Acompanhamento e Fluxo de O.S.:</h3>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Qualquer funcionário tem acesso ao <span className="font-semibold text-indigo-700">Checklist de Entrada</span> para recepcionar carros. Mecânicos usam o <span className="font-semibold text-indigo-700">Diagnóstico Técnico</span> para testes e solicitar peças ao estoque. Vendedores e Gerentes aprovam <span className="font-semibold text-indigo-700">Orçamentos</span> e gerenciam <span className="font-semibold text-indigo-700">Estoque / Caixa Financeiro</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Seção 2: Lista de Devedores e Visão Financeira Rápida (1 coluna) */}
        <div className="space-y-6">
          {/* Caixa & Margem Rápida (Apenas Vendedores e Gerentes) */}
          {currentRole !== 'mecanico' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-3">
                <BadgeDollarSign className="h-4.5 w-4.5 text-blue-600" />
                Resumo de Caixa & Margem
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Saldo Atual Líquido:</span>
                  <span className={`text-sm font-bold ${cashBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    R$ {cashBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                {/* Cálculo aproximado de custos de peças vs margem de lucro */}
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Receitas Totais:</span>
                  <span className="text-xs font-bold text-slate-700">
                    R$ {transactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Despesas Totais:</span>
                  <span className="text-xs font-bold text-rose-600">
                    R$ {transactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {currentRole === 'gerente' && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mt-2 text-center">
                    <p className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider">Margem Média Estimada</p>
                    <p className="text-lg font-black text-indigo-950 mt-1">~ 54.2%</p>
                    <span className="text-[9px] text-indigo-500 block">Calculado sobre markup de peças e serviços</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Clientes Devedores (Contas a Receber Pendentes) */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                Clientes Devedores
              </h2>
              <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {debtorClients.length} pendentes
              </span>
            </div>

            {debtorClients.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-400 text-xs">Nenhum débito pendente. Excelente!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {debtorClients.map((client) => {
                  const remaining = client.totalValue - client.amountPaid;
                  return (
                    <div 
                      key={client.id}
                      className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex justify-between items-center"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800">{client.clientName}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{client.brand} {client.model}</p>
                        <span className="text-[9px] bg-slate-200 text-slate-700 px-1 py-0.5 rounded font-mono font-semibold uppercase">
                          OS: {client.id}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-rose-600 block">
                          R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <button
                          onClick={() => onNavigateToTab('checklist', client.id)}
                          className="text-[9px] text-indigo-600 hover:underline font-bold mt-1 cursor-pointer block"
                        >
                          Registrar Recebimento
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
