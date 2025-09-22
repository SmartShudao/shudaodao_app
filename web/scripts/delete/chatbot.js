const chatbot = {
    // 定义常量
    ASSISTANT_MESSAGE: '你好！我是我市不动产登记中心的业务咨询智能体，您的AI助手。有什么我可以帮助你的吗？',
    ASSISTANT_ROLE: '不动产登记中心「AI」工作人员',
    CHAT_TITLE: '新对话',
    CHAT_WAITING: '...',
    USER_ROLE: '咨询的问题',
    URL_CHAT_POST: '/api/chatbot/stream',
    URL_CHAT_GET: '/api/chatbot/dialogue',
    URL_CHAT_MODIFY: '/api/chatbot/dialogue',
    URL_CHAT_DELETE: '/api/chatbot/dialogue',
    URL_CHAT_HISTORY: '/api/chatbot/history',
    URL_CHAT_MODELS: "/api/v1/models",

    // 新对话按钮
    chatNewBtn: null,
    // 菜单按钮
    chatMenuBtn: null,
    // 发送按钮
    sendButton: null,
    // 修改按钮
    modifyButton: null,
    // 删除按钮
    deleteButton: null,

    // 对话标题
    chatTitle: null,
    // 侧边栏
    sidebar: null,
    // 对话消息区
    chatMessages: null,
    // 对话历史
    chatHistory: null,

    // 用户标签
    chatUser: null,
    // 用户输入消息
    messageInput: null,
    // 用户输出消息
    messageOutput: null,

    // 流控制器
    controller: null,
    // 正在发送
    isSending: false,

    // 模型选择
    modelsList: null,
    // 深度思考
    enable_thinking: null,
    // 助理类型
    assistant_type: null,


    // 初始化用户
    initializeUser: function (index = 0) {
        if (index === 0) {
            this.chatUser.user_id = 'shu_dao_zhi_rong_567890';
            // this.chatUser.textContent = '数道智融科技「某用户」'
        } else if (index === 1) {
            debugger
            this.chatUser.user_id = 'shu_dao_zhi_rong_123456';
            // this.chatUser.textContent = '数道智融科技「管理员」'
        }
        // 登录成果加载
        this.initializeHistory(this.chatUser.user_id)
    },
    // 对象初始化
    init: function () {
        // 获取容器
        this.chatContainer = document.getElementById('chat_Container')
        // 从容器中按样式名字去获取
        this.sidebar = this.chatContainer.querySelector('.sidebar');
        this.chatMenuBtn = this.chatContainer.querySelector('.chat-menu-btn');
        this.chatNewBtn = this.chatContainer.querySelector('.chat-new-btn');
        this.chatHistory = this.chatContainer.querySelector('.chat-history');
        this.chatMessages = this.chatContainer.querySelector('.chat-messages');
        this.messageInput = this.chatContainer.querySelector('.input-textarea');
        this.modelsList = document.getElementById("models_list")
        this.assistant_type = document.getElementById("assistant_type")
        this.enable_thinking = document.getElementById("enable_thinking")
        this.sendButton = this.chatContainer.querySelector('.chat-send-btn');
        this.chatTitle = this.chatContainer.querySelector('.chat-title');
        this.chatUser = this.chatContainer.querySelector(".chat-username");
        this.messageOutput = null;
        this.isSending = false;
        this.modifyButton = this.chatContainer.querySelector(".chat-modify-btn");
        this.deleteButton = this.chatContainer.querySelector(".chat-delete-btn");
        // 设置事件监听器
        this.setupEventListeners();
        // 自动滚动
        this.chatMessages.autoScroll = true
    },
    // 添加 回答消息
    addAnswerElement: function (inputValue) {
        const templates = this.getElementTemplates();
        const msgElement = document.createElement('div');
        msgElement.className = 'message';
        msgElement.innerHTML = templates.AI_MESSAGE_TEMPLATE.replace(
            '{ASSISTANT_MESSAGE}', inputValue);
        this.chatMessages.appendChild(msgElement);
        this.scrollBottom();
        return msgElement.getElementsByClassName('message-text')[0];
    },
    // 添加 历史消息清单
    addHistoryElement: function (id, title) {
        const element = document.createElement('div');
        element.className = 'chat-item';
        element.id = id;
        element.textContent = title;
        this.chatHistory.appendChild(element);
        return element
    },
    // 添加 咨询问题
    addQuestionElement: function (inputValue) {
        const templates = this.getElementTemplates();
        const msgElement = document.createElement('div');
        msgElement.className = 'message';
        msgElement.innerHTML = templates.USER_MESSAGE_TEMPLATE.replace(
            '{USER_MESSAGE}', inputValue);
        this.chatMessages.appendChild(msgElement);
        this.scrollBottom();
        return msgElement.getElementsByClassName('message-text')[0];
    },
    // 获取消息模版
    getElementTemplates: function () {
        return {
            AI_MESSAGE_TEMPLATE: `
                <div class='message-content'>
                    <div class='message-role'><div class='message-avatar assistant-avatar'>AI</div>${this.ASSISTANT_ROLE}</div>
                    <div class='message-text assistant-message markdown-container'>{ASSISTANT_MESSAGE}</div>
                </div>`,
            USER_MESSAGE_TEMPLATE: `
                <div class='message-content'>
                    <div class='message-role'><div class='message-avatar user-avatar'>我</div>${this.USER_ROLE}</div>
                    <div class='message-text user-message'>{USER_MESSAGE}</div>
                </div>`
        };
    },
    // 初始化对话
    initializeNewChat: function (boolAssistant = true) {
        this.chatMessages.innerHTML = ""
        this.chatTitle.chat_id = "";
        this.chatTitle.textContent = this.CHAT_TITLE; // 更新标题
        if (boolAssistant)
            this.addAnswerElement(this.ASSISTANT_MESSAGE);    // 添加默认记录
        // 取消对话历史列表高亮显式
        this.chatHistory.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
        this.closeSider();                       // 如果是移动端，关闭侧边栏
        this.messageInput.focus();
    },
    // 初始化历史集合
    initializeHistory: function (userID) {
        //根据用户ID从会话管理中获取所有会话，列在左侧
        this.chatHistory.innerHTML = "";
        this.fetchChatHistory(userID);
    },

    // 如果是移动端，关闭侧边栏
    closeSider: function () {
        if (window.innerWidth <= 768) {
            this.sidebar.classList.remove('open');
        }
    },
    // 验证历史对话是否选择
    validHistorySelected: function () {
        const activeElement = this.chatHistory.querySelector(".active")
        if (activeElement === null) {
            alert("请先选择一条会话记录")
            return activeElement;
        }
        return activeElement;
    },
    // 发送按钮开始点击
    sendButton_Start: function (prompt) {
        // 添加用户消息
        this.addQuestionElement(prompt);
        // 添加AI回复
        this.messageOutput = this.addAnswerElement(this.CHAT_WAITING);
        this.messageOutput._context = "";
        // 设置标记
        this.isSending = true;
        // 修改发送按钮图标
        this.sendButton.innerHTML = '<i class="fas fa-stop"></i>'
    },
    // 发送按钮点击结束
    sendButton_End: function (clearInput) {
        // 清空输入框
        if (clearInput) {
            this.messageInput.value = '';
            this.messageInput.style.height = 'auto';
        }
        // 修改发送按钮图标
        this.sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>'
        this.isSending = false;
    },
    // 使用Fetch API 删除当前对话
    fetchDeleteChat: async function (id) {
        this.chatMessages.autoScroll = true
        this.scrollBottom()
        streamFetchJson(this.URL_CHAT_DELETE, {
            method: "DELETE",
            data: {
                user_id: this.chatUser.user_id,
                chat_id: id
            },
            onChunk: (chunk) => {
                if (chunk.sate !== 'true')
                    return;
                const activeElement = this.chatHistory.querySelector(".active")
                if (activeElement != null) {
                    activeElement.remove()
                    this.initializeNewChat(true);
                }
            }
        }).catch(error => {
            this.addAnswerElement(`发生错误: ${error.message}`)
        });
    },
    // 使用Fetch API 修改对话标题
    fetchModifyChat: async function (id, title) {
        streamFetchJson(this.URL_CHAT_MODIFY, {
            method: "PUT",
            data: {
                chat_title: title,
                user_id: this.chatUser.user_id,
                chat_id: id
            },
            onChunk: (chunk) => {
                const activeElement = this.chatHistory.querySelector(".active")
                if (activeElement != null) {
                    activeElement.textContent = chunk.chat_title;
                    this.chatTitle.textContent = chunk.chat_title;
                }
            }
        }).catch(error => {
            this.addAnswerElement(`发生错误: ${error.message}`)
        });
    },
    // 使用Fetch API 获取对话消息
    fetchChatMessage: async function (chat_id) {
        this.chatMessages.autoScroll = true
        this.scrollBottom()
        streamFetchJson(this.URL_CHAT_GET, {
            method: "POST",
            data: {
                user_id: this.chatUser.user_id,
                chat_id: chat_id
            },
            onChunk: (chunk) => {
                if (chunk.user === "user")
                    this.addQuestionElement(chunk.content)
                else if (chunk.user === "assistant") {
                    let msgElement = this.addAnswerElement("")
                    msgElement.innerHTML = marked.parse(chunk.content);
                }
                this.scrollBottom()
            }
        }).then(data => {
            this.scrollBottom();
        }).catch(error => {
            this.addAnswerElement(`发生错误: ${error.message}`)
        });
        this.sendButton_End(false);
    },
    // 使用Fetch API 获取历史对话
    fetchChatHistory: async function (user_id) {
        streamFetchJson(this.URL_CHAT_HISTORY, {
            method: "POST",
            data: {
                user_id: user_id
            },
            onChunk: (chunk) => {
                this.addHistoryElement(chunk.id, chunk.title);
            }
        }).catch(error => {
            this.addAnswerElement(`发生错误: ${error.message}`)
        });
    },

    // 使用Fetch API 获取提问答案
    fetchAskQuestion: async function (question = '') {
        this.chatMessages.autoScroll = true
        this.scrollBottom()
        this.controller = new AbortController();
        console.log("assistant_type.selectvalue", this.assistant_type.options[this.assistant_type.selectedIndex].value)
        const model_think = !this.enable_thinking.disabled && this.enable_thinking.checked
        streamFetchJson(this.URL_CHAT_POST, {
            abortCtrl: this.controller,
            method: "POST",
            data: {
                model: this.modelsList.options[this.modelsList.selectedIndex].text,
                chat_type: this.assistant_type.options[this.assistant_type.selectedIndex].value,
                chat_text: question,
                is_think: model_think,
                user_id: this.chatUser.user_id,
                chat_id: this.chatTitle.chat_id
            },
            onChunk: (chunk) => {
                this.processDataAnswer(chunk);
                this.scrollBottom();
            }
        }).then(data => {
            this.messageOutput.innerHTML += '<span style=\"font-size: 9pt\"><br>---------------------------------<br>' +
                '回复内容由 AI 生成（仅供参考），请仔细甄别</span>';
            this.scrollBottom();
            this.sendButton_End(true);
        }).catch(error => {
            this.sendButton_End(false);
            this.addAnswerElement(`发生错误: ${error.message}`)
        });
    },
    // 处理提问返回回答数据
    processDataAnswer: function (jsonObj) {
        if ("chat_id" in jsonObj) {
            this.chatTitle.chat_id = jsonObj.chat_id;
            this.chatTitle.textContent = jsonObj.chat_title;
            this.messageInput.value = '';
            // 加到左侧历史并高亮
            let new_item = this.addHistoryElement(jsonObj.chat_id, jsonObj.chat_title);
            new_item.classList.add('active');
        } else if ("chat_think" in jsonObj) {
            this.messageOutput.thinkElement._ontent += jsonObj.chat_think
            this.messageOutput.thinkElement.innerHTML = marked.parse(this.messageOutput.thinkElement._ontent);
        } else if ("chat_text" in jsonObj) {
            // console.log("深度思考的勾选状态：", !this.enable_thinking.disabled && this.enable_thinking.checked)
            // console.log(jsonObj)
            if (!this.enable_thinking.disabled && this.enable_thinking.checked) {
                this.messageOutput.textElement._ontent += jsonObj.chat_text
                this.messageOutput.textElement.innerHTML = marked.parse(this.messageOutput.textElement._ontent);
            } else {
                this.messageOutput._ontent += jsonObj.chat_text
                this.messageOutput.innerHTML = marked.parse(this.messageOutput._ontent);
            }
        }
    },
    // 设置事件监听
    setupEventListeners: function () {
        this.modifyButton.addEventListener('click', async () => {
            const activeElement = this.validHistorySelected();
            if (activeElement === null)
                return;
            const name = prompt("请输入新对话名", this.chatTitle.textContent);
            if (name !== null) {
                await this.fetchModifyChat(activeElement.id, name)
            }
        });
        this.deleteButton.addEventListener('click', async () => {
            const activeElement = this.validHistorySelected();
            if (activeElement === null)
                return;
            const result = confirm("你确定要执行此操作吗？");
            if (result) {
                await this.fetchDeleteChat(activeElement.id);
            }
        });
        // 点击聊天消息区域隐藏侧边栏
        this.chatMessages.addEventListener('click', () => {
            this.sidebar.classList.remove('open');
        });
        // 点击输入区域隐藏侧边栏
        this.messageInput.addEventListener('click', () => {
            this.sidebar.classList.remove('open');
        });
        // 切换侧边栏显示
        this.chatMenuBtn.addEventListener('click', () => {
            this.sidebar.classList.toggle('open');
        });
        // 新对话按钮
        this.chatNewBtn.addEventListener('click', () => {
            this.initializeNewChat(true);
        });
        // 发送按钮点击
        this.sendButton.addEventListener('click', async () => {
            if (this.isSending) {
                if (this.controller) {
                    this.controller.abort();
                    this.controller = null;
                }
                this.sendButton_End(false)                   // 停止发送状态
            } else {
                // 输入框无内容
                const prompt = this.messageInput.value.trim();
                if (!prompt) return;
                this.sendButton_Start(prompt)                  // 开始发送状态
                this.messageOutput._ontent = "";
                this.messageOutput.innerHTML = "";
                if (!this.enable_thinking.disabled && this.enable_thinking.checked) {
                    const _element1 = document.createElement("div")
                    _element1.className = "message-think"
                    this.messageOutput.append(_element1)
                    this.messageOutput.thinkElement = this.messageOutput.querySelector(".message-think");
                    this.messageOutput.append(document.createElement("div"))
                    this.messageOutput.textElement = this.messageOutput.lastElementChild
                    this.messageOutput.thinkElement._ontent = "";
                    this.messageOutput.textElement._ontent = "";
                }
                await this.fetchAskQuestion(prompt);
            }
        });
        // 按Enter发送消息
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendButton.click();
            }
        });
        // 输入框动态调整高度
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = (this.messageInput.scrollHeight) + 'px';
            this.sendButton.disabled = this.messageInput.value.trim() === ''; // 启用/禁用发送按钮
        });
        // 聊天历史项 点击
        this.chatHistory.addEventListener('click', async (e) => {
            if (e.target.classList.contains('chat-item')) {
                this.initializeNewChat(false);              // 重置聊天记录
                e.target.classList.add('active');                    // 设置对话历史列表高亮显式
                this.chatTitle.textContent = e.target.textContent;   // 更新标题
                this.chatTitle.chat_id = e.target.id;
                // e.target.parentElement
                // // AI 获取历史对话
                // if (this.isSending) {
                //     if (this.controller) {
                //         this.controller.abort();
                //         this.controller = null;
                //     }
                //     this.sendButton_End(false)                   // 停止发送状态
                // } else {
                //     this.isSending = true;
                await this.fetchChatMessage(this.chatTitle.chat_id)
                // }
            }
        });
        // const user_profile =document.querySelectorAll(".user-profile");
        // for (const element of user_profile) {
        //      element.addEventListener('click', function (e) {
        //         // console.log('点击元素的索引位置:', Array.from(this.parentElement.children).indexOf(this));
        //         console.log(Array.from(e.target.parentElement.children))
        //
        //         // this.initializeUser(Array.from(e.target.parentElement.children).indexOf(e.target))
        //     });
        // }
        // 页面载入后
        window.addEventListener('load', () => {
            // 初始化聊天
            // this.initializeNewChat(true);
            // 初始化用户
            this.initializeUser()
            // 初始化滚动
            this.initializeScroll()
            // 获取服务器配置
            this.initializeConfig()
            // 初始化聊天 不需要执行任何动作，模型列表加载后会自动触发
            // this.assistant_type.dispatchEvent(new Event('change'));
        });
        // 窗口大小变化时调整
        window.addEventListener('resize', () => {
            this.closeSider();       // 如果是移动端，关闭侧边栏
        });
        // 选择模型的select变化
        this.modelsList.addEventListener("change", (e) => {
            this.enable_thinking.disabled = (e.target.value !== "true");
            if (this.enable_thinking.disabled)
                this.enable_thinking.labels[0].classList.add("enable_thinking_disabled")
            else
                this.enable_thinking.labels[0].classList.remove("enable_thinking_disabled")
            // this.assistant_type.selectedIndex = 0;
            // this.assistant_type.dispatchEvent(new Event('change'));
        });
        this.assistant_type.addEventListener("change", (e) => {
            const selectValue = this.assistant_type.options[this.assistant_type.selectedIndex].value;
            const modelName = this.modelsList.options[this.modelsList.selectedIndex].text;
            switch (selectValue) {
                case "1":
                    this.ASSISTANT_ROLE = "模型「" + modelName + "」聊天助理";
                    this.ASSISTANT_MESSAGE = "你好，我是模型「" + modelName + "」，我知识丰富，你想问点什么？当然我模型越大效果越好哟，另外某个时间点之后的知识我大概率不会。"
                    break;
                case "2":
                    this.ASSISTANT_ROLE = "模型「" + modelName + "」不动产登记业务专家";
                    this.ASSISTANT_MESSAGE = "你好！我是不动产登记领域的模型助手，有什么我可以帮助你的吗？"
                    break;
                case "3":
                    this.ASSISTANT_ROLE = "不动产登记中心「AI智能体」工作人员";
                    this.ASSISTANT_MESSAGE = "你好！我是我市不动产登记中心的业务咨询智能体，您的AI助手。有什么我可以帮助你的吗？"
            }
            this.initializeNewChat(true);

        });
    },
    initializeScroll: function () {
        // 事件监听
        this.chatMessages.addEventListener('scroll', this.handleScroll.bind(null, this.chatMessages));
        this.chatMessages.addEventListener('wheel', this.handleScroll.bind(null, this.chatMessages));
        this.chatMessages.addEventListener('touchmove', this.handleScroll.bind(null, this.chatMessages));
        this.chatMessages.addEventListener('mousedown', this.handleScroll.bind(null, this.chatMessages));
    },
    // 滚动处理
    handleScroll: function (el, e) {
        el.autoScroll = el.scrollHeight - el.scrollTop <= el.clientHeight + 10;
    },
    // 滚动滚动条到最下
    scrollBottom: function () {
        if (this.chatMessages.autoScroll) {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight; // 滚动到底部
        }
    },
    initializeConfig: async function () {
        streamFetchJson(this.URL_CHAT_MODELS)
            .then(jsonData => {
                this.modelsList.innerHTML = ""; // 先清空
                // 遍历 JSON 数据并添加选项
                jsonData["models"].forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.is_think;
                    option.textContent = item.id;
                    this.modelsList.appendChild(option);
                });
                this.modelsList.selectedIndex = 0;
            })
            .then(data => {
                this.initializeNewChat(true);
            })
            .catch(error => {
                    this.addAnswerElement(`发生错误: ${error.message}`)
                }
            );
    },
};

// 初始化聊天机器人
document.addEventListener('DOMContentLoaded', function () {
    chatbot.init();
});