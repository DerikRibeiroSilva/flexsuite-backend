"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeController = void 0;
const employee_1 = require("../repositories/employee");
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
// Esquema de validação para criação de funcionário
const createEmployeeSchema = zod_1.z.object({
    status: zod_1.z.enum(['ATIVO', 'INATIVO']).optional(),
    name: zod_1.z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').max(100, 'O nome deve ter no máximo 100 caracteres'),
    cpf: zod_1.z.string().min(11, 'CPF inválido').max(14, 'CPF inválido').optional(),
    birthDate: zod_1.z.string().or(zod_1.z.date()).transform(val => new Date(val)).optional(),
    gender: zod_1.z.enum(['HOMEM', 'MULHER']).optional(),
    maritalStatus: zod_1.z.enum(['SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO']).optional(),
    nationality: zod_1.z.string().transform(val => val === "" ? undefined : val).pipe(zod_1.z.string().min(2, 'Nacionalidade inválida').optional()),
    placeOfBirth: zod_1.z.string().transform(val => val === "" ? undefined : val).pipe(zod_1.z.string().min(2, 'Local de nascimento inválido').optional()),
    position: zod_1.z.string().transform(val => val === "" ? undefined : val).pipe(zod_1.z.string().min(2, 'Cargo inválido').optional()),
    department: zod_1.z.enum([
        'ADMINISTRATIVO', 'OPERACIONAL', 'COMERCIAL', 'OUTRO', 'OPERACAO',
        'VENDAS', 'ORCAMENTO', 'SUPERVISION', 'LOGISTICA', 'QUALIDADE',
        'ATENDIMENTO_AO_CLIENTE', 'RECURSOS_HUMANOS', 'FINANCEIRO', 'MARKETING',
        'PROJETOS', 'SEGURANCA_DO_TRABALHO', 'TI', 'COMPRAS', 'MANUTENCAO'
    ]).optional(),
    paymentRegime: zod_1.z.enum(['CLT', 'CLTD', 'TERCEIRO']).optional(),
    weeklyWorkload: zod_1.z.string().optional(),
    workShift: zod_1.z.enum(['TEMPO_INTEGRAL', 'PARCIAL', 'REMOTO', 'HIBRIDO']).optional(),
    admissionDate: zod_1.z.string().or(zod_1.z.date()).transform(val => new Date(val)).optional(),
    terminationDate: zod_1.z.string().or(zod_1.z.date()).transform(val => new Date(val)).optional(),
    terminationReason: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    // Relacionamentos
    addresses: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.enum(['RESIDENCIAL', 'COMERCIAL', 'ENTREGA', 'PROJECT']),
        postalCode: zod_1.z.string().min(8, 'CEP inválido'),
        street: zod_1.z.string().transform(val => val === "" ? undefined : val).pipe(zod_1.z.string().min(2, 'Rua inválida').optional()),
        number: zod_1.z.string(),
        complement: zod_1.z.string().optional(),
        neighborhood: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
    })).optional(),
    contacts: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.enum(['RESIDENCIAL', 'COMERCIAL', 'PERSONAL']),
        name: zod_1.z.string().transform(val => val === "" ? undefined : val).pipe(zod_1.z.string().min(2, 'Nome inválido').optional()),
        email: zod_1.z.string().transform(val => val === "" ? undefined : val).pipe(zod_1.z.string().email('Email inválido').optional()),
        phone: zod_1.z.string().transform(val => val === "" ? undefined : val).pipe(zod_1.z.string().min(8, 'Telefone inválido').optional()),
        role: zod_1.z.string().optional(),
        note: zod_1.z.string().optional(),
    })).optional(),
    bankDetails: zod_1.z.object({
        bank: zod_1.z.string().transform(val => val === "" ? undefined : val).pipe(zod_1.z.string().min(2, 'Banco inválido').optional()),
        agency: zod_1.z.string().transform(val => val === "" ? undefined : val).pipe(zod_1.z.string().min(1, 'Agência inválida').optional()),
        accountNumber: zod_1.z.string().transform(val => val === "" ? undefined : val).pipe(zod_1.z.string().min(1, 'Número de conta inválido').optional()),
        accountType: zod_1.z.enum(['CONTA_CORRENTE', 'CONTA_POUPANCA', 'CONTA_JURIDICA']).optional(),
        pixKey: zod_1.z.string().optional(),
        paymentCondition: zod_1.z.enum(['A_VISTA', 'SETE_DIAS', 'QUATORZE_DIAS', 'TRINTA_DIAS', 'PERSONALIZADO']).optional(),
        creditLimit: zod_1.z.number().optional(),
        allowCreditOveruse: zod_1.z.boolean().optional(),
        suframaRegistration: zod_1.z.string().optional(),
    }).optional(),
    compensationBenefits: zod_1.z.object({
        baseSalary: zod_1.z.number().min(0, 'Salário base inválido'),
        dailyCost: zod_1.z.number().min(0, 'Custo diário inválido'),
        paymentType: zod_1.z.enum(['MENSAL', 'QUINZENAL', 'SEMANAL', 'DIARIO']),
        transportationVoucher: zod_1.z.number().min(0),
        mealVoucher: zod_1.z.number().min(0),
        healthPlan: zod_1.z.number().min(0),
    }).optional(),
});
// Esquema de validação para atualização de funcionário
const updateEmployeeSchema = zod_1.z.object({
    status: zod_1.z.enum(['ATIVO', 'INATIVO']).optional(),
    name: zod_1.z.string().transform(val => val === "" ? undefined : val).pipe(zod_1.z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').max(100, 'O nome deve ter no máximo 100 caracteres').optional()),
    cpf: zod_1.z.string().transform(val => val === "" ? undefined : val).pipe(zod_1.z.string().min(11, 'CPF inválido').max(14, 'CPF inválido').optional()),
    birthDate: zod_1.z.string().or(zod_1.z.date()).transform(val => new Date(val)).optional(),
    gender: zod_1.z.enum(['HOMEM', 'MULHER']).optional(),
    maritalStatus: zod_1.z.enum(['SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO']).optional(),
    nationality: zod_1.z.string().transform(val => val === "" ? undefined : val).pipe(zod_1.z.string().min(2, 'Nacionalidade inválida').optional()),
    placeOfBirth: zod_1.z.string().transform(val => val === "" ? undefined : val).pipe(zod_1.z.string().min(2, 'Local de nascimento inválido').optional()),
    position: zod_1.z.string().transform(val => val === "" ? undefined : val).pipe(zod_1.z.string().min(2, 'Cargo inválido').optional()),
    department: zod_1.z.enum([
        'ADMINISTRATIVO', 'OPERACIONAL', 'COMERCIAL', 'OUTRO', 'OPERACAO',
        'VENDAS', 'ORCAMENTO', 'SUPERVISION', 'LOGISTICA', 'QUALIDADE',
        'ATENDIMENTO_AO_CLIENTE', 'RECURSOS_HUMANOS', 'FINANCEIRO', 'MARKETING',
        'PROJETOS', 'SEGURANCA_DO_TRABALHO', 'TI', 'COMPRAS', 'MANUTENCAO'
    ]).optional(),
    paymentRegime: zod_1.z.enum(['CLT', 'CLTD', 'TERCEIRO']).optional(),
    weeklyWorkload: zod_1.z.string().optional(),
    workShift: zod_1.z.enum(['TEMPO_INTEGRAL', 'PARCIAL', 'REMOTO', 'HIBRIDO']).optional(),
    admissionDate: zod_1.z.string().or(zod_1.z.date()).transform(val => new Date(val)).optional(),
    terminationDate: zod_1.z.string().or(zod_1.z.date()).transform(val => new Date(val)).optional(),
    terminationReason: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    // Relacionamentos
    addresses: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.enum(['RESIDENCIAL', 'COMERCIAL', 'ENTREGA', 'PROJECT']),
        postalCode: zod_1.z.string().min(8, 'CEP inválido'),
        street: zod_1.z.string().transform(val => val === "" ? undefined : val).pipe(zod_1.z.string().min(2, 'Rua inválida').optional()),
        number: zod_1.z.string(),
        complement: zod_1.z.string().optional(),
        neighborhood: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
    })).optional(),
    contacts: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.enum(['RESIDENCIAL', 'COMERCIAL', 'PERSONAL']),
        name: zod_1.z.string().transform(val => val === "" ? undefined : val).pipe(zod_1.z.string().min(2, 'Nome inválido').optional()),
        email: zod_1.z.string().transform(val => val === "" ? undefined : val).pipe(zod_1.z.string().email('Email inválido').optional()),
        phone: zod_1.z.string().transform(val => val === "" ? undefined : val).pipe(zod_1.z.string().min(8, 'Telefone inválido').optional()),
        role: zod_1.z.string().optional(),
        note: zod_1.z.string().optional(),
    })).optional(),
    bankDetails: zod_1.z.object({
        bank: zod_1.z.string().transform(val => val === "" ? undefined : val).pipe(zod_1.z.string().min(2, 'Banco inválido').optional()),
        agency: zod_1.z.string().transform(val => val === "" ? undefined : val).pipe(zod_1.z.string().min(1, 'Agência inválida').optional()),
        accountNumber: zod_1.z.string().transform(val => val === "" ? undefined : val).pipe(zod_1.z.string().min(1, 'Número de conta inválido').optional()),
        accountType: zod_1.z.enum(['CONTA_CORRENTE', 'CONTA_POUPANCA', 'CONTA_JURIDICA']).optional(),
        pixKey: zod_1.z.string().optional(),
        paymentCondition: zod_1.z.enum(['A_VISTA', 'SETE_DIAS', 'QUATORZE_DIAS', 'TRINTA_DIAS', 'PERSONALIZADO']).optional(),
        creditLimit: zod_1.z.number().optional(),
        allowCreditOveruse: zod_1.z.boolean().optional(),
        suframaRegistration: zod_1.z.string().optional(),
    }).optional(),
    compensationBenefits: zod_1.z.object({
        baseSalary: zod_1.z.number().min(0, 'Salário base inválido'),
        dailyCost: zod_1.z.number().min(0, 'Custo diário inválido'),
        paymentType: zod_1.z.enum(['MENSAL', 'QUINZENAL', 'SEMANAL', 'DIARIO']),
        transportationVoucher: zod_1.z.number().min(0),
        mealVoucher: zod_1.z.number().min(0),
        healthPlan: zod_1.z.number().min(0),
    }).optional(),
});
exports.employeeController = {
    // Listar todos os funcionários
    getAll: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const employees = yield employee_1.employeeRepository.findAll();
            res.status(200).json(employees);
        }
        catch (error) {
            logger_1.logger.error('Erro ao buscar funcionários:', error);
            res.status(500).json({ message: 'Erro ao buscar funcionários' });
        }
    }),
    // Buscar funcionário por ID
    getById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const employee = yield employee_1.employeeRepository.findById(id);
            if (!employee) {
                res.status(404).json({ message: 'Funcionário não encontrado' });
                return;
            }
            res.status(200).json(employee);
        }
        catch (error) {
            logger_1.logger.error('Erro ao buscar funcionário:', error);
            res.status(500).json({ message: 'Erro ao buscar funcionário' });
        }
    }),
    // Criar novo funcionário
    create: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = createEmployeeSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    message: 'Dados inválidos',
                    errors: validationResult.error.errors
                });
                return;
            }
            const data = validationResult.data;
            // Verificar se já existe um funcionário com o mesmo CPF
            const existingEmployee = yield employee_1.employeeRepository.findByCpf(data.cpf);
            if (existingEmployee) {
                res.status(400).json({ message: 'Já existe um funcionário com este CPF' });
                return;
            }
            const employee = yield employee_1.employeeRepository.create(data);
            res.status(201).json(employee);
        }
        catch (error) {
            logger_1.logger.error('Erro ao criar funcionário:', error);
            res.status(500).json({ message: 'Erro ao criar funcionário' });
        }
    }),
    // Atualizar funcionário
    update: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const validationResult = updateEmployeeSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    message: 'Dados inválidos',
                    errors: validationResult.error.errors
                });
                return;
            }
            const data = validationResult.data;
            // Verificar se o funcionário existe
            const employee = yield employee_1.employeeRepository.findById(id);
            if (!employee) {
                res.status(404).json({ message: 'Funcionário não encontrado' });
                return;
            }
            // Verificar se o CPF já está em uso por outro funcionário
            if (data.cpf && data.cpf !== employee.cpf) {
                const existingEmployee = yield employee_1.employeeRepository.findByCpf(data.cpf);
                if (existingEmployee && existingEmployee.id !== id) {
                    res.status(400).json({ message: 'Este CPF já está sendo usado por outro funcionário' });
                    return;
                }
            }
            const updatedEmployee = yield employee_1.employeeRepository.update(id, data);
            res.status(200).json(updatedEmployee);
        }
        catch (error) {
            logger_1.logger.error('Erro ao atualizar funcionário:', error);
            res.status(500).json({ message: 'Erro ao atualizar funcionário' });
        }
    }),
    // Excluir funcionário
    delete: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const forceful = req.query.forceful === 'true';
            // Verificar se o funcionário existe
            const employee = yield employee_1.employeeRepository.findById(id);
            if (!employee) {
                res.status(404).json({ message: 'Funcionário não encontrado' });
                return;
            }
            // Se não for exclusão forçada, verificar relações
            if (!forceful) {
                // Verificar se o funcionário tem relações
                const hasRelations = yield employee_1.employeeRepository.hasRelations(id);
                if (hasRelations) {
                    res.status(400).json({
                        message: 'Não é possível excluir o funcionário. Existem registros associados a ele (projetos, orçamentos, clientes, etc).',
                        hint: 'Adicione o parâmetro ?forceful=true para excluir o funcionário forçadamente'
                    });
                    return;
                }
            }
            // Excluir funcionário
            yield employee_1.employeeRepository.delete(id);
            logger_1.logger.info(`Funcionário ${id} excluído ${forceful ? 'forçadamente' : ''}`);
            res.status(200).json({ message: 'Funcionário excluído com sucesso' });
        }
        catch (error) {
            logger_1.logger.error('Erro ao excluir funcionário:', error);
            res.status(500).json({ message: 'Erro ao excluir funcionário' });
        }
    })
};
