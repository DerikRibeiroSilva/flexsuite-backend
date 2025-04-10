import { prisma } from '../prisma/client';
import { CreateUserDTO, UpdateUserDTO, User, UserResponseDTO } from '../entities/User';
import bcrypt from 'bcrypt';
import { logger } from '../utils/logger';

export const userRepository = {
    findAll: async (): Promise<UserResponseDTO[]> => {
        return prisma.user.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                customerCompanyId: true,
                isAdmin: true,
                isVerified: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
    },

    findById: async (id: string): Promise<UserResponseDTO | null> => {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                customerCompanyId: true,
                isAdmin: true,
                isVerified: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
    },

    findByEmail: async (email: string): Promise<User | null> => {
        return prisma.user.findUnique({
            where: { email }
        });
    },

    create: async (data: CreateUserDTO): Promise<UserResponseDTO> => {
        const { password, ...userData } = data;

        // Hash da senha antes de salvar
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        return prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword,
                isVerified: false,
                isActive: true
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                customerCompanyId: true,
                isAdmin: true,
                isVerified: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
    },

    update: async (id: string, data: UpdateUserDTO): Promise<UserResponseDTO> => {
        return prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                customerCompanyId: true,
                isAdmin: true,
                isVerified: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
    },

    delete: async (id: string): Promise<void> => {
        await prisma.user.delete({
            where: { id }
        });
    },

    deleteWithTokens: async (id: string): Promise<void> => {
        // Usar uma transação para garantir que os tokens e o usuário sejam excluídos juntos
        await prisma.$transaction(async (tx) => {
            // Primeiro, excluir todos os tokens de autenticação do usuário
            await tx.authToken.deleteMany({
                where: { userId: id }
            });

            // Em seguida, excluir o usuário
            await tx.user.delete({
                where: { id }
            });
        });

        logger.info(`Usuário ${id} e seus tokens de autenticação foram excluídos com sucesso.`);
    },

    hasAuthTokens: async (id: string): Promise<boolean> => {
        const count = await prisma.authToken.count({
            where: { userId: id }
        });

        return count > 0;
    }
}; 