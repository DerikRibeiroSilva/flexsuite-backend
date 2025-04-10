export enum Status {
    ATIVO = 'ATIVO',
    INATIVO = 'INATIVO'
}

export enum Gender {
    HOMEM = 'HOMEM',
    MULHER = 'MULHER'
}

export enum MaritalStatus {
    SOLTEIRO = 'SOLTEIRO',
    CASADO = 'CASADO',
    DIVORCIADO = 'DIVORCIADO',
    VIUVO = 'VIUVO'
}

export enum Department {
    ADMINISTRATIVO = 'ADMINISTRATIVO',
    OPERACIONAL = 'OPERACIONAL',
    COMERCIAL = 'COMERCIAL',
    OUTRO = 'OUTRO',
    OPERACAO = 'OPERACAO',
    VENDAS = 'VENDAS',
    ORCAMENTO = 'ORCAMENTO',
    SUPERVISION = 'SUPERVISION',
    LOGISTICA = 'LOGISTICA',
    QUALIDADE = 'QUALIDADE',
    ATENDIMENTO_AO_CLIENTE = 'ATENDIMENTO_AO_CLIENTE',
    RECURSOS_HUMANOS = 'RECURSOS_HUMANOS',
    FINANCEIRO = 'FINANCEIRO',
    MARKETING = 'MARKETING',
    PROJETOS = 'PROJETOS',
    SEGURANCA_DO_TRABALHO = 'SEGURANCA_DO_TRABALHO',
    TI = 'TI',
    COMPRAS = 'COMPRAS',
    MANUTENCAO = 'MANUTENCAO'
}

export enum PaymentRegime {
    CLT = 'CLT',
    CLTD = 'CLTD',
    TERCEIRO = 'TERCEIRO'
}

export enum WorkShift {
    TEMPO_INTEGRAL = 'TEMPO_INTEGRAL',
    PARCIAL = 'PARCIAL',
    REMOTO = 'REMOTO',
    HIBRIDO = 'HIBRIDO'
}

export enum PaymentType {
    MENSAL = 'MENSAL',
    QUINZENAL = 'QUINZENAL',
    SEMANAL = 'SEMANAL',
    DIARIO = 'DIARIO'
}

export interface Address {
    id?: string;
    type: string;
    postalCode: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
}

export interface Contact {
    id?: string;
    type: string;
    name: string;
    email: string;
    phone: string;
    role?: string;
    note?: string;
}

export interface BankDetails {
    id?: string;
    bank: string;
    agency: string;
    accountNumber: string;
    accountType: string;
    pixKey: string;
    paymentCondition: string;
    creditLimit?: number;
    allowCreditOveruse: boolean;
    suframaRegistration: string;
}

export interface CompensationBenefits {
    id?: string;
    baseSalary: number;
    dailyCost: number;
    paymentType: PaymentType;
    transportationVoucher: number;
    mealVoucher: number;
    healthPlan: number;
}

export interface Employee {
    id: string;
    status: Status;
    name: string;
    cpf: string;
    birthDate: Date;
    gender: Gender;
    maritalStatus: MaritalStatus;
    nationality: string;
    placeOfBirth: string;
    contacts?: Contact[];
    addresses?: Address[];
    position: string;
    department: Department;
    paymentRegime: PaymentRegime;
    weeklyWorkload: string;
    workShift: WorkShift;
    admissionDate: Date;
    terminationDate?: Date;
    terminationReason?: string;
    bankDetails?: BankDetails;
    compensationBenefits?: CompensationBenefits;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateEmployeeDTO extends Omit<Employee, 'id' | 'createdAt' | 'updatedAt'> {
    addresses?: Address[];
    contacts?: Contact[];
    bankDetails?: BankDetails;
    compensationBenefits?: CompensationBenefits;
}

export interface UpdateEmployeeDTO {
    status?: Status;
    name?: string;
    cpf?: string;
    birthDate?: Date;
    gender?: Gender;
    maritalStatus?: MaritalStatus;
    nationality?: string;
    placeOfBirth?: string;
    position?: string;
    department?: Department;
    paymentRegime?: PaymentRegime;
    weeklyWorkload?: string;
    workShift?: WorkShift;
    admissionDate?: Date;
    terminationDate?: Date;
    terminationReason?: string;
    notes?: string;
    addresses?: Address[];
    contacts?: Contact[];
    bankDetails?: BankDetails;
    compensationBenefits?: CompensationBenefits;
} 