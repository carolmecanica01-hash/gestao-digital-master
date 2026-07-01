/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InventoryItem, UserRole } from '../types';
import { Package, Plus, AlertTriangle, Search, TrendingUp, ShieldAlert, ArrowDown, ArrowUp, DollarSign } from 'lucide-react';

interface StockManagerProps {
  inventory: InventoryItem[];
  currentRole: UserRole;
  onAddInventoryItem: (newItem: Omit<InventoryItem, 'id'>) => void;
  onUpdateStockQty: (sku: string, qtyChange: number) => void;
}

export const StockManager: React.FC<StockManagerProps> = ({
  inventory,
  currentRole,
  onAddInventoryItem,
  onUpdateStockQty,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Formulario de nova peça
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Geral');
  const [newCurrentQty, setNewCurrentQty] = useState(5);
  const [newMinQty, setNewMinQty] = useState(2);
  const [newCostPrice, setNewCostPrice] = useState(0);
  const [newSalePrice, setNewSalePrice] = useState(0);

  if (currentRole === 'mecanico') {
    return (
      <div id="mecanico-access-denied-stock" className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-xl mx-auto my-12">
        <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-base font-bold text-slate-800">Acesso ao Estoque Reservado</h3>
        <p className="text-xs text-slate-500 mt-2">
          De acordo com as diretrizes da oficina mecânica, os mecânicos apenas efetuam requisições de peças pelas ordens de serviço. O controle geral do estoque físico, valores de custo e cadastro é restrito ao setor de Vendas e Gerência.
        </p>
        <p className="text-xs font-semibold text-indigo-600 mt-3">
          Por favor, mude seu cargo para "Vendedor" ou "Gerente" no topo da página.
        </p>
      </div>
    );
  }

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku || !newName || newCostPrice < 0 || newSalePrice < 0) {
      alert('Preencha os dados do item de estoque corretamente.');
      return;
    }

    onAddInventoryItem({
      sku: newSku.toUpperCase(),
      name: newName,
      category: newCategory,
      currentQty: Number(newCurrentQty),
      minQty: Number(newMinQty),
      costPrice: Number(newCostPrice),
      salePrice: Number(newSalePrice),
    });

    setNewSku('');
    setNewName('');
    setNewCategory('Geral');
    setNewCurrentQty(5);
    setNewMinQty(2);
    setNewCostPrice(0);
    setNewSalePrice(0);
    setIsAdding(false);
    alert('Nova peça cadastrada com sucesso no estoque!');
  };

  const handleAdjustQty = (sku: string, change: number) => {
    onUpdateStockQty(sku, change);
  };

  // Filtragem dos itens de estoque
  const filteredItems = inventory.filter(item => {
    return item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
           item.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Itens em nível crítico
  const criticalItems = inventory.filter(item => item.currentQty <= item.minQty);

  return (
    <div id="stock-module" className="space-y-6">
      
      {/* Alertas Críticos de Estoque */}
      {criticalItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Atenção: Estoque Crítico Detectado!</p>
            <p className="mt-0.5">Os seguintes itens estão em nível mínimo ou esgotados. Recomendamos efetuar compra para estoque imediata:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {criticalItems.map(i => (
                <span key={i.id} className="bg-amber-100 border border-amber-300 px-2 py-0.5 rounded font-mono font-bold uppercase text-[9px]">
                  {i.name} ({i.currentQty === 0 ? 'SEM ESTOQUE' : `${i.currentQty} restantes`})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid Superior: Filtros, Buscas e Botão de Adicionar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div className="relative flex-1 max-w-md text-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input 
            type="text" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por peça, código SKU ou categoria..." 
            className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
          />
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          {isAdding ? 'Fechar Formulário' : 'Cadastrar Nova Peça'}
        </button>
      </div>

      {/* Formulário de Cadastro de Peça */}
      {isAdding && (
        <form id="new-part-form" onSubmit={handleSaveItem} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm animate-fadeIn">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Package className="h-4.5 w-4.5" />
            Cadastrar Peça de Reposição
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Código SKU (Único) *</label>
              <input 
                type="text" 
                required 
                value={newSku} 
                onChange={e => setNewSku(e.target.value)} 
                placeholder="EX: PAST-FND-CIV" 
                className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-indigo-500 bg-white uppercase font-mono"
              />
            </div>
            <div className="col-span-2 md:col-span-2">
              <label className="block font-semibold text-slate-600 mb-1">Nome da Peça *</label>
              <input 
                type="text" 
                required 
                value={newName} 
                onChange={e => setNewName(e.target.value)} 
                placeholder="Ex: Pastilha de Freio Dianteira Cerâmica" 
                className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-indigo-500 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Categoria</label>
              <select 
                value={newCategory} 
                onChange={e => setNewCategory(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-indigo-500 bg-white"
              >
                <option value="Geral">Geral</option>
                <option value="Freios">Freios</option>
                <option value="Suspensão">Suspensão</option>
                <option value="Ignição">Ignição</option>
                <option value="Fluidos">Fluidos / Óleo</option>
                <option value="Filtros">Filtros</option>
                <option value="Correias">Correias</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Qtd Atual no Estoque *</label>
              <input 
                type="number" 
                required 
                value={newCurrentQty} 
                onChange={e => setNewCurrentQty(Number(e.target.value))} 
                className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-indigo-500 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Limite Mínimo (Alerta) *</label>
              <input 
                type="number" 
                required 
                value={newMinQty} 
                onChange={e => setNewMinQty(Number(e.target.value))} 
                className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-indigo-500 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Preço Custo / Compra (R$) *</label>
              <input 
                type="number" 
                required 
                value={newCostPrice} 
                onChange={e => setNewCostPrice(Number(e.target.value))} 
                placeholder="150.00"
                className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-indigo-500 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Preço de Venda (R$) *</label>
              <input 
                type="number" 
                required 
                value={newSalePrice} 
                onChange={e => setNewSalePrice(Number(e.target.value))} 
                placeholder="290.00"
                className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-indigo-500 bg-white"
              />
            </div>

            <div className="flex items-end md:col-span-1">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded transition-colors cursor-pointer"
              >
                Salvar Peça
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tabela de Estoque */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-slate-700">Visualização Geral de Peças</span>
          <span className="text-[10px] text-slate-400 font-mono">{filteredItems.length} peças cadastradas</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-xs">Nenhuma peça encontrada para os filtros especificados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-150 text-slate-500 font-bold uppercase text-[10px] bg-slate-100/50">
                  <th className="p-3">Código SKU</th>
                  <th className="p-3">Nome da Peça</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3 text-center">Saldo Estoque</th>
                  <th className="p-3">Preço Venda</th>
                  {currentRole === 'gerente' && <th className="p-3">Preço Custo</th>}
                  {currentRole === 'gerente' && <th className="p-3">Margem Lucro</th>}
                  <th className="p-3 text-right">Ajuste Manual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-slate-700">
                {filteredItems.map(item => {
                  const isCritical = item.currentQty <= item.minQty;
                  
                  // Calcular margem: ((venda - custo) / venda) * 100
                  const marginValue = item.salePrice > 0 
                    ? (((item.salePrice - item.costPrice) / item.salePrice) * 100).toFixed(1)
                    : '0';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-800 uppercase">{item.sku}</td>
                      <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">{item.category}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`font-bold px-2.5 py-1 rounded-full text-xs ${
                          item.currentQty === 0 
                            ? 'bg-rose-100 text-rose-800' 
                            : isCritical 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.currentQty} un (mín: {item.minQty})
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900">R$ {item.salePrice.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                      
                      {/* Custo e margem visíveis apenas para o Gerente */}
                      {currentRole === 'gerente' && (
                        <td className="p-3 text-slate-500">R$ {item.costPrice.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                      )}
                      {currentRole === 'gerente' && (
                        <td className="p-3">
                          <span className="text-emerald-700 font-extrabold flex items-center gap-0.5">
                            <TrendingUp className="h-3 w-3" />
                            {marginValue}%
                          </span>
                        </td>
                      )}

                      {/* Controle rápido de adição/redução física */}
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => handleAdjustQty(item.sku, -1)}
                          disabled={item.currentQty <= 0}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1 rounded font-bold disabled:opacity-40 transition-colors cursor-pointer inline-flex items-center justify-center w-6 h-6 text-xs"
                          title="Remover 1 do estoque"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleAdjustQty(item.sku, 1)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-1 rounded font-bold transition-colors cursor-pointer inline-flex items-center justify-center w-6 h-6 text-xs"
                          title="Adicionar 1 ao estoque"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
