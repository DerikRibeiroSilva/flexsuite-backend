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
exports.customerCompanyRepository = void 0;
const client_1 = require("../prisma/client");
exports.customerCompanyRepository = {
    findAll: () => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.customerCompany.findMany({
            orderBy: { name: 'asc' }
        });
    }),
    findById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.customerCompany.findUnique({
            where: { id },
            include: {
                users: true,
                suppliers: true
            }
        });
    }),
    create: (data) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.customerCompany.create({
            data: {
                name: data.name
            }
        });
    }),
    update: (id, data) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.customerCompany.update({
            where: { id },
            data: {
                name: data.name
            }
        });
    }),
    delete: (id) => __awaiter(void 0, void 0, void 0, function* () {
        yield client_1.prisma.customerCompany.delete({
            where: { id }
        });
    }),
    hasRelations: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const count = yield client_1.prisma.$transaction([
            client_1.prisma.user.count({ where: { customerCompanyId: id } }),
            client_1.prisma.supplier.count({ where: { customerCompanyId: id } })
        ]);
        return count[0] > 0 || count[1] > 0;
    })
};
