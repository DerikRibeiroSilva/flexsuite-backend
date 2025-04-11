"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logger = {
    info: (message, meta) => {
        console.log(`[INFO] ${message}`, meta || '');
    },
    error: (message, error) => {
        console.error(`[ERROR] ${message}`, error || '');
    },
    debug: (message, meta) => {
        console.log(`[DEBUG] ${message}`, meta || '');
    },
    warn: (message, meta) => {
        console.warn(`[WARN] ${message}`, meta || '');
    }
};
