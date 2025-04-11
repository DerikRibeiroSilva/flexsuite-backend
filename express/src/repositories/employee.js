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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeRepository = void 0;
const client_1 = require("../prisma/client");
const logger_1 = require("../utils/logger");
// Função para converter tipos do Prisma para nossos tipos de entidade
const convertPrismaEmployeeToEntity = (prismaEmployee) => {
    return Object.assign({}, prismaEmployee);
};
exports.employeeRepository = {
    findAll: () => __awaiter(void 0, void 0, void 0, function* () {
        const employees = yield client_1.prisma.employee.findMany({
            orderBy: { name: 'asc' },
            include: {
                addresses: true,
                contacts: true,
                bankDetails: true,
                compensationBenefits: true
            }
        });
        return employees.map(convertPrismaEmployeeToEntity);
    }),
    findById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const employee = yield client_1.prisma.employee.findUnique({
            where: { id },
            include: {
                addresses: true,
                contacts: true,
                bankDetails: true,
                compensationBenefits: true
            }
        });
        return employee ? convertPrismaEmployeeToEntity(employee) : null;
    }),
    findByCpf: (cpf) => __awaiter(void 0, void 0, void 0, function* () {
        const employee = yield client_1.prisma.employee.findFirst({
            where: { cpf },
            include: {
                addresses: true,
                contacts: true,
                bankDetails: true,
                compensationBenefits: true
            }
        });
        return employee ? convertPrismaEmployeeToEntity(employee) : null;
    }),
    create: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { addresses, contacts, bankDetails, compensationBenefits } = data, employeeData = __rest(data, ["addresses", "contacts", "bankDetails", "compensationBenefits"]);
        // Transação para criar o funcionário e suas relações
        const result = yield client_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Criar funcionário
            const employee = yield tx.employee.create({
                data: employeeData
            });
            // Criar endereços, se fornecidos
            if (addresses && addresses.length > 0) {
                for (const address of addresses) {
                    yield tx.address.create({
                        data: {
                            type: address.type,
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
                    yield tx.contact.create({
                        data: {
                            type: contact.type,
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
                yield tx.bankDetails.create({
                    data: {
                        bank: bankDetails.bank,
                        agency: bankDetails.agency,
                        accountNumber: bankDetails.accountNumber,
                        accountType: bankDetails.accountType,
                        pixKey: bankDetails.pixKey,
                        paymentCondition: bankDetails.paymentCondition,
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
                yield tx.compensationBenefits.create({
                    data: {
                        baseSalary: compensationBenefits.baseSalary,
                        dailyCost: compensationBenefits.dailyCost,
                        paymentType: compensationBenefits.paymentType,
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
            const createdEmployee = yield tx.employee.findUnique({
                where: { id: employee.id },
                include: {
                    addresses: true,
                    contacts: true,
                    bankDetails: true,
                    compensationBenefits: true
                }
            });
            return createdEmployee;
        }));
        return convertPrismaEmployeeToEntity(result);
    }),
    update: (id, data) => __awaiter(void 0, void 0, void 0, function* () {
        const { addresses, contacts, bankDetails, compensationBenefits } = data, employeeData = __rest(data, ["addresses", "contacts", "bankDetails", "compensationBenefits"]);
        // Transação para atualizar o funcionário e suas relações
        const result = yield client_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Atualizar funcionário
            const employee = yield tx.employee.update({
                where: { id },
                data: employeeData
            });
            // Atualizar endereços, se fornecidos
            if (addresses) {
                // Desconectar endereços existentes
                const existingAddresses = yield tx.address.findMany({
                    where: {
                        employees: {
                            some: { id }
                        }
                    }
                });
                for (const address of existingAddresses) {
                    yield tx.address.update({
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
                        yield tx.address.create({
                            data: {
                                type: address.type,
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
                const existingContacts = yield tx.contact.findMany({
                    where: {
                        employee: {
                            some: { id }
                        }
                    }
                });
                for (const contact of existingContacts) {
                    yield tx.contact.update({
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
                        yield tx.contact.create({
                            data: {
                                type: contact.type,
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
                const existingBankDetails = yield tx.bankDetails.findUnique({
                    where: {
                        employeeId: id
                    }
                });
                if (existingBankDetails) {
                    // Atualizar detalhes bancários existentes
                    yield tx.bankDetails.update({
                        where: { employeeId: id },
                        data: {
                            bank: bankDetails.bank,
                            agency: bankDetails.agency,
                            accountNumber: bankDetails.accountNumber,
                            accountType: bankDetails.accountType,
                            pixKey: bankDetails.pixKey,
                            paymentCondition: bankDetails.paymentCondition,
                            creditLimit: bankDetails.creditLimit,
                            allowCreditOveruse: bankDetails.allowCreditOveruse,
                            suframaRegistration: bankDetails.suframaRegistration
                        }
                    });
                }
                else {
                    // Criar novos detalhes bancários
                    yield tx.bankDetails.create({
                        data: {
                            bank: bankDetails.bank,
                            agency: bankDetails.agency,
                            accountNumber: bankDetails.accountNumber,
                            accountType: bankDetails.accountType,
                            pixKey: bankDetails.pixKey,
                            paymentCondition: bankDetails.paymentCondition,
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
                const existingCompensationBenefits = yield tx.compensationBenefits.findUnique({
                    where: {
                        employeeId: id
                    }
                });
                if (existingCompensationBenefits) {
                    // Atualizar benefícios de compensação existentes
                    yield tx.compensationBenefits.update({
                        where: { employeeId: id },
                        data: {
                            baseSalary: compensationBenefits.baseSalary,
                            dailyCost: compensationBenefits.dailyCost,
                            paymentType: compensationBenefits.paymentType,
                            transportationVoucher: compensationBenefits.transportationVoucher,
                            mealVoucher: compensationBenefits.mealVoucher,
                            healthPlan: compensationBenefits.healthPlan
                        }
                    });
                }
                else {
                    // Criar novos benefícios de compensação
                    yield tx.compensationBenefits.create({
                        data: {
                            baseSalary: compensationBenefits.baseSalary,
                            dailyCost: compensationBenefits.dailyCost,
                            paymentType: compensationBenefits.paymentType,
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
            const updatedEmployee = yield tx.employee.findUnique({
                where: { id: employee.id },
                include: {
                    addresses: true,
                    contacts: true,
                    bankDetails: true,
                    compensationBenefits: true
                }
            });
            return updatedEmployee;
        }));
        return convertPrismaEmployeeToEntity(result);
    }),
    delete: (id) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Transação para remover o funcionário e suas relações
            yield client_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                // Remover detalhes bancários
                yield tx.bankDetails.deleteMany({
                    where: { employeeId: id }
                });
                // Remover benefícios de compensação
                yield tx.compensationBenefits.deleteMany({
                    where: { employeeId: id }
                });
                // Desconectar endereços
                const existingAddresses = yield tx.address.findMany({
                    where: {
                        employees: {
                            some: { id }
                        }
                    }
                });
                for (const address of existingAddresses) {
                    yield tx.address.update({
                        where: { id: address.id },
                        data: {
                            employees: {
                                disconnect: { id }
                            }
                        }
                    });
                }
                // Desconectar contatos
                const existingContacts = yield tx.contact.findMany({
                    where: {
                        employee: {
                            some: { id }
                        }
                    }
                });
                for (const contact of existingContacts) {
                    yield tx.contact.update({
                        where: { id: contact.id },
                        data: {
                            employee: {
                                disconnect: { id }
                            }
                        }
                    });
                }
                // Remover funcionário
                yield tx.employee.delete({
                    where: { id }
                });
            }));
        }
        catch (error) {
            logger_1.logger.error(`Erro ao excluir funcionário ${id}:`, error);
            throw error;
        }
    }),
    hasRelations: (id) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const count = yield client_1.prisma.$transaction([
                client_1.prisma.project.count({ where: { responsibleId: id } }),
                client_1.prisma.budget.count({ where: { responsibleId: id } }),
                client_1.prisma.budgetEmployee.count({ where: { employeeId: id } }),
                client_1.prisma.customer.count({ where: { responsibleId: id } }),
                client_1.prisma.supplier.count({ where: { responsibleId: id } })
            ]);
            // Verificar se há relações em alguma das tabelas
            return count.some(c => c > 0);
        }
        catch (error) {
            logger_1.logger.error(`Erro ao verificar relações do funcionário ${id}:`, error);
            throw error;
        }
    })
};
