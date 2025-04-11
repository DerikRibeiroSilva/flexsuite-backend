import { prisma } from '../prisma/client';
import { CreateCustomerCompanyDTO, CustomerCompany, UpdateCustomerCompanyDTO } from '../entities/CustomerCompany';

export const customerCompanyRepository = {
    findAll: async (): Promise<CustomerCompany[]> => {
        return prisma.customerCompany.findMany({
            orderBy: { name: 'asc' }
        });
    },

    findById: async (id: string): Promise<CustomerCompany | null> => {
        return prisma.customerCompany.findUnique({
            where: { id },
            include: {
                users: true,
                suppliers: true
            }
        });
    },

    create: async (data: CreateCustomerCompanyDTO): Promise<CustomerCompany> => {
        return prisma.customerCompany.create({
            data: {
                name: data.name
            }
        });
    },

    update: async (id: string, data: UpdateCustomerCompanyDTO): Promise<CustomerCompany> => {
        return prisma.customerCompany.update({
            where: { id },
            data: {
                name: data.name
            }
        });
    },

    delete: async (id: string): Promise<void> => {
        await prisma.customerCompany.delete({
            where: { id }
        });
    },

    hasRelations: async (id: string): Promise<boolean> => {
        const count = await prisma.$transaction([
            prisma.user.count({ where: { customerCompanyId: id } }),
            prisma.supplier.count({ where: { customerCompanyId: id } })
        ]);

        return count[0] > 0 || count[1] > 0;
    }
};