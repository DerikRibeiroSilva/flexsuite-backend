"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_company_1 = __importDefault(require("./customer-company"));
const auth_1 = __importDefault(require("./auth"));
const employee_1 = __importDefault(require("./employee"));
const user_1 = __importDefault(require("./user"));
const router = (0, express_1.Router)();
router.use('/api/auth', auth_1.default);
router.use('/api/v1/customer-companies', customer_company_1.default);
router.use('/api/v1/employees', employee_1.default);
router.use('/api/v1/users', user_1.default);
exports.default = router;
