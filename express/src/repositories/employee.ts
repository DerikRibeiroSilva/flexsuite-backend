import { prisma } from '../prisma/client';
import { CreateEmployeeDTO, Employee, UpdateEmployeeDTO } from '../entities/Employee';
import { logger } from '../utils/logger';
import { Prisma } from '@prisma/client';

// Função para converter tipos do Prisma para nossos tipos de entidade
const convertPrismaEmployeeToEntity = (prismaEmployee: any): Employee => {
    return {
        ...prismaEmployee,
        // Conversões específicas de enum podem ser adicionadas aqui se necessário
    } as Employee;
};

export const employeeRepository = {
    findAll: async (): Promise<Employee[]> => {
        const employees = await prisma.employee.findMany({
            orderBy: { name: 'asc' },
            include: {
                addresses: true,
                contacts: true,
                bankDetails: true,
                compensationBenefits: true
            }
        });

        return employees.map(convertPrismaEmployeeToEntity);
    },

    findById: async (id: string): Promise<Employee | null> => {
        const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                addresses: true,
                contacts: true,
                bankDetails: true,
                compensationBenefits: true
            }
        });

        return employee ? convertPrismaEmployeeToEntity(employee) : null;
    },

    findByCpf: async (cpf: string): Promise<Employee | null> => {
        const employee = await prisma.employee.findFirst({
            where: { cpf },
            include: {
                addresses: true,
                contacts: true,
                bankDetails: true,
                compensationBenefits: true
            }
        });

        return employee ? convertPrismaEmployeeToEntity(employee) : null;
    },

    create: async (data: CreateEmployeeDTO): Promise<Employee> => {
        const { addresses, contacts, bankDetails, compensationBenefits, ...employeeData } = data;

        // Transação para criar o funcionário e suas relações
        const result = await prisma.$transaction(async (tx) => {
            // Criar funcionário
            const employee = await tx.employee.create({
                data: employeeData as any
            });

            // Criar endereços, se fornecidos
            if (addresses && addresses.length > 0) {
                for (const address of addresses) {
                    await tx.address.create({
                        data: {
                            type: address.type as any,
                            postalCode: address.postalCode,
                            street: address.street,
                            number: address.number,
                            complement: address.complement,
                            neighborhood: address.neighborhood,
                            city: address.city,
                            state: address.state,
                            employees: {
                                connect: { id: employee.id }
                            }
                        }
                    });
                }
            }

            // Criar contatos, se fornecidos
            if (contacts && contacts.length > 0) {
                for (const contact of contacts) {
                    await tx.contact.create({
                        data: {
                            type: contact.type as any,
                            name: contact.name,
                            email: contact.email,
                            phone: contact.phone,
                            role: contact.role,
                            note: contact.note,
                            employee: {
                                connect: { id: employee.id }
                            }
                        }
                    });
                }
            }

            // Criar detalhes bancários, se fornecidos
            if (bankDetails) {
                await tx.bankDetails.create({
                    data: {
                        bank: bankDetails.bank,
                        agency: bankDetails.agency,
                        accountNumber: bankDetails.accountNumber,
                        accountType: bankDetails.accountType as any,
                        pixKey: bankDetails.pixKey,
                        paymentCondition: bankDetails.paymentCondition as any,
                        creditLimit: bankDetails.creditLimit,
                        allowCreditOveruse: bankDetails.allowCreditOveruse,
                        suframaRegistration: bankDetails.suframaRegistration,
                        employee: {
                            connect: { id: employee.id }
                        }
                    }
                });
            }

            // Criar benefícios de compensação, se fornecidos
            if (compensationBenefits) {
                await tx.compensationBenefits.create({
                    data: {
                        baseSalary: compensationBenefits.baseSalary,
                        dailyCost: compensationBenefits.dailyCost,
                        paymentType: compensationBenefits.paymentType as any,
                        transportationVoucher: compensationBenefits.transportationVoucher,
                        mealVoucher: compensationBenefits.mealVoucher,
                        healthPlan: compensationBenefits.healthPlan,
                        employee: {
                            connect: { id: employee.id }
                        }
                    }
                });
            }

            // Retornar o funcionário com todas as relações
            const createdEmployee = await tx.employee.findUnique({
                where: { id: employee.id },
                include: {
                    addresses: true,
                    contacts: true,
                    bankDetails: true,
                    compensationBenefits: true
                }
            });

            return createdEmployee;
        });

        return convertPrismaEmployeeToEntity(result);
    },

    update: async (id: string, data: UpdateEmployeeDTO): Promise<Employee> => {
        const { addresses, contacts, bankDetails, compensationBenefits, ...employeeData } = data;

        // Transação para atualizar o funcionário e suas relações
        const result = await prisma.$transaction(async (tx) => {
            // Atualizar funcionário
            const employee = await tx.employee.update({
                where: { id },
                data: employeeData as any
            });

            // Atualizar endereços, se fornecidos
            if (addresses) {
                // Desconectar endereços existentes
                const existingAddresses = await tx.address.findMany({
                    where: {
                        employees: {
                            some: { id }
                        }
                    }
                });

                for (const address of existingAddresses) {
                    await tx.address.update({
                        where: { id: address.id },
                        data: {
                            employees: {
                                disconnect: { id }
                            }
                        }
                    });
                }

                // Criar novos endereços
                if (addresses.length > 0) {
                    for (const address of addresses) {
                        await tx.address.create({
                            data: {
                                type: address.type as any,
                                postalCode: address.postalCode,
                                street: address.street,
                                number: address.number,
                                complement: address.complement,
                                neighborhood: address.neighborhood,
                                city: address.city,
                                state: address.state,
                                employees: {
                                    connect: { id: employee.id }
                                }
                            }
                        });
                    }
                }
            }

            // Atualizar contatos, se fornecidos
            if (contacts) {
                // Desconectar contatos existentes
                const existingContacts = await tx.contact.findMany({
                    where: {
                        employee: {
                            some: { id }
                        }
                    }
                });

                for (const contact of existingContacts) {
                    await tx.contact.update({
                        where: { id: contact.id },
                        data: {
                            employee: {
                                disconnect: { id }
                            }
                        }
                    });
                }

                // Criar novos contatos
                if (contacts.length > 0) {
                    for (const contact of contacts) {
                        await tx.contact.create({
                            data: {
                                type: contact.type as any,
                                name: contact.name,
                                email: contact.email,
                                phone: contact.phone,
                                role: contact.role,
                                note: contact.note,
                                employee: {
                                    connect: { id: employee.id }
                                }
                            }
                        });
                    }
                }
            }

            // Atualizar detalhes bancários, se fornecidos
            if (bankDetails) {
                // Verificar se já existem detalhes bancários
                const existingBankDetails = await tx.bankDetails.findUnique({
                    where: {
                        employeeId: id
                    }
                });

                if (existingBankDetails) {
                    // Atualizar detalhes bancários existentes
                    await tx.bankDetails.update({
                        where: { employeeId: id },
                        data: {
                            bank: bankDetails.bank,
                            agency: bankDetails.agency,
                            accountNumber: bankDetails.accountNumber,
                            accountType: bankDetails.accountType as any,
                            pixKey: bankDetails.pixKey,
                            paymentCondition: bankDetails.paymentCondition as any,
                            creditLimit: bankDetails.creditLimit,
                            allowCreditOveruse: bankDetails.allowCreditOveruse,
                            suframaRegistration: bankDetails.suframaRegistration
                        }
                    });
                } else {
                    // Criar novos detalhes bancários
                    await tx.bankDetails.create({
                        data: {
                            bank: bankDetails.bank,
                            agency: bankDetails.agency,
                            accountNumber: bankDetails.accountNumber,
                            accountType: bankDetails.accountType as any,
                            pixKey: bankDetails.pixKey,
                            paymentCondition: bankDetails.paymentCondition as any,
                            creditLimit: bankDetails.creditLimit,
                            allowCreditOveruse: bankDetails.allowCreditOveruse,
                            suframaRegistration: bankDetails.suframaRegistration,
                            employee: {
                                connect: { id: employee.id }
                            }
                        }
                    });
                }
            }

            // Atualizar benefícios de compensação, se fornecidos
            if (compensationBenefits) {
                // Verificar se já existem benefícios de compensação
                const existingCompensationBenefits = await tx.compensationBenefits.findUnique({
                    where: {
                        employeeId: id
                    }
                });

                if (existingCompensationBenefits) {
                    // Atualizar benefícios de compensação existentes
                    await tx.compensationBenefits.update({
                        where: { employeeId: id },
                        data: {
                            baseSalary: compensationBenefits.baseSalary,
                            dailyCost: compensationBenefits.dailyCost,
                            paymentType: compensationBenefits.paymentType as any,
                            transportationVoucher: compensationBenefits.transportationVoucher,
                            mealVoucher: compensationBenefits.mealVoucher,
                            healthPlan: compensationBenefits.healthPlan
                        }
                    });
                } else {
                    // Criar novos benefícios de compensação
                    await tx.compensationBenefits.create({
                        data: {
                            baseSalary: compensationBenefits.baseSalary,
                            dailyCost: compensationBenefits.dailyCost,
                            paymentType: compensationBenefits.paymentType as any,
                            transportationVoucher: compensationBenefits.transportationVoucher,
                            mealVoucher: compensationBenefits.mealVoucher,
                            healthPlan: compensationBenefits.healthPlan,
                            employee: {
                                connect: { id: employee.id }
                            }
                        }
                    });
                }
            }

            // Retornar o funcionário com todas as relações
            const updatedEmployee = await tx.employee.findUnique({
                where: { id: employee.id },
                include: {
                    addresses: true,
                    contacts: true,
                    bankDetails: true,
                    compensationBenefits: true
                }
            });

            return updatedEmployee;
        });

        return convertPrismaEmployeeToEntity(result);
    },

    delete: async (id: string): Promise<void> => {
        try {
            // Transação para remover o funcionário e suas relações
            await prisma.$transaction(async (tx) => {
                // Remover detalhes bancários
                await tx.bankDetails.deleteMany({
                    where: { employeeId: id }
                });

                // Remover benefícios de compensação
                await tx.compensationBenefits.deleteMany({
                    where: { employeeId: id }
                });

                // Desconectar endereços
                const existingAddresses = await tx.address.findMany({
                    where: {
                        employees: {
                            some: { id }
                        }
                    }
                });

                for (const address of existingAddresses) {
                    await tx.address.update({
                        where: { id: address.id },
                        data: {
                            employees: {
                                disconnect: { id }
                            }
                        }
                    });
                }

                // Desconectar contatos
                const existingContacts = await tx.contact.findMany({
                    where: {
                        employee: {
                            some: { id }
                        }
                    }
                });

                for (const contact of existingContacts) {
                    await tx.contact.update({
                        where: { id: contact.id },
                        data: {
                            employee: {
                                disconnect: { id }
                            }
                        }
                    });
                }

                // Remover funcionário
                await tx.employee.delete({
                    where: { id }
                });
            });
        } catch (error) {
            logger.error(`Erro ao excluir funcionário ${id}:`, error);
            throw error;
        }
    },

    hasRelations: async (id: string): Promise<boolean> => {
        try {
            const count = await prisma.$transaction([
                prisma.project.count({ where: { responsibleId: id } }),
                prisma.budget.count({ where: { responsibleId: id } }),
                prisma.budgetEmployee.count({ where: { employeeId: id } }),
                prisma.customer.count({ where: { responsibleId: id } }),
                prisma.supplier.count({ where: { responsibleId: id } })
            ]);

            // Verificar se há relações em alguma das tabelas
            return count.some(c => c > 0);
        } catch (error) {
            logger.error(`Erro ao verificar relações do funcionário ${id}:`, error);
            throw error;
        }
    }
};