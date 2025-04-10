import { Request, Response } from 'express';
import { customerCompanyRepository } from '../repositories/customer-company';
import { CreateCustomerCompanyDTO, UpdateCustomerCompanyDTO } from '../entities/CustomerCompany';
import { z } from 'zod';

// Esquema de validação
const createCustomerCompanySchema = z.object({
    name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').max(100, 'O nome deve ter no máximo 100 caracteres')
});

export const customerCompanyController = {
    // Listar todas as empresas cliente
    getAll: async (req: Request, res: Response): Promise<void> => {
        try {
            const customerCompanies = await customerCompanyRepository.findAll();
            res.status(200).json(customerCompanies);
        } catch (error) {
            console.error('Erro ao buscar empresas cliente:', error);
            res.status(500).json({ message: 'Erro ao buscar empresas cliente' });
        }
    },

    // Buscar empresa cliente por ID
    getById: async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const customerCompany = await customerCompanyRepository.findById(id);

            if (!customerCompany) {
                res.status(404).json({ message: 'Empresa cliente não encontrada' });
                return;
            }

            res.status(200).json(customerCompany);
        } catch (error) {
            console.error('Erro ao buscar empresa cliente:', error);
            res.status(500).json({ message: 'Erro ao buscar empresa cliente' });
        }
    },

    // Criar nova empresa cliente
    create: async (req: Request, res: Response): Promise<void> => {
        try {
            const validationResult = createCustomerCompanySchema.safeParse(req.body);

            if (!validationResult.success) {
                res.status(400).json({
                    message: 'Dados inválidos',
                    errors: validationResult.error.errors
                });
                return;
            }

            const data: CreateCustomerCompanyDTO = validationResult.data;

            const customerCompany = await customerCompanyRepository.create(data);
            res.status(201).json(customerCompany);
        } catch (error) {
            console.error('Erro ao criar empresa cliente:', error);
            res.status(500).json({ message: 'Erro ao criar empresa cliente' });
        }
    },

    // Atualizar empresa cliente
    update: async (req: Request, res: Response): Promise<void> => {
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

            const data: UpdateCustomerCompanyDTO = validationResult.data;

            // Verificar se a empresa existe
            const customerCompany = await customerCompanyRepository.findById(id);

            if (!customerCompany) {
                res.status(404).json({ message: 'Empresa cliente não encontrada' });
                return;
            }

            const updatedCompany = await customerCompanyRepository.update(id, data);
            res.status(200).json(updatedCompany);
        } catch (error) {
            console.error('Erro ao atualizar empresa cliente:', error);
            res.status(500).json({ message: 'Erro ao atualizar empresa cliente' });
        }
    },

    // Excluir empresa cliente
    delete: async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            // Verificar se a empresa existe
            const customerCompany = await customerCompanyRepository.findById(id);

            if (!customerCompany) {
                res.status(404).json({ message: 'Empresa cliente não encontrada' });
                return;
            }

            // Verificar se há relações antes de excluir
            const hasRelations = await customerCompanyRepository.hasRelations(id);

            if (hasRelations) {
                res.status(400).json({
                    message: 'Não é possível excluir a empresa. Existem usuários ou fornecedores vinculados a ela.'
                });
                return;
            }

            await customerCompanyRepository.delete(id);
            res.status(204).send();
        } catch (error) {
            console.error('Erro ao excluir empresa cliente:', error);
            res.status(500).json({ message: 'Erro ao excluir empresa cliente' });
        }
    }
};