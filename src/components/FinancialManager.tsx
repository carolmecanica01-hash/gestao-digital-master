/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transaction, PaymentMethod, AccountCategory, UserRole } from '../types';
import { DollarSign, Plus, ToggleLeft, ToggleRight, Sparkles, AlertCircle, TrendingUp, TrendingDown, BookOpen, ShieldAlert, Check } from 'lucide-react';

interface FinancialManagerProps {
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
  categories: AccountCategory[];
  currentRole: UserRole;
  onAddTransaction: (newTx: Omit<Transaction, 'id' | 'date'>) => void;
  onTogglePaymentMethod: (id: string) => void;
  onAddAccountCategory: (name: string, type: 'receita' | 'despesa') => void;
}

export const FinancialManager: React.FC<FinancialManagerProps> = ({
  transactions,
  paymentMethods,
  categories,
  currentRole,
  onAddTransaction,
  onTogglePaymentMethod,
  onAddAccountCategory,
}) => {
  // Controle de Abas Internas do Financeiro
  const [activeSubTab, setActiveSubTab] = useState<'caixa' | 'plano' | 'pagamentos' | 'analise'>('caixa');

  // Lançamento manual de caixa
  const [txType, setTxType] = useState<'receita' | 'despesa'>('despesa');
  const [txCategory, setTxCategory] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txAmount, setTxAmount] = useState<number>(0);
  const [txPaymentMethod, setTxPaymentMethod] = useState('');

  // Nova categoria plano de contas
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'receita' | 'despesa'>('despesa');

  if (currentRole !== 'gerente') {
    return (
      <div id="financial-access-denied" className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-xl mx-auto my-12">
        <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-base font-bold text-slate-800">Acesso Financeiro Exclusivo à Gerência</h3>
        <p className="text-xs text-slate-500 mt-2">
          Por questões estritas de compliance e segurança operacional da oficina, o painel de faturamento líquido, DRE de caixa, plano de contas corporativo e métodos de pagamento são acessíveis apenas ao cargo de Administrador/Gerente.
        </p>
        <p className="text-xs font-semibold text-indigo-600 mt-3">
          Por favor, alterne a simulação de cargo para "Gerente / Admin (Ana)" no topo da página.
        </p>
      </div>
    );
  }

  // Cálculos Financeiros
  const totalInflow = transactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
  const totalOutflow = transactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalInflow - totalOutflow;
  const profitability = totalInflow > 0 ? (netProfit / totalInflow) * 100 : 0;

  // Handler Lançamento Caixa
  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txCategory || !txDescription || txAmount <= 0) {
      alert('Preencha todos os campos obrigatórios corretamente.');
      return;
    }

    onAddTransaction({
      type: txType,
      category: txCategory,
      description: txDescription,
      amount: Number(txAmount),
      paymentMethod: txPaymentMethod || undefined
    });

    setTxDescription('');
    setTxAmount(0);
    setTxPaymentMethod('');
    alert('Lançamento registrado com sucesso no caixa!');
  };

  // Handler Nova Categoria Plano de Contas
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    onAddAccountCategory(newCatName.trim(), newCatType);
    setNewCatName('');
    alert(`Nova categoria "${newCatName}" inserida no Plano de Contas!`);
  };

  // Agrupamento de Despesas por Categoria para a Análise Profunda
  const expensesByCategory = categories
    .filter(cat => cat.type === 'despesa')
    .map(cat => {
      const sum = transactions
        .filter(t => t.type === 'despesa' && (t.category === cat.name || t.category === cat.id))
        .reduce((s, t) => s + t.amount, 0);
      return { name: cat.name, amount: sum };
    })
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div id="financial-module" className="space-y-6">
      
      {/* KPI Cards Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receita Bruta</span>
          <span className="text-xl font-extrabold text-emerald-600 mt-1 block">
            R$ {totalInflow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">entradas totais registradas</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Despesas / Saídas</span>
          <span className="text-xl font-extrabold text-rose-600 mt-1 block">
            R$ {totalOutflow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">custos fixos, variáveis e compras</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lucro Líquido Real</span>
          <span className={`text-xl font-extrabold mt-1 block ${netProfit >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">saldo livre no caixa</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rentabilidade</span>
          <span className="text-xl font-extrabold text-indigo-600 mt-1 block">
            {profitability.toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">conversão de faturamento</span>
        </div>
      </div>

      {/* Sub-Navegação de abas financeiras */}
      <div className="border-b border-slate-200 flex flex-wrap gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('caixa')}
          className={`pb-2.5 px-4 cursor-pointer border-b-2 transition-all ${
            activeSubTab === 'caixa' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Caixa & Fluxo Diário
        </button>
        <button
          onClick={() => setActiveSubTab('plano')}
          className={`pb-2.5 px-4 cursor-pointer border-b-2 transition-all ${
            activeSubTab === 'plano' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Plano de Contas Editável 📊
        </button>
        <button
          onClick={() => setActiveSubTab('pagamentos')}
          className={`pb-2.5 px-4 cursor-pointer border-b-2 transition-all ${
            activeSubTab === 'pagamentos' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Formas de Pagamento
        </button>
        <button
          onClick={() => setActiveSubTab('analise')}
          className={`pb-2.5 px-4 cursor-pointer border-b-2 transition-all ${
            activeSubTab === 'analise' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Inteligência Financeira & Cortes 🧠
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}

      {/* ABA 1: Caixa & Lançamentos */}
      {activeSubTab === 'caixa' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário de Lançamento */}
          <form id="misc-transaction-form" onSubmit={handleCreateTx} className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Lançar Movimento de Caixa
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Tipo de Movimento *</label>
                <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => { setTxType('receita'); setTxCategory(''); }}
                    className={`py-1 text-xs font-bold rounded ${txType === 'receita' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
                  >
                    Receita (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTxType('despesa'); setTxCategory(''); }}
                    className={`py-1 text-xs font-bold rounded ${txType === 'despesa' ? 'bg-rose-600 text-white' : 'text-slate-600'}`}
                  >
                    Despesa (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Categoria (Plano de Contas) *</label>
                <select
                  required
                  value={txCategory}
                  onChange={e => setTxCategory(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 bg-white"
                >
                  <option value="">-- Selecione Categoria --</option>
                  {categories.filter(cat => cat.type === txType).map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Descrição / Histórico *</label>
                <input 
                  type="text" 
                  required 
                  value={txDescription}
                  onChange={e => setTxDescription(e.target.value)}
                  placeholder="Ex: Compra de filtro de óleo na distribuidora"
                  className="w-full border border-slate-300 rounded p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Valor do Lançamento (R$) *</label>
                  <input 
                    type="number" 
                    required 
                    value={txAmount || ''}
                    onChange={e => setTxAmount(Number(e.target.value))}
                    placeholder="120.00"
                    className="w-full border border-slate-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Forma de Pagamento</label>
                  <select
                    value={txPaymentMethod}
                    onChange={e => setTxPaymentMethod(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 bg-white"
                  >
                    <option value="">Nenhuma / Outra</option>
                    {paymentMethods.filter(p => p.active).map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded mt-2 cursor-pointer text-xs"
              >
                Efetuar Registro no Caixa
              </button>
            </div>
          </form>

          {/* Histórico das Transações de Caixa */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col h-[480px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Fluxo de Caixa Operacional (Livro Caixa)</span>
              <span className="text-[10px] text-slate-400 font-mono">{transactions.length} registros</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {transactions.slice().reverse().map(t => {
                const isIncome = t.type === 'receita';
                return (
                  <div key={t.id} className="p-3.5 flex justify-between items-center hover:bg-slate-50/50 transition-colors text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{t.description}</span>
                        <span className="bg-slate-100 text-slate-500 font-mono text-[9px] px-1 rounded uppercase">{t.category}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Data: {new Date(t.date).toLocaleDateString('pt-BR')} {t.paymentMethod ? `| Pago via: ${t.paymentMethod}` : ''}
                      </p>
                    </div>

                    <span className={`font-bold text-sm ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isIncome ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: Plano de Contas Editável */}
      {activeSubTab === 'plano' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário de Criação no Plano de Contas */}
          <form id="new-account-category-form" onSubmit={handleCreateCategory} className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Customizar Plano de Contas
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Crie contas contábeis customizadas para organizar suas saídas e entradas de dinheiro. Isso permite uma análise profunda dos gastos operacionais.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Nome da Conta Contábil / Categoria *</label>
                <input 
                  type="text" 
                  required 
                  value={newCatName} 
                  onChange={e => setNewCatName(e.target.value)} 
                  placeholder="Ex: Assinatura de Softwares" 
                  className="w-full border border-slate-300 rounded p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Tipo da Conta Contábil *</label>
                <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setNewCatType('receita')}
                    className={`py-1 text-xs font-bold rounded ${newCatType === 'receita' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
                  >
                    Conta de Receita
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCatType('despesa')}
                    className={`py-1 text-xs font-bold rounded ${newCatType === 'despesa' ? 'bg-rose-600 text-white' : 'text-slate-600'}`}
                  >
                    Conta de Despesa
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded mt-2 cursor-pointer text-xs"
              >
                Adicionar ao Plano de Contas
              </button>
            </div>
          </form>

          {/* Árvore do Plano de Contas Atual */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs p-5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Plano de Contas Atual da Oficina</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Coluna Receitas */}
              <div className="space-y-3">
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 uppercase tracking-wider text-[10px] block">
                  Contas de Receitas (Inflow)
                </span>
                <div className="divide-y divide-slate-100 border border-slate-150 rounded-lg p-2.5 space-y-2">
                  {categories.filter(c => c.type === 'receita').map(cat => (
                    <div key={cat.id} className="py-1.5 flex justify-between items-center text-slate-700">
                      <span>• {cat.name}</span>
                      <span className="text-[10px] text-slate-400">{cat.isEditable ? 'Customizado' : 'Sistema'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coluna Despesas */}
              <div className="space-y-3">
                <span className="font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200 uppercase tracking-wider text-[10px] block">
                  Contas de Despesas (Outflow)
                </span>
                <div className="divide-y divide-slate-100 border border-slate-150 rounded-lg p-2.5 space-y-2">
                  {categories.filter(c => c.type === 'despesa').map(cat => (
                    <div key={cat.id} className="py-1.5 flex justify-between items-center text-slate-700">
                      <span>• {cat.name}</span>
                      <span className="text-[10px] text-slate-400">{cat.isEditable ? 'Customizado' : 'Sistema'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: Métodos de Pagamento */}
      {activeSubTab === 'pagamentos' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Configuração de Formas de Pagamento</h3>
            <p className="text-xs text-slate-500 mt-0.5">Ative ou desative formas de recebimento aceitas para fechamento de O.S.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethods.map(pm => (
              <div 
                key={pm.id} 
                className="border border-slate-200 p-4 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800">{pm.name}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Disponível no fechamento de contas</p>
                </div>

                <button
                  type="button"
                  onClick={() => onTogglePaymentMethod(pm.id)}
                  className="text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
                >
                  {pm.active ? (
                    <ToggleRight className="h-8 w-8 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-slate-300" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 4: Inteligência & Diagnóstico Financeiro */}
      {activeSubTab === 'analise' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico/Barra visual de Distribuição de Custos */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Distribuição das Despesas do Mês</h3>
            
            {expensesByCategory.length === 0 ? (
              <p className="text-slate-400 text-xs italic">Nenhum gasto lançado para análise detalhada de fatias.</p>
            ) : (
              <div className="space-y-4">
                {expensesByCategory.map(exp => {
                  const percentage = totalOutflow > 0 ? (exp.amount / totalOutflow) * 100 : 0;
                  return (
                    <div key={exp.name} className="text-xs space-y-1.5">
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-700">{exp.name}</span>
                        <span className="text-slate-900">R$ {exp.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full" 
                          style={{ width: `${percentage}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Motor de Sugestões de Correções e Cortes de Gastos */}
          <div className="lg:col-span-1 bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-xl p-5 space-y-4 shadow-md">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              IA Conselheira de Margem & Cortes
            </h3>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <p className="font-bold text-indigo-300">Análise de Margem de Peças:</p>
                <p className="text-[11px] text-slate-200 mt-1">
                  Sua margem bruta média na revenda de autopeças está em <span className="font-semibold text-emerald-400">~ 54.2%</span>. Isto está alinhado com o mercado. Para melhorar o caixa rápido, aplique um markup de 2.2x em peças de alto giro (ex: filtros e pastilhas).
                </p>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <p className="font-bold text-indigo-300">Sugestão de Corte / Correções:</p>
                {expensesByCategory.length > 0 ? (
                  <p className="text-[11px] text-slate-200 mt-1">
                    Sua maior saída contábil acumulada este mês é em <span className="font-semibold text-amber-300">{expensesByCategory[0].name}</span>. Sugerimos auditar contratos desta categoria para buscar reduções de até 15% ou renegociações de aluguel/fornecedores.
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-200 mt-1">
                    Registre despesas recorrentes (como energia elétrica, aluguel, salários) na aba "Caixa" para receber diagnósticos de controle orçamentário em tempo real.
                  </p>
                )}
              </div>

              <div className="bg-indigo-900/40 p-3 rounded-lg border border-indigo-700 flex gap-2">
                <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
                <p className="text-[10px] text-slate-300">
                  Dica de Gestão: Sempre exija o checklist de entrada. Carros que entram com checklist correto reduzem disputas de avarias de pátio em até 95%, protegendo seu lucro operacional de reparos imprevistos.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
