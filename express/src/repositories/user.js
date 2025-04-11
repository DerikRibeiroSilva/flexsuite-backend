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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const client_1 = require("../prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const logger_1 = require("../utils/logger");
exports.userRepository = {
    findAll: () => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.user.findMany({
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
    }),
    findById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.user.findUnique({
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
    }),
    findByEmail: (email) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.user.findUnique({
            where: { email }
        });
    }),
    create: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { password } = data, userData = __rest(data, ["password"]);
        // Hash da senha antes de salvar
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        return client_1.prisma.user.create({
            data: Object.assign(Object.assign({}, userData), { password: hashedPassword, isVerified: false, isActive: true }),
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
    }),
    update: (id, data) => __awaiter(void 0, void 0, void 0, function* () {
        return client_1.prisma.user.update({
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
    }),
    delete: (id) => __awaiter(void 0, void 0, void 0, function* () {
        yield client_1.prisma.user.delete({
            where: { id }
        });
    }),
    deleteWithTokens: (id) => __awaiter(void 0, void 0, void 0, function* () {
        // Usar uma transação para garantir que os tokens e o usuário sejam excluídos juntos
        yield client_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Primeiro, excluir todos os tokens de autenticação do usuário
            yield tx.authToken.deleteMany({
                where: { userId: id }
            });
            // Em seguida, excluir o usuário
            yield tx.user.delete({
                where: { id }
            });
        }));
        logger_1.logger.info(`Usuário ${id} e seus tokens de autenticação foram excluídos com sucesso.`);
    }),
    hasAuthTokens: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const count = yield client_1.prisma.authToken.count({
            where: { userId: id }
        });
        return count > 0;
    })
};
