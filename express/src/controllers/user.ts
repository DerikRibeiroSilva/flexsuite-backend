import { Request, Response } from 'express';
import { userRepository } from '../repositories/user';
import { CreateUserDTO, UpdateUserDTO } from '../entities/User';
import { z } from 'zod';
import { logger } from '../utils/logger';

// Esquema de validação para criação de usuário
const createUserSchema = z.object({
    name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').max(100, 'O nome deve ter no máximo 100 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().min(8, 'O telefone deve ter no mínimo 8 caracteres').max(20, 'O telefone deve ter no máximo 20 caracteres'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    customerCompanyId: z.string().uuid('ID de empresa inválido'),
    isAdmin: z.boolean().optional()
});

// Esquema de validação para atualização de usuário
const updateUserSchema = z.object({
    name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').max(100, 'O nome deve ter no máximo 100 caracteres').optional(),
    email: z.string().email('Email inválido').optional(),
    phone: z.string().min(8, 'O telefone deve ter no mínimo 8 caracteres').max(20, 'O telefone deve ter no máximo 20 caracteres').optional(),
    customerCompanyId: z.string().uuid('ID de empresa inválido').optional(),
    isAdmin: z.boolean().optional(),
    isActive: z.boolean().optional()
});

export const userController = {
    // Listar todos os usuários
    getAll: async (req: Request, res: Response): Promise<void> => {
        try {
            const users = await userRepository.findAll();
            res.status(200).json(users);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            res.status(500).json({ message: 'Erro ao buscar usuários' });
        }
    },

    // Buscar usuário por ID
    getById: async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const user = await userRepository.findById(id);

            if (!user) {
                res.status(404).json({ message: 'Usuário não encontrado' });
                return;
            }

            res.status(200).json(user);
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            res.status(500).json({ message: 'Erro ao buscar usuário' });
        }
    },

    // Criar novo usuário
    create: async (req: Request, res: Response): Promise<void> => {
        try {
            const validationResult = createUserSchema.safeParse(req.body);

            if (!validationResult.success) {
                res.status(400).json({
                    message: 'Dados inválidos',
                    errors: validationResult.error.errors
                });
                return;
            }

            const data: CreateUserDTO = validationResult.data;

            // Verificar se já existe um usuário com o mesmo email
            const existingUser = await userRepository.findByEmail(data.email);
            if (existingUser) {
                res.status(400).json({ message: 'Já existe um usuário com este email' });
                return;
            }

            const user = await userRepository.create(data);
            res.status(201).json(user);
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            res.status(500).json({ message: 'Erro ao criar usuário' });
        }
    },

    // Atualizar usuário
    update: async (req: Request, res: Response): Promise<void> => {
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

            const data: UpdateUserDTO = validationResult.data;

            // Verificar se o usuário existe
            const user = await userRepository.findById(id);
            if (!user) {
                res.status(404).json({ message: 'Usuário não encontrado' });
                return;
            }

            // Verificar se o email já está em uso por outro usuário
            if (data.email && data.email !== user.email) {
                const existingUser = await userRepository.findByEmail(data.email);
                if (existingUser && existingUser.id !== id) {
                    res.status(400).json({ message: 'Este email já está sendo usado por outro usuário' });
                    return;
                }
            }

            const updatedUser = await userRepository.update(id, data);
            res.status(200).json(updatedUser);
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            res.status(500).json({ message: 'Erro ao atualizar usuário' });
        }
    },

    // Excluir usuário
    delete: async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const forceful = req.query.forceful === 'true';

            // Verificar se o usuário existe
            const user = await userRepository.findById(id);
            if (!user) {
                res.status(404).json({ message: 'Usuário não encontrado' });
                return;
            }

            // Se não for exclusão forçada, verificar tokens
            if (!forceful) {
                // Verificar se o usuário tem tokens de autenticação
                const hasAuthTokens = await userRepository.hasAuthTokens(id);
                if (hasAuthTokens) {
                    res.status(400).json({
                        message: 'Não é possível excluir o usuário. Existem tokens de autenticação associados a ele.',
                        hint: 'Adicione o parâmetro ?forceful=true para excluir o usuário e seus tokens'
                    });
                    return;
                }

                await userRepository.delete(id);
            } else {
                // Exclusão forçada: remover tokens e usuário
                await userRepository.deleteWithTokens(id);
                logger.info(`Usuário ${id} excluído forçadamente junto com seus tokens`);
            }

            res.status(200).json({ message: 'Usuário excluído com sucesso' });
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            res.status(500).json({ message: 'Erro ao excluir usuário' });
        }
    }
}; 