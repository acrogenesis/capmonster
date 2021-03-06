import { LanguagePoolTypes, QueueTypes } from "./enum";
import { IGetQueueStatsResponse, IGetTaskResultResponse } from "./interfaces";
export declare class CapMonster {
    private api;
    private debug;
    /**
     * Creates an instance of CapMonster.
     *
     * @param {strig} clientKey - The client key provided in your admin panel.
     * @param {boolean} [debugMode=false] - Whether you want to get debug log in the console.
     * @memberof CapMonster
     */
    constructor(clientKey: string, debugMode?: boolean);
    /**
     * Get queue stats
     */
    getQueueStats(queueType: QueueTypes): Promise<IGetQueueStatsResponse>;
    /**
     * Get the account balance.
     */
    getBalance(): Promise<number>;
    /**
     * Helper method to check whether the account balance is greater than the given amount.
     *
     * @param {number} amount - The amount to compare.
     */
    isBalanceGreaterThan(amount: number): Promise<boolean>;
    /**
     * Dispatch a task creation to the service. This will return a taskId.
     *
     * @param {string} task - Task to perform
     * @param {string} websiteKey - The value of the "data-site-key" attribute.
     * @param {string} languagePool - The language pool. Default to English if not provided.
     *
     * @memberof CapMonster
     */
    createTask<T>(task: T, languagePool?: LanguagePoolTypes): Promise<number>;
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
    createTaskRecaptchaV3Proxyless(websiteURL: string, websiteKey: string, minScore: number, pageAction: string, languagePool?: string): Promise<number>;
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
    getTaskResult<T>(taskId: number, retry?: number, retryInterval?: number): Promise<IGetTaskResultResponse<T>>;
}
