/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Vehicle, UserRole, VehicleStatus, DiagnosticLog, PartsRequest } from '../types';
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Camera, 
  Plus, 
  ClipboardList, 
  ShieldAlert, 
  AlertCircle, 
  ShoppingCart, 
  HelpCircle,
  ShieldCheck,
  FileText,
  Trash2,
  Image,
  Sparkles
} from 'lucide-react';
import { SAMPLE_VEHICLE_IMAGES } from '../data/mockData';

interface DiagnosticLabProps {
  vehicles: Vehicle[];
  currentRole: UserRole;
  onAddDiagnosticLog: (vehicleId: string, log: Omit<DiagnosticLog, 'id' | 'timestamp' | 'technician'>) => void;
  onAddPartsRequest: (
    vehicleId: string, 
    partName: string, 
    qty: number, 
    type: 'peca' | 'servico', 
    observation: string
  ) => void;
  onUpdateVehicleStatus: (vehicleId: string, status: VehicleStatus) => void;
  onRemovePartsRequest: (vehicleId: string, requestId: string) => void;
  onUpdateDiagnosticConclusion: (vehicleId: string, conclusion: string) => void;
  selectedVehicleId?: string;
}

export const DiagnosticLab: React.FC<DiagnosticLabProps> = ({
  vehicles,
  currentRole,
  onAddDiagnosticLog,
  onAddPartsRequest,
  onUpdateVehicleStatus,
  onRemovePartsRequest,
  onUpdateDiagnosticConclusion,
  selectedVehicleId,
}) => {
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(selectedVehicleId || null);

  // Estados de novos logs
  const [testName, setTestName] = useState('');
  const [testResult, setTestResult] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  
  // Ref para input de câmera
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Estados de novas peças / serviços
  const [itemType, setItemType] = useState<'peca' | 'servico'>('peca');
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemObservation, setNewItemObservation] = useState('');

  // Estado da conclusão de diagnóstico
  const [conclusionText, setConclusionText] = useState('');

  // Sincronizar prop externa se houver
  React.useEffect(() => {
    if (selectedVehicleId) {
      setActiveVehicleId(selectedVehicleId);
    }
  }, [selectedVehicleId]);

  // Filtrar todos os veículos ativos no pátio (exclui apenas os já entregues)
  const activeVehicles = vehicles.filter(v => v.status !== 'entregue');

  const activeVehicle = vehicles.find(v => v.id === activeVehicleId);

  // Atualizar campo de conclusão ao mudar o veículo ativo
  React.useEffect(() => {
    if (activeVehicle) {
      setConclusionText(activeVehicle.diagnosticConclusion || '');
    } else {
      setConclusionText('');
    }
    // Limpar estados de formulários
    setTestName('');
    setTestResult('');
    setUploadedPhotos([]);
    setNewItemName('');
    setNewItemQty(1);
    setNewItemObservation('');
  }, [activeVehicleId, activeVehicle]);

  // Handler para tirar foto / carregar arquivo da câmera
  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setUploadedPhotos(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file as File);
    });
  };

  // Remover foto temporária antes de salvar o log
  const handleRemoveTempPhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, idx) => idx !== index));
  };

  // Adicionar preset de foto rápida para desktop
  const handleAddPresetPhoto = (presetUrl: string) => {
    if (uploadedPhotos.includes(presetUrl)) {
      setUploadedPhotos(prev => prev.filter(p => p !== presetUrl));
    } else {
      setUploadedPhotos(prev => [...prev, presetUrl]);
    }
  };

  // Submit do Log de Teste/Procedimento
  const handleAddLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVehicleId || !testName || !testResult) return;

    // Regra de segurança front-end
    if (currentRole !== 'mecanico' && currentRole !== 'gerente') {
      alert('Acesso negado: Apenas mecânicos ou gerentes podem adicionar logs de diagnóstico.');
      return;
    }

    onAddDiagnosticLog(activeVehicleId, {
      testName,
      result: testResult,
      photo: uploadedPhotos[0] || undefined, // foto primária
      photos: uploadedPhotos, // todas as fotos
    });

    setTestName('');
    setTestResult('');
    setUploadedPhotos([]);
    alert('Log de procedimento adicionado com sucesso!');
  };

  // Submit de Peças / Serviços
  const handleAddPartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVehicleId || !newItemName || newItemQty < 1) return;

    // Regra de segurança front-end
    if (currentRole !== 'mecanico' && currentRole !== 'gerente') {
      alert('Acesso negado: Apenas mecânicos ou gerentes podem solicitar peças ou serviços.');
      return;
    }

    onAddPartsRequest(
      activeVehicleId, 
      newItemName, 
      itemType === 'servico' ? 1 : newItemQty, 
      itemType, 
      newItemObservation
    );

    setNewItemName('');
    setNewItemQty(1);
    setNewItemObservation('');
    alert(`${itemType === 'peca' ? 'Peça' : 'Serviço'} "${newItemName}" lançado com sucesso e marcado como "lançado".`);
  };

  // Salvar conclusão de diagnóstico
  const handleSaveConclusion = () => {
    if (!activeVehicleId) return;

    // Regra de segurança front-end
    if (currentRole !== 'mecanico' && currentRole !== 'gerente') {
      alert('Acesso negado: Apenas mecânicos ou gerentes podem preencher o campo de conclusão do diagnóstico.');
      return;
    }

    onUpdateDiagnosticConclusion(activeVehicleId, conclusionText);
    alert('Conclusão do diagnóstico técnico salva com sucesso na O.S.!');
  };

  // Alterar status da O.S.
  const handleStatusProgress = (status: VehicleStatus) => {
    if (!activeVehicleId) return;
    onUpdateVehicleStatus(activeVehicleId, status);
  };

  // Determinar permissões de escrita/leitura da aba de Diagnóstico
  const canEditDiagnosis = currentRole === 'mecanico' || currentRole === 'gerente';

  // Tradução dos status na fila
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'recepcionado': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'diagnostico': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'aguardando_peca': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'aguardando_orcamento': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'execucao': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pronto': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'recepcionado': return 'Recepcionado';
      case 'diagnostico': return 'Em Diagnóstico';
      case 'aguardando_peca': return 'Aguardando Peça';
      case 'aguardando_orcamento': return 'Aguardando Orçamento';
      case 'execucao': return 'Em Execução';
      case 'pronto': return 'Pronto para Entrega';
      default: return 'Indefinido';
    }
  };

  return (
    <div id="diagnostic-lab-module" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* COLUNA LATERAL: FILA DO PÁTIO */}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl shadow-xs p-4 flex flex-col h-[680px]">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <ClipboardList className="h-4.5 w-4.5 text-indigo-600" />
            Veículos em Atendimento (Fila)
          </h2>
          <p className="text-[11px] text-slate-400 mb-3">Selecione o veículo para lançar diagnóstico, peças ou serviços.</p>
        </div>

        {activeVehicles.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg flex-1 flex flex-col items-center justify-center">
            <Wrench className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-slate-400 text-xs">Nenhum veículo ativo no pátio.</p>
          </div>
        ) : (
          <div className="space-y-2 flex-1 overflow-y-auto pr-1">
            {activeVehicles.map(v => {
              const isSelected = v.id === activeVehicleId;
              return (
                <div
                  key={v.id}
                  onClick={() => setActiveVehicleId(v.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-50/60 border-indigo-300 shadow-2xs' 
                      : 'border-slate-150 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-bold text-xs text-slate-900">{v.brand} {v.model}</span>
                    <span className="bg-slate-200 text-slate-800 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase shrink-0">{v.plate}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Cliente: {v.clientName}</p>
                  
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeColor(v.status)}`}>
                      {getStatusText(v.status)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">OS: {v.id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PAINEL CENTRAL & DIREITO: PRANCHETA DO TÉCNICO */}
      <div className="lg:col-span-2 space-y-6">
        {!activeVehicle ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-12 text-center flex flex-col items-center justify-center h-[600px]">
            <Wrench className="h-12 w-12 text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">Prancheta do Mecânico & Ordem de Serviço</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-sm">
              Selecione um veículo na fila de atendimento para iniciar os testes de diagnóstico, anexar fotos e descrever as peças/mão de obra necessárias.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* CABEÇALHO DO VEÍCULO & FLUXO DE STATUS */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-3">
                <div>
                  <span className="bg-slate-800 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase mr-2">{activeVehicle.plate}</span>
                  <h2 className="text-base font-bold text-slate-900 inline-block">{activeVehicle.brand} {activeVehicle.model}</h2>
                  <p className="text-xs text-slate-500 mt-1">Reclamação do Cliente: <span className="font-medium text-rose-600">&ldquo;{activeVehicle.complaints}&rdquo;</span></p>
                </div>
                
                {/* Status do Veículo com Dropdown Unificado */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs w-full md:w-auto">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mudar Situação (O.S.):</label>
                  <select
                    value={activeVehicle.status}
                    onChange={(e) => handleStatusProgress(e.target.value as VehicleStatus)}
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded p-1.5 text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="recepcionado">1. Recepcionado</option>
                    <option value="diagnostico">2. Em Diagnóstico</option>
                    <option value="aguardando_peca">3. Aguardando Peça</option>
                    <option value="aguardando_orcamento">4. Aguardando Orçamento</option>
                    <option value="execucao">5. Em Execução</option>
                    <option value="pronto">6. Pronto para Entrega</option>
                  </select>
                  <p className="text-[9px] text-slate-400 mt-1">
                    Ajuste conforme avança o serviço. O painel do pátio atualiza em tempo real.
                  </p>
                </div>
              </div>

              {/* CONTROLE DE ACESSO EXIBIDO */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
                {canEditDiagnosis ? (
                  <>
                    <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                    <span className="font-medium text-emerald-800">
                      Você está logado como <strong className="uppercase">{currentRole}</strong>: Acesso de Escrita liberado para lançar testes, fotos e peças.
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-4.5 w-4.5 text-amber-600" />
                    <span className="font-medium text-amber-800">
                      Você está logado como <strong className="uppercase">{currentRole}</strong> (Visualização): Laudos técnicos, fotos e lançamento de peças podem ser editados apenas por <strong>Mecânico</strong> e <strong>Gerente</strong>.
                    </span>
                  </>
                )}
              </div>

              {/* TIMELINE DE DIAGNÓSTICO */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardList className="h-4.5 w-4.5" />
                  Procedimentos, Aparelhos & Testes Efetuados (Timeline)
                </h3>

                {activeVehicle.diagnosticLogs.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-150 rounded-lg p-4 text-center">
                    <p className="text-xs text-slate-500">Nenhum teste catalogado para este veículo ainda. Adicione as medições e passadas de aparelho abaixo.</p>
                  </div>
                ) : (
                  <div className="relative border-l border-indigo-200 pl-4 space-y-4 ml-2">
                    {activeVehicle.diagnosticLogs.map(log => (
                      <div key={log.id} className="relative text-xs">
                        {/* Marcador redondo na linha do tempo */}
                        <div className="absolute -left-[21px] top-0.5 bg-indigo-600 h-2.5 w-2.5 rounded-full border-2 border-white" />
                        
                        <div className="bg-slate-50 border border-slate-250 rounded-lg p-3 space-y-2 hover:bg-slate-100/50 transition-colors">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-slate-800 text-[11px]">{log.testName}</span>
                            <span className="text-[9px] text-slate-400 font-mono shrink-0">
                              {new Date(log.timestamp).toLocaleDateString('pt-BR')} {new Date(log.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                            </span>
                          </div>
                          
                          <p className="text-slate-600 leading-relaxed font-mono text-[11px] bg-white p-2 rounded border border-slate-150 whitespace-pre-wrap">{log.result}</p>
                          
                          {/* Renderização de Imagens Múltiplas */}
                          {log.photos && log.photos.length > 0 ? (
                            <div className="mt-2.5 space-y-1">
                              <p className="text-[9px] text-slate-400 flex items-center gap-1 font-bold">
                                <Camera className="h-3 w-3" /> Imagens Arquivadas ({log.photos.length}):
                              </p>
                              <div className="flex gap-2 overflow-x-auto py-1">
                                {log.photos.map((pic, idx) => (
                                  <img 
                                    key={idx}
                                    src={pic} 
                                    alt={`${log.testName} - ${idx}`} 
                                    className="h-20 rounded-lg border border-slate-200 shadow-2xs object-cover hover:scale-105 transition-transform" 
                                    referrerPolicy="no-referrer"
                                  />
                                ))}
                              </div>
                            </div>
                          ) : log.photo ? (
                            <div className="mt-2.5">
                              <p className="text-[9px] text-slate-400 flex items-center gap-1 font-bold">
                                <Camera className="h-3 w-3" /> Imagem Arquivada:
                              </p>
                              <img 
                                src={log.photo} 
                                alt={log.testName} 
                                className="h-20 rounded-lg border border-slate-200 shadow-2xs object-cover" 
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          ) : null}
                          
                          <p className="text-[9px] text-slate-400 text-right font-semibold">Técnico Autor: {log.technician}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* FORMULÁRIO DE CADASTRO DE TESTE (Exibido apenas para Mecânicos e Gerentes) */}
                {canEditDiagnosis && (
                  <form id="add-diagnostic-log-form" onSubmit={handleAddLogSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Plus className="h-4 w-4 text-indigo-600" />
                      Registrar Novo Teste ou Procedimento Realizado
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Nome do Teste / Medição Efetuada:</label>
                        <input 
                          type="text" 
                          required 
                          value={testName} 
                          onChange={e => setTestName(e.target.value)} 
                          placeholder="Ex: Scanner OBD de Injeção Eletrônica" 
                          className="w-full text-xs border border-slate-300 rounded p-2 bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Laudo Técnico / Medições / Conclusões:</label>
                        <input 
                          type="text" 
                          required 
                          value={testResult} 
                          onChange={e => setTestResult(e.target.value)} 
                          placeholder="Ex: Código P0302 (Falta centelha cil 2). Pressão de bomba: 3.2 bar." 
                          className="w-full text-xs border border-slate-300 rounded p-2 bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      
                      {/* Upload de Fotos da Câmera Real */}
                      <div className="md:col-span-2 space-y-2">
                        <label className="block font-semibold text-slate-600">Fotos de Diagnóstico:</label>
                        <div className="flex flex-wrap gap-2 items-center">
                          {/* Botão de captura de câmera real */}
                          <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            <Camera className="h-3.5 w-3.5" />
                            Tirar Foto (Câmera do Celular)
                          </button>
                          
                          <input 
                            type="file"
                            ref={cameraInputRef}
                            accept="image/*"
                            capture="environment"
                            multiple
                            onChange={handleCameraCapture}
                            className="hidden"
                          />

                          <span className="text-[10px] text-slate-400">ou use um preset de simulação rápida:</span>
                          
                          <button
                            type="button"
                            onClick={() => handleAddPresetPhoto(SAMPLE_VEHICLE_IMAGES.scannerScreen)}
                            className={`px-2 py-1 border rounded text-[10px] transition-all ${
                              uploadedPhotos.includes(SAMPLE_VEHICLE_IMAGES.scannerScreen) ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-slate-100'
                            }`}
                          >
                            OBD Screen
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddPresetPhoto(SAMPLE_VEHICLE_IMAGES.sparkPlug)}
                            className={`px-2 py-1 border rounded text-[10px] transition-all ${
                              uploadedPhotos.includes(SAMPLE_VEHICLE_IMAGES.sparkPlug) ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-slate-100'
                            }`}
                          >
                            Vela Desgastada
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddPresetPhoto(SAMPLE_VEHICLE_IMAGES.brakeDiscs)}
                            className={`px-2 py-1 border rounded text-[10px] transition-all ${
                              uploadedPhotos.includes(SAMPLE_VEHICLE_IMAGES.brakeDiscs) ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-slate-100'
                            }`}
                          >
                            Freio Gasto
                          </button>
                        </div>

                        {/* Listagem temporária de fotos prontas para envio */}
                        {uploadedPhotos.length > 0 && (
                          <div className="mt-2">
                            <p className="text-[10px] font-bold text-slate-500 mb-1">Fotos prontas para arquivar ({uploadedPhotos.length}):</p>
                            <div className="flex flex-wrap gap-2 py-1 bg-white p-2 rounded-lg border border-slate-200">
                              {uploadedPhotos.map((img, idx) => (
                                <div key={idx} className="relative group">
                                  <img 
                                    src={img} 
                                    alt="Pré-visualização" 
                                    className="h-14 w-20 object-cover rounded-md border" 
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTempPhoto(idx)}
                                    className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white p-0.5 rounded-full hover:bg-rose-500 transition-colors cursor-pointer"
                                    title="Remover"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-all"
                      >
                        Salvar Registro na Timeline
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* CAMPO: CONCLUSÃO DO DIAGNÓSTICO */}
              <div className="pt-4 border-t border-slate-150 space-y-2">
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-4.5 w-4.5" />
                  Laudo Final / Conclusão do Diagnóstico
                </h3>
                
                {canEditDiagnosis ? (
                  <div className="space-y-3">
                    <textarea
                      rows={3}
                      value={conclusionText}
                      onChange={(e) => setConclusionText(e.target.value)}
                      placeholder="Descreva a conclusão final do diagnóstico do carro. Ex: Recomendada substituição das velas do motor devido ao desgaste de eletrodo e velas originais gastas, bem como troca de bieletas dianteiras folgadas..."
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleSaveConclusion}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors"
                      >
                        Salvar Conclusão do Diagnóstico
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs italic text-slate-600">
                    {activeVehicle.diagnosticConclusion ? (
                      <p className="whitespace-pre-wrap font-mono">{activeVehicle.diagnosticConclusion}</p>
                    ) : (
                      <p className="text-slate-400">Nenhuma conclusão cadastrada ainda pelo mecânico responsável.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* PEÇAS E SERVIÇOS DO VEÍCULO (LAUDO DE REQUISIÇÃO) */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 space-y-4">
              <div className="border-b border-slate-100 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingCart className="h-4.5 w-4.5" />
                  Peças Necessárias & Serviços Solicitados
                </h3>
                
                {/* Visualização de regras críticas de acesso */}
                {currentRole === 'mecanico' ? (
                  <div className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 font-medium">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                    Regra Crítica: Valores de compra, venda e estoque ocultados para Mecânicos.
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                    Perfil Administrativo: Valores e nível de estoque estão visíveis.
                  </div>
                )}
              </div>

              {/* Tabela de Peças e Serviços */}
              {activeVehicle.partsRequests.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nenhum item (peça ou serviço) lançado para esta Ordem de Serviço ainda.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-150 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-2">Tipo</th>
                        <th className="py-2">Descrição / Item</th>
                        <th className="py-2">Qtd</th>
                        <th className="py-2">Observação</th>
                        <th className="py-2">Lançado Por</th>
                        <th className="py-2">Situação</th>
                        {currentRole !== 'mecanico' && (
                          <>
                            <th className="py-2">Valor Venda</th>
                            <th className="py-2">Total Item</th>
                          </>
                        )}
                        {canEditDiagnosis && <th className="py-2 text-right">Ação</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {activeVehicle.partsRequests.map(req => {
                        const isService = req.type === 'servico';
                        return (
                          <tr key={req.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                isService ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                              }`}>
                                {isService ? 'Mão de Obra' : 'Peça'}
                              </span>
                            </td>
                            <td className="py-2.5 font-medium">{req.partName}</td>
                            <td className="py-2.5">{isService ? '--' : `${req.qty} un`}</td>
                            <td className="py-2.5 text-slate-500 italic max-w-xs truncate" title={req.observation}>{req.observation || '--'}</td>
                            <td className="py-2.5 text-slate-400 text-[10px]">
                              {req.author || 'Mestre Logan'}
                              <span className="block text-[8px]">
                                {req.date ? new Date(req.date).toLocaleDateString('pt-BR') : '--'}
                              </span>
                            </td>
                            <td className="py-2.5">
                              {req.status === 'aprovado' ? (
                                <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold text-[9px] border border-emerald-200">Aprovado</span>
                              ) : req.status === 'recusado' ? (
                                <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-bold text-[9px] border border-rose-200">Recusado</span>
                              ) : (
                                <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold text-[9px] border border-slate-200">Lançado</span>
                              )}
                            </td>
                            
                            {/* PREÇOS OCULTOS PARA MECÂNICO */}
                            {currentRole !== 'mecanico' && (
                              <>
                                <td className="py-2.5 text-slate-900 font-medium">
                                  {req.price ? `R$ ${req.price.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 'R$ --'}
                                </td>
                                <td className="py-2.5 font-bold text-slate-900">
                                  {req.price ? `R$ ${(req.price * req.qty).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 'R$ --'}
                                </td>
                              </>
                            )}
                            
                            {/* Ações de exclusão */}
                            {canEditDiagnosis && (
                              <td className="py-2.5 text-right">
                                {req.status === 'lancado' && (
                                  <button
                                    onClick={() => onRemovePartsRequest(activeVehicle.id, req.id)}
                                    className="text-rose-600 hover:text-rose-800 p-1 rounded-lg transition-colors cursor-pointer"
                                    title="Remover Item"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* FORMULÁRIO DE LANÇAMENTO DE PEÇAS / SERVIÇOS (Apenas mecânicos e gerentes) */}
              {canEditDiagnosis && (
                <form id="add-parts-request-form" onSubmit={handleAddPartSubmit} className="pt-4 border-t border-slate-100 text-xs space-y-4">
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Plus className="h-4 w-4 text-indigo-600" />
                    Lançar Novo Requisito na O.S. (Peça ou Mão de Obra)
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-2">
                      <label className="block font-semibold text-slate-600 mb-1">Tipo de Item:</label>
                      <select
                        value={itemType}
                        onChange={(e) => setItemType(e.target.value as 'peca' | 'servico')}
                        className="w-full text-xs border border-slate-300 rounded p-2 bg-white focus:outline-none"
                      >
                        <option value="peca">📦 Peça</option>
                        <option value="servico">⚙️ Serviço / MO</option>
                      </select>
                    </div>

                    <div className="md:col-span-4">
                      <label className="block font-semibold text-slate-600 mb-1">Descrição do Item / Serviço:</label>
                      <input 
                        type="text" 
                        required 
                        value={newItemName} 
                        onChange={e => setNewItemName(e.target.value)} 
                        placeholder={itemType === 'peca' ? "Ex: Correia Dentada Onix 1.0" : "Ex: Troca de Correia Dentada e Limpeza"} 
                        className="w-full text-xs border border-slate-300 rounded p-2 focus:border-indigo-500 focus:outline-none bg-white"
                      />
                    </div>

                    {itemType === 'peca' ? (
                      <div className="md:col-span-2">
                        <label className="block font-semibold text-slate-600 mb-1">Quantidade:</label>
                        <input 
                          type="number" 
                          required 
                          min={1} 
                          value={newItemQty} 
                          onChange={e => setNewItemQty(Number(e.target.value))} 
                          className="w-full text-xs border border-slate-300 rounded p-2 focus:border-indigo-500 focus:outline-none bg-white" 
                        />
                      </div>
                    ) : (
                      <div className="md:col-span-2 opacity-50">
                        <label className="block font-semibold text-slate-600 mb-1">Quantidade:</label>
                        <input 
                          type="text" 
                          disabled
                          value="N/A" 
                          className="w-full text-xs border border-slate-200 rounded p-2 bg-slate-100 cursor-not-allowed" 
                        />
                      </div>
                    )}

                    <div className="md:col-span-4">
                      <label className="block font-semibold text-slate-600 mb-1">Observação do Lançamento:</label>
                      <input 
                        type="text" 
                        value={newItemObservation} 
                        onChange={e => setNewItemObservation(e.target.value)} 
                        placeholder="Ex: Peça com folga / Diagnóstico de vazamento" 
                        className="w-full text-xs border border-slate-300 rounded p-2 focus:border-indigo-500 focus:outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-6 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Lançar Item na O.S.
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
