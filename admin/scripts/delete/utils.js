/**
 * 通用的流式请求函数
 * @param {string} url - 请求URL
 * @param {Object} [options] - 请求选项
 * @param {string} [options.method='GET'] - 请求方法 (GET/POST等)
 * @param {Object} [options.data] - POST请求的数据
 * @param {Object} [options.headers] - 请求头
 * @param {Function} [options.onChunk] - 处理数据块的回调函数
 * @param {Function} [options.abortCtrl] - 终止请求
 * @returns {Promise<string>} - 返回完整数据
 */
async function streamFetchJson(url, {
    method = 'GET',
    data = null,
    headers = {},
    onChunk = null,
    abortCtrl = null
} = {}) {
    try {
        // 准备请求配置
        const config = {
            method, headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };
        // 如果是POST请求且有数据，创建可读流作为请求体
        if (method.toUpperCase() !== 'GET' && data) {
            config.body = JSON.stringify(data)
        }
        // 设置终止
        if (abortCtrl !== null)
            config.signal = abortCtrl.signal;
        // 发送请求
        const response = await fetch(url, config);
        if (!response.ok) throw new Error(`HTTP错误! 状态码: ${response.status}`);

        // 从响应流中读取数据
        let doChunk = onChunk && typeof onChunk === 'function';
        const decoder = new TextDecoder('utf-8');
        const reader = response.body.getReader();
        let result = '';
        let buffer = '';
        // 处理流数据
        while (true) {
            const {done, value} = await reader.read();
            if (done) break;
            // 解码数据块
            const chunk = decoder.decode(value, {stream: true});
            buffer += chunk
            result += chunk;
            // 尝试从缓冲区中提取完整的JSON对象
            let boundary;
            while ((boundary = buffer.indexOf('}')) !== -1) {
                const jsonStr = buffer.substring(0, boundary + 1);
                buffer = buffer.substring(boundary + 1);
                try {
                    const jsonObj = JSON.parse(jsonStr)
                    // 调用数据块回调
                    if (doChunk) onChunk(jsonObj);
                } catch (e) {
                    break;
                }
            }
        }
        if (doChunk) {
            // result = '{"data":[' + result.replaceAll("}{","},{") + ']}';
            // 如果回调函数处理了，直接返回 ""，或者考虑补齐集合，上句话就是
            return "";
        }
        return JSON.parse(result);
    } catch (error) {
        if (error.name !== 'AbortError') {
            throw error; // 重新抛出错误以便外部处理
        }
    }
}

