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
exports.userController = void 0;
const user_1 = require("../repositories/user");
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
// Esquema de validação para criação de usuário
const createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').max(100, 'O nome deve ter no máximo 100 caracteres'),
    email: zod_1.z.string().email('Email inválido'),
    phone: zod_1.z.string().min(8, 'O telefone deve ter no mínimo 8 caracteres').max(20, 'O telefone deve ter no máximo 20 caracteres'),
    password: zod_1.z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    customerCompanyId: zod_1.z.string().uuid('ID de empresa inválido'),
    isAdmin: zod_1.z.boolean().optional()
});
// Esquema de validação para atualização de usuário
const updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').max(100, 'O nome deve ter no máximo 100 caracteres').optional(),
    email: zod_1.z.string().email('Email inválido').optional(),
    phone: zod_1.z.string().min(8, 'O telefone deve ter no mínimo 8 caracteres').max(20, 'O telefone deve ter no máximo 20 caracteres').optional(),
    customerCompanyId: zod_1.z.string().uuid('ID de empresa inválido').optional(),
    isAdmin: zod_1.z.boolean().optional(),
    isActive: zod_1.z.boolean().optional()
});
exports.userController = {
    // Listar todos os usuários
    getAll: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const users = yield user_1.userRepository.findAll();
            res.status(200).json(users);
        }
        catch (error) {
            console.error('Erro ao buscar usuários:', error);
            res.status(500).json({ message: 'Erro ao buscar usuários' });
        }
    }),
    // Buscar usuário por ID
    getById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const user = yield user_1.userRepository.findById(id);
            if (!user) {
                res.status(404).json({ message: 'Usuário não encontrado' });
                return;
            }
            res.status(200).json(user);
        }
        catch (error) {
            console.error('Erro ao buscar usuário:', error);
            res.status(500).json({ message: 'Erro ao buscar usuário' });
        }
    }),
    // Criar novo usuário
    create: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = createUserSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    message: 'Dados inválidos',
                    errors: validationResult.error.errors
                });
                return;
            }
            const data = validationResult.data;
            // Verificar se já existe um usuário com o mesmo email
            const existingUser = yield user_1.userRepository.findByEmail(data.email);
            if (existingUser) {
                res.status(400).json({ message: 'Já existe um usuário com este email' });
                return;
            }
            const user = yield user_1.userRepository.create(data);
            res.status(201).json(user);
        }
        catch (error) {
            console.error('Erro ao criar usuário:', error);
            res.status(500).json({ message: 'Erro ao criar usuário' });
        }
    }),
    // Atualizar usuário
    update: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const validationResult = updateUserSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    message: 'Dados inválidos',
                    errors: validationResult.error.errors
                });
                return;
            }
            const data = validationResult.data;
            // Verificar se o usuário existe
            const user = yield user_1.userRepository.findById(id);
            if (!user) {
                res.status(404).json({ message: 'Usuário não encontrado' });
                return;
            }
            // Verificar se o email já está em uso por outro usuário
            if (data.email && data.email !== user.email) {
                const existingUser = yield user_1.userRepository.findByEmail(data.email);
                if (existingUser && existingUser.id !== id) {
                    res.status(400).json({ message: 'Este email já está sendo usado por outro usuário' });
                    return;
                }
            }
            const updatedUser = yield user_1.userRepository.update(id, data);
            res.status(200).json(updatedUser);
        }
        catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            res.status(500).json({ message: 'Erro ao atualizar usuário' });
        }
    }),
    // Excluir usuário
    delete: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const forceful = req.query.forceful === 'true';
            // Verificar se o usuário existe
            const user = yield user_1.userRepository.findById(id);
            if (!user) {
                res.status(404).json({ message: 'Usuário não encontrado' });
                return;
            }
            // Se não for exclusão forçada, verificar tokens
            if (!forceful) {
                // Verificar se o usuário tem tokens de autenticação
                const hasAuthTokens = yield user_1.userRepository.hasAuthTokens(id);
                if (hasAuthTokens) {
                    res.status(400).json({
                        message: 'Não é possível excluir o usuário. Existem tokens de autenticação associados a ele.',
                        hint: 'Adicione o parâmetro ?forceful=true para excluir o usuário e seus tokens'
                    });
                    return;
                }
                yield user_1.userRepository.delete(id);
            }
            else {
                // Exclusão forçada: remover tokens e usuário
                yield user_1.userRepository.deleteWithTokens(id);
                logger_1.logger.info(`Usuário ${id} excluído forçadamente junto com seus tokens`);
            }
            res.status(200).json({ message: 'Usuário excluído com sucesso' });
        }
        catch (error) {
            console.error('Erro ao excluir usuário:', error);
            res.status(500).json({ message: 'Erro ao excluir usuário' });
        }
    })
};
