"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const apisauce_1 = require("apisauce");
const enum_1 = require("./enum");
const error_1 = require("./error");
class CapMonster {
    /**
     * Creates an instance of CapMonster.
     *
     * @param {strig} clientKey - The client key provided in your admin panel.
     * @param {boolean} [debugMode=false] - Whether you want to get debug log in the console.
     * @memberof CapMonster
     */
    constructor(clientKey, debugMode = false) {
        this.api = apisauce_1.create({
            baseURL: "https://api.capmonster.cloud"
        });
        this.debug = debugMode;
        // Auto-fill client key on each request.
        this.api.addRequestTransform(request => {
            if (!request.data) {
                request.data = { clientKey };
            }
            else {
                request.data.clientKey = clientKey;
            }
        });
    }
    /**
     * Get queue stats
     */
    getQueueStats(queueType) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = (yield this.api.post("getQueueStats", {
                queueId: queueType
            }));
            return response.data;
        });
    }
    /**
     * Get the account balance.
     */
    getBalance() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = (yield this.api.post("getBalance"));
            if (response.ok && response.data.errorId === 0) {
                return response.data.balance;
            }
            throw new error_1.CapMonsterError(response.data.errorCode, response.data.errorDescription);
        });
    }
    /**
     * Helper method to check whether the account balance is greater than the given amount.
     *
     * @param {number} amount - The amount to compare.
     */
    isBalanceGreaterThan(amount) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getBalance()) > amount;
        });
    }
    /**
     * Dispatch a task creation to the service. This will return a taskId.
     *
     * @param {string} task - Task to perform
     * @param {string} websiteKey - The value of the "data-site-key" attribute.
     * @param {string} languagePool - The language pool. Default to English if not provided.
     *
     * @memberof CapMonster
     */
    createTask(task, languagePool = enum_1.LanguagePoolTypes.ENGLISH) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = (yield this.api.post("createTask", {
                languagePool,
                task
            }));
            if (response.ok && response.data.errorId === 0) {
                return response.data.taskId;
            }
            throw new error_1.CapMonsterError(response.data.errorCode, response.data.errorDescription);
        });
    }
    /**
     *
     * @param {string} websiteURL - The URL where the captcha is defined.
     * @param {string} websiteKey - The value of the "data-site-key" attribute.
     * @param {string} languagePool - The language pool. Default to English if not provided.
     * @param {number} minScore - minimum score you want to get
     * @param {string} pageAction - the action name is defined by the website owner
     * @returns {Promise<number>}
     * @memberof CapMonster
     */
    createTaskRecaptchaV3Proxyless(websiteURL, websiteKey, minScore, pageAction, languagePool = "en") {
        return __awaiter(this, void 0, void 0, function* () {
            const response = (yield this.api.post("createTask", {
                languagePool,
                task: {
                    minScore,
                    pageAction,
                    type: enum_1.TaskTypes.RECAPTCHA_PROXYLESS,
                    websiteKey,
                    websiteURL
                }
            }));
            if (response.ok && response.data.errorId === 0) {
                if (this.debug) {
                    console.log(`Task [ ${response.data.taskId} ] - Created`);
                }
                return response.data.taskId;
            }
            throw new Error(response.data.errorDescription);
        });
    }
    /**
     * Check a task to be resolved. Will try for given amount at the give time interval.
     *
     * @param {number} taskId - The task ID you want to check result.
     * @param {number} [retry=12] - The number of time the request must be tryed if worker is busy.
     * @param {number} [retryInterval=10000] - The amount of time before first and each try.
     *
     * @see createTask
     * @memberof CapMonster
     */
    getTaskResult(taskId, retry = 12, retryInterval = 10000) {
        return __awaiter(this, void 0, void 0, function* () {
            let retryCount = 0;
            return new Promise((resolve, reject) => {
                const routine = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    if (this.debug) {
                        console.log(`Task [ ${taskId} ] - Retry : ${retryCount}`);
                    }
                    if (retryCount > retry) {
                        if (this.debug) {
                            console.log(`Task [${taskId}] - Exceeded retry count [ ${retry} ].`);
                        }
                        clearInterval(routine);
                        reject(new Error("L'appel est timeout."));
                        return;
                    }
                    const response = (yield this.api.post("getTaskResult", {
                        taskId
                    }));
                    retryCount++; // We update the timeout count
                    // API service failure
                    if (response.ok && response.data.errorId > 0) {
                        reject(new error_1.CapMonsterError(response.data.errorCode, response.data.errorDescription));
                    }
                    // Generic failure
                    if (!response.ok || !response.data || response.data.errorId !== 0) {
                        clearInterval(routine);
                        reject(new Error(response.data && response.data.hasOwnProperty("errorDescription")
                            ? response.data.errorDescription
                            : "http request to get task result failed"));
                        return;
                    }
                    // If request is OK, we resolve
                    if (response.data.status === enum_1.TaskStatus.READY) {
                        if (this.debug) {
                            console.log(`Task [ ${taskId} ] - Hash found !`);
                        }
                        clearInterval(routine);
                        resolve(response.data);
                        return;
                    }
                }), retryInterval);
            });
        });
    }
}
exports.CapMonster = CapMonster;
