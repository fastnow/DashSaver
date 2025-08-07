/*
 * A web application loader
 * Copyright 2025 FastNow Studio
 * License: MIT
 * GitHub: https://github.com/fastnow/DashSaver
*/

const timeElement = document.getElementById('time');
const dateElement = document.getElementById('date');
const randomTextElement = document.getElementById('random-text');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const closeSettingsBtn = document.getElementById('close-settings');
const searchInput = document.getElementById('search-input');
const quickLinksContainer = document.getElementById('quick-links');
const statusMessage = document.getElementById('status-message');
const bgLoader = document.getElementById('bg-loader');
const toggleTextBtn = document.getElementById('toggle-text-btn');
const toggleSearchBtn = document.getElementById('toggle-search-btn');
const toggleLinksBtn = document.getElementById('toggle-links-btn');
const editModal = document.getElementById('edit-modal');
const closeEditModal = document.getElementById('close-edit-modal');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const saveEditBtn = document.getElementById('save-edit-btn');
const editFormContainer = document.getElementById('edit-form-container');
const contentContainer = document.getElementById('content-container');
const searchContainer = document.getElementById('search-container');
const centerContainer = document.getElementById('center-container');
const customEnginesList = document.getElementById('custom-engines-list');

let bgInterval = null;
let bgSwitching = true;
let textInterval = null;
let textVisible = true;
let searchVisible = true;
let linksVisible = true;
let currentEditItem = null;
let currentEditType = null;
let currentEditIndex = null;
let isBgChanging = false;
let lastBgChangeTime = 0;

let animationIn = 'fade-in';
let animationOut = 'fade-out';

let quotes = [{
        id: 1,
        text: "生活就像骑自行车，为了保持平衡，你必须不断前进"
    },
    {
        id: 2,
        text: "每一天都是新的开始，珍惜当下"
    },
    {
        id: 3,
        text: "成功不是终点，失败不是终结，勇气才是永恒"
    },
    {
        id: 4,
        text: "梦想不会发光，发光的是追梦的人"
    },
    {
        id: 5,
        text: "最好的时光就是现在"
    },
    {
        id: 6,
        text: "简单的事情重复做，你就是专家；重复的事情用心做，你就是赢家"
    },
    {
        id: 7,
        text: "行动是治愈恐惧的良药，而犹豫拖延将不断滋养恐惧"
    },
    {
        id: 8,
        text: "只有不断超越自我，才能成就非凡"
    },
    {
        id: 9,
        text: "生命不是要超越别人，而是要超越自己"
    },
    {
        id: 10,
        text: "不要等待机会，而要创造机会"
    }
];

let searchEngines = [{
        name: "Google",
        url: "https://www.google.com/search?q={query}",
        default: true
    },
    {
        name: "Bing",
        url: "https://www.bing.com/search?q={query}",
        default: true
    },
    {
        name: "DuckDuckGo",
        url: "https://duckduckgo.com/?q={query}",
        default: true
    },
    {
        name: "百度",
        url: "https://www.baidu.com/s?wd={query}",
        default: true
    }
];

let quickLinks = [{
        id: 1,
        name: "GitHub",
        url: "https://github.com",
        icon: "fab fa-github",
        type: "fa"
    },
    {
        id: 2,
        name: "Gmail",
        url: "https://gmail.com",
        icon: "fas fa-envelope",
        type: "fa"
    },
    {
        id: 3,
        name: "YouTube",
        url: "https://youtube.com",
        icon: "fab fa-youtube",
        type: "fa"
    },
    {
        id: 4,
        name: "Twitter",
        url: "https://twitter.com",
        icon: "fab fa-twitter",
        type: "fa"
    },
    {
        id: 5,
        name: "Reddit",
        url: "https://reddit.com",
        icon: "fab fa-reddit",
        type: "fa"
    },
    {
        id: 6,
        name: "Spotify",
        url: "https://spotify.com",
        icon: "fab fa-spotify",
        type: "fa"
    },
    {
        id: 7,
        name: "Netflix",
        url: "https://netflix.com",
        icon: "fas fa-film",
        type: "fa"
    },
    {
        id: 8,
        name: "Amazon",
        url: "https://amazon.com",
        icon: "fab fa-amazon",
        type: "fa"
    }
];

// 显示状态消息
function showStatusMessage(message, duration = 3000) {
    statusMessage.textContent = message;
    statusMessage.style.display = 'block';
    setTimeout(() => {
        statusMessage.style.display = 'none';
    }, duration);
}

// 从localStorage加载数据
function loadData() {
    const savedQuotes = localStorage.getItem('customQuotes');
    const savedEngines = localStorage.getItem('customEngines');
    const savedLinks = localStorage.getItem('customLinks');
    const showSearch = localStorage.getItem('showSearch');
    const showLinks = localStorage.getItem('showLinks');
    const showText = localStorage.getItem('showText');
    const savedFont = localStorage.getItem('selectedFont');
    const savedColor = localStorage.getItem('selectedColor');
    const savedAnimationIn = localStorage.getItem('animationIn');
    const savedAnimationOut = localStorage.getItem('animationOut');

    if (savedQuotes) {
        const customQuotes = JSON.parse(savedQuotes);
        quotes = [...quotes, ...customQuotes];
    }

    if (savedEngines) {
        const customEngines = JSON.parse(savedEngines);
        searchEngines = [...searchEngines, ...customEngines];
    }

    if (savedLinks) {
        const customLinks = JSON.parse(savedLinks);
        quickLinks = [...quickLinks, ...customLinks];
    }

    if (showSearch !== null) {
        searchVisible = showSearch === 'true';
        toggleSearchBtn.classList.toggle('active', searchVisible);
        updateVisibility();
    }

    if (showLinks !== null) {
        linksVisible = showLinks === 'true';
        toggleLinksBtn.classList.toggle('active', linksVisible);
        updateVisibility();
    }

    if (showText !== null) {
        textVisible = showText === 'true';
        toggleTextBtn.classList.toggle('active', textVisible);
        randomTextElement.style.display = textVisible ? 'flex' : 'none';
        centerContainer.classList.toggle('text-hidden', !textVisible);
    }

    // 应用保存的字体
    if (savedFont) {
        document.documentElement.style.setProperty('--global-font', savedFont);
        document.querySelectorAll('.font-option').forEach(option => {
            if (option.dataset.font === savedFont) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    // 应用保存的颜色
    if (savedColor) {
        document.querySelectorAll('.color-option').forEach(option => {
            if (option.dataset.color === savedColor) {
                option.classList.add('active');
                document.documentElement.style.setProperty('--time-color', savedColor);
                document.documentElement.style.setProperty('--date-color', savedColor.replace(')', ', 0.8)').replace('rgb', 'rgba'));
                document.documentElement.style.setProperty('--text-color', savedColor.replace(')', ', 0.85)').replace('rgb', 'rgba'));
            } else {
                option.classList.remove('active');
            }
        });
    }

    // 应用保存的动画
    if (savedAnimationIn) {
        animationIn = savedAnimationIn;
        document.querySelectorAll('[data-animation-in]').forEach(option => {
            if (option.dataset.animationIn === savedAnimationIn) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    if (savedAnimationOut) {
        animationOut = savedAnimationOut;
        document.querySelectorAll('[data-animation-out]').forEach(option => {
            if (option.dataset.animationOut === savedAnimationOut) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }
}

// 保存数据到localStorage
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// 更新时间和日期
function updateDateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const day = days[now.getDay()];
    const date = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

    timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    dateElement.textContent = `${date} ${day}`;
}

// 更新随机文本
function updateRandomText() {
    if (!textVisible) return;

    // 防止多次调用
    if (randomTextElement.classList.contains('updating')) return;

    randomTextElement.classList.add('updating');

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const newText = quotes[randomIndex].text;

    // 添加离开动画
    randomTextElement.classList.add(animationOut);

    setTimeout(() => {
        randomTextElement.textContent = newText;
        randomTextElement.className = 'random-text updating';

        // 特殊处理打字机效果
        if (animationIn === 'typewriter') {
            randomTextElement.classList.add('typewriter');
            // 打字机效果结束后恢复正常
            setTimeout(() => {
                randomTextElement.classList.remove('typewriter', 'updating');
            }, 4000);
        } else {
            // 添加其他进入动画
            randomTextElement.classList.add(animationIn);

            // 动画结束后移除标记
            setTimeout(() => {
                randomTextElement.classList.remove('updating');
            }, 1000);
        }
    }, 1000);
}

// 全屏功能
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`全屏请求错误: ${err.message}`);
        });
        fullscreenBtn.style.display = 'none';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        fullscreenBtn.style.display = 'flex';
    }
}

// 设置面板控制
function toggleSettings() {
    settingsPanel.classList.toggle('open');
}

// 切换背景 - 使用CSS加载图片
function changeBackground(showNotification = false) {
    // 防止频繁切换
    const now = Date.now();
    if (isBgChanging || (now - lastBgChangeTime < 5000)) return;

    isBgChanging = true;
    lastBgChangeTime = now;

    const bgApi = document.getElementById('bg-api').value || 'https://t.alcy.cc/ycy';

    // 显示加载指示器
    bgLoader.style.display = 'flex';

    // 添加时间戳防止缓存
    const timestamp = new Date().getTime();
    const bgUrl = `${bgApi}${bgApi.includes('?') ? '&' : '?'}t=${timestamp}`;

    // 使用CSS设置背景
    const bgImg = new Image();
    bgImg.onload = function() {
        document.body.style.backgroundImage = `url(${bgUrl})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        bgLoader.style.display = 'none';
        isBgChanging = false;
        if (showNotification) {
            showStatusMessage('背景已更新');
        }
    };
    bgImg.onerror = function() {
        console.error('背景图片加载失败，使用默认背景');
        document.body.style.background = 'linear-gradient(135deg, #1a2a6c, #b21f1f, #1a2a6c)';
        bgLoader.style.display = 'none';
        isBgChanging = false;
        if (showNotification) {
            showStatusMessage('背景加载失败，使用默认背景', 5000);
        }
    };
    bgImg.src = bgUrl;
}

// 更新显示设置
function updateVisibility() {
    // 搜索栏
    searchContainer.style.display = searchVisible ? 'block' : 'none';

    // 快捷链接
    quickLinksContainer.style.display = linksVisible ? 'flex' : 'none';

    // 整个内容区域
    if (searchVisible || linksVisible) {
        contentContainer.classList.remove('hidden');
    } else {
        contentContainer.classList.add('hidden');
    }

    // 保存设置
    localStorage.setItem('showSearch', searchVisible);
    localStorage.setItem('showLinks', linksVisible);
    localStorage.setItem('showText', textVisible);
}

// 渲染搜索引擎选择器
function renderSearchEngineSelector() {
    const container = document.getElementById('search-engine-selector');
    container.innerHTML = '';

    searchEngines.forEach(engine => {
        const option = document.createElement('div');
        option.className = 'animation-option';
        if (engine.default) option.classList.add('active');
        option.dataset.engine = engine.name;
        option.textContent = engine.name;

        option.addEventListener('click', () => {
            document.querySelectorAll('.animation-option[data-engine]').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });

        container.appendChild(option);
    });
}

// 渲染自定义搜索引擎列表
function renderCustomEnginesList() {
    const container = document.getElementById('custom-engines-list');
    container.innerHTML = '';

    const customEngines = searchEngines.filter(engine => !engine.default);

    if (customEngines.length === 0) {
        container.innerHTML = '<p class="custom-item">暂无自定义搜索引擎</p>';
        return;
    }

    customEngines.forEach((engine, index) => {
        // 在整个搜索引擎数组中找到当前引擎的索引
        const engineIndex = searchEngines.findIndex(e => e.name === engine.name && e.url === engine.url);

        const item = document.createElement('div');
        item.className = 'custom-item';
        item.innerHTML = `
                    <span>${engine.name}</span>
                    <div class="actions">
                        <button class="btn-icon delete-engine" data-index="${engineIndex}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
        container.appendChild(item);
    });

    // 添加删除事件 - 使用事件委托
    customEnginesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-engine') || e.target.closest('.delete-engine')) {
            const btn = e.target.closest('.delete-engine');
            const index = parseInt(btn.dataset.index);

            if (!isNaN(index) && index >= 0 && index < searchEngines.length) {
                searchEngines.splice(index, 1);
                saveData('customEngines', searchEngines.filter(engine => !engine.default));
                renderSearchEngineSelector();
                renderCustomEnginesList();
                showStatusMessage('搜索引擎已删除');
            }
        }
    });
}

// 渲染快捷链接
function renderQuickLinks() {
    quickLinksContainer.innerHTML = '';

    quickLinks.forEach((link, index) => {
        const item = document.createElement('div');
        item.className = 'link-item';
        item.dataset.url = link.url;
        item.innerHTML = `
                    <div class="icon-container">
                        ${link.type === 'fa' ? 
                            `<i class="${link.icon}"></i>` : 
                            `<img src="${link.icon}" alt="${link.name}">`}
                    </div>
                    <span>${link.name}</span>
                    <div class="delete-link" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </div>
                    <div class="edit-link" data-index="${index}">
                        <i class="fas fa-edit"></i>
                    </div>
                `;

        // 修复链接跳转问题
        item.addEventListener('click', (e) => {
            // 确保点击的不是删除或编辑按钮
            if (!e.target.closest('.delete-link') && !e.target.closest('.edit-link')) {
                window.open(link.url, '_blank');
            }
        });

        quickLinksContainer.appendChild(item);
    });

    // 添加删除事件 - 使用事件委托
    quickLinksContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-link') || e.target.closest('.delete-link')) {
            const btn = e.target.closest('.delete-link');
            const index = parseInt(btn.dataset.index);

            if (!isNaN(index) && index >= 0 && index < quickLinks.length) {
                quickLinks.splice(index, 1);

                // 区分默认链接和自定义链接
                if (index >= 8) {
                    saveData('customLinks', quickLinks.slice(8));
                }

                renderQuickLinks();
                renderCustomLinksList();
                showStatusMessage('链接已删除');
            }
        }

        // 添加编辑事件
        if (e.target.classList.contains('edit-link') || e.target.closest('.edit-link')) {
            const btn = e.target.closest('.edit-link');
            const index = parseInt(btn.dataset.index);

            if (!isNaN(index) && index >= 0 && index < quickLinks.length) {
                openEditLinkModal(index);
            }
        }
    });
}

// 打开编辑链接模态框
function openEditLinkModal(index) {
    const link = quickLinks[index];
    currentEditItem = link;
    currentEditType = 'link';
    currentEditIndex = index;

    editFormContainer.innerHTML = `
                <div class="form-group">
                    <label for="edit-link-name">链接名称</label>
                    <input type="text" class="form-control" id="edit-link-name" value="${link.name}">
                </div>
                <div class="form-group">
                    <label for="edit-link-url">链接地址</label>
                    <input type="text" class="form-control" id="edit-link-url" value="${link.url}">
                </div>
                <div class="form-group">
                    <label for="edit-link-icon">图标 (Font Awesome类名或图片URL)</label>
                    <input type="text" class="form-control" id="edit-link-icon" value="${link.icon}">
                </div>
            `;

    document.getElementById('edit-modal-title').textContent = '编辑链接';
    editModal.style.display = 'flex';
}

// 打开编辑文本模态框
function openEditQuoteModal(index) {
    const quote = quotes[index];
    currentEditItem = quote;
    currentEditType = 'quote';
    currentEditIndex = index;

    editFormContainer.innerHTML = `
                <div class="form-group">
                    <label for="edit-quote-text">文本内容</label>
                    <textarea class="form-control" id="edit-quote-text" rows="4">${quote.text}</textarea>
                </div>
            `;

    document.getElementById('edit-modal-title').textContent = '编辑文本';
    editModal.style.display = 'flex';
}

// 渲染自定义链接列表
function renderCustomLinksList() {
    const container = document.getElementById('custom-links-list');
    container.innerHTML = '';

    const customLinks = quickLinks.slice(8);

    if (customLinks.length === 0) {
        container.innerHTML = '<p class="custom-item">暂无自定义链接</p>';
        return;
    }

    customLinks.forEach((link, index) => {
        const globalIndex = index + 8;
        const item = document.createElement('div');
        item.className = 'custom-item';
        item.innerHTML = `
                    <span>${link.name}</span>
                    <div class="actions">
                        <button class="btn-icon edit-custom-link" data-index="${globalIndex}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-custom-link" data-index="${globalIndex}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
        container.appendChild(item);
    });

    // 添加编辑和删除事件 - 使用事件委托
    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-custom-link') || e.target.closest('.delete-custom-link')) {
            const btn = e.target.closest('.delete-custom-link');
            const index = parseInt(btn.dataset.index);

            if (!isNaN(index) && index >= 8 && index < quickLinks.length) {
                quickLinks.splice(index, 1);
                saveData('customLinks', quickLinks.slice(8));
                renderCustomLinksList();
                renderQuickLinks();
                showStatusMessage('链接已删除');
            }
        }

        if (e.target.classList.contains('edit-custom-link') || e.target.closest('.edit-custom-link')) {
            const btn = e.target.closest('.edit-custom-link');
            const index = parseInt(btn.dataset.index);

            if (!isNaN(index) && index >= 8 && index < quickLinks.length) {
                openEditLinkModal(index);
            }
        }
    });
}

// 渲染自定义文本列表
function renderCustomQuotesList() {
    const container = document.getElementById('custom-quotes-list');
    container.innerHTML = '';

    quotes.forEach((quote, index) => {
        const item = document.createElement('div');
        item.className = 'custom-item';
        item.innerHTML = `
                    <span>${quote.text.substring(0, 50)}${quote.text.length > 50 ? '...' : ''}</span>
                    <div class="actions">
                        <button class="btn-icon edit-custom-quote" data-index="${index}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-custom-quote" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
        container.appendChild(item);
    });

    // 添加编辑和删除事件 - 使用事件委托
    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-custom-quote') || e.target.closest('.delete-custom-quote')) {
            const btn = e.target.closest('.delete-custom-quote');
            const index = parseInt(btn.dataset.index);

            if (!isNaN(index) && index >= 0 && index < quotes.length) {
                quotes.splice(index, 1);
                saveData('customQuotes', quotes);
                renderCustomQuotesList();
                showStatusMessage('文本已删除');
            }
        }

        if (e.target.classList.contains('edit-custom-quote') || e.target.closest('.edit-custom-quote')) {
            const btn = e.target.closest('.edit-custom-quote');
            const index = parseInt(btn.dataset.index);

            if (!isNaN(index) && index >= 0 && index < quotes.length) {
                openEditQuoteModal(index);
            }
        }
    });
}

// 保存编辑内容
function saveEdit() {
    if (currentEditType === 'link') {
        const name = document.getElementById('edit-link-name').value.trim();
        const url = document.getElementById('edit-link-url').value.trim();
        const icon = document.getElementById('edit-link-icon').value.trim();

        if (name && url && icon) {
            // 判断是Font Awesome还是图片URL
            const type = icon.startsWith('http') ? 'img' : 'fa';

            quickLinks[currentEditIndex] = {
                ...quickLinks[currentEditIndex],
                name,
                url,
                icon,
                type
            };

            // 如果是自定义链接，保存到localStorage
            if (currentEditIndex >= 8) {
                saveData('customLinks', quickLinks.slice(8));
            }

            renderQuickLinks();
            renderCustomLinksList();
            showStatusMessage('链接已更新');
        } else {
            showStatusMessage('请填写完整的链接信息', 5000);
        }
    } else if (currentEditType === 'quote') {
        const text = document.getElementById('edit-quote-text').value.trim();

        if (text) {
            quotes[currentEditIndex].text = text;
            saveData('customQuotes', quotes);

            renderCustomQuotesList();
            showStatusMessage('文本已更新');

            // 如果当前显示的是被编辑的文本，更新显示
            if (randomTextElement.textContent === currentEditItem.text) {
                updateRandomText();
            }
        } else {
            showStatusMessage('请输入文本内容', 5000);
        }
    }

    closeEditModalFunc();
}

// 关闭编辑模态框
function closeEditModalFunc() {
    editModal.style.display = 'none';
    currentEditItem = null;
    currentEditType = null;
    currentEditIndex = null;
}

// 初始化设置
function initSettings() {
    // 加载数据
    loadData();

    // 颜色选择
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            const color = option.dataset.color;

            // 应用颜色
            document.documentElement.style.setProperty('--time-color', color);
            document.documentElement.style.setProperty('--date-color', color.replace(')', ', 0.8)').replace('rgb', 'rgba'));
            document.documentElement.style.setProperty('--text-color', color.replace(')', ', 0.85)').replace('rgb', 'rgba'));

            // 保存颜色
            localStorage.setItem('selectedColor', color);
        });
    });

    // 字体选择
    document.querySelectorAll('.font-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.font-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            const font = option.dataset.font;

            // 应用到整个页面
            document.documentElement.style.setProperty('--global-font', font);
            localStorage.setItem('selectedFont', font);

            // 立即更新设置面板的字体
            document.querySelectorAll('.settings-panel, .modal-content').forEach(el => {
                el.style.fontFamily = font;
            });

            showStatusMessage(`字体已更改为 ${option.textContent}`);
        });
    });

    // 时间大小调整
    const timeSizeSlider = document.getElementById('time-size');
    const timeSizeValue = document.getElementById('time-size-value');

    timeSizeSlider.addEventListener('input', () => {
        const size = timeSizeSlider.value;
        timeSizeValue.textContent = `${size}vw`;
        timeElement.style.fontSize = `${size}vw`;
    });

    // 进入动画效果选择
    document.querySelectorAll('[data-animation-in]').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('[data-animation-in]').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            animationIn = option.dataset.animationIn;
            localStorage.setItem('animationIn', animationIn);
        });
    });

    // 离开动画效果选择
    document.querySelectorAll('[data-animation-out]').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('[data-animation-out]').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            animationOut = option.dataset.animationOut;
            localStorage.setItem('animationOut', animationOut);
        });
    });

    // 文字切换间隔
    const textChangeSlider = document.getElementById('text-change');
    const textChangeValue = document.getElementById('text-change-value');

    textChangeSlider.addEventListener('input', () => {
        const seconds = textChangeSlider.value;
        textChangeValue.textContent = seconds;
        clearInterval(textInterval);
        textInterval = setInterval(updateRandomText, seconds * 1000);
        showStatusMessage(`文本切换间隔已设为 ${seconds} 秒`);
    });

    // 背景切换间隔
    const bgChangeSlider = document.getElementById('bg-change');
    const bgChangeValue = document.getElementById('bg-change-value');

    bgChangeSlider.addEventListener('input', () => {
        const seconds = bgChangeSlider.value;
        bgChangeValue.textContent = seconds;
        if (bgSwitching) {
            clearInterval(bgInterval);
            bgInterval = setInterval(() => changeBackground(false), seconds * 1000);
            showStatusMessage(`背景切换间隔已设为 ${seconds} 秒`);
        }
    });

    // 添加搜索引擎
    document.getElementById('add-engine-btn').addEventListener('click', () => {
        const name = document.getElementById('new-engine-name').value.trim();
        const url = document.getElementById('new-engine-url').value.trim();

        if (name && url && url.includes('{query}')) {
            searchEngines.push({
                name,
                url,
                custom: true
            });
            saveData('customEngines', searchEngines.filter(engine => !engine.default));

            document.getElementById('new-engine-name').value = '';
            document.getElementById('new-engine-url').value = '';

            renderSearchEngineSelector();
            renderCustomEnginesList();
            showStatusMessage('搜索引擎已添加');
        } else {
            showStatusMessage('请填写完整的搜索引擎信息，URL必须包含{query}', 5000);
        }
    });

    // 添加快捷链接
    document.getElementById('add-link-btn').addEventListener('click', () => {
        const name = document.getElementById('new-link-name').value.trim();
        const url = document.getElementById('new-link-url').value.trim();
        const icon = document.getElementById('new-link-icon').value.trim();

        if (name && url && icon) {
            // 判断是Font Awesome还是图片URL
            const type = icon.startsWith('http') ? 'img' : 'fa';

            quickLinks.push({
                id: Date.now(),
                name,
                url,
                icon,
                type,
                custom: true
            });
            saveData('customLinks', quickLinks.filter(link => link.custom));

            document.getElementById('new-link-name').value = '';
            document.getElementById('new-link-url').value = '';
            document.getElementById('new-link-icon').value = '';

            renderQuickLinks();
            renderCustomLinksList();
            showStatusMessage('快捷链接已添加');
        } else {
            showStatusMessage('请填写完整的链接信息', 5000);
        }
    });

    // 添加随机文本
    document.getElementById('add-quote-btn').addEventListener('click', () => {
        const text = document.getElementById('new-quote-text').value.trim();

        if (text) {
            quotes.push({
                id: Date.now(),
                text
            });
            saveData('customQuotes', quotes);

            document.getElementById('new-quote-text').value = '';
            renderCustomQuotesList();
            showStatusMessage('文本已添加');
        } else {
            showStatusMessage('请输入文本内容', 5000);
        }
    });

    // 更新背景图片
    document.getElementById('update-bg-btn').addEventListener('click', () => changeBackground(true));

    // 停止/开始背景切换
    document.getElementById('stop-bg-btn').addEventListener('click', () => {
        clearInterval(bgInterval);
        bgInterval = null;
        bgSwitching = false;
        document.getElementById('bg-toggle-btn').classList.remove('btn-success');
        document.getElementById('bg-toggle-btn').classList.add('btn-danger');
        document.getElementById('bg-toggle-btn').innerHTML = '<i class="fas fa-stop"></i> 切换已停止';
        showStatusMessage('背景切换已停止');
    });

    document.getElementById('bg-toggle-btn').addEventListener('click', function() {
        if (bgSwitching) {
            clearInterval(bgInterval);
            bgInterval = null;
            bgSwitching = false;
            this.classList.remove('btn-success');
            this.classList.add('btn-danger');
            this.innerHTML = '<i class="fas fa-stop"></i> 切换已停止';
            showStatusMessage('背景切换已停止');
        } else {
            const seconds = document.getElementById('bg-change').value;
            bgInterval = setInterval(() => changeBackground(false), seconds * 1000);
            bgSwitching = true;
            this.classList.remove('btn-danger');
            this.classList.add('btn-success');
            this.innerHTML = '<i class="fas fa-play"></i> 切换背景';
            showStatusMessage('背景切换已启动');
        }
    });

    // 切换文本显示
    toggleTextBtn.addEventListener('click', function() {
        textVisible = !textVisible;
        this.classList.toggle('active', textVisible);
        randomTextElement.style.display = textVisible ? 'flex' : 'none';
        centerContainer.classList.toggle('text-hidden', !textVisible);
        saveData('showText', textVisible);
        if (textVisible) {
            showStatusMessage('文本已显示');
            updateRandomText();
        } else {
            showStatusMessage('文本已隐藏');
        }
    });

    // 切换搜索栏显示
    toggleSearchBtn.addEventListener('click', function() {
        searchVisible = !searchVisible;
        this.classList.toggle('active', searchVisible);
        updateVisibility();
        showStatusMessage(searchVisible ? '搜索栏已显示' : '搜索栏已隐藏');
    });

    // 切换快捷链接显示
    toggleLinksBtn.addEventListener('click', function() {
        linksVisible = !linksVisible;
        this.classList.toggle('active', linksVisible);
        updateVisibility();
        showStatusMessage(linksVisible ? '快捷链接已显示' : '快捷链接已隐藏');
    });

    // 初始更新显示设置
    updateVisibility();

    // 渲染初始列表
    renderSearchEngineSelector();
    renderCustomEnginesList();
    renderQuickLinks();
    renderCustomLinksList();
    renderCustomQuotesList();
}

// 事件监听
fullscreenBtn.addEventListener('click', toggleFullscreen);
settingsBtn.addEventListener('click', toggleSettings);
closeSettingsBtn.addEventListener('click', toggleSettings);

// 搜索功能
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const engineElement = document.querySelector('.animation-option[data-engine].active');
        if (!engineElement) return;

        const engineName = engineElement.dataset.engine;
        const engine = searchEngines.find(e => e.name === engineName);

        if (engine) {
            const query = encodeURIComponent(searchInput.value);
            const url = engine.url.replace('{query}', query);
            window.open(url, '_blank');
            searchInput.value = '';
        }
    }
});

// 退出全屏时显示按钮
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        fullscreenBtn.style.display = 'flex';
    }
});

// 编辑模态框事件
closeEditModal.addEventListener('click', closeEditModalFunc);
cancelEditBtn.addEventListener('click', closeEditModalFunc);
saveEditBtn.addEventListener('click', saveEdit);

// 点击模态框外部关闭
window.addEventListener('click', (e) => {
    if (e.target === editModal) {
        closeEditModalFunc();
    }
});

// 初始化
updateDateTime();
updateRandomText();
changeBackground(false);
initSettings();

// 设置定时器
setInterval(updateDateTime, 1000);
const textSeconds = parseInt(document.getElementById('text-change').value);
textInterval = setInterval(updateRandomText, textSeconds * 1000);
const bgSeconds = parseInt(document.getElementById('bg-change').value);
bgInterval = setInterval(() => changeBackground(false), bgSeconds * 1000);

// 性能优化：取消不必要的动画和监听器
window.addEventListener('blur', () => {
    clearInterval(textInterval);
    clearInterval(bgInterval);
});

window.addEventListener('focus', () => {
    const textSeconds = parseInt(document.getElementById('text-change').value);
    const bgSeconds = parseInt(document.getElementById('bg-change').value);

    textInterval = setInterval(updateRandomText, textSeconds * 1000);
    if (bgSwitching) {
        bgInterval = setInterval(() => changeBackground(false), bgSeconds * 1000);
    }
});