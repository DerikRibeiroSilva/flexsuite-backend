"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentType = exports.WorkShift = exports.PaymentRegime = exports.Department = exports.MaritalStatus = exports.Gender = exports.Status = void 0;
var Status;
(function (Status) {
    Status["ATIVO"] = "ATIVO";
    Status["INATIVO"] = "INATIVO";
})(Status || (exports.Status = Status = {}));
var Gender;
(function (Gender) {
    Gender["HOMEM"] = "HOMEM";
    Gender["MULHER"] = "MULHER";
})(Gender || (exports.Gender = Gender = {}));
var MaritalStatus;
(function (MaritalStatus) {
    MaritalStatus["SOLTEIRO"] = "SOLTEIRO";
    MaritalStatus["CASADO"] = "CASADO";
    MaritalStatus["DIVORCIADO"] = "DIVORCIADO";
    MaritalStatus["VIUVO"] = "VIUVO";
})(MaritalStatus || (exports.MaritalStatus = MaritalStatus = {}));
var Department;
(function (Department) {
    Department["ADMINISTRATIVO"] = "ADMINISTRATIVO";
    Department["OPERACIONAL"] = "OPERACIONAL";
    Department["COMERCIAL"] = "COMERCIAL";
    Department["OUTRO"] = "OUTRO";
    Department["OPERACAO"] = "OPERACAO";
    Department["VENDAS"] = "VENDAS";
    Department["ORCAMENTO"] = "ORCAMENTO";
    Department["SUPERVISION"] = "SUPERVISION";
    Department["LOGISTICA"] = "LOGISTICA";
    Department["QUALIDADE"] = "QUALIDADE";
    Department["ATENDIMENTO_AO_CLIENTE"] = "ATENDIMENTO_AO_CLIENTE";
    Department["RECURSOS_HUMANOS"] = "RECURSOS_HUMANOS";
    Department["FINANCEIRO"] = "FINANCEIRO";
    Department["MARKETING"] = "MARKETING";
    Department["PROJETOS"] = "PROJETOS";
    Department["SEGURANCA_DO_TRABALHO"] = "SEGURANCA_DO_TRABALHO";
    Department["TI"] = "TI";
    Department["COMPRAS"] = "COMPRAS";
    Department["MANUTENCAO"] = "MANUTENCAO";
})(Department || (exports.Department = Department = {}));
var PaymentRegime;
(function (PaymentRegime) {
    PaymentRegime["CLT"] = "CLT";
    PaymentRegime["CLTD"] = "CLTD";
    PaymentRegime["TERCEIRO"] = "TERCEIRO";
})(PaymentRegime || (exports.PaymentRegime = PaymentRegime = {}));
var WorkShift;
(function (WorkShift) {
    WorkShift["TEMPO_INTEGRAL"] = "TEMPO_INTEGRAL";
    WorkShift["PARCIAL"] = "PARCIAL";
    WorkShift["REMOTO"] = "REMOTO";
    WorkShift["HIBRIDO"] = "HIBRIDO";
})(WorkShift || (exports.WorkShift = WorkShift = {}));
var PaymentType;
(function (PaymentType) {
    PaymentType["MENSAL"] = "MENSAL";
    PaymentType["QUINZENAL"] = "QUINZENAL";
    PaymentType["SEMANAL"] = "SEMANAL";
    PaymentType["DIARIO"] = "DIARIO";
})(PaymentType || (exports.PaymentType = PaymentType = {}));
