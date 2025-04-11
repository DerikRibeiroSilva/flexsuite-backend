import { Request, Response } from 'express';
import { employeeRepository } from '../repositories/employee';
import { CreateEmployeeDTO, UpdateEmployeeDTO } from '../entities/Employee';
import { z } from 'zod';
import { logger } from '../utils/logger';

// Esquema de validação para criação de funcionário
const createEmployeeSchema = z.object({
    status: z.enum(['ATIVO', 'INATIVO']).optional(),
    name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').max(100, 'O nome deve ter no máximo 100 caracteres'),
    cpf: z.string().min(11, 'CPF inválido').max(14, 'CPF inválido').optional(),
    birthDate: z.string().or(z.date()).transform(val => new Date(val)).optional(),
    gender: z.enum(['HOMEM', 'MULHER']).optional(),
    maritalStatus: z.enum(['SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO']).optional(),
    nationality: z.string().transform(val => val === "" ? undefined : val).pipe(
        z.string().min(2, 'Nacionalidade inválida').optional()
    ),
    placeOfBirth: z.string().transform(val => val === "" ? undefined : val).pipe(
        z.string().min(2, 'Local de nascimento inválido').optional()
    ),
    position: z.string().transform(val => val === "" ? undefined : val).pipe(
        z.string().min(2, 'Cargo inválido').optional()
    ),
    department: z.enum([
        'ADMINISTRATIVO', 'OPERACIONAL', 'COMERCIAL', 'OUTRO', 'OPERACAO',
        'VENDAS', 'ORCAMENTO', 'SUPERVISION', 'LOGISTICA', 'QUALIDADE',
        'ATENDIMENTO_AO_CLIENTE', 'RECURSOS_HUMANOS', 'FINANCEIRO', 'MARKETING',
        'PROJETOS', 'SEGURANCA_DO_TRABALHO', 'TI', 'COMPRAS', 'MANUTENCAO'
    ]).optional(),
    paymentRegime: z.enum(['CLT', 'CLTD', 'TERCEIRO']).optional(),
    weeklyWorkload: z.string().optional(),
    workShift: z.enum(['TEMPO_INTEGRAL', 'PARCIAL', 'REMOTO', 'HIBRIDO']).optional(),
    admissionDate: z.string().or(z.date()).transform(val => new Date(val)).optional(),
    terminationDate: z.string().or(z.date()).transform(val => new Date(val)).optional(),
    terminationReason: z.string().optional(),
    notes: z.string().optional(),

    // Relacionamentos
    addresses: z.array(
        z.object({
            type: z.enum(['RESIDENCIAL', 'COMERCIAL', 'ENTREGA', 'PROJECT']),
            postalCode: z.string().min(8, 'CEP inválido'),
            street: z.string().transform(val => val === "" ? undefined : val).pipe(
                z.string().min(2, 'Rua inválida').optional()
            ),
            number: z.string(),
            complement: z.string().optional(),
            neighborhood: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
        })
    ).optional(),

    contacts: z.array(
        z.object({
            type: z.enum(['RESIDENCIAL', 'COMERCIAL', 'PERSONAL']),
            name: z.string().transform(val => val === "" ? undefined : val).pipe(
                z.string().min(2, 'Nome inválido').optional()
            ),
            email: z.string().transform(val => val === "" ? undefined : val).pipe(
                z.string().email('Email inválido').optional()
            ),
            phone: z.string().transform(val => val === "" ? undefined : val).pipe(
                z.string().min(8, 'Telefone inválido').optional()
            ),
            role: z.string().optional(),
            note: z.string().optional(),
        })
    ).optional(),

    bankDetails: z.object({
        bank: z.string().transform(val => val === "" ? undefined : val).pipe(
            z.string().min(2, 'Banco inválido').optional()
        ),
        agency: z.string().transform(val => val === "" ? undefined : val).pipe(
            z.string().min(1, 'Agência inválida').optional()
        ),
        accountNumber: z.string().transform(val => val === "" ? undefined : val).pipe(
            z.string().min(1, 'Número de conta inválido').optional()
        ),
        accountType: z.enum(['CONTA_CORRENTE', 'CONTA_POUPANCA', 'CONTA_JURIDICA']).optional(),
        pixKey: z.string().optional(),
        paymentCondition: z.enum(['A_VISTA', 'SETE_DIAS', 'QUATORZE_DIAS', 'TRINTA_DIAS', 'PERSONALIZADO']).optional(),
        creditLimit: z.number().optional(),
        allowCreditOveruse: z.boolean().optional(),
        suframaRegistration: z.string().optional(),
    }).optional(),

    compensationBenefits: z.object({
        baseSalary: z.number().min(0, 'Salário base inválido'),
        dailyCost: z.number().min(0, 'Custo diário inválido'),
        paymentType: z.enum(['MENSAL', 'QUINZENAL', 'SEMANAL', 'DIARIO']),
        transportationVoucher: z.number().min(0),
        mealVoucher: z.number().min(0),
        healthPlan: z.number().min(0),
    }).optional(),
});

// Esquema de validação para atualização de funcionário
const updateEmployeeSchema = z.object({
    status: z.enum(['ATIVO', 'INATIVO']).optional(),
    name: z.string().transform(val => val === "" ? undefined : val).pipe(
        z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').max(100, 'O nome deve ter no máximo 100 caracteres').optional()
    ),
    cpf: z.string().transform(val => val === "" ? undefined : val).pipe(
        z.string().min(11, 'CPF inválido').max(14, 'CPF inválido').optional()
    ),
    birthDate: z.string().or(z.date()).transform(val => new Date(val)).optional(),
    gender: z.enum(['HOMEM', 'MULHER']).optional(),
    maritalStatus: z.enum(['SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO']).optional(),
    nationality: z.string().transform(val => val === "" ? undefined : val).pipe(
        z.string().min(2, 'Nacionalidade inválida').optional()
    ),
    placeOfBirth: z.string().transform(val => val === "" ? undefined : val).pipe(
        z.string().min(2, 'Local de nascimento inválido').optional()
    ),
    position: z.string().transform(val => val === "" ? undefined : val).pipe(
        z.string().min(2, 'Cargo inválido').optional()
    ),
    department: z.enum([
        'ADMINISTRATIVO', 'OPERACIONAL', 'COMERCIAL', 'OUTRO', 'OPERACAO',
        'VENDAS', 'ORCAMENTO', 'SUPERVISION', 'LOGISTICA', 'QUALIDADE',
        'ATENDIMENTO_AO_CLIENTE', 'RECURSOS_HUMANOS', 'FINANCEIRO', 'MARKETING',
        'PROJETOS', 'SEGURANCA_DO_TRABALHO', 'TI', 'COMPRAS', 'MANUTENCAO'
    ]).optional(),
    paymentRegime: z.enum(['CLT', 'CLTD', 'TERCEIRO']).optional(),
    weeklyWorkload: z.string().optional(),
    workShift: z.enum(['TEMPO_INTEGRAL', 'PARCIAL', 'REMOTO', 'HIBRIDO']).optional(),
    admissionDate: z.string().or(z.date()).transform(val => new Date(val)).optional(),
    terminationDate: z.string().or(z.date()).transform(val => new Date(val)).optional(),
    terminationReason: z.string().optional(),
    notes: z.string().optional(),

    // Relacionamentos
    addresses: z.array(
        z.object({
            type: z.enum(['RESIDENCIAL', 'COMERCIAL', 'ENTREGA', 'PROJECT']),
            postalCode: z.string().min(8, 'CEP inválido'),
            street: z.string().transform(val => val === "" ? undefined : val).pipe(
                z.string().min(2, 'Rua inválida').optional()
            ),
            number: z.string(),
            complement: z.string().optional(),
            neighborhood: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
        })
    ).optional(),

    contacts: z.array(
        z.object({
            type: z.enum(['RESIDENCIAL', 'COMERCIAL', 'PERSONAL']),
            name: z.string().transform(val => val === "" ? undefined : val).pipe(
                z.string().min(2, 'Nome inválido').optional()
            ),
            email: z.string().transform(val => val === "" ? undefined : val).pipe(
                z.string().email('Email inválido').optional()
            ),
            phone: z.string().transform(val => val === "" ? undefined : val).pipe(
                z.string().min(8, 'Telefone inválido').optional()
            ),
            role: z.string().optional(),
            note: z.string().optional(),
        })
    ).optional(),

    bankDetails: z.object({
        bank: z.string().transform(val => val === "" ? undefined : val).pipe(
            z.string().min(2, 'Banco inválido').optional()
        ),
        agency: z.string().transform(val => val === "" ? undefined : val).pipe(
            z.string().min(1, 'Agência inválida').optional()
        ),
        accountNumber: z.string().transform(val => val === "" ? undefined : val).pipe(
            z.string().min(1, 'Número de conta inválido').optional()
        ),
        accountType: z.enum(['CONTA_CORRENTE', 'CONTA_POUPANCA', 'CONTA_JURIDICA']).optional(),
        pixKey: z.string().optional(),
        paymentCondition: z.enum(['A_VISTA', 'SETE_DIAS', 'QUATORZE_DIAS', 'TRINTA_DIAS', 'PERSONALIZADO']).optional(),
        creditLimit: z.number().optional(),
        allowCreditOveruse: z.boolean().optional(),
        suframaRegistration: z.string().optional(),
    }).optional(),

    compensationBenefits: z.object({
        baseSalary: z.number().min(0, 'Salário base inválido'),
        dailyCost: z.number().min(0, 'Custo diário inválido'),
        paymentType: z.enum(['MENSAL', 'QUINZENAL', 'SEMANAL', 'DIARIO']),
        transportationVoucher: z.number().min(0),
        mealVoucher: z.number().min(0),
        healthPlan: z.number().min(0),
    }).optional(),
});

export const employeeController = {
    // Listar todos os funcionários
    getAll: async (req: Request, res: Response): Promise<void> => {
        try {
            const employees = await employeeRepository.findAll();
            res.status(200).json(employees);
        } catch (error) {
            logger.error('Erro ao buscar funcionários:', error);
            res.status(500).json({ message: 'Erro ao buscar funcionários' });
        }
    },

    // Buscar funcionário por ID
    getById: async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const employee = await employeeRepository.findById(id);

            if (!employee) {
                res.status(404).json({ message: 'Funcionário não encontrado' });
                return;
            }

            res.status(200).json(employee);
        } catch (error) {
            logger.error('Erro ao buscar funcionário:', error);
            res.status(500).json({ message: 'Erro ao buscar funcionário' });
        }
    },

    // Criar novo funcionário
    create: async (req: Request, res: Response): Promise<void> => {
        try {
            const validationResult = createEmployeeSchema.safeParse(req.body);

            if (!validationResult.success) {
                res.status(400).json({
                    message: 'Dados inválidos',
                    errors: validationResult.error.errors
                });
                return;
            }

            const data = validationResult.data as unknown as CreateEmployeeDTO;

            // Verificar se já existe um funcionário com o mesmo CPF
            const existingEmployee = await employeeRepository.findByCpf(data.cpf);
            if (existingEmployee) {
                res.status(400).json({ message: 'Já existe um funcionário com este CPF' });
                return;
            }

            const employee = await employeeRepository.create(data);
            res.status(201).json(employee);
        } catch (error) {
            logger.error('Erro ao criar funcionário:', error);
            res.status(500).json({ message: 'Erro ao criar funcionário' });
        }
    },

    // Atualizar funcionário
    update: async (req: Request, res: Response): Promise<void> => {
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

            const data = validationResult.data as unknown as UpdateEmployeeDTO;

            // Verificar se o funcionário existe
            const employee = await employeeRepository.findById(id);
            if (!employee) {
                res.status(404).json({ message: 'Funcionário não encontrado' });
                return;
            }

            // Verificar se o CPF já está em uso por outro funcionário
            if (data.cpf && data.cpf !== employee.cpf) {
                const existingEmployee = await employeeRepository.findByCpf(data.cpf);
                if (existingEmployee && existingEmployee.id !== id) {
                    res.status(400).json({ message: 'Este CPF já está sendo usado por outro funcionário' });
                    return;
                }
            }

            const updatedEmployee = await employeeRepository.update(id, data);
            res.status(200).json(updatedEmployee);
        } catch (error) {
            logger.error('Erro ao atualizar funcionário:', error);
            res.status(500).json({ message: 'Erro ao atualizar funcionário' });
        }
    },

    // Excluir funcionário
    delete: async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const forceful = req.query.forceful === 'true';

            // Verificar se o funcionário existe
            const employee = await employeeRepository.findById(id);
            if (!employee) {
                res.status(404).json({ message: 'Funcionário não encontrado' });
                return;
            }

            // Se não for exclusão forçada, verificar relações
            if (!forceful) {
                // Verificar se o funcionário tem relações
                const hasRelations = await employeeRepository.hasRelations(id);
                if (hasRelations) {
                    res.status(400).json({
                        message: 'Não é possível excluir o funcionário. Existem registros associados a ele (projetos, orçamentos, clientes, etc).',
                        hint: 'Adicione o parâmetro ?forceful=true para excluir o funcionário forçadamente'
                    });
                    return;
                }
            }

            // Excluir funcionário
            await employeeRepository.delete(id);
            logger.info(`Funcionário ${id} excluído ${forceful ? 'forçadamente' : ''}`);

            res.status(200).json({ message: 'Funcionário excluído com sucesso' });
        } catch (error) {
            logger.error('Erro ao excluir funcionário:', error);
            res.status(500).json({ message: 'Erro ao excluir funcionário' });
        }
    }
}; 