class CookieManager {
    /**
     * 设置Cookie
     * @param {string} name - Cookie名称
     * @param {string} value - Cookie值
     * @param {number|null} days - 过期天数（可选，默认为会话Cookie）
     */
    static set(name, value, days = 7) {
        let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            cookieString += `; expires=${date.toUTCString()}`;
        }

        cookieString += '; path=/';
        document.cookie = cookieString;
    }

    /**
     * 获取Cookie值
     * @param {string} name - 要获取的Cookie名称
     * @returns {string|null} Cookie值或null（如果不存在）
     */
    static get(name) {
        const nameEQ = encodeURIComponent(name) + "=";
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1, cookie.length);
            }
            if (cookie.indexOf(nameEQ) === 0) {
                return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
            }
        }
        return null;
    }

    /**
     * 删除Cookie
     * @param {string} name - 要删除的Cookie名称
     */
    static delete(name) {
        document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }

    /**
     * 获取所有Cookie
     * @returns {Object} 包含所有Cookie的键值对对象
     */
    static getAll() {
        const cookies = {};
        const cookieArray = document.cookie.split(';');
        for (let i = 0; i < cookieArray.length; i++) {
            let cookie = cookieArray[i];
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1);
            }
            const cookieParts = cookie.split('=');
            if (cookieParts.length > 1) {
                const name = decodeURIComponent(cookieParts[0]);
                cookies[name] = decodeURIComponent(cookieParts.slice(1).join('='));
            }
        }
        return cookies;
    }

    /**
     * 清除所有Cookie
     */
    static clearAll() {
        const cookies = this.getAll();
        for (const name in cookies) {
            this.delete(name);
        }
    }

    /**
     * 检查Cookie是否存在
     * @param {string} name - 要检查的Cookie名称
     * @returns {boolean} 是否存在
     */
    static has(name) {
        return this.get(name) !== null;
    }
}