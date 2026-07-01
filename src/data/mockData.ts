/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vehicle, InventoryItem, PaymentMethod, AccountCategory, Transaction } from '../types';

// Amostras de imagens em Base64/SVG simulados para carros e diagnósticos
export const SAMPLE_VEHICLE_IMAGES = {
  carFront: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400",
  carSide: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400",
  engineBay: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400",
  scannerScreen: "https://images.unsplash.com/photo-1517524008436-bbdbb8a01d8a?auto=format&fit=crop&q=80&w=400",
  sparkPlug: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=400",
  brakeDiscs: "https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&q=80&w=400"
};

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: "V-101",
    plate: "ABC-1234",
    model: "Civic 2.0 EXR",
    brand: "Honda",
    year: 2018,
    color: "Cinza Metálico",
    km: 84320,
    clientName: "Marcos Oliveira Silva",
    clientPhone: "(11) 98765-4321",
    clientEmail: "marcos.silva@email.com",
    entryDate: "2026-06-28T09:15:00",
    status: "execucao",
    complaints: "Barulho metálico na suspensão dianteira ao passar por buracos e luz de injeção acesa intermitente no painel.",
    checklist: {
      fuelLevel: "1/2",
      hasSpareTire: true,
      hasJack: true,
      hasWrench: true,
      hasAntenna: true,
      scratchesDents: "Pequeno risco no para-choque traseiro lado esquerdo e leve amassado na porta do motorista.",
      photos: [SAMPLE_VEHICLE_IMAGES.carFront, SAMPLE_VEHICLE_IMAGES.carSide],
      completedBy: "Roberto Almeida (Recepcionista)",
      completedAt: "2026-06-28T09:30:00"
    },
    diagnosticLogs: [
      {
        id: "D-1",
        timestamp: "2026-06-28T14:20:00",
        testName: "Scanner OBD-II - Diagnóstico de Injeção",
        result: "Código P0302 detectado - Falha de ignição no cilindro 2. Velas com desgaste acentuado.",
        photo: SAMPLE_VEHICLE_IMAGES.scannerScreen,
        technician: "Mestre Logan (Mecânico)"
      },
      {
        id: "D-2",
        timestamp: "2026-06-28T15:10:00",
        testName: "Análise Visual da Suspensão Dianteira",
        result: "Bieletas dianteiras com folga excessiva e buchas da bandeja com desgaste severo.",
        photo: SAMPLE_VEHICLE_IMAGES.brakeDiscs,
        technician: "Mestre Logan (Mecânico)"
      }
    ],
    partsRequests: [
      { id: "PR-1", type: "peca", partName: "Jogo de Velas Iridium Honda", qty: 1, status: "aprovado", price: 340.00, sku: "VEL-HND-01" },
      { id: "PR-2", type: "peca", partName: "Bieleta Dianteira (Par)", qty: 1, status: "aprovado", price: 180.00, sku: "BIEL-PAR" },
      { id: "PR-3", type: "peca", partName: "Bucha de Bandeja Dianteira", qty: 2, status: "aprovado", price: 90.00, sku: "BCH-BAND-CIV" }
    ],
    laborValue: 450.00,
    totalValue: 1150.00,
    paymentStatus: "pendente",
    amountPaid: 0
  },
  {
    id: "V-102",
    plate: "XYZ-9876",
    model: "Corolla Altis 1.8 Hybrid",
    brand: "Toyota",
    year: 2021,
    color: "Branco Pérola",
    km: 45110,
    clientName: "Carla Souza de Medeiros",
    clientPhone: "(11) 99123-4567",
    clientEmail: "carla.medeiros@gmail.com",
    entryDate: "2026-06-29T10:00:00",
    status: "aguardando_orcamento",
    complaints: "Freio apresentando chiado muito agudo ao frear em descidas e pedal ligeiramente baixo.",
    checklist: {
      fuelLevel: "3/4",
      hasSpareTire: true,
      hasJack: true,
      hasWrench: true,
      hasAntenna: true,
      scratchesDents: "Nenhuma avaria visível. Veículo extremamente conservado.",
      photos: [SAMPLE_VEHICLE_IMAGES.carFront],
      completedBy: "Amanda Costa (Recepcionista)",
      completedAt: "2026-06-29T10:12:00"
    },
    diagnosticLogs: [
      {
        id: "D-3",
        timestamp: "2026-06-29T11:45:00",
        testName: "Verificação da Espessura das Pastilhas e Discos de Freio",
        result: "Pastilhas de freio dianteiras com espessura de 1.8mm (limite é 2mm). Discos de freio dentro do limite mínimo, mas necessitam de retífica ou troca por empeno leve.",
        photo: SAMPLE_VEHICLE_IMAGES.brakeDiscs,
        technician: "Mestre Logan (Mecânico)"
      }
    ],
    partsRequests: [
      { id: "PR-4", type: "peca", partName: "Pastilha de Freio Dianteira Cerâmica Corolla", qty: 1, status: "pendente", price: 290.00, sku: "PST-FRE-COR" },
      { id: "PR-5", type: "peca", partName: "Óleo de Freio DOT 4 (Frasco 500ml)", qty: 2, status: "pendente", price: 45.00, sku: "LIQ-DOT4" }
    ],
    laborValue: 200.00,
    totalValue: 580.00,
    paymentStatus: "pendente",
    amountPaid: 0
  },
  {
    id: "V-103",
    plate: "JKL-4567",
    model: "Onix LTZ 1.0 Turbo",
    brand: "Chevrolet",
    year: 2020,
    color: "Preto Ouro Negro",
    km: 62450,
    clientName: "Roberto Camargo Santos",
    clientPhone: "(11) 97788-9900",
    entryDate: "2026-06-29T14:30:00",
    status: "diagnostico",
    complaints: "Revisão preventiva de 60.000 km. Relata pedal da embreagem pesado e partida a frio um pouco lenta nas manhãs frias.",
    checklist: {
      fuelLevel: "1/4",
      hasSpareTire: true,
      hasJack: true,
      hasWrench: true,
      hasAntenna: false,
      scratchesDents: "Antena ausente. Riscado na tampa traseira do porta-malas.",
      photos: [],
      completedBy: "Roberto Almeida (Recepcionista)",
      completedAt: "2026-06-29T14:40:00"
    },
    diagnosticLogs: [
      {
        id: "D-4",
        timestamp: "2026-06-29T16:00:00",
        testName: "Teste de Carga da Bateria",
        result: "Bateria original de 12V apresentando 11.2V sob partida. CCA medido: 220A (Especificado: 400A). Recomendado substituição preventiva.",
        photo: SAMPLE_VEHICLE_IMAGES.scannerScreen,
        technician: "Mestre Logan (Mecânico)"
      }
    ],
    partsRequests: [],
    laborValue: 350.00,
    totalValue: 350.00,
    paymentStatus: "pendente",
    amountPaid: 0
  },
  {
    id: "V-104",
    plate: "MNO-3322",
    model: "Jeep Compass Longitude",
    brand: "Jeep",
    year: 2019,
    color: "Azul Jazz",
    km: 79800,
    clientName: "Ana Beatriz Pinheiro",
    clientPhone: "(11) 96543-2109",
    entryDate: "2026-06-29T16:45:00",
    status: "recepcionado",
    complaints: "Vazamento de água visível na garagem e motor esquentando ligeiramente acima do meio do painel.",
    partsRequests: [],
    diagnosticLogs: [],
    laborValue: 0,
    totalValue: 0,
    paymentStatus: "pendente",
    amountPaid: 0
  },
  {
    id: "V-105",
    plate: "KIP-8899",
    model: "Golf GTI 2.0 TSI",
    brand: "Volkswagen",
    year: 2017,
    color: "Vermelho Tornado",
    km: 98150,
    clientName: "Felipe Gouveia",
    clientPhone: "(11) 98222-1144",
    clientEmail: "felipe.gti@gmail.com",
    entryDate: "2026-06-26T08:00:00",
    exitDate: "2026-06-28T16:00:00",
    status: "entregue",
    complaints: "Troca de óleo, filtros, descarbonização de válvulas e jogo de velas.",
    checklist: {
      fuelLevel: "Cheio",
      hasSpareTire: true,
      hasJack: true,
      hasWrench: true,
      hasAntenna: true,
      scratchesDents: "Roda dianteira direita ralada na borda.",
      photos: [],
      completedBy: "Roberto Almeida (Recepcionista)",
      completedAt: "2026-06-26T08:10:00"
    },
    diagnosticLogs: [
      {
        id: "D-5",
        timestamp: "2026-06-26T10:00:00",
        testName: "Inspeção de Carbonização de Válvulas",
        result: "Válvulas de admissão com acúmulo moderado a alto de depósitos de carbono. Necessária descarbonização física química.",
        photo: SAMPLE_VEHICLE_IMAGES.engineBay,
        technician: "Mestre Logan (Mecânico)"
      }
    ],
    partsRequests: [
      { id: "PR-6", type: "peca", partName: "Óleo Sintético 5W40 Pentosin (6L)", qty: 1, status: "aprovado", price: 420.00, sku: "OL-5W40-6L" },
      { id: "PR-7", type: "peca", partName: "Filtro de Óleo Mann Filter", qty: 1, status: "aprovado", price: 85.00, sku: "FLT-OL-GOLF" },
      { id: "PR-8", type: "peca", partName: "Jogo de Velas NGK Racing", qty: 1, status: "aprovado", price: 550.00, sku: "VEL-NGK-RC" }
    ],
    laborValue: 800.00,
    totalValue: 1855.00,
    paymentMethod: "Pix",
    paymentStatus: "pago",
    amountPaid: 1855.00
  },
  {
    id: "V-106",
    plate: "DDE-5566",
    model: "Duster 1.6 Expression",
    brand: "Renault",
    year: 2016,
    color: "Marrom",
    km: 112400,
    clientName: "José Ramos Mendes",
    clientPhone: "(11) 93211-8899",
    entryDate: "2026-06-27T11:00:00",
    status: "pronto",
    complaints: "Substituição do kit de correia dentada e tensor preventiva por tempo de uso.",
    checklist: {
      fuelLevel: "1/4",
      hasSpareTire: true,
      hasJack: true,
      hasWrench: true,
      hasAntenna: true,
      scratchesDents: "Vários pequenos riscos em ambas as laterais.",
      photos: [],
      completedBy: "Amanda Costa (Recepcionista)",
      completedAt: "2026-06-27T11:15:00"
    },
    diagnosticLogs: [],
    partsRequests: [
      { id: "PR-9", type: "peca", partName: "Kit Correia Dentada + Tensor Renault 1.6", qty: 1, status: "aprovado", price: 450.00, sku: "KIT-COR-REN" }
    ],
    laborValue: 350.00,
    totalValue: 800.00,
    paymentStatus: "parcial", // Devedor (pagou metade de sinal)
    amountPaid: 400.00
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: "ST-1", sku: "VEL-HND-01", name: "Jogo de Velas Iridium Honda", currentQty: 8, minQty: 3, costPrice: 180.00, salePrice: 340.00, category: "Ignição" },
  { id: "ST-2", sku: "BIEL-PAR", name: "Bieleta Dianteira (Par)", currentQty: 2, minQty: 2, costPrice: 95.00, salePrice: 180.00, category: "Suspensão" },
  { id: "ST-3", sku: "BCH-BAND-CIV", name: "Bucha de Bandeja Dianteira Civic", currentQty: 10, minQty: 4, costPrice: 40.00, salePrice: 90.00, category: "Suspensão" },
  { id: "ST-4", sku: "PST-FRE-COR", name: "Pastilha de Freio Dianteira Cerâmica Corolla", currentQty: 1, minQty: 3, costPrice: 150.00, salePrice: 290.00, category: "Freios" }, // Baixo Estoque
  { id: "ST-5", sku: "LIQ-DOT4", name: "Óleo de Freio DOT 4 (Frasco 500ml)", currentQty: 15, minQty: 5, costPrice: 20.00, salePrice: 45.00, category: "Fluidos" },
  { id: "ST-6", sku: "OL-5W40-6L", name: "Óleo Sintético 5W40 Pentosin (6L)", currentQty: 4, minQty: 2, costPrice: 240.00, salePrice: 420.00, category: "Fluidos" },
  { id: "ST-7", sku: "FLT-OL-GOLF", name: "Filtro de Óleo Mann Filter", currentQty: 6, minQty: 3, costPrice: 42.00, salePrice: 85.00, category: "Filtros" },
  { id: "ST-8", sku: "VEL-NGK-RC", name: "Jogo de Velas NGK Racing", currentQty: 0, minQty: 1, costPrice: 310.00, salePrice: 550.00, category: "Ignição" }, // Sem Estoque
  { id: "ST-9", sku: "KIT-COR-REN", name: "Kit Correia Dentada + Tensor Renault 1.6", currentQty: 3, minQty: 2, costPrice: 220.00, salePrice: 450.00, category: "Correias" }
];

export const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "PM-1", name: "Pix", active: true },
  { id: "PM-2", name: "Cartão de Crédito", active: true },
  { id: "PM-3", name: "Cartão de Débito", active: true },
  { id: "PM-4", name: "Dinheiro", active: true },
  { id: "PM-5", name: "Boleto Bancário", active: false }
];

export const INITIAL_CATEGORIES: AccountCategory[] = [
  { id: "CAT-R1", name: "Serviços de Mão de Obra", type: "receita", isEditable: false },
  { id: "CAT-R2", name: "Venda de Peças", type: "receita", isEditable: false },
  { id: "CAT-R3", name: "Vendas Diretas / Acessórios", type: "receita", isEditable: true },
  { id: "CAT-D1", name: "Compra de Peças para Estoque", type: "despesa", isEditable: false },
  { id: "CAT-D2", name: "Aluguel e Condomínio", type: "despesa", isEditable: false },
  { id: "CAT-D3", name: "Salários e Pró-labore", type: "despesa", isEditable: false },
  { id: "CAT-D4", name: "Água, Luz e Telefone", type: "despesa", isEditable: false },
  { id: "CAT-D5", name: "Impostos e Taxas", type: "despesa", isEditable: true },
  { id: "CAT-D6", name: "Ferramentas e Equipamentos", type: "despesa", isEditable: true },
  { id: "CAT-D7", name: "Marketing e Divulgação", type: "despesa", isEditable: true }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "T-1", date: "2026-06-01", type: "despesa", category: "Aluguel e Condomínio", description: "Aluguel do galpão da oficina - Junho", amount: 4500.00 },
  { id: "T-2", date: "2026-06-05", type: "despesa", category: "Salários e Pró-labore", description: "Salários equipe mecânica e administrativa", amount: 12000.00 },
  { id: "T-3", date: "2026-06-10", type: "despesa", category: "Água, Luz e Telefone", description: "Fatura de Energia Elétrica Trifásica", amount: 1240.00 },
  { id: "T-4", date: "2026-06-15", type: "despesa", category: "Compra de Peças para Estoque", description: "Lote de pastilhas de freio e filtros - Distribuidora", amount: 3500.00 },
  { id: "T-5", date: "2026-06-25", type: "receita", category: "Serviços de Mão de Obra", description: "Mão de Obra OS V-090 - Corolla", amount: 650.00, paymentMethod: "Cartão de Crédito" },
  { id: "T-6", date: "2026-06-25", type: "receita", category: "Venda de Peças", description: "Peças OS V-090 - Corolla", amount: 1120.00, paymentMethod: "Cartão de Crédito" },
  { id: "T-7", date: "2026-06-28", type: "receita", category: "Serviços de Mão de Obra", description: "OS V-105 - Mão de obra Golf GTI", amount: 800.00, paymentMethod: "Pix" },
  { id: "T-8", date: "2026-06-28", type: "receita", category: "Venda de Peças", description: "OS V-105 - Peças Golf GTI", amount: 1055.00, paymentMethod: "Pix" },
  { id: "T-9", date: "2026-06-28", type: "receita", category: "Serviços de Mão de Obra", description: "OS V-106 - Sinal 50% Duster", amount: 400.00, paymentMethod: "Dinheiro" },
  { id: "T-10", date: "2026-06-29", type: "despesa", category: "Ferramentas e Equipamentos", description: "Scanner Automotivo OBD-II Atualização", amount: 890.00 }
];
