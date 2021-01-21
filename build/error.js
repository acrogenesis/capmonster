"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CapMonsterError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
exports.CapMonsterError = CapMonsterError;
