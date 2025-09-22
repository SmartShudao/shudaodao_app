/*
# -*- coding:utf-8 -*-
# @License  ：(C)Copyright 2025, 数道智融科技
# @Author   ：李锋
# @Software ：PyCharm
# @Date     ：2025/7/29 下午9:55
# @Desc     ：
*/

// import {RequestManager} from '/scripts/base/request_manager.js';

class ShudaoAIComponent {
    #fetch_url = {
        baseUrl: '/api/v1',
        generateUrl: "/agent/chat",
        getModelUrl: "/models"
    }
    #httpRequest = new RequestManager(this.#fetch_url.baseUrl);
    #fetch_headers;
    // 外部处理函数
    #func_progress;
    // 外部mackdown函数
    #func_markdown;

    // 输出的容器
    #element_container;
    // 输出内容element
    #element_content;
    // 输出思考element
    #element_reasoning;
    // 思考element显示、隐藏按钮
    #element_button;
    // 请求内容
    #response_content = "";
    // 思考内容
    #response_reasoning = "";

    /**
     * @param {Object} [options] - 配置选项
     * @param {string} [options.headers] - 请求头
     * @param {HTMLElement} [options.responseElement] - 输出结果的 DOM 元素
     * @param {function} [options.onProgress] - 流式处理时的进度回调
     * @param {function} [options.onParseMarkdown] - Mackdown格式化函数
     * @param {function} [options.onMessage] - 提示消息
     */
    constructor(options) {
        const {
            headers = {headers: {'Content-Type': 'application/json'}},
            responseElement = null,
            onProgress = null,
            onParseMarkdown = null
        } = options;
        this.#fetch_headers = headers
        this.#element_container = responseElement;

        this.#func_progress = onProgress;
        this.#func_markdown = onParseMarkdown;
        // 初始化滚动处理 - 响应区域
        ScrollManager.initAutoScroll(this.#element_container);
    }

    abort() {
        this.#httpRequest.abort()
        this.showErrorMessage("请求已终止");
        // AbortController.about 导致 click 事件丢失，重新绑定
        this.#element_container.querySelectorAll(".button").forEach(
            (button) => {
                button.removeEventListener('click', this.#response_element_reasoning_button_click);
                button.addEventListener('click', this.#response_element_reasoning_button_click);
            }
        );
    }

    /**
     * 流式POST请求
     * @param {Object} jsonobject - 请求体数据
     * @param {Object} [options={}] - 请求配置
     * @returns {Promise<Response>} - 返回流式响应对象
     */
    async generate(jsonobject, options) {
        this.#initOutputElement();
        const post_options = {...this.#fetch_headers, ...options}
        if (jsonobject.stream) {
            await this.#httpRequest.postStream(this.#fetch_url.generateUrl, jsonobject, post_options)
                .then(async (response) => {
                    this.#element_content.innerHTML = "";
                    await RequestManager.processStream(response.body, (chunk) => {
                        this.#processor_chunk(chunk)
                    });
                })
                .catch(error => {
                    if (error.name === 'AbortError') {
                        return null;
                    }
                    throw this.#httpRequest.showFriendlyError(error,
                        "获取数据失败，可能涉及模型流式响应异常。");
                })
        } else {
            await this.#httpRequest.post(this.#fetch_url.generateUrl, jsonobject, post_options)
                .then(response => {
                    this.#processor_json(response)
                })
                .catch(error => {
                    if (error.name === 'AbortError') {
                        return null;
                    }
                    throw this.#httpRequest.showFriendlyError(error,
                        "获取数据失败，可能涉及模型响应异常。");
                })
        }
    }

    load_models(generateElement, embeddingElement) {
        this.#httpRequest.get(this.#fetch_url.getModelUrl, this.#fetch_headers)
            .then(data => {
                if (generateElement)
                    this.#load_models_dom(generateElement, data["language_models"]);
                if (embeddingElement)
                    this.#load_models_dom(embeddingElement, data["embedding_models"]);
            })
            .catch(() => {
                if (generateElement)
                    generateElement.append(new Option('加载失败'));
                if (embeddingElement)
                    embeddingElement.append(new Option('加载失败'));
            });
    }

    /*
    * 处理 JSON 响应对象并更新 UI
    * @param {HTMLElement} selectElement - 模型选择框的DOM元素
    * @private
    */
    #load_models_dom(selectElement, data) {
        selectElement.replaceChildren();   // 清除子元素
        const fragment = new DocumentFragment();// 使用文档片段提高性能
        const optgroup_local = document.createElement('optgroup');
        const optgroup_remote = document.createElement('optgroup');
        optgroup_local.label = "本地模型";
        optgroup_remote.label = "远程模型"
        fragment.append(optgroup_local);
        fragment.append(optgroup_remote);
        data.forEach(model => {
            if (model.proxy === "local")
                optgroup_local.append(new Option(model.name, model.name))
            else
                optgroup_remote.append(new Option(model.name, model.name))
        });
        selectElement.append(fragment)
    }

    #initOutputElement() {
        this.#response_content = "";
        this.#response_reasoning = "";
        this.#element_content = document.createElement("div");
        this.#element_content.classList.add("content");
        this.#element_content.innerHTML = '<p class="loading">AI正在思考，请稍候...</p>';
        this.#element_reasoning = document.createElement("div");
        this.#element_reasoning.classList.add("reasoning");
        this.#element_reasoning.classList.add("hidden");

        this.#element_button = document.createElement("button");
        this.#element_button.setAttribute("type", "button");
        this.#element_button.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.656 17.344c-1.016-1.015-1.15-2.75-.313-4.925.325-.825.73-1.617 1.205-2.365L3.582 10l-.033-.054c-.5-.799-.91-1.596-1.206-2.365-.836-2.175-.703-3.91.313-4.926.56-.56 1.364-.86 2.335-.86 1.425 0 3.168.636 4.957 1.756l.053.034.053-.034c1.79-1.12 3.532-1.757 4.957-1.757.972 0 1.776.3 2.335.86 1.014 1.015 1.148 2.752.312 4.926a13.892 13.892 0 0 1-1.206 2.365l-.034.054.034.053c.5.8.91 1.596 1.205 2.365.837 2.175.704 3.911-.311 4.926-.56.56-1.364.861-2.335.861-1.425 0-3.168-.637-4.957-1.757L10 16.415l-.053.033c-1.79 1.12-3.532 1.757-4.957 1.757-.972 0-1.776-.3-2.335-.86zm13.631-4.399c-.187-.488-.429-.988-.71-1.492l-.075-.132-.092.12a22.075 22.075 0 0 1-3.968 3.968l-.12.093.132.074c1.308.734 2.559 1.162 3.556 1.162.563 0 1.006-.138 1.298-.43.3-.3.436-.774.428-1.346-.008-.575-.159-1.264-.449-2.017zm-6.345 1.65l.058.042.058-.042a19.881 19.881 0 0 0 4.551-4.537l.043-.058-.043-.058a20.123 20.123 0 0 0-2.093-2.458 19.732 19.732 0 0 0-2.458-2.08L10 5.364l-.058.042A19.883 19.883 0 0 0 5.39 9.942L5.348 10l.042.059c.631.874 1.332 1.695 2.094 2.457a19.74 19.74 0 0 0 2.458 2.08zm6.366-10.902c-.293-.293-.736-.431-1.298-.431-.998 0-2.248.429-3.556 1.163l-.132.074.12.092a21.938 21.938 0 0 1 3.968 3.968l.092.12.074-.132c.282-.504.524-1.004.711-1.492.29-.753.442-1.442.45-2.017.007-.572-.129-1.045-.429-1.345zM3.712 7.055c.202.514.44 1.013.712 1.493l.074.13.092-.119a21.94 21.94 0 0 1 3.968-3.968l.12-.092-.132-.074C7.238 3.69 5.987 3.262 4.99 3.262c-.563 0-1.006.138-1.298.43-.3.301-.436.774-.428 1.346.007.575.159 1.264.448 2.017zm0 5.89c-.29.753-.44 1.442-.448 2.017-.008.572.127 1.045.428 1.345.293.293.736.431 1.298.431.997 0 2.247-.428 3.556-1.162l.131-.074-.12-.093a21.94 21.94 0 0 1-3.967-3.968l-.093-.12-.074.132a11.712 11.712 0 0 0-.71 1.492z" fill="currentColor" stroke="currentColor" stroke-width=".1"></path><path d="M10.706 11.704A1.843 1.843 0 0 1 8.155 10a1.845 1.845 0 1 1 2.551 1.704z" fill="currentColor" stroke="currentColor" stroke-width=".2"></path></svg>' +
            "<span>深度思考</span>" +
            '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="m6 9 6 6 6-6"></path></svg>' +
            '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="m18 15-6-6-6 6"></path></svg>';
        //.textContent = "深度思考";
        this.#element_button.classList.add("button");
        this.#element_button.classList.add("hidden");
        this.#element_button.addEventListener("click",
            this.#response_element_reasoning_button_click);
        this.#element_container.append(this.#element_button);
        this.#element_container.append(this.#element_reasoning);
        this.#element_container.append(this.#element_content);
    }

    #response_element_reasoning_button_click(e) {
        e.preventDefault();
        const handlerElement = e.currentTarget;
        const nextElement = handlerElement.nextElementSibling;
        nextElement.classList.toggle('hidden');
        handlerElement.classList.toggle('button-collapse')
    }

    add_question(text) {
        const question = document.createElement("div");
        const span = document.createElement("span");
        question.classList.add("question");
        span.textContent = text;
        question.append(span)
        this.#element_container.append(question);
    }

    #add_generate_content(text) {
        this.#response_content += text;
        if (this.#func_markdown)
            this.#element_content.innerHTML = this.#func_markdown(this.#response_content);
        else
            this.#element_content.innerHTML = this.#response_content
    }

    #add_generate_reasoning(text) {
        // 处理2个连续回车，一般在结束的时候出现
        if (this.#response_reasoning && this.#response_reasoning.endsWith("\n") && text.startsWith("\n")) {
            return;
        }
        this.#response_reasoning += text;
        if (this.#element_button.classList.contains("hidden")) {
            this.#element_button.classList.remove("hidden");
            this.#element_reasoning.classList.remove("hidden");
        }
        this.#element_reasoning.textContent = this.#response_reasoning;
    }

    /**
     * 处理 JSON 响应对象并更新 UI
     * @param {Object} jsonObject - 从 API 返回的 JSON 响应对象
     * @param {Array} [jsonObject.choices] - 包含生成内容的选项数组
     * @param {Object} [jsonObject.choices.delta] - 流式响应中的增量对象
     * @param {string} [jsonObject.choices.delta.content] - 主内容
     * @param {string} [jsonObject.choices.delta.reasoning_content] - 推理内容
     * @param {Object} [jsonObject.choices.message] - 非流式响应中的消息对象
     * @param {string} [jsonObject.choices.message.content] - 主内容
     * @param {string} [jsonObject.choices.message.reasoning_content] - 推理内容
     * @param {Object} [jsonObject.error] - 异常对象
     * @private
     */
    #processor_json(jsonObject) {
        let enabled_progress = false;
        if (jsonObject.hasOwnProperty("choices")) {
            const content = jsonObject.choices[0]?.delta?.content ||
                jsonObject.choices[0]?.message?.content || '';
            if (content) {
                enabled_progress = true;
                if (this.#element_container)
                    this.#add_generate_content(content)
            }
            const reasoning_content = jsonObject.choices[0]?.delta?.reasoning_content ||
                jsonObject.choices[0]?.message?.reasoning_content || '';
            if (reasoning_content) {
                enabled_progress = true;
                if (this.#element_container)
                    this.#add_generate_reasoning(reasoning_content)
            }
            if (enabled_progress && this.#func_progress)
                this.#func_progress(jsonObject);
        } else if (jsonObject.hasOwnProperty("error")) {
            this.showError(jsonObject)
            if (this.#func_progress)
                this.#func_progress(jsonObject);
        } else {
            if (this.#func_progress)
                this.#func_progress(jsonObject);
        }
    }

    /**
     * 处理 JSON 响应对象
     * @param {string} [chunk] - 返回的快
     * @private
     */
    #processor_chunk(chunk) {
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
            const message = line.replace(/^data: /, '').trim();
            this.#processor_json(JSON.parse(message))
        }
    }

    /*
    *  显示错误信息的函数，用于将错误对象中的内容格式化并展示在用户界面中。
    *  * @param {Object} error - 错误对象，包含以下属性：
    *   - code: 错误代码（用于标识错误类型）
    *   - message: 错误描述信息（用户可读的错误信息）
    *   - details: 可选的详细错误数据（如请求参数、响应内容等）
    */
    showError(error) {
        if (this.#element_button)
            this.#element_button.classList.add("hidden");
        if (this.#element_reasoning)
            this.#element_reasoning.classList.add("hidden");
        if (this.#element_content)
            this.#element_content.classList.add("hidden");
        const title = `${error.message}`;
        delete error.message;
        const content = JSON.stringify(error, null, 5);
        this.#showErrorObject(title, content);
    }

    #showErrorObject(title, content) {
        let error_content = `<div class="error-object">`;
        if (title)
            error_content += `<span class="title">${title}</span>`;
        if (content)
            error_content += `<span class="content">${content}</span>`;
        error_content += `</div>`
        this.#element_container.innerHTML += error_content;
    }

    showErrorMessage(message) {
        this.#element_container.innerHTML += `<div class="error"><span>${message}</span></div>`;
    }

    showMessage(message) {
        this.#element_container.innerHTML += `<div class="info"><span>${message}</span></div>`;
    }
}
