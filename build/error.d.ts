import { ErrorCodes } from "./enum";
export declare class CapMonsterError extends Error {
    readonly code: ErrorCodes;
    constructor(code: ErrorCodes, message: string);
}
