/*
# -*- coding:utf-8 -*-
# @License  ：(C)Copyright 2025, 数道智融科技
# @Author   ：李锋
# @Software ：PyCharm
# @Date     ：2025/7/29 下午9:55
# @Desc     ：
*/

class RequestManager {
    #xmlHttpRequest = null;
    #controller = null;

    /**
     * 创建 RequestManager 实例
     * @param {string} [baseUrl=''] - 请求的基础URL
     */
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
    }

    /**
     * 核心请求方法
     * @param {string} url                  - 请求地址（会自动拼接baseUrl）
     * @param {Object} [options]            - 请求配置选项
     * @param {string} [options.method]     - 请求方法
     * @param {Object} [options.headers]    - 自定义请求头
     * @param {FormData} [options.formData]     - 本次请求的超时时间（会覆盖默认值）
     * @returns {Promise<any>}              - 返回Promise，解析为JSON数据或流式响应对象
     // * @throws {ShudaoHttpError} - 请求失败时抛出带有状态码的错误
     */
    xmlHttpRequest(url, options) {
        return new Promise((promise_then, promise_catch) => {
            const xhr = new XMLHttpRequest();
            this.#xmlHttpRequest = xhr;
            // 设置 headers
            if (options.headers) {
                Object.keys(options.headers).forEach(key => {
                    xhr.setRequestHeader(key, options.headers[key]);
                });
            }
            // debugger
            if (CookieManager.get("token") !== null) {
                xhr.setRequestHeader("Authorization", "Bearer " + CookieManager.get("token"))
            }
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const result = JSON.parse(xhr.responseText)
                        if (result.hasOwnProperty("error"))
                            promise_catch(result)
                        else
                            promise_then(result);
                    } catch (e) {
                        promise_catch(new Error('上传失败:解析响应失败'));
                    }
                } else {
                    const data = JSON.parse(xhr.responseText);
                    promise_catch(new Error(`上传失败:${data.detail}`));
                }
            });
            xhr.addEventListener('error', () => {
                promise_catch(new Error('上传失败:过程中发生错误'));
            });

            xhr.addEventListener('abort', () => {
                promise_catch(new Error('上传取消'));
            });
            xhr.open(options.method, this.baseUrl + url, true);
            xhr.send(options.formData);
        });
    }

    /**
     * 核心请求方法
     * @param {string} url - 请求地址（会自动拼接baseUrl）
     * @param {Object} [options] - 请求配置选项
     * @param {Object} [options.headers] - 自定义请求头
     * @param {number} [options.timeout] - 本次请求的超时时间（会覆盖默认值）
     * @param {string} [options.responseType] - 响应类型（stream 表示流式响应）
     * @returns {Promise<any>} - 返回Promise，解析为JSON数据或流式响应对象
     * @throws {ShudaoHttpError} - 请求失败时抛出带有状态码的错误
     */
    async request(url, options = {}) {
        // 取消之前的请求和超时定时器
        this.abort();
        // 创建新的AbortController
        this.#controller = new AbortController();
        try {
            let fetch_init = {
                signal: this.#controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                },
                ...options,
            }
            if (CookieManager.get("token") !== null) {
                fetch_init.headers = {
                    ...fetch_init.headers,
                    ...{
                        "Authorization": "Bearer " + CookieManager.get("token"),
                    }
                }
            }
            const response = await fetch(`${this.baseUrl}${url}`, fetch_init);
            if (!response.ok) {
                const json_response = await response.json();
                const errorCode = response.status
                const errorMessage = !response.statusText ? '请求失败' : response.statusText;
                let errorDetails = {
                    url: `${response.url}`
                }
                if (json_response.error)
                    errorDetails = {
                        ...errorDetails,
                        ...{
                            code: json_response.code,
                            message: json_response.message,
                            ...json_response.error
                        }
                    };
                else
                    errorDetails = {...errorDetails, ...json_response}
                throw new ShudaoHttpError(errorCode, errorMessage, errorDetails);
            }
            // 如果是流式响应，直接返回响应对象
            if (options.responseType === 'stream') {
                return response;
            }
            const result_data = await response.json();
            if (result_data.hasOwnProperty("error")) {
                throw result_data;
            }
            return result_data;
        } catch (error) {
            if (error.name === 'AbortError') {
                return null;
            }
            throw error;
        }
    }

    /**
     * 流式POST请求
     * @param {string} url - 请求地址
     * @param {Object} json_body - 请求体数据
     * @param {Object} [options={}] - 请求配置
     * @returns {Promise<Response>} - 返回流式响应对象
     */
    postStream(url, json_body, options = {}) {
        return this.request(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(json_body),
            responseType: 'stream'
        });
    }

    /**
     * GET请求
     * @param {string} url - 请求地址
     * @param {Object} [options={}] - 请求配置
     * @returns {Promise<any>} - 返回JSON数据
     */
    get(url, options = {}) {
        return this.request(url, {
            ...options,
            method: 'GET'
        });
    }

    /**
     * POST请求
     * @param {string} url - 请求地址
     * @param {Object} json_body - 请求体数据
     * @param {Object} [options={}] - 请求配置
     * @returns {Promise<any>} - 返回JSON数据
     */
    post(url, json_body, options = {}) {
        return this.request(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(json_body),
        });
    }

    /**
     * PUT请求
     * @param {string} url - 请求地址
     * @param {Object} json_body - 请求体数据
     * @param {Object} [options={}] - 请求配置
     * @returns {Promise<any>} - 返回JSON数据
     */
    put(url, json_body, options = {}) {
        return this.request(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(json_body),
        });
    }

    /**
     * PATCH请求
     * @param {string} url - 请求地址
     * @param {Object} json_body - 请求体数据
     * @param {Object} [options={}] - 请求配置
     * @returns {Promise<any>} - 返回JSON数据
     */
    patch(url, json_body, options = {}) {
        return this.request(url, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(json_body)
        });
    }

    /**
     * DELETE请求
     * @param {string} url - 请求地址
     * @param {Object} json_body - 请求体数据
     * @param {Object} [options={}] - 请求配置
     * @returns {Promise<any>} - 返回JSON数据
     */
    delete(url, json_body, options = {}) {
        return this.request(url, {
            ...options,
            method: 'DELETE',
            body: JSON.stringify(json_body),
        });
        // return this.request(url, {...options, method: 'DELETE'});
    }

    /**
     * 中止当前正在进行的请求
     */
    abort() {
        if (this.#controller) {
            this.#controller.abort();
            this.#controller = null;
        }
        if (this.#xmlHttpRequest) {
            this.#xmlHttpRequest.abort();
            this.#xmlHttpRequest = null;
        }
    }

    /**
     * 更友好的错误提示
     * @param {Error} error         - 原始错误
     * @param {string} message      - 错误消息
     * @returns {Error}             - 返回错误的Json
     */
    showFriendlyError(error, message) {
        const friendly_error = new Error(message)
        friendly_error.code = error.code || 500;
        friendly_error.name = error.name || "ShudaoHttpError";
        friendly_error.error = error.error;
        return friendly_error;
    }


    /**
     * 流式数据处理辅助方法
     * @param {ReadableStream} stream - 可读流
     * @param {Function} processor - 处理每个数据块的函数
     */
    static async processStream(stream, processor) {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        try {
            while (true) {
                const {done, value} = await reader.read();
                if (done) break;
                const text = decoder.decode(value, {stream: true});
                if (text.replace(/\r\n|\n/g, "") === 'data: [DONE]')
                    continue;
                // 偶发直接返回多个token，并带上data: [DONE]结尾
                const message = text.replace('data: [DONE]', '').trim();
                processor(message);
                // processor(text);
            }
        } finally {
            reader.releaseLock();
        }
    };
}

/**
 * HTTP请求错误类
 */
class ShudaoHttpError extends Error {
    /**
     * 创建HttpFetchManagerError实例
     * @param {number} code     - HTTP状态码
     * @param {string} message  - 错误信息
     * @param {object} details  - 更详细的错误
     */
    constructor(code, message, details) {
        super(message);
        this.code = code;
        this.name = 'ShudaoHttpError';
        this.error = {
            message: message,
            details: details
        }
    }
}

