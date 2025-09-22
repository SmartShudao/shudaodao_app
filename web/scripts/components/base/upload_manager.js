/*
# -*- coding:utf-8 -*-
# @License  ：(C)Copyright 2025, 数道智融科技
# @Author   ：李锋
# @Software ：PyCharm
# @Date     ：2025/8/13
# @Desc     ：
*/

class UploadManager {
    #fetch_url = {
        baseUrl: '/api/v1/files/',
        uploadUrl: "",
        listFileUrl: "",
        deleteFileUrl: "",
    }

    #httpRequest = new RequestManager(this.#fetch_url.baseUrl);
    #elements = {}
    #element_upload_panel;
    #element_files_table;
    #func_onLogging;
    #options;
    #local_files;
    #appState = {
        isProcessing: false,
        message: ""
    };
    #temp_message = "";

    /**
     * 文件上传组件
     * @param {string} path 存储目录
     * @param {Object} options 配置选项
     * @param {HTMLElement} options.uploadElement 上传文件容器
     * @param {HTMLElement} options.listElement 文件列表容器
     * @param {function} [options.onLogging] - 处理消息日志
     * @param {boolean} options.multiple 是否支持多文件
     * @param {boolean} options.allowDeletion 是否可删除列表的文件
     * @param {number} options.maxFiles 最大文件数
     * @param {string[]} options.accept 接受的文件类型
     * @param {Object} [options.headers] - 自定义请求头
     */
    constructor(path, options = {}) {
        let encode_path = path
        if (encode_path)
            encode_path = encodeURIComponent(path);
        else
            encode_path = "shudao_ai"
        this.#fetch_url.uploadUrl = encode_path + this.#fetch_url.uploadUrl;
        this.#fetch_url.listFileUrl = encode_path
        this.#fetch_url.deleteFileUrl = encode_path + this.#fetch_url.deleteFileUrl;

        const {
            uploadElement = null,
            listElement = null,
            onLogging = null,
            multiple = true,
            allowDeletion = true,
            maxFiles = 10,
            accept = [],
            headers = {}
        } = options;

        this.#element_upload_panel = uploadElement;
        this.#element_files_table = listElement;
        this.#func_onLogging = onLogging;

        this.#options = {
            multiple: multiple,
            allowDeletion: allowDeletion,
            maxFiles: maxFiles,
            accept: accept,
            headers: headers,
        };
        this.#local_files = []
        this.#appState.isProcessing = false;
        this.#appState.message = "";
        if (this.#element_upload_panel) {
            // 创建 panel 容器
            this.#dom_panel_create();
            // 绑定 对象元素
            this.#dom_bind_elements_panel();
            // 绑定 Panel事件
            this.#dom_bind_events_panel();
        }
        if (this.#element_files_table) {
            // 创建 table 容器
            this.#dom_table_create();
            // 绑定 对象元素
            this.#dom_bind_elements_table();
            // 绑定 Table事件
            this.#dom_bind_events_table();
            // 填充 Table rows
            this.#dom_table_list_create()
        }
    }

    get_files() {
        let select_files = [];
        const listInput = this.#elements.filesTableBody.querySelectorAll("td input[type=checkbox]")
        listInput.forEach(currInput => {
            if (currInput.checked) {
                const fileName = currInput.parentElement.nextElementSibling.textContent;
                select_files.push(fileName);
            }
        })
        return select_files;
    }

    #dom_panel_create() {
        if (this.#element_upload_panel.classList.contains("panel-upload") === false)
            this.#element_upload_panel.classList.add("panel-upload")
        this.#element_upload_panel.innerHTML = `
            <div class="dropzone">
                <div class="hint">
                    <p>将文件拖放到此区域</p>
                    <p>${this.#options.accept.join(' ')}</p>
                    <input type="file" class="hidden" ${this.#options.multiple ? 'multiple' : ''}
                        ${this.#options.accept.length ? `accept="${this.#options.accept.join(',')}"` : ''}>  
                </div>
                <div class="toolbar">
                    <button type="button">选择</button>
                    <button type="button" class="submit">上传</button>
                    <button type="button" class="cancel hidden">取消</button>
                </div>
                <div class="list"></div>
            </div>`;
    }

    #dom_panel_list_create() {
        this.#elements.fileList.innerHTML = '';
        if (this.#local_files.length === 0)
            return;
        const fragment = new DocumentFragment();
        this.#local_files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'item';
            fileItem.innerHTML = `
                <span>${file.name}</span>
                <span class='no-wrap'>${this.#format_file_size(file.size)}</span>
                <button>删除</button>`;
            fileItem.querySelector('button').addEventListener('click',
                (e) => this.#handle_panel_list_remove(e));
            fragment.append(fileItem);
        });
        this.#elements.fileList.append(fragment);
    }

    #dom_table_create() {
        if (this.#element_files_table === null)
            return;
        if (this.#element_files_table.classList.contains("panel-upload") === false)
            this.#element_files_table.classList.add("panel-upload")
        this.#element_files_table.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th><input type="checkbox"></th>
                        <th>文件名</th>
                        <th>大小</th>
                        <th>时间</th>
                        <th>${this.#options.allowDeletion ? '<button type="button">删除</button>' : ''}</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 文件列表将通过JS动态生成 -->
                </tbody>
            </table>`;
    }

    #dom_bind_elements_panel() {
        const buttons = this.#element_upload_panel.querySelectorAll('button');
        this.#elements = {
            // panel drop zone
            dropzone: this.#element_upload_panel.querySelector('.dropzone'),
            // panel file input
            fileInput: this.#element_upload_panel.querySelector('input[type="file"]'),
            // panel button
            selectBtn: buttons[0],
            submitBtn: buttons[1],
            cancelBtn: buttons[2],
            // panel list
            fileList: this.#element_upload_panel.querySelector('.list'),
        }
    }

    #dom_bind_elements_table() {
        // table body
        this.#elements.filesTableBody = this.#element_files_table.querySelector('tbody');
    }


    #dom_bind_events_panel() {
        // 拖放功能
        this.#elements.dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.#elements.dropzone.classList.add('active');
        });
        this.#elements.dropzone.addEventListener('dragleave', () => {
            this.#elements.dropzone.classList.remove('active');
        });
        this.#elements.dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.#elements.dropzone.classList.remove('active');
            this.#handle_panel_select(e.dataTransfer.files);
        });
        // 文件选择
        this.#elements.selectBtn.addEventListener('click', () =>
            this.#elements.fileInput.click());
        this.#elements.fileInput.addEventListener('change', (e) =>
            this.#handle_panel_select(e.target.files));
        // 上传按钮
        this.#elements.submitBtn.addEventListener('click', () =>
            this.#handle_panel_upload());
        // 取消按钮
        this.#elements.cancelBtn.addEventListener('click', () =>
            this.#handle_panel_abort());
    }

    #dom_bind_events_table() {
        // 表头 - 全选
        const thCheckInput = this.#element_files_table.querySelector("th input")
        thCheckInput.addEventListener("change", () =>
            this.#elements.filesTableBody.querySelectorAll("input[type='checkbox']").forEach(
                checkInput => {
                    checkInput.checked = thCheckInput.checked
                }
            )
        );
    }

    #dom_table_list_create() {
        this.#elements.filesTableBody.innerHTML = "";
        //发起get请求
        this.#httpRequest.get(this.#fetch_url.listFileUrl, this.#options.headers)
            .then(data => {
                // if (data.hasOwnProperty("error")){
                //     throw data;
                // }
                //响应的内容
                data.files.forEach(
                    /**
                     * @param {Object} [file]
                     * @param {number | string | Date} [file.upload_time]
                     * @param {number} [file.size]
                     * @param {string} [file.name]
                     */
                    file => {
                        // 格式化文件大小
                        const size = this.#format_file_size(file.size);
                        // 格式化上传时间
                        const uploadTime = new Date(file.upload_time);
                        const timeStr = uploadTime.toLocaleDateString();
                        // 构建 row
                        this.#dom_table_list_row_create(file.name, size, timeStr);
                    });
            })
            .catch(error => {
                this.#showMessage(error.message);
                throw error;
            })
    }

    #dom_table_list_row_create(file_name, file_size, file_time) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox"></td>
            <td>${file_name}</td>
            <td>${file_size}</td>
            <td>${file_time}</td>
            <td>${this.#options.allowDeletion ? '<button type="button">删除</button>' : ''}</td>`;
        this.#elements.filesTableBody.appendChild(row);
        if (this.#options.allowDeletion) {
            const clickBtn = row.querySelector('button')
            clickBtn.addEventListener('click', () =>
                this.#handle_table_delete_file(clickBtn, `${file_name}`));
        }
    }

    #handle_panel_select(selectedFiles) {
        let files = Array.from(selectedFiles);
        if (!this.#options.multiple) {
            files = [files[0]]
        }
        // 检查文件数量限制
        if ((this.#options.maxFiles > 0) &&
            (this.#local_files.length + files.length) > this.#options.maxFiles) {
            this.#showMessage(`最多只能上传 ${this.#options.maxFiles} 个文件`);
            return;
        }
        if (!this.#options.multiple) {
            this.#local_files = []
        }
        // 添加到文件列表
        this.#local_files = [...this.#local_files, ...files];
        this.#dom_panel_list_create();
        this.#elements.fileInput.value = "";
    }

    #handle_panel_abort() {
        this.#httpRequest.abort()
        this.#appState.isProcessing = false;
        this.#appState.message = "";
        this.#showMessage("终止上传")
    }


    #handle_panel_list_remove(e) {
        e.preventDefault()
        if (this.#appState.isProcessing) {
            this.#showMessage(this.#appState.message);
            return;
        }
        const item = e.target.parentElement;
        // 找到点击事件的item
        const file_name = item.children[0].textContent;
        const index = this.#local_files.findIndex(f => f.name === file_name)
        if (index > -1)
            this.#local_files.splice(index, 1);
        item.remove();
    }

    #handle_panel_upload() {
        if (this.#appState.isProcessing) {
            this.#showMessage(this.#appState.message);
            return;
        }
        if (this.#local_files.length === 0) {
            this.#showMessage('请先选择文件');
            return;
        }
        this.#handle_panel_upload_queue();
    }

    #resetUI_panel() {
        this.#appState.isProcessing = false;
        this.#appState.message = "";
        this.#elements.submitBtn.classList.remove("hidden");
        this.#elements.cancelBtn.classList.add("hidden");
    }

    #prepareUI_panel() {
        this.#appState.isProcessing = true;
        this.#appState.message = "文件上传中，请稍后";
        this.#elements.submitBtn.classList.add("hidden");
        this.#elements.cancelBtn.classList.remove("hidden");
    }

    #handle_panel_upload_queue() {
        if (this.#local_files.length === 0) {
            this.#resetUI_panel();
            this.#showMessage('上传完成');
            this.#dom_panel_list_create();
            return;
        }
        this.#prepareUI_panel();
        const file = this.#local_files[0];//.shift();
        this.#showMessage(`上传: ${file.name}`, false);
        const formData = new FormData();
        formData.append('files', file);
        this.#httpRequest.xmlHttpRequest(this.#fetch_url.uploadUrl,
            {
                method: "POST",
                formData: formData,
            })
            .then(() => {
                this.#showMessage(` 成功`);
                const item = this.#elements.fileList.children[0]
                if (this.#element_files_table) {
                    // 移除旧文件（如果存在）
                    this.#dom_table_list_row_remove(item.children[0].textContent);
                    // 格式化上传时间
                    const uploadTime = new Date();
                    const timeStr = uploadTime.toLocaleDateString();
                    // 构建新文件
                    this.#dom_table_list_row_create(item.children[0].textContent,
                        item.children[1].textContent, timeStr);
                }
                // 删除上传列表
                item.remove();
                this.#local_files.shift();
                // 下一个文件上传
                this.#handle_panel_upload_queue();
            })
            .catch(error => {
                this.#showMessage(` 失败`);
                this.#resetUI_panel();
                throw error;
            });
    }

    #dom_table_list_row_remove(file_name) {
        for (const row of this.#elements.filesTableBody.rows)
            if (row.children[1].textContent === file_name) {
                row.remove();
                break;
            }
    }

    #handle_table_delete_file(el, fileName) {
        console.log(fileName)
        this.#httpRequest.delete(this.#fetch_url.deleteFileUrl,
            [{"name": fileName}], this.#options.headers)
            .then(data => {
                if (data.status === "success") {
                    el.parentElement.parentElement.remove();
                }
                this.#showMessage(data);
            })
            .catch(error => {
                this.#showMessage(error.message);
                throw error;
            })
    }


    #showMessage(message, newLine = true) {
        this.#temp_message += message
        if (newLine && this.#func_onLogging !== null) {
            this.#func_onLogging(this.#temp_message, newLine)
        }
        if (newLine)
            this.#temp_message = "";
    }


    #format_file_size(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

