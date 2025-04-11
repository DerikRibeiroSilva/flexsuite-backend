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
exports.customerCompanyController = void 0;
const customer_company_1 = require("../repositories/customer-company");
const zod_1 = require("zod");
// Esquema de validação
const createCustomerCompanySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').max(100, 'O nome deve ter no máximo 100 caracteres')
});
exports.customerCompanyController = {
    // Listar todas as empresas cliente
    getAll: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const customerCompanies = yield customer_company_1.customerCompanyRepository.findAll();
            res.status(200).json(customerCompanies);
        }
        catch (error) {
            console.error('Erro ao buscar empresas cliente:', error);
            res.status(500).json({ message: 'Erro ao buscar empresas cliente' });
        }
    }),
    // Buscar empresa cliente por ID
    getById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const customerCompany = yield customer_company_1.customerCompanyRepository.findById(id);
            if (!customerCompany) {
                res.status(404).json({ message: 'Empresa cliente não encontrada' });
                return;
            }
            res.status(200).json(customerCompany);
        }
        catch (error) {
            console.error('Erro ao buscar empresa cliente:', error);
            res.status(500).json({ message: 'Erro ao buscar empresa cliente' });
        }
    }),
    // Criar nova empresa cliente
    create: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = createCustomerCompanySchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    message: 'Dados inválidos',
                    errors: validationResult.error.errors
                });
                return;
            }
            const data = validationResult.data;
            const customerCompany = yield customer_company_1.customerCompanyRepository.create(data);
            res.status(201).json(customerCompany);
        }
        catch (error) {
            console.error('Erro ao criar empresa cliente:', error);
            res.status(500).json({ message: 'Erro ao criar empresa cliente' });
        }
    }),
    // Atualizar empresa cliente
    update: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const validationResult = createCustomerCompanySchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    message: 'Dados inválidos',
                    errors: validationResult.error.errors
                });
                return;
            }
            const data = validationResult.data;
            // Verificar se a empresa existe
            const customerCompany = yield customer_company_1.customerCompanyRepository.findById(id);
            if (!customerCompany) {
                res.status(404).json({ message: 'Empresa cliente não encontrada' });
                return;
            }
            const updatedCompany = yield customer_company_1.customerCompanyRepository.update(id, data);
            res.status(200).json(updatedCompany);
        }
        catch (error) {
            console.error('Erro ao atualizar empresa cliente:', error);
            res.status(500).json({ message: 'Erro ao atualizar empresa cliente' });
        }
    }),
    // Excluir empresa cliente
    delete: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            // Verificar se a empresa existe
            const customerCompany = yield customer_company_1.customerCompanyRepository.findById(id);
            if (!customerCompany) {
                res.status(404).json({ message: 'Empresa cliente não encontrada' });
                return;
            }
            // Verificar se há relações antes de excluir
            const hasRelations = yield customer_company_1.customerCompanyRepository.hasRelations(id);
            if (hasRelations) {
                res.status(400).json({
                    message: 'Não é possível excluir a empresa. Existem usuários ou fornecedores vinculados a ela.'
                });
                return;
            }
            yield customer_company_1.customerCompanyRepository.delete(id);
            res.status(204).send();
        }
        catch (error) {
            console.error('Erro ao excluir empresa cliente:', error);
            res.status(500).json({ message: 'Erro ao excluir empresa cliente' });
        }
    })
};
