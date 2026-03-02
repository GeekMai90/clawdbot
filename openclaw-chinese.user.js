// ==UserScript==
// @name         OpenClaw 中文翻译
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  OpenClaw Web 界面中文化（强化版）
// @author       麦先生
// @match        http://127.0.0.1:18789/*
// @match        http://localhost:18789/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const translations = {
        // === 侧边栏导航 ===
        'Chat': '对话',
        'Overview': '概览',
        'Channels': '频道',
        'Instances': '实例',
        'Sessions': '会话',
        'Cron Jobs': '定时任务',
        'Skills': '技能',
        'Nodes': '节点',
        'Config': '配置',
        'Debug': '调试',
        'Logs': '日志',
        'Docs': '文档',
        
        // === 分组标题 ===
        'Control': '控制',
        'Agent': '智能体',
        'Resources': '资源',
        
        // === 页面标题和描述 ===
        'Direct gateway chat session for quick interventions.': '直接网关对话会话，用于快速干预。',
        'GATEWAY DASHBOARD': '网关仪表板',
        
        // === 输入区域 ===
        'Message': '消息',
        'to send': '发送',
        'for line breaks': '换行',
        'paste images': '粘贴图片',
        'Type a message...': '输入消息...',
        'Send Message': '发送消息',
        'New session': '新建会话',
        'Send': '发送',
        
        // === 按钮和操作 ===
        'Save': '保存',
        'Cancel': '取消',
        'Delete': '删除',
        'Edit': '编辑',
        'Close': '关闭',
        'Confirm': '确认',
        'Reset': '重置',
        'Refresh': '刷新',
        'Copy': '复制',
        'Download': '下载',
        'Upload': '上传',
        
        // === Quick Settings ===
        'Quick Settings': '快捷设置',
        'Theme': '主题',
        'Dark': '深色',
        'Light': '浅色',
        'System': '跟随系统',
        
        // === Settings 页面 ===
        'Settings': '设置',
        'General': '通用',
        'Models': '模型',
        'Model': '模型',
        'Capabilities': '能力',
        'System Prompt': '系统提示词',
        'Temperature': '温度',
        'Thinking': '思考',
        'Save Changes': '保存更改',
        
        // === Agents 页面 ===
        'Agents': '智能体',
        'No agents installed': '未安装智能体',
        'Install new skills from ClawdHub': '从 ClawdHub 安装新技能',
        'Agents installed on your system': '系统已安装的智能体',
        'Install': '安装',
        'Update': '更新',
        'Remove': '移除',
        
        // === 状态和提示 ===
        'Health': '健康',
        'OK': '正常',
        'Loading...': '加载中...',
        'Error': '错误',
        'Success': '成功',
        'Warning': '警告',
        
        // === Plugins ===
        'Plugins': '插件',
        
        // === History ===
        'History': '历史记录',
    };

    // 翻译文本内容（支持部分匹配）
    function translateText(text) {
        if (!text) return text;
        
        const trimmed = text.trim();
        
        // 完全匹配
        if (translations[trimmed]) {
            return translations[trimmed];
        }
        
        // 部分匹配（用于处理带额外空格的情况）
        for (const [en, zh] of Object.entries(translations)) {
            if (trimmed === en || text.includes(en)) {
                return text.replace(en, zh);
            }
        }
        
        return text;
    }

    // 翻译单个文本节点
    function translateTextNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const original = node.textContent;
            const translated = translateText(original);
            if (translated !== original) {
                node.textContent = translated;
            }
        }
    }

    // 翻译元素的属性
    function translateAttributes(element) {
        const attrs = ['placeholder', 'title', 'alt', 'aria-label', 'aria-placeholder'];
        
        attrs.forEach(attr => {
            if (element.hasAttribute(attr)) {
                const value = element.getAttribute(attr);
                const translated = translateText(value);
                if (translated !== value) {
                    element.setAttribute(attr, translated);
                }
            }
        });
    }

    // 递归翻译元素及其子元素
    function translateElement(element) {
        if (!element) return;
        
        // 翻译属性
        translateAttributes(element);
        
        // 翻译所有文本节点
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // 跳过 script 和 style 标签
                    const parent = node.parentElement;
                    if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    // 只处理有内容的文本节点
                    if (node.textContent.trim().length > 0) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_REJECT;
                }
            }
        );
        
        let node;
        while (node = walker.nextNode()) {
            translateTextNode(node);
        }
    }

    // 翻译整个页面
    function translatePage() {
        translateElement(document.body);
    }

    // 使用 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            // 处理新增的节点
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    translateElement(node);
                } else if (node.nodeType === Node.TEXT_NODE) {
                    translateTextNode(node);
                }
            });
            
            // 处理文本内容变化
            if (mutation.type === 'characterData') {
                translateTextNode(mutation.target);
            }
            
            // 处理属性变化
            if (mutation.type === 'attributes' && mutation.target.nodeType === Node.ELEMENT_NODE) {
                translateAttributes(mutation.target);
            }
        });
    });

    // 启动观察器
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['placeholder', 'title', 'alt', 'aria-label', 'aria-placeholder']
    });

    // 页面加载完成后立即翻译
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', translatePage);
    } else {
        translatePage();
    }

    // 延迟再翻译一次（处理延迟加载的内容）
    setTimeout(translatePage, 500);
    setTimeout(translatePage, 1000);
    setTimeout(translatePage, 2000);

    console.log('✨ OpenClaw 中文翻译脚本已加载');
})();
