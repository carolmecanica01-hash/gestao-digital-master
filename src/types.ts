/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'gerente' | 'vendedor' | 'mecanico' | 'recepcao';

export type VehicleStatus = 
  | 'recepcionado'          // Recepcionado
  | 'diagnostico'           // Em diagnóstico
  | 'aguardando_peca'       // Aguardando peça
  | 'aguardando_orcamento'  // Aguardando orçamento
  | 'execucao'              // Em execução
  | 'pronto'                // Pronto para entrega
  | 'entregue';             // Entregue

export interface VehicleChecklist {
  fuelLevel: string;      // 'Reserva' | '1/4' | '1/2' | '3/4' | 'Cheio'
  hasSpareTire: boolean;  // Estepe
  hasJack: boolean;       // Macaco
  hasWrench: boolean;     // Chave de roda
  hasAntenna: boolean;    // Antena
  scratchesDents: string; // Descrição de arranhões, amassados, etc.
  photos: string[];       // Base64 ou caminhos de imagens
  completedBy: string;    // Nome de quem fez o checklist
  completedAt: string;    // Data e hora
}

export interface DiagnosticLog {
  id: string;
  timestamp: string;
  testName: string;       // Ex: "Medição de Pressão da Linha de Combustível"
  result: string;         // Ex: "3.2 bar (Dentro do especificado)"
  photo?: string;         // Foto principal do teste ou scanner
  photos?: string[];      // Multi-foto suporte para Fase 2
  technician: string;     // Nome do mecânico (autor)
}

export interface PartsRequest {
  id: string;
  type?: 'peca' | 'servico'; // Tipo: peça ou serviço
  partName: string;        // Descrição do item (peça ou serviço)
  qty: number;             // Quantidade (1 para serviço)
  status: 'lancado' | 'pendente' | 'aprovado' | 'recusado'; // Situação inicial "lançado"
  price?: number;          // Preço unitário (venda) - preenchido pelo vendedor
  sku?: string;            // SKU da peça associada no estoque
  observation?: string;    // Observação do lançamento
  author?: string;         // Autor do lançamento (mecânico, gerente, etc)
  date?: string;           // Data e hora do lançamento
}

export interface Vehicle {
  id: string;
  plate: string;          // Placa do veículo
  model: string;          // Modelo (ex: Civic)
  brand: string;          // Marca (ex: Honda)
  year: number;           // Ano
  color: string;          // Cor
  km: number;             // Quilometragem
  clientName: string;     // Nome do cliente
  clientPhone: string;    // Telefone
  clientEmail?: string;   // E-mail opcional
  entryDate: string;      // Data de entrada
  exitDate?: string;      // Data de entrega
  status: VehicleStatus;
  complaints: string;     // Reclamações e sintomas relatados pelo cliente
  checklist?: VehicleChecklist;
  diagnosticLogs: DiagnosticLog[];
  partsRequests: PartsRequest[];
  diagnosticConclusion?: string; // Campo de "conclusão do diagnóstico" na OS
  laborValue: number;     // Valor da mão de obra
  totalValue: number;     // Valor total (peças + mão de obra)
  paymentMethod?: string; // Forma de pagamento selecionada
  paymentStatus: 'pendente' | 'pago' | 'parcial';
  amountPaid: number;     // Valor já pago pelo cliente
}

export interface InventoryItem {
  id: string;
  sku: string;            // Código interno da peça
  name: string;           // Nome da peça
  currentQty: number;     // Quantidade atual em estoque
  minQty: number;         // Quantidade mínima de segurança
  costPrice: number;      // Preço de compra / custo
  salePrice: number;      // Preço de venda
  category: string;       // Categoria (Ex: Filtros, Freios, Suspensão)
}

export interface PaymentMethod {
  id: string;
  name: string;           // Pix, Cartão de Crédito, Cartão de Débito, Dinheiro, Boleto
  active: boolean;
}

export interface AccountCategory {
  id: string;
  name: string;           // Ex: "Venda de Peças", "Mão de Obra", "Aluguel", "Salários", "Energia"
  type: 'receita' | 'despesa';
  isEditable: boolean;    // Se é uma categoria padrão ou customizada pelo usuário
}

export interface Transaction {
  id: string;
  date: string;
  type: 'receita' | 'despesa';
  category: string;       // ID ou nome da AccountCategory
  description: string;    // Descrição da transação
  amount: number;
  paymentMethod?: string; // Pix, Cartão, etc.
  referenceId?: string;   // ID do veículo/OS (se aplicável)
}
