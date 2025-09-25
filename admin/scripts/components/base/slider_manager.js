/*
# -*- coding:utf-8 -*-
# @License  ：(C)Copyright 2025, 数道智融科技
# @Author   ：李锋
# @Software ：PyCharm
# @Date     ：2025/7/29 下午9:55
# @Desc     ：
*/

/**
 * 滑块组件封装
 * @class SliderManager
 */
class SliderManager {
    /**
     * 初始化滑块组件
     * @param {Object} options - 配置选项
     * @param {HTMLInputElement} options.slider - 滑块元素
     * @param {HTMLElement} options.valueDisplay - 显示值的元素
     * @param {number} [options.divisor=10] - 除数(用于将滑块整数值转换为小数)
     * @param {number} [options.decimalPlaces=1] - 保留小数位数
     * @param {string} [options.name] - 滑块名称(用于在实例集合中标识)
     */
    constructor(options) {
        const {
            slider,
            valueDisplay,
            divisor = 10,
            decimalPlaces = 1,
            name
        } = options;

        this.slider = slider;
        this.valueDisplay = valueDisplay;
        this.decimalPlaces = decimalPlaces;
        this.divisor = divisor;
        this.name = name || slider.id || `slider-${Math.random().toString(36).substr(2, 9)}`;

        if (!this.slider || !this.valueDisplay) {
            console.error('Slider or value display element not found');
            return;
        }

        // 初始化显示值
        this.#updateDisplayValue();

        // 添加事件监听
        this.slider.addEventListener('input', () => {
            this.#updateDisplayValue();
        });
    }

    /**
     * 获取当前滑块值
     * @returns {number} 当前滑块值
     */
    get value() {
        return parseFloat(this.#getValue());
    }

    /**
     * 更新显示的值
     * @private
     */
    #updateDisplayValue() {
        this.valueDisplay.textContent = this.#getValue();
    }

    /**
     * 计算并格式化滑块值
     * @private
     * @returns {string} 格式化后的值
     */
    #getValue() {
        const value = Number(this.slider.value) / this.divisor;
        return value.toFixed(this.decimalPlaces);
    }

    /**
     * 初始化一组滑块
     * @static
     * @param {Array} slidersConfig - 滑块配置数组
     * @returns {Object.<string, SliderManager>} 包含所有滑块实例的对象
     */
    static initSliders(slidersConfig) {
        const sliders = {};

        slidersConfig.forEach(config => {
            if (config.slider && config.valueDisplay) {
                const instance = new SliderManager(config);
                sliders[instance.name] = instance;
            }
        });

        return sliders;
    }
}