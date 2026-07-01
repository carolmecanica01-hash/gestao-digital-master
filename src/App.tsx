/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Vehicle, 
  InventoryItem, 
  PaymentMethod, 
  AccountCategory, 
  Transaction, 
  UserRole, 
  VehicleStatus, 
  VehicleChecklist, 
  DiagnosticLog, 
  PartsRequest 
} from './types';
import { 
  INITIAL_VEHICLES, 
  INITIAL_INVENTORY, 
  INITIAL_PAYMENT_METHODS, 
  INITIAL_CATEGORIES, 
  INITIAL_TRANSACTIONS 
} from './data/mockData';

// Componentes do Sistema
import { RoleSelector } from './components/RoleSelector';
import { Dashboard } from './components/Dashboard';
import { ChecklistManager } from './components/ChecklistManager';
import { DiagnosticLab } from './components/DiagnosticLab';
import { BudgetManager } from './components/BudgetManager';
import { StockManager } from './components/StockManager';
import { FinancialManager } from './components/FinancialManager';

// Ícones
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  Wrench, 
  Receipt, 
  Package, 
  LineChart, 
  Menu, 
  X, 
  Smartphone, 
  User, 
  ShieldAlert,
  Car
} from 'lucide-react';

export default function App() {
  // 1. Estados Persistidos no LocalStorage
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('oficina_vehicles');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('oficina_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    const saved = localStorage.getItem('oficina_payment_methods');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_METHODS;
  });

  const [categories, setCategories] = useState<AccountCategory[]>(() => {
    const saved = localStorage.getItem('oficina_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('oficina_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // 2. Estados de Controle de UI
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('gerente');
  const [isMobileSimulated, setIsMobileSimulated] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [deepLinkedVehicleId, setDeepLinkedVehicleId] = useState<string | undefined>(undefined);

  // Efeito para sincronizar as mudanças no LocalStorage
  useEffect(() => {
    localStorage.setItem('oficina_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('oficina_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('oficina_payment_methods', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  useEffect(() => {
    localStorage.setItem('oficina_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('oficina_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // 3. Handlers Operacionais do Sistema

  // Novo veículo adicionado pela Recepção (Checklist)
  const handleAddVehicle = (newVehicleData: Partial<Vehicle>) => {
    // REGRAS DE SEGURANÇA BACKEND (Simulado):
    if (currentRole !== 'recepcao' && currentRole !== 'gerente') {
      alert('ERRO DE SEGURANÇA BACKEND: Somente usuários com a função "recepcao" ou "gerente" podem dar entrada em veículos.');
      return;
    }
    const id = `V-${Math.floor(100 + Math.random() * 900)}`;
    const newVehicle: Vehicle = {
      id,
      plate: newVehicleData.plate || 'SEM-PLACA',
      model: newVehicleData.model || 'Desconhecido',
      brand: newVehicleData.brand || 'Desconhecida',
      year: newVehicleData.year || new Date().getFullYear(),
      color: newVehicleData.color || 'Preto',
      km: newVehicleData.km || 0,
      clientName: newVehicleData.clientName || 'Cliente sem nome',
      clientPhone: newVehicleData.clientPhone || 'Sem telefone',
      clientEmail: newVehicleData.clientEmail,
      entryDate: newVehicleData.entryDate || new Date().toISOString(),
      status: 'recepcionado',
      complaints: newVehicleData.complaints || 'Nenhuma queixa descrita.',
      diagnosticLogs: [],
      partsRequests: [],
      laborValue: 0,
      totalValue: 0,
      paymentStatus: 'pendente',
      amountPaid: 0,
    };

    setVehicles(prev => [newVehicle, ...prev]);
    setDeepLinkedVehicleId(id);
    setCurrentTab('checklist');
  };

  // Preencher/Atualizar checklist de entrada
  const handleUpdateVehicleChecklist = (vehicleId: string, checklist: VehicleChecklist, complaints: string) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return { ...v, checklist, complaints };
      }
      return v;
    }));
  };

  // Alterar situação de fluxo do carro (status)
  const handleUpdateVehicleStatus = (vehicleId: string, status: VehicleStatus) => {
    // REGRAS DE SEGURANÇA BACKEND (Simulado):
    if (currentRole === 'recepcao' && status !== 'recepcionado' && status !== 'entregue' && status !== 'pronto') {
      alert('ERRO DE SEGURANÇA BACKEND: Funcionários da Recepção só podem alterar o status para "Recepcionado", "Pronto" ou "Entregue".');
      return;
    }
    if (currentRole === 'mecanico' && (status === 'entregue')) {
      alert('ERRO DE SEGURANÇA BACKEND: Mecânicos não têm permissão para finalizar e entregar ordens de serviço (procedimento reservado para gerência e recepção).');
      return;
    }
    if (currentRole === 'vendedor' && (status === 'diagnostico')) {
      alert('ERRO DE SEGURANÇA BACKEND: Vendedores não podem recolocar veículos em diagnóstico técnico.');
      return;
    }

    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return { 
          ...v, 
          status,
          exitDate: status === 'entregue' ? new Date().toISOString() : v.exitDate
        };
      }
      return v;
    }));
  };

  // Adicionar Log de Testes / Scanner
  const handleAddDiagnosticLog = (vehicleId: string, logData: Omit<DiagnosticLog, 'id' | 'timestamp' | 'technician'>) => {
    // REGRAS DE SEGURANÇA BACKEND (Simulado):
    if (currentRole !== 'mecanico' && currentRole !== 'gerente') {
      alert('ERRO DE SEGURANÇA BACKEND: Apenas funcionários com a função "mecanico" ou "gerente" podem registrar testes e diagnósticos.');
      return;
    }

    const newLog: DiagnosticLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      testName: logData.testName,
      result: logData.result,
      photo: logData.photo,
      photos: logData.photos,
      technician: currentRole === 'mecanico' ? 'Mestre Logan (Mecânico)' : 'Ana (Gerente)',
    };

    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return { 
          ...v, 
          diagnosticLogs: [...v.diagnosticLogs, newLog] 
        };
      }
      return v;
    }));
  };

  // Mecânico lança peças e serviços na O.S. (sem acesso direto ao estoque)
  const handleAddPartsRequest = (
    vehicleId: string, 
    partName: string, 
    qty: number, 
    type: 'peca' | 'servico' = 'peca', 
    observation: string = ''
  ) => {
    // REGRAS DE SEGURANÇA BACKEND (Simulado):
    if (currentRole !== 'mecanico' && currentRole !== 'gerente') {
      alert('ERRO DE SEGURANÇA BACKEND: Apenas funcionários com a função "mecanico" ou "gerente" podem lançar peças ou serviços.');
      return;
    }

    const newRequest: PartsRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      type,
      partName,
      qty,
      status: 'lancado', // Situação inicial "lançado"
      observation,
      author: currentRole === 'mecanico' ? 'Mestre Logan (Mecânico)' : 'Ana (Gerente)',
      date: new Date().toISOString()
    };

    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return { 
          ...v, 
          partsRequests: [...v.partsRequests, newRequest] 
        };
      }
      return v;
    }));
  };

  // Concluir Diagnóstico
  const handleUpdateDiagnosticConclusion = (vehicleId: string, conclusion: string) => {
    // REGRAS DE SEGURANÇA BACKEND (Simulado):
    if (currentRole !== 'mecanico' && currentRole !== 'gerente') {
      alert('ERRO DE SEGURANÇA BACKEND: Apenas mecânicos ou gerentes podem editar a conclusão de diagnóstico.');
      return;
    }

    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          diagnosticConclusion: conclusion
        };
      }
      return v;
    }));
  };

  // Excluir solicitação de peça pendente
  const handleRemovePartsRequest = (vehicleId: string, requestId: string) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          partsRequests: v.partsRequests.filter(pr => pr.id !== requestId)
        };
      }
      return v;
    }));
  };

  // Vendedor/Gerente aprova orçamento, precifica e deduz estoque automaticamente
  const handleApproveBudget = (vehicleId: string, updatedParts: PartsRequest[], laborValue: number) => {
    // REGRAS DE SEGURANÇA BACKEND (Simulado):
    if (currentRole !== 'vendedor' && currentRole !== 'gerente') {
      alert('ERRO DE SEGURANÇA BACKEND: Apenas funcionários com a função "vendedor" ou "gerente" podem realizar a aprovação financeira de orçamentos.');
      return;
    }
    // 1. Atualizar peças e valores do veículo
    let totalPartsCost = 0;
    
    const processedParts = updatedParts.map(part => {
      if (part.status === 'aprovado' && part.price) {
        totalPartsCost += (part.price * part.qty);
      }
      return part;
    });

    const totalValue = totalPartsCost + laborValue;

    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          partsRequests: processedParts,
          laborValue,
          totalValue,
          status: 'execucao' // Passa para execução/serviço após aprovação do orçamento
        };
      }
      return v;
    }));

    // 2. Deduzir quantidades correspondentes do Estoque Físico
    setInventory(prevInv => {
      return prevInv.map(invItem => {
        // Encontrar se essa peça foi aprovada na O.S.
        const approvedPartUsage = processedParts.find(p => p.sku === invItem.sku && p.status === 'aprovado');
        if (approvedPartUsage) {
          return {
            ...invItem,
            currentQty: Math.max(0, invItem.currentQty - approvedPartUsage.qty) // Deduz quantidade
          };
        }
        return invItem;
      });
    });
  };

  // Registrar pagamento / Baixa de conta do veículo (alimentando o Livro Caixa)
  const handleSettlePayment = (vehicleId: string, method: string, amount: number, isFullyPaid: boolean) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        const newPaidAmount = v.amountPaid + amount;
        const status = newPaidAmount >= v.totalValue ? 'pago' : 'parcial';
        return {
          ...v,
          amountPaid: newPaidAmount,
          paymentStatus: status,
          paymentMethod: method,
          status: status === 'pago' ? 'pronto' : v.status // Pronto para sair se pagou tudo
        };
      }
      return v;
    }));

    const targetVehicle = vehicles.find(v => v.id === vehicleId);
    if (!targetVehicle) return;

    // Adicionar duas transações de receita divididas para análise financeira contábil de Margem de Peças vs Mão de Obra
    // (Apenas se for o pagamento total, senão adiciona uma transação proporcional geral)
    const proportionMaoDeObra = targetVehicle.totalValue > 0 ? (targetVehicle.laborValue / targetVehicle.totalValue) : 1;
    const amountMaoDeObra = Number((amount * proportionMaoDeObra).toFixed(2));
    const amountPecas = Number((amount - amountMaoDeObra).toFixed(2));

    const newTransactions: Transaction[] = [];

    if (amountMaoDeObra > 0) {
      newTransactions.push({
        id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString(),
        type: 'receita',
        category: 'Serviços de Mão de Obra',
        description: `Serviço O.S. ${vehicleId} (${targetVehicle.brand} ${targetVehicle.model})`,
        amount: amountMaoDeObra,
        paymentMethod: method,
        referenceId: vehicleId
      });
    }

    if (amountPecas > 0) {
      newTransactions.push({
        id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString(),
        type: 'receita',
        category: 'Venda de Peças',
        description: `Autopeças O.S. ${vehicleId} (${targetVehicle.brand} ${targetVehicle.model})`,
        amount: amountPecas,
        paymentMethod: method,
        referenceId: vehicleId
      });
    }

    setTransactions(prev => [...prev, ...newTransactions]);
  };

  // Cadastrar item no Estoque
  const handleAddInventoryItem = (newItemData: Omit<InventoryItem, 'id'>) => {
    const id = `ST-${Math.floor(10 + Math.random() * 90)}`;
    const newItem: InventoryItem = {
      id,
      ...newItemData
    };
    setInventory(prev => [...prev, newItem]);
  };

  // Ajuste manual rápido de estoque (ex: compra de mais mercadorias ou acerto de balanço)
  const handleUpdateStockQty = (sku: string, qtyChange: number) => {
    setInventory(prev => prev.map(item => {
      if (item.sku === sku) {
        const updatedQty = Math.max(0, item.currentQty + qtyChange);
        
        // Se adicionou peças (qtyChange > 0), pode registrar uma despesa de compra de estoque automática para controle de caixa!
        if (qtyChange > 0) {
          const costValue = item.costPrice * qtyChange;
          // Registrar despesa de compra no caixa
          const purchaseTx: Transaction = {
            id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
            date: new Date().toISOString(),
            type: 'despesa',
            category: 'Compra de Peças para Estoque',
            description: `Reposição manual de ${qtyChange}x ${item.name}`,
            amount: costValue,
          };
          setTransactions(prevT => [...prevT, purchaseTx]);
        }
        
        return { ...item, currentQty: updatedQty };
      }
      return item;
    }));
  };

  // Lançamentos Avulsos de Despesas/Receitas pelo Gerente
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id' | 'date'>) => {
    const newTx: Transaction = {
      id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      ...newTxData
    };
    setTransactions(prev => [...prev, newTx]);
  };

  // Ativar/Desativar formas de pagamento
  const handleTogglePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.map(pm => {
      if (pm.id === id) {
        return { ...pm, active: !pm.active };
      }
      return pm;
    }));
  };

  // Expandir o Plano de Contas editável
  const handleAddAccountCategory = (name: string, type: 'receita' | 'despesa') => {
    const newCat: AccountCategory = {
      id: `CAT-${type === 'receita' ? 'R' : 'D'}${categories.length + 1}`,
      name,
      type,
      isEditable: true
    };
    setCategories(prev => [...prev, newCat]);
  };

  // Atalho de Navegação entre Abas com ID de veículo associado
  const handleNavigateToTabWithVehicle = (tab: string, vehicleId?: string) => {
    if (vehicleId) {
      setDeepLinkedVehicleId(vehicleId);
    } else {
      setDeepLinkedVehicleId(undefined);
    }
    setCurrentTab(tab);
    setIsMobileMenuOpen(false);
  };

  // 4. Renderizador Dinâmico de Conteúdo de Abas
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard 
            vehicles={vehicles} 
            transactions={transactions} 
            currentRole={currentRole} 
            onNavigateToTab={handleNavigateToTabWithVehicle} 
          />
        );
      case 'checklist':
        return (
          <ChecklistManager 
            vehicles={vehicles} 
            currentRole={currentRole} 
            paymentMethods={paymentMethods}
            onAddVehicle={handleAddVehicle} 
            onUpdateVehicleChecklist={handleUpdateVehicleChecklist} 
            onUpdateVehicleStatus={handleUpdateVehicleStatus}
            onSettlePayment={handleSettlePayment}
            selectedVehicleId={deepLinkedVehicleId}
            onClearSelectedId={() => setDeepLinkedVehicleId(undefined)}
          />
        );
      case 'lab':
        return (
          <DiagnosticLab 
            vehicles={vehicles} 
            currentRole={currentRole} 
            onAddDiagnosticLog={handleAddDiagnosticLog} 
            onAddPartsRequest={handleAddPartsRequest} 
            onUpdateVehicleStatus={handleUpdateVehicleStatus}
            onRemovePartsRequest={handleRemovePartsRequest}
            onUpdateDiagnosticConclusion={handleUpdateDiagnosticConclusion}
            selectedVehicleId={deepLinkedVehicleId}
          />
        );
      case 'budget':
        return (
          <BudgetManager 
            vehicles={vehicles} 
            inventory={inventory} 
            currentRole={currentRole} 
            onApproveBudget={handleApproveBudget} 
            selectedVehicleId={deepLinkedVehicleId}
          />
        );
      case 'stock':
        return (
          <StockManager 
            inventory={inventory} 
            currentRole={currentRole} 
            onAddInventoryItem={handleAddInventoryItem} 
            onUpdateStockQty={handleUpdateStockQty} 
          />
        );
      case 'financial':
        return (
          <FinancialManager 
            transactions={transactions} 
            paymentMethods={paymentMethods} 
            categories={categories} 
            currentRole={currentRole} 
            onAddTransaction={handleAddTransaction} 
            onTogglePaymentMethod={handleTogglePaymentMethod} 
            onAddAccountCategory={handleAddAccountCategory} 
          />
        );
      default:
        return <div className="text-center py-12 text-slate-500">Aba não implementada.</div>;
    }
  };

  // 5. Layout com Adaptador de Dispositivo Simulator
  const sidebarNavItems = [
    { id: 'dashboard', label: 'Painel do Pátio', icon: LayoutDashboard },
    { id: 'checklist', label: 'Checklist / Entrada', icon: ClipboardCheck },
    { id: 'lab', label: 'Diagnóstico Técnico', icon: Wrench },
    { id: 'budget', label: 'Orçamentos O.S.', icon: Receipt },
    { id: 'stock', label: 'Controle de Estoque', icon: Package },
    { id: 'financial', label: 'Gestão Financeira', icon: LineChart },
  ];

  const appLayout = (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      
      {/* Top Header Barra / HUD */}
      <header id="app-top-header" className="bg-[#07090d] border-b border-white/10 text-white h-18 flex items-center justify-between px-4 sticky top-0 z-30 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-800 text-white cursor-pointer"
            title="Menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          
          <div className="h-10 w-10 bg-orange-500 rounded flex items-center justify-center text-black font-black shadow-[0_0_15px_rgba(249,115,22,0.4)] shrink-0">
            OS
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block uppercase">AutoGestão Digital Master</span>
            <span className="text-[10px] text-gray-400 font-mono tracking-widest block -mt-1 uppercase">
              SYSTEM STATUS: OPTIMAL // {vehicles.filter(v => v.status !== 'entregue').length} UNITS IN YARD
            </span>
          </div>
        </div>

        {/* Global HUD Metrics inside the header */}
        <div className="hidden lg:flex gap-8 px-6 border-l border-white/10 h-10 items-center">
          <div className="text-right">
            <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-none">Fluxo de Caixa (Hoje)</p>
            <p className="text-sm font-mono text-emerald-400 font-bold mt-0.5">
              + R$ {transactions.reduce((balance, t) => t.type === 'receita' ? balance + t.amount : balance - t.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-none">Pendente / Devedores</p>
            <p className="text-sm font-mono text-rose-500 font-bold mt-0.5">
              - R$ {vehicles.filter(v => v.totalValue > v.amountPaid).reduce((sum, v) => sum + (v.totalValue - v.amountPaid), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Informações do usuário simulado atual */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">
              {currentRole === 'mecanico' ? 'Mestre Logan' : currentRole === 'vendedor' ? 'Carlos Vendas' : 'Ana (Gerente)'}
            </p>
            <p className="text-[10px] text-slate-400 capitalize">
              Cargo: {currentRole}
            </p>
          </div>
          <div className="h-9 w-9 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 text-slate-300 font-extrabold text-xs">
            {currentRole === 'mecanico' ? 'LO' : currentRole === 'vendedor' ? 'CV' : 'AN'}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1 flex-col md:flex-row relative">
        
        {/* SIDEBAR DE NAVEGAÇÃO - Visível em desktop */}
        <aside 
          className={`bg-white border-r border-slate-200 w-64 flex-col shrink-0 sticky top-16 h-[calc(100vh-64px)] hidden md:flex`}
        >
          <nav className="flex-1 p-3.5 space-y-1">
            {sidebarNavItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              
              // Bloqueio visual parcial ou dicas de permissões baseados nos cargos
              const isLocked = (item.id === 'financial' && currentRole !== 'gerente') ||
                              ((item.id === 'stock' || item.id === 'budget') && (currentRole === 'mecanico' || currentRole === 'recepcao'));

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigateToTabWithVehicle(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-600 text-white font-extrabold shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  } ${isLocked ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4.5 w-4.5" />
                    <span>{item.label}</span>
                  </div>
                  {isLocked && (
                    <span className="text-[8px] bg-slate-100 text-slate-400 px-1 py-0.5 rounded uppercase font-bold border border-slate-200">
                      Restrito
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-slate-150 bg-slate-50 text-[11px] text-slate-400 space-y-1">
            <p className="font-bold text-slate-600">AutoGestão v1.0</p>
            <p>Layout 100% responsivo para tablet, smartphone e computadores.</p>
          </div>
        </aside>

        {/* MENU MOBILE SLIDE-IN */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex">
            <div className="bg-white w-64 h-full p-4 flex flex-col justify-between shadow-2xl animate-slideIn">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-indigo-600" />
                    <span className="font-bold text-slate-800 text-sm">Navegação</span>
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {sidebarNavItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    const isLocked = (item.id === 'financial' && currentRole !== 'gerente') ||
                                    ((item.id === 'stock' || item.id === 'budget') && (currentRole === 'mecanico' || currentRole === 'recepcao'));

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigateToTabWithVehicle(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-indigo-600 text-white shadow-sm' 
                            : 'text-slate-600 hover:bg-slate-100'
                        } ${isLocked ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </div>
                        {isLocked && <span className="text-[8px] bg-slate-100 text-slate-400 px-1 rounded">Restrito</span>}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg text-[10px] text-slate-500 space-y-1">
                <p>Simulador ativo: <span className="font-bold uppercase text-indigo-600">{currentRole}</span></p>
                <p>Toque nas opções para simular os setores da oficina.</p>
              </div>
            </div>
            
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* CONTAINER DE CONTEÚDO PRINCIPAL */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-full">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 selection:bg-indigo-600 selection:text-white">
      {/* Top Simulator Toggle Bar */}
      <RoleSelector 
        currentRole={currentRole} 
        onRoleChange={setCurrentRole} 
        isMobileSimulated={isMobileSimulated}
        onToggleMobileSim={() => setIsMobileSimulated(!isMobileSimulated)}
      />

      {/* RENDER PRINCIPAL */}
      {isMobileSimulated ? (
        /* Caso queira testar a visualização móvel em telas grandes */
        <div id="mobile-viewport-container" className="py-8 flex flex-col items-center justify-center bg-slate-900/40 min-h-[calc(100vh-50px)]">
          <div className="relative mx-auto border-[12px] border-slate-800 rounded-[40px] shadow-2xl overflow-hidden w-[360px] h-[740px] flex flex-col bg-slate-50">
            {/* Linha da câmera do smartphone */}
            <div className="absolute top-0 inset-x-0 h-6 bg-slate-800 flex items-center justify-between px-6 text-[10px] text-slate-400 font-mono z-50">
              <span>09:41</span>
              <div className="w-16 h-4 bg-slate-900 rounded-full absolute left-1/2 -translate-x-1/2 top-1" />
              <div className="flex items-center gap-1">
                <span>5G</span>
                <div className="w-5 h-2.5 border border-slate-400 rounded-xs bg-slate-300" />
              </div>
            </div>

            {/* Corpo interno do applet */}
            <div className="flex-1 pt-6 overflow-y-auto flex flex-col bg-slate-50">
              {appLayout}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4 text-center max-w-sm">
            📱 Esta é uma simulação de visualização móvel do aplicativo de oficina. Teste a responsividade do checklist, fotos e aprovações de orçamento nela!
          </p>
        </div>
      ) : (
        /* Renderização fluida padrão do navegador */
        appLayout
      )}
    </div>
  );
}
