export const logger = {
    info: (message: string, meta?: any) => {
        console.log(`[INFO] ${message}`, meta || '');
    },
    error: (message: string, error?: any) => {
        console.error(`[ERROR] ${message}`, error || '');
    },
    debug: (message: string, meta?: any) => {
        console.log(`[DEBUG] ${message}`, meta || '');
    },
    warn: (message: string, meta?: any) => {
        console.warn(`[WARN] ${message}`, meta || '');
    }
};