/*
# -*- coding:utf-8 -*-
# @License  ：(C)Copyright 2025, 数道智融科技
# @Author   ：李锋
# @Software ：PyCharm
# @Date     ：2025/7/29 下午9:55
# @Desc     ：
*/

/**
 * 使用示例：
 * // 初始化单个元素
 * ScrollManager.initAutoScroll(document.getElementById('container1'));
 *
 * // 初始化多个元素
 * ScrollManager.initAutoScroll(document.querySelectorAll('.scroll-container'));
 *
 * // 滚动所有元素到底部
 * ScrollManager.scrollToBottom();
 *
 * // 滚动特定元素到底部
 * ScrollManager.scrollToBottom(document.getElementById('container1'));
 *
 * // 销毁多个元素
 * ScrollManager.destroy(document.querySelectorAll('.scroll-container'));
 */
class ScrollManager {
    static #elementMap = new Map();
    static #mutationObserver = null;
    static #resizeObserver = null;

    static #normalizeElements(input) {
        if (!input) return [];
        if (Array.isArray(input) || input instanceof NodeList || input instanceof HTMLCollection) {
            return Array.from(input).filter(el => el instanceof HTMLElement);
        }
        if (input instanceof HTMLElement) return [input];
        return [];
    }

    static #getMutationObserver() {
        if (!this.#mutationObserver) {
            this.#mutationObserver = new MutationObserver(() => {
                requestAnimationFrame(() => {
                    this.#elementMap.forEach((state, element) => {
                        if (state.autoScroll && element.isConnected) {
                            const newScrollHeight = element.scrollHeight;
                            if (newScrollHeight !== state.lastScrollHeight) {
                                element.scrollTop = newScrollHeight;
                                state.lastScrollHeight = newScrollHeight;
                            }
                        }
                    });
                });
            });
        }
        return this.#mutationObserver;
    }

    static #getResizeObserver() {
        if (!this.#resizeObserver) {
            this.#resizeObserver = new ResizeObserver(entries => {
                requestAnimationFrame(() => {
                    entries.forEach(entry => {
                        const element = entry.target;
                        const state = this.#elementMap.get(element);
                        if (state && state.autoScroll) {
                            element.scrollTop = element.scrollHeight;
                            state.lastScrollHeight = element.scrollHeight;
                        }
                    });
                });
            });
        }
        return this.#resizeObserver;
    }

    static #cleanupDisconnectedElements() {
        this.#elementMap.forEach((state, element) => {
            if (!element.isConnected) this.destroy(element);
        });
    }

    static initAutoScroll(elements, options = {}) {
        this.#cleanupDisconnectedElements();
        const normalizedElements = this.#normalizeElements(elements);
        if (normalizedElements.length === 0) return;

        const defaultOptions = {
            observeChildList: true,
            observeAttributes: false,
            observeCharacterData: false,
            observeResize: false,
            autoInitScroll: true,
            scrollThreshold: 20
        };
        const mergedOptions = {...defaultOptions, ...options};

        const observer = this.#getMutationObserver();
        const resizeObserver = mergedOptions.observeResize ? this.#getResizeObserver() : null;

        normalizedElements.forEach(element => {
            if (!element.isConnected || this.#elementMap.has(element)) return;

            const state = {
                autoScroll: true,
                element: element,
                options: mergedOptions,
                lastScrollHeight: element.scrollHeight,
                scrollCheckPending: false,
                rafId: null,
                handleScroll: null
            };

            this.#elementMap.set(element, state);

            const handleScroll = () => {
                const currentState = this.#elementMap.get(element);
                if (!currentState || currentState.scrollCheckPending) return;

                currentState.scrollCheckPending = true;
                if (currentState.rafId) cancelAnimationFrame(currentState.rafId);

                currentState.rafId = requestAnimationFrame(() => {
                    currentState.scrollCheckPending = false;
                    const threshold = currentState.options.scrollThreshold;
                    currentState.autoScroll = element.scrollHeight - element.scrollTop <=
                        element.clientHeight + threshold;
                });
            };

            element.addEventListener('scroll', handleScroll, { passive: true });
            element.addEventListener('wheel', handleScroll, { passive: true });
            element.addEventListener('touchmove', handleScroll, { passive: true });
            state.handleScroll = handleScroll;

            observer.observe(element, {
                childList: mergedOptions.observeChildList,
                attributes: mergedOptions.observeAttributes,
                characterData: mergedOptions.observeCharacterData,
                subtree: true
            });

            if (mergedOptions.observeResize) resizeObserver.observe(element);
            if (mergedOptions.autoInitScroll) {
                requestAnimationFrame(() => {
                    element.scrollTop = element.scrollHeight;
                    state.lastScrollHeight = element.scrollHeight;
                });
            }
        });
    }

    static scrollToBottom(elements, force = false) {
        this.#cleanupDisconnectedElements();
        const targets = elements ? this.#normalizeElements(elements) : Array.from(this.#elementMap.keys());
        if (targets.length === 0) return;

        requestAnimationFrame(() => {
            targets.forEach(element => {
                const state = this.#elementMap.get(element);
                if (state && element.isConnected) {
                    const newScrollHeight = element.scrollHeight;
                    if (force || newScrollHeight !== state.lastScrollHeight) {
                        element.scrollTop = newScrollHeight;
                        state.lastScrollHeight = newScrollHeight;
                    }
                    state.autoScroll = true;
                }
            });
        });
    }

    static setAutoScroll(elements, enabled) {
        this.#cleanupDisconnectedElements();
        const targets = this.#normalizeElements(elements);
        if (targets.length === 0) return;

        requestAnimationFrame(() => {
            targets.forEach(element => {
                const state = this.#elementMap.get(element);
                if (state && element.isConnected) {
                    state.autoScroll = enabled;
                    if (enabled) {
                        element.scrollTop = element.scrollHeight;
                        state.lastScrollHeight = element.scrollHeight;
                    }
                }
            });
        });
    }

    static destroy(elements) {
        this.#cleanupDisconnectedElements();
        const targets = elements ? this.#normalizeElements(elements) : [];
        if (elements === undefined) return;
        if (elements === null || (Array.isArray(elements) && elements.length === 0)) {
            return this.destroyAll();
        }

        const observer = this.#getMutationObserver();
        const resizeObserver = this.#resizeObserver;

        targets.forEach(element => {
            const state = this.#elementMap.get(element);
            if (!state) return;

            if (state.handleScroll) {
                element.removeEventListener('scroll', state.handleScroll);
                element.removeEventListener('wheel', state.handleScroll);
                element.removeEventListener('touchmove', state.handleScroll);
                if (state.rafId) cancelAnimationFrame(state.rafId);
            }

            if (resizeObserver) resizeObserver.unobserve(element);
            this.#elementMap.delete(element);
        });

        observer.disconnect();
        this.#elementMap.forEach((state, element) => {
            observer.observe(element, {
                childList: state.options.observeChildList,
                attributes: state.options.observeAttributes,
                characterData: state.options.observeCharacterData,
                subtree: true
            });
        });

        if (this.#elementMap.size === 0) {
            observer.disconnect();
            this.#mutationObserver = null;
            if (resizeObserver) {
                resizeObserver.disconnect();
                this.#resizeObserver = null;
            }
        }
    }

    static destroyAll() {
        this.destroy(Array.from(this.#elementMap.keys()));
    }

    static getManagedCount() {
        this.#cleanupDisconnectedElements();
        return this.#elementMap.size;
    }

    static isManaged(element) {
        this.#cleanupDisconnectedElements();
        return this.#elementMap.has(element);
    }
}