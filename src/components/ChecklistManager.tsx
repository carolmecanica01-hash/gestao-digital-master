/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Vehicle, UserRole, VehicleStatus, VehicleChecklist, PaymentMethod } from '../types';
import { Plus, Check, ShieldAlert, Camera, Phone, FileText, ChevronRight, User, KeyRound, Wrench, ShieldCheck, Fuel, AlertCircle, Printer, DollarSign } from 'lucide-react';
import { SAMPLE_VEHICLE_IMAGES } from '../data/mockData';

interface ChecklistManagerProps {
  vehicles: Vehicle[];
  currentRole: UserRole;
  paymentMethods: PaymentMethod[];
  onAddVehicle: (newVehicle: Partial<Vehicle>) => void;
  onUpdateVehicleChecklist: (vehicleId: string, checklist: VehicleChecklist, complaints: string) => void;
  onUpdateVehicleStatus: (vehicleId: string, status: VehicleStatus) => void;
  onSettlePayment: (vehicleId: string, method: string, amount: number, isFullyPaid: boolean) => void;
  selectedVehicleId?: string;
  onClearSelectedId?: () => void;
}

export const ChecklistManager: React.FC<ChecklistManagerProps> = ({
  vehicles,
  currentRole,
  paymentMethods,
  onAddVehicle,
  onUpdateVehicleChecklist,
  onUpdateVehicleStatus,
  onSettlePayment,
  selectedVehicleId,
  onClearSelectedId,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(selectedVehicleId || null);

  // Estados do formulário de Nova Recepção
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [color, setColor] = useState('');
  const [km, setKm] = useState(0);
  const [complaints, setComplaints] = useState('');

  // Estados do checklist de Entrada
  const [fuelLevel, setFuelLevel] = useState('1/2');
  const [hasSpareTire, setHasSpareTire] = useState(true);
  const [hasJack, setHasJack] = useState(true);
  const [hasWrench, setHasWrench] = useState(true);
  const [hasAntenna, setHasAntenna] = useState(true);
  const [scratchesDents, setScratchesDents] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  // Estados do recebimento financeiro (fechamento)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isFullSettlement, setIsFullSettlement] = useState(true);

  // Sincronizar prop externa de veículo selecionado se houver
  React.useEffect(() => {
    if (selectedVehicleId) {
      setActiveVehicleId(selectedVehicleId);
    }
  }, [selectedVehicleId]);

  const handleOpenCreateForm = () => {
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setPlate('');
    setBrand('');
    setModel('');
    setYear(2020);
    setColor('');
    setKm(50000);
    setComplaints('');
    setFuelLevel('1/2');
    setHasSpareTire(true);
    setHasJack(true);
    setHasWrench(true);
    setHasAntenna(true);
    setScratchesDents('');
    setUploadedPhotos([]);
    setIsCreating(true);
    setActiveVehicleId(null);
  };

  const handleSaveCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !plate || !brand || !model) {
      alert('Por favor, preencha nome do cliente, placa, marca e modelo.');
      return;
    }

    const newVehicleData: Partial<Vehicle> = {
      plate: plate.toUpperCase(),
      brand,
      model,
      year: Number(year),
      color,
      km: Number(km),
      clientName,
      clientPhone,
      clientEmail,
      complaints,
      status: 'recepcionado', // Inicia recepcionado
      entryDate: new Date().toISOString(),
      diagnosticLogs: [],
      partsRequests: [],
      laborValue: 0,
      totalValue: 0,
      paymentStatus: 'pendente',
      amountPaid: 0,
    };

    onAddVehicle(newVehicleData);
    setIsCreating(false);
  };

  const handleAddPhotoPreset = (presetUrl: string) => {
    if (uploadedPhotos.includes(presetUrl)) {
      setUploadedPhotos(uploadedPhotos.filter(p => p !== presetUrl));
    } else {
      setUploadedPhotos([...uploadedPhotos, presetUrl]);
    }
  };

  const handleCompleteChecklist = (vehicleId: string) => {
    const checklist: VehicleChecklist = {
      fuelLevel,
      hasSpareTire,
      hasJack,
      hasWrench,
      hasAntenna,
      scratchesDents,
      photos: uploadedPhotos.length > 0 ? uploadedPhotos : [SAMPLE_VEHICLE_IMAGES.carFront],
      completedBy: currentRole === 'mecanico' ? 'Logan (Mecânico)' : currentRole === 'vendedor' ? 'Carlos (Vendedor)' : 'Ana (Gerente)',
      completedAt: new Date().toISOString()
    };

    onUpdateVehicleChecklist(vehicleId, checklist, complaints);
    // Avança o status do veículo para 'diagnostico' automaticamente
    onUpdateVehicleStatus(vehicleId, 'diagnostico');
    alert('Checklist salvo com sucesso! O veículo foi encaminhado para a fila de diagnóstico.');
  };

  // Encontrar veículo ativo
  const activeVehicle = vehicles.find(v => v.id === activeVehicleId);

  React.useEffect(() => {
    if (activeVehicle) {
      setComplaints(activeVehicle.complaints || '');
      if (activeVehicle.checklist) {
        setFuelLevel(activeVehicle.checklist.fuelLevel);
        setHasSpareTire(activeVehicle.checklist.hasSpareTire);
        setHasJack(activeVehicle.checklist.hasJack);
        setHasWrench(activeVehicle.checklist.hasWrench);
        setHasAntenna(activeVehicle.checklist.hasAntenna);
        setScratchesDents(activeVehicle.checklist.scratchesDents);
        setUploadedPhotos(activeVehicle.checklist.photos);
      }
      // Ajustar valor padrão de pagamento
      setPaymentAmount(activeVehicle.totalValue - activeVehicle.amountPaid);
    }
  }, [activeVehicleId, vehicles]);

  const handlePayOS = (vehicle: Vehicle) => {
    if (!selectedPaymentMethod) {
      alert('Selecione uma forma de pagamento.');
      return;
    }
    const amountToPay = isFullSettlement ? (vehicle.totalValue - vehicle.amountPaid) : paymentAmount;
    if (amountToPay <= 0) {
      alert('O valor de pagamento deve ser maior que zero.');
      return;
    }

    onSettlePayment(vehicle.id, selectedPaymentMethod, amountToPay, isFullSettlement);
    alert('Recebimento registrado com sucesso!');
  };

  return (
    <div id="checklist-module" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Coluna Lateral: Lista de Veículos Ativos ou em Entrega */}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl shadow-xs p-4 flex flex-col h-[650px]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recepção de Pátio</h2>
            <p className="text-[11px] text-slate-400">Gerencie entradas, checklists e saídas.</p>
          </div>
          
          <button
            id="btn-checkin-new"
            onClick={handleOpenCreateForm}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Check-in
          </button>
        </div>

        {/* Barra de Pesquisa Rápida */}
        <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 p-2.5 rounded-lg mb-3 flex gap-1.5">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
          <span>Qualquer cargo/funcionário tem acesso livre a esta aba para recepcionar clientes.</span>
        </div>

        {/* Lista de Carros */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {vehicles.map(v => {
            const isSelected = v.id === activeVehicleId && !isCreating;
            const needsChecklist = !v.checklist;
            const isReadyToDeliver = v.status === 'pronto';
            
            return (
              <div
                key={v.id}
                onClick={() => {
                  setActiveVehicleId(v.id);
                  setIsCreating(false);
                  if (onClearSelectedId) onClearSelectedId();
                }}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex justify-between items-start ${
                  isSelected 
                    ? 'bg-indigo-50/60 border-indigo-300 shadow-xs' 
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{v.brand} {v.model}</span>
                    <span className="bg-slate-100 border border-slate-200 text-slate-800 text-[10px] px-1 rounded font-mono font-bold uppercase">{v.plate}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <User className="h-3 w-3 inline text-slate-400" />
                    {v.clientName}
                  </p>
                  
                  {/* Tags informativas */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {needsChecklist && (
                      <span className="bg-rose-50 text-rose-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-rose-200 animate-pulse">
                        Falta Checklist Entrada
                      </span>
                    )}
                    {isReadyToDeliver && (
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                        Pronto p/ Entrega
                      </span>
                    )}
                    {!needsChecklist && !isReadyToDeliver && (
                      <span className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded">
                        Status: {
                          v.status === 'recepcionado' ? 'Recepcionado' : 
                          v.status === 'diagnostico' ? 'Em Diagnóstico' : 
                          v.status === 'aguardando_peca' ? 'Aguardando Peça' : 
                          v.status === 'aguardando_orcamento' ? 'Aguardando Orçamento' : 
                          v.status === 'execucao' ? 'Em Execução' : 
                          v.status === 'pronto' ? 'Pronto para Entrega' : 
                          'Entregue'
                        }
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform ${isSelected ? 'text-indigo-600 translate-x-1' : 'text-slate-400'}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Painel Central: Formulários ou Detalhes */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Caso 1: Formulário de Nova Recepção de Veículo */}
        {isCreating && (
          <form id="new-reception-form" onSubmit={handleSaveCheckin} className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Nova Recepção (Entrada de Carro)</h2>
              <p className="text-xs text-slate-500">Registre os dados iniciais do cliente e os sintomas informados.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Informações do Cliente */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  Dados do Proprietário
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nome Completo *</label>
                    <input 
                      type="text" 
                      required 
                      value={clientName} 
                      onChange={e => setClientName(e.target.value)} 
                      placeholder="Marcos Oliveira Silva" 
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">WhatsApp / Telefone *</label>
                    <input 
                      type="text" 
                      required 
                      value={clientPhone} 
                      onChange={e => setClientPhone(e.target.value)} 
                      placeholder="(11) 98765-4321" 
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">E-mail (Opcional)</label>
                    <input 
                      type="email" 
                      value={clientEmail} 
                      onChange={e => setClientEmail(e.target.value)} 
                      placeholder="marcos@email.com" 
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Informações do Veículo */}
              <div className="space-y-4 md:col-span-2 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="h-4 w-4" />
                  Dados do Veículo
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Placa *</label>
                    <input 
                      type="text" 
                      required 
                      value={plate} 
                      onChange={e => setPlate(e.target.value)} 
                      placeholder="ABC1D23" 
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Marca *</label>
                    <input 
                      type="text" 
                      required 
                      value={brand} 
                      onChange={e => setBrand(e.target.value)} 
                      placeholder="Honda" 
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Modelo *</label>
                    <input 
                      type="text" 
                      required 
                      value={model} 
                      onChange={e => setModel(e.target.value)} 
                      placeholder="Civic 2.0 EXR" 
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Cor</label>
                    <input 
                      type="text" 
                      value={color} 
                      onChange={e => setColor(e.target.value)} 
                      placeholder="Cinza Metálico" 
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Ano</label>
                    <input 
                      type="number" 
                      value={year} 
                      onChange={e => setYear(Number(e.target.value))} 
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Quilometragem (KM)</label>
                    <input 
                      type="number" 
                      value={km} 
                      onChange={e => setKm(Number(e.target.value))} 
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Reclamações */}
              <div className="md:col-span-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reclamações & Sintomas Relatados pelo Cliente *</label>
                <textarea
                  required
                  rows={3}
                  value={complaints}
                  onChange={e => setComplaints(e.target.value)}
                  placeholder="Ex: Barulho metálico ao passar por buracos na roda dianteira direita. Luz de injeção acende após andar 10km na rodovia."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Recepcionar e Iniciar Check-in
              </button>
            </div>
          </form>
        )}

        {/* Caso 2: Nenhum veículo selecionado e não está criando */}
        {!isCreating && !activeVehicle && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-12 text-center flex flex-col items-center justify-center h-[550px]">
            <FileText className="h-14 w-14 text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">Selecione ou Crie um Veículo</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-sm">
              Escolha um veículo na lista lateral para preencher o checklist de entrada, registrar fotos, ver o andamento ou proceder com a entrega e fechamento de conta.
            </p>
            <button
              onClick={handleOpenCreateForm}
              className="mt-4 bg-indigo-600 text-white font-semibold text-xs px-4 py-2.5 rounded-lg hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              Criar Novo Recebimento
            </button>
          </div>
        )}

        {/* Caso 3: Veículo selecionado (Visualizar / Preencher Checklist ou Fechar OS) */}
        {!isCreating && activeVehicle && (
          <div className="space-y-6">
            
            {/* Cabeçalho do Veículo Ativo */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-slate-900">{activeVehicle.brand} {activeVehicle.model}</h2>
                  <span className="bg-slate-800 text-white font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">{activeVehicle.plate}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Cliente: <span className="font-semibold text-slate-700">{activeVehicle.clientName}</span> | Contato: {activeVehicle.clientPhone}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  ID de Controle: <span className="font-mono">{activeVehicle.id}</span>
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                {/* Botão de simular impressão de ficha de entrada */}
                <button
                  onClick={() => {
                    alert(`Ficha de Entrada impressa para ${activeVehicle.clientName}!\nVeículo: ${activeVehicle.brand} ${activeVehicle.model}\nPlaca: ${activeVehicle.plate}`);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all border border-slate-200"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Ficha
                </button>
              </div>
            </div>

            {/* Abas internas: Checklist de entrada */}
            {!activeVehicle.checklist ? (
              /* Checklist pendente - Formulário de preenchimento obrigatório */
              <div id="active-checklist-form" className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 space-y-6">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                  <div className="bg-rose-50 text-rose-600 p-1.5 rounded-lg">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Checklist Digital de Entrada (Obrigatório)</h3>
                    <p className="text-xs text-rose-500">Este veículo está aguardando o checklist de entrada antes de ir para o diagnóstico.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Reclamações podem ser atualizadas ou revisadas */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Reclamações Reconfirmadas:</label>
                    <textarea
                      value={complaints}
                      onChange={e => setComplaints(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-indigo-500 focus:outline-none bg-slate-50/50"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Combustível & Acessórios */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                          <Fuel className="h-4 w-4 text-slate-500" />
                          Nível de Combustível *
                        </label>
                        <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-lg">
                          {['Reserva', '1/4', '1/2', '3/4', 'Cheio'].map(level => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => setFuelLevel(level)}
                              className={`py-1.5 text-[10px] font-bold rounded-md transition-all ${
                                fuelLevel === level 
                                  ? 'bg-indigo-600 text-white shadow-xs' 
                                  : 'text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Itens do Veículo */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Acessórios presentes no ato da entrega:</label>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-150 bg-slate-50/30 hover:bg-slate-50 transition-colors cursor-pointer">
                            <input type="checkbox" checked={hasSpareTire} onChange={e => setHasSpareTire(e.target.checked)} className="rounded border-slate-300 text-indigo-600 h-4 w-4 focus:ring-indigo-500" />
                            <span className="text-xs text-slate-600 font-medium">Estepe (Pneu)</span>
                          </label>
                          <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-150 bg-slate-50/30 hover:bg-slate-50 transition-colors cursor-pointer">
                            <input type="checkbox" checked={hasJack} onChange={e => setHasJack(e.target.checked)} className="rounded border-slate-300 text-indigo-600 h-4 w-4 focus:ring-indigo-500" />
                            <span className="text-xs text-slate-600 font-medium">Macaco</span>
                          </label>
                          <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-150 bg-slate-50/30 hover:bg-slate-50 transition-colors cursor-pointer">
                            <input type="checkbox" checked={hasWrench} onChange={e => setHasWrench(e.target.checked)} className="rounded border-slate-300 text-indigo-600 h-4 w-4 focus:ring-indigo-500" />
                            <span className="text-xs text-slate-600 font-medium">Chave de Roda</span>
                          </label>
                          <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-150 bg-slate-50/30 hover:bg-slate-50 transition-colors cursor-pointer">
                            <input type="checkbox" checked={hasAntenna} onChange={e => setHasAntenna(e.target.checked)} className="rounded border-slate-300 text-indigo-600 h-4 w-4 focus:ring-indigo-500" />
                            <span className="text-xs text-slate-600 font-medium">Antena Externa</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Avarias e Fotos */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Avarias, riscos ou amassados:</label>
                        <textarea
                          rows={2}
                          value={scratchesDents}
                          onChange={e => setScratchesDents(e.target.value)}
                          placeholder="Ex: Risco profundo na porta dianteira direita. Amassado leve no capô."
                          className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      {/* Fotos de recepção */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Fotos do Recebimento (Selecione para simular):</label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => handleAddPhotoPreset(SAMPLE_VEHICLE_IMAGES.carFront)}
                            className={`p-2 rounded-lg border text-center transition-all ${
                              uploadedPhotos.includes(SAMPLE_VEHICLE_IMAGES.carFront)
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <Camera className="h-4 w-4 mx-auto mb-1" />
                            <span className="text-[9px] block">Frente Carro</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddPhotoPreset(SAMPLE_VEHICLE_IMAGES.carSide)}
                            className={`p-2 rounded-lg border text-center transition-all ${
                              uploadedPhotos.includes(SAMPLE_VEHICLE_IMAGES.carSide)
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <Camera className="h-4 w-4 mx-auto mb-1" />
                            <span className="text-[9px] block">Lateral Carro</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddPhotoPreset(SAMPLE_VEHICLE_IMAGES.engineBay)}
                            className={`p-2 rounded-lg border text-center transition-all ${
                              uploadedPhotos.includes(SAMPLE_VEHICLE_IMAGES.engineBay)
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <Camera className="h-4 w-4 mx-auto mb-1" />
                            <span className="text-[9px] block">Cofre Motor</span>
                          </button>
                        </div>
                        {uploadedPhotos.length > 0 && (
                          <p className="text-[10px] text-indigo-600 font-semibold mt-2">
                            {uploadedPhotos.length} foto(s) anexadas ao checklist de entrada.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleCompleteChecklist(activeVehicle.id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      Finalizar Checklist e Iniciar Diagnóstico
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Checklist já feito - Mostra os dados do checklist de entrada */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Detalhes do Checklist Completo */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 space-y-4">
                  <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                      Checklist de Entrada Concluído
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">OK</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-400">Combustível no ato:</p>
                      <p className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                        <Fuel className="h-3.5 w-3.5 text-indigo-600" />
                        {activeVehicle.checklist.fuelLevel}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Arranhões/Avarias:</p>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {activeVehicle.checklist.scratchesDents || "Nenhuma avaria listada."}
                      </p>
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <div className={`h-2.5 w-2.5 rounded-full ${activeVehicle.checklist.hasSpareTire ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>Estepe (pneu)</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <div className={`h-2.5 w-2.5 rounded-full ${activeVehicle.checklist.hasJack ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>Macaco mecânico</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <div className={`h-2.5 w-2.5 rounded-full ${activeVehicle.checklist.hasWrench ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>Chave de roda</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <div className={`h-2.5 w-2.5 rounded-full ${activeVehicle.checklist.hasAntenna ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>Antena rádio</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 bg-slate-50 p-2.5 rounded-lg text-[11px] text-slate-500 space-y-1">
                    <p>Feito por: <span className="font-bold text-slate-700">{activeVehicle.checklist.completedBy}</span></p>
                    <p>Data/Hora: <span className="font-bold text-slate-700">{new Date(activeVehicle.checklist.completedAt).toLocaleString('pt-BR')}</span></p>
                  </div>

                  {activeVehicle.checklist.photos.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-slate-600">Fotos de Recepção:</p>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {activeVehicle.checklist.photos.map((url, idx) => (
                          <img 
                            key={idx} 
                            src={url} 
                            alt={`Carro ${idx}`} 
                            className="h-14 w-20 object-cover rounded-lg border border-slate-200 shadow-2xs shrink-0" 
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Seção de Saída / Liberação / Fechamento de Conta */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <DollarSign className="h-4.5 w-4.5 text-indigo-600" />
                      Status de Faturamento & Saída
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Mão de Obra:</span>
                      <span className="font-semibold text-slate-800">R$ {activeVehicle.laborValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Peças do Orçamento:</span>
                      <span className="font-semibold text-slate-800">
                        R$ {(activeVehicle.totalValue - activeVehicle.laborValue).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2 font-bold text-sm">
                      <span className="text-slate-900">Total Geral da O.S.:</span>
                      <span className="text-slate-900">R$ {activeVehicle.totalValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                    </div>

                    <div className="p-3 rounded-lg flex items-center justify-between text-xs font-semibold mt-2 bg-slate-100">
                      <span>Situação do Pagamento:</span>
                      {activeVehicle.paymentStatus === 'pago' ? (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">PAGO / QUITADO</span>
                      ) : activeVehicle.paymentStatus === 'parcial' ? (
                        <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">
                          PARCIAL (Falta R$ {(activeVehicle.totalValue - activeVehicle.amountPaid).toLocaleString('pt-BR', {minimumFractionDigits: 2})})
                        </span>
                      ) : (
                        <span className="bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full font-bold">AGUARDANDO PAGAMENTO</span>
                      )}
                    </div>

                    {/* Formulário de Quitação ou Fechamento de Pagamento (Apenas Vendedores ou Gerentes) */}
                    {activeVehicle.paymentStatus !== 'pago' ? (
                      currentRole === 'mecanico' ? (
                        <div className="bg-amber-50 text-amber-800 p-2.5 rounded-lg border border-amber-200 text-[10px] mt-2 flex gap-1 items-start">
                          <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                          <span>Mecânicos não têm acesso a receber pagamentos ou fechamento de caixa. Chame um Vendedor ou Gerente.</span>
                        </div>
                      ) : (
                        /* Formulário de pagamento ativo */
                        <div id="payment-settlement-box" className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 space-y-3 mt-3">
                          <p className="text-xs font-bold text-slate-800">Registrar Recebimento / Baixa Financeira</p>
                          
                          <div className="space-y-2 text-xs">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Forma de Pagamento:</label>
                              <select 
                                value={selectedPaymentMethod} 
                                onChange={e => setSelectedPaymentMethod(e.target.value)}
                                className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white"
                              >
                                <option value="">-- Selecione --</option>
                                {paymentMethods.filter(pm => pm.active).map(pm => (
                                  <option key={pm.id} value={pm.name}>{pm.name}</option>
                                ))}
                              </select>
                            </div>

                            <div className="flex gap-4 items-center">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" checked={isFullSettlement} onChange={() => setIsFullSettlement(true)} className="h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-500" />
                                <span>Quitar Valor Total</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input type="radio" checked={!isFullSettlement} onChange={() => setIsFullSettlement(false)} className="h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-500" />
                                <span>Pagamento Parcial</span>
                              </label>
                            </div>

                            {!isFullSettlement && (
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Valor do Recebimento (R$):</label>
                                <input 
                                  type="number" 
                                  value={paymentAmount} 
                                  onChange={e => setPaymentAmount(Number(e.target.value))}
                                  className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white" 
                                />
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => handlePayOS(activeVehicle)}
                              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-md mt-2 transition-all cursor-pointer"
                            >
                              Confirmar Recebimento e Caixa
                            </button>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg border border-emerald-200 text-xs font-semibold text-center mt-3">
                        Este veículo já está totalmente pago e finalizado.
                        {activeVehicle.status !== 'entregue' && (
                          <button
                            onClick={() => {
                              onUpdateVehicleStatus(activeVehicle.id, 'entregue');
                              alert('Veículo entregue com sucesso! Saiu do pátio ativo.');
                            }}
                            className="mt-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 rounded transition-all cursor-pointer block text-[11px]"
                          >
                            Registrar Saída Física do Pátio
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
