/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Vehicle, InventoryItem, UserRole, PartsRequest } from '../types';
import { Receipt, Check, FileCheck, Package, ShoppingBag, ShieldAlert, DollarSign, Edit3, Trash2, ArrowRight } from 'lucide-react';

interface BudgetManagerProps {
  vehicles: Vehicle[];
  inventory: InventoryItem[];
  currentRole: UserRole;
  onApproveBudget: (vehicleId: string, updatedParts: PartsRequest[], laborValue: number) => void;
  selectedVehicleId?: string;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  vehicles,
  inventory,
  currentRole,
  onApproveBudget,
  selectedVehicleId,
}) => {
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(selectedVehicleId || null);
  const [laborValue, setLaborValue] = useState<number>(0);
  const [partsState, setPartsState] = useState<PartsRequest[]>([]);

  // Sincronizar prop externa se houver
  React.useEffect(() => {
    if (selectedVehicleId) {
      setActiveVehicleId(selectedVehicleId);
    }
  }, [selectedVehicleId]);

  // Filtrar veículos que precisam de Orçamento
  // (Pode ser os de status 'aguardando_orcamento' ou que possuem requests de peças no estado 'lancado' ou 'pendente')
  const budgetVehicles = vehicles.filter(v => 
    v.status === 'aguardando_orcamento' || 
    v.partsRequests.some(pr => pr.status === 'lancado' || pr.status === 'pendente')
  );

  const activeVehicle = vehicles.find(v => v.id === activeVehicleId);

  // Carregar dados do veículo ativo ao selecionar
  React.useEffect(() => {
    if (activeVehicle) {
      setLaborValue(activeVehicle.laborValue || 0);
      setPartsState(activeVehicle.partsRequests.map(p => ({ ...p })));
    } else {
      setPartsState([]);
    }
  }, [activeVehicleId, activeVehicle]);

  if (currentRole === 'mecanico') {
    return (
      <div id="mecanico-access-denied-budget" className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-xl mx-auto my-12">
        <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-base font-bold text-slate-800">Acesso Restrito ao Setor de Vendas</h3>
        <p className="text-xs text-slate-500 mt-2">
          De acordo com as regras operacionais da oficina, mecânicos não têm acesso à elaboração, precificação de peças, nem liberação de orçamentos fiscais.
        </p>
        <p className="text-xs font-semibold text-indigo-600 mt-3">
          Por favor, alterne a simulação de cargo para "Vendedor" ou "Gerente" no topo da página.
        </p>
      </div>
    );
  }

  // Lógica para auto-associar peça do estoque à solicitação do mecânico
  const handleAutoAssociate = (index: number, sku: string) => {
    const matchedItem = inventory.find(i => i.sku === sku);
    if (!matchedItem) return;

    const updated = [...partsState];
    updated[index] = {
      ...updated[index],
      sku: matchedItem.sku,
      price: matchedItem.salePrice,
      status: 'aprovado' // Assume aprovação se estiver associada corretamente
    };
    setPartsState(updated);
  };

  const handlePriceChange = (index: number, price: number) => {
    const updated = [...partsState];
    updated[index].price = price;
    setPartsState(updated);
  };

  const handleStatusChange = (index: number, status: 'aprovado' | 'recusado' | 'pendente') => {
    const updated = [...partsState];
    updated[index].status = status;
    setPartsState(updated);
  };

  // Calcular valor total do orçamento atual
  const partsTotal = partsState.reduce((sum, pr) => {
    if (pr.status === 'aprovado') {
      return sum + ((pr.price || 0) * pr.qty);
    }
    return sum;
  }, 0);

  const budgetTotal = partsTotal + laborValue;

  const handleConfirmAndDeductStock = () => {
    if (!activeVehicleId) return;

    // Verificar se há peças pendentes de decisão
    const hasPending = partsState.some(p => p.status === 'lancado' || p.status === 'pendente');
    if (hasPending) {
      if (!confirm('Alguns itens ainda estão marcados como pendentes/lançados. Eles não serão cobrados nem retiradas do estoque. Deseja prosseguir com a aprovação?')) {
        return;
      }
    }

    // Verificar níveis de estoque antes de confirmar
    let stockWarning = false;
    partsState.forEach(req => {
      if (req.status === 'aprovado' && req.sku) {
        const item = inventory.find(i => i.sku === req.sku);
        if (item && item.currentQty < req.qty) {
          stockWarning = true;
        }
      }
    });

    if (stockWarning) {
      if (!confirm('Atenção: Uma ou mais peças aprovadas possuem quantidade inferior em estoque do que o solicitado. Deseja forçar a retirada do estoque (ficará negativo)?')) {
        return;
      }
    }

    // Realizar aprovação
    onApproveBudget(activeVehicleId, partsState, laborValue);
    alert('Orçamento Aprovado com sucesso!\nAs peças aprovadas foram baixadas do estoque e o veículo foi colocado em execução de serviço.');
  };

  return (
    <div id="budget-module" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Coluna Lateral: Orçamentos Pendentes */}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl shadow-xs p-4 flex flex-col h-[650px]">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Receipt className="h-4.5 w-4.5 text-blue-600" />
            Orçamentos Solicitados
          </h2>
          <p className="text-[11px] text-slate-400 mb-3">Revisão de peças solicitadas por mecânicos.</p>
        </div>

        {budgetVehicles.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg flex-1 flex flex-col items-center justify-center">
            <FileCheck className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-slate-400 text-xs">Nenhum veículo aguardando orçamento no momento.</p>
          </div>
        ) : (
          <div className="space-y-2 flex-1 overflow-y-auto pr-1">
            {budgetVehicles.map(v => {
              const isSelected = v.id === activeVehicleId;
              const pendingCount = v.partsRequests.filter(p => p.status === 'lancado' || p.status === 'pendente').length;

              return (
                <div
                  key={v.id}
                  onClick={() => setActiveVehicleId(v.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-50/60 border-blue-300 shadow-2xs' 
                      : 'border-slate-150 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-bold text-xs text-slate-900">{v.brand} {v.model}</span>
                    <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0">OS: {v.id}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Cliente: {v.clientName}</p>
                  
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                      {pendingCount} itens p/ analisar
                    </span>
                    <span className="text-[10px] text-slate-700 font-extrabold">R$ {v.totalValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Painel Central: Elaborador de Orçamento e Baixa de Estoque */}
      <div className="lg:col-span-2 space-y-6">
        {!activeVehicle ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-12 text-center flex flex-col items-center justify-center h-[550px]">
            <Receipt className="h-12 w-12 text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">Elaborador de Orçamentos</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-sm">
              Selecione uma solicitação da fila de orçamentos para cruzar as peças requisitadas com o estoque físico, definir os preços de venda e registrar o consentimento do cliente.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Resumo do Cliente & O.S. */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
                <div>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded uppercase mr-2 font-mono">OS: {activeVehicle.id}</span>
                  <h2 className="text-base font-bold text-slate-900 inline">{activeVehicle.brand} {activeVehicle.model}</h2>
                  <p className="text-xs text-slate-500 mt-1">Proprietário: <span className="font-medium text-slate-700">{activeVehicle.clientName}</span> | Telefone: {activeVehicle.clientPhone}</p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-slate-400">Entrada pátio:</p>
                  <p className="font-bold text-slate-700">{new Date(activeVehicle.entryDate).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              {/* Checklist & Diagnostic Summary */}
              <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-1.5 border border-slate-150">
                <p className="font-semibold text-slate-700">Resumo de Reclamações e Diagnósticos Efetuados:</p>
                <p className="text-slate-600 italic leading-relaxed">&ldquo;{activeVehicle.complaints}&rdquo;</p>
                {activeVehicle.diagnosticLogs.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 mt-1.5">
                    <p className="font-bold text-indigo-700">Resultados dos testes (Mecânico):</p>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-slate-600">
                      {activeVehicle.diagnosticLogs.map(l => (
                        <li key={l.id} className="text-[11px]"><span className="font-semibold text-slate-700">{l.testName}</span>: {l.result}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Itens do Orçamento: Cruzar com Estoque e Precificar */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 space-y-4">
              <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="h-4.5 w-4.5" />
                Precificação de Peças & Associação ao Estoque Físico
              </h3>

              {partsState.length === 0 ? (
                <div className="bg-amber-50 text-amber-800 p-4 rounded-lg border border-amber-200 text-xs">
                  O mecânico não solicitou nenhuma peça adicional para este veículo. Apenas o valor da mão de obra será orçado.
                </div>
              ) : (
                <div className="space-y-4 divide-y divide-slate-100">
                  {partsState.map((part, index) => {
                    // Encontrar item correspondente no estoque (se houver SKU associado)
                    const stockItem = inventory.find(i => i.sku === part.sku);
                    
                    return (
                      <div key={part.id} className={`pt-3 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs`}>
                        {/* Nome da peça solicitado pelo mecânico */}
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800 text-sm">{part.partName}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Quantidade: {part.qty} unidade(s)</p>
                          
                          {/* Associação com estoque */}
                          <div className="mt-1">
                            <label className="block text-[10px] text-slate-500 font-bold">Associar Peça do Estoque:</label>
                            <select
                              value={part.sku || ""}
                              onChange={e => handleAutoAssociate(index, e.target.value)}
                              className="text-[11px] border border-slate-300 rounded p-1 bg-white mt-0.5 max-w-xs focus:outline-none focus:border-indigo-500"
                            >
                              <option value="">-- Selecione peça no estoque --</option>
                              {inventory.map(item => (
                                <option key={item.id} value={item.sku}>
                                  {item.name} (SKU: {item.sku} | Qtd: {item.currentQty} | R$ {item.salePrice.toLocaleString('pt-BR')})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Controles de Preço e Decisão */}
                        <div className="flex flex-wrap items-end gap-3 shrink-0">
                          {/* Quantidade no estoque mostrada ao vendedor */}
                          {stockItem && (
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block">Estoque Físico:</span>
                              <span className={`font-bold block ${stockItem.currentQty >= part.qty ? 'text-emerald-600' : 'text-rose-600 animate-pulse'}`}>
                                {stockItem.currentQty} un. {stockItem.currentQty < part.qty ? '(Insuficiente)' : '(Ok)'}
                              </span>
                            </div>
                          )}

                          {/* Ajuste de preço de venda */}
                          <div>
                            <span className="text-[10px] text-slate-500 block mb-1">Preço Venda Unitário (R$):</span>
                            <input 
                              type="number"
                              value={part.price || 0}
                              onChange={e => handlePriceChange(index, Number(e.target.value))}
                              className="w-24 text-xs border border-slate-300 rounded p-1 font-bold text-slate-800"
                            />
                          </div>

                          {/* Decisão de aprovação ou rejeição pelo vendedor */}
                          <div>
                            <span className="text-[10px] text-slate-500 block mb-1">Decisão do Vendedor:</span>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleStatusChange(index, 'aprovado')}
                                className={`px-2 py-1 rounded text-[10px] font-bold ${
                                  part.status === 'aprovado' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                Cobrar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(index, 'recusado')}
                                className={`px-2 py-1 rounded text-[10px] font-bold ${
                                  part.status === 'recusado' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                Recusar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mão de Obra e Total Geral */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              {/* Ajuste do Valor da Mão de Obra */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Valor de Mão de Obra de Serviços (R$):</label>
                <div className="relative rounded-md shadow-2xs max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 text-xs">R$</span>
                  </div>
                  <input
                    type="number"
                    value={laborValue}
                    onChange={e => setLaborValue(Number(e.target.value))}
                    className="w-full text-xs font-extrabold border border-slate-300 rounded-lg p-2.5 pl-8 focus:border-indigo-500 focus:outline-none"
                    placeholder="450.00"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Insira o valor das horas de trabalho do mecânico.</p>
              </div>

              {/* Resumo Financeiro do Orçamento */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Peças Selecionadas:</span>
                  <span className="font-bold text-slate-800">R$ {partsTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Mão de Obra:</span>
                  <span className="font-bold text-slate-800">R$ {laborValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm">
                  <span className="text-slate-900">Total Geral Orçado:</span>
                  <span className="text-indigo-600 text-base font-black">R$ {budgetTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmAndDeductStock}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg mt-3 flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer text-xs"
                >
                  <FileCheck className="h-4.5 w-4.5" />
                  Aprovar Orçamento e Baixar do Estoque
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
