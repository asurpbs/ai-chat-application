document.addEventListener('DOMContentLoaded', () => {
    console.log('App initializing...');
    
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const loading = document.getElementById('loading');
    const chatList = document.getElementById('chatList');
    const newChatBtn = document.getElementById('newChatBtn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const modelDisplayBtn = document.getElementById('modelDisplayBtn');
    const currentModelName = document.getElementById('currentModelName');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');
    const systemPromptTextarea = document.getElementById('systemPrompt');
    const fontSizeSelect = document.getElementById('fontSize');
    const codeThemeSelect = document.getElementById('codeTheme');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const mobileNewChatBtn = document.getElementById('mobileNewChatBtn');
    const modelModal = document.getElementById('modelModal');
    const closeModelBtn = document.getElementById('closeModelBtn');
    const modelList = document.getElementById('modelList');
    const searchChats = document.getElementById('searchChats');
    
    // Check if all elements are found
    if (!modelDisplayBtn) console.error('modelDisplayBtn not found');
    if (!modelModal) console.error('modelModal not found');
    if (!toggleSidebarBtn) console.error('toggleSidebarBtn not found');
    if (!sidebar) console.error('sidebar not found');
    
    console.log('All elements loaded successfully');
    
    // Encrypted API endpoint (Base64 encoded)
    const getAPIEndpoint = () => atob('aHR0cHM6Ly9haS5oYWNrY2x1Yi5jb20vY2hhdC9jb21wbGV0aW9ucw==');
    
    const DEFAULT_SYSTEM_PROMPT = `Be talkative and conversational. Respond with corporate jargon. Readily share strong opinions. Get right to the point. Take a forward-thinking view.`;
    
    // Model descriptions with capabilities
    const MODEL_INFO = {
        'qwen/qwen3-32b': {
            name: 'Qwen 3',
            fullName: 'Qwen 3 32B',
            description: 'General purpose model with balanced performance for everyday tasks',
            reasoning: false
        },
        'openai/gpt-oss-120b': {
            name: 'GPT OSS',
            fullName: 'GPT OSS 120B',
            description: 'Advanced reasoning model for complex analysis and deep thinking',
            reasoning: true
        },
        'openai/gpt-oss-20b': {
            name: 'GPT Fast',
            fullName: 'GPT OSS 20B',
            description: 'Fast and efficient model for quick responses',
            reasoning: false
        },
        'meta-llama/llama-4-maverick': {
            name: 'Llama 4',
            fullName: 'Llama 4 Maverick',
            description: 'Creative and versatile model for diverse applications',
            reasoning: false
        },
        'moonshotai/kimi-k2-instruct-0905': {
            name: 'Kimi K2',
            fullName: 'Kimi K2 Instruct',
            description: 'Specialized in instruction following and structured tasks',
            reasoning: false
        }
    };
    
    let settings = {
        systemPrompt: localStorage.getItem('systemPrompt') || DEFAULT_SYSTEM_PROMPT,
        fontSize: localStorage.getItem('fontSize') || 'medium',
        codeTheme: localStorage.getItem('codeTheme') || 'github-dark',
        model: localStorage.getItem('selectedModel') || 'qwen/qwen3-32b',
        darkMode: localStorage.getItem('darkMode') === 'true'
    };
    
    let chats = JSON.parse(localStorage.getItem('chats')) || [];
    let currentChatId = localStorage.getItem('currentChatId');
    
    marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: false,
        mangle: false
    });
    
    initializeApp();
    
    function initializeApp() {
        loadSettings();
        if (settings.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggleBtn.querySelector('i').className = 'fas fa-sun';
        }
        renderModelList();
        renderChatList();
        if (currentChatId && chats.find(c => c.id === currentChatId)) {
            loadChat(currentChatId);
        } else {
            createNewChat();
        }
        updateCurrentModelDisplay();
    }
    
    function renderModelList() {
        modelList.innerHTML = '';
        Object.keys(MODEL_INFO).forEach(modelKey => {
            const info = MODEL_INFO[modelKey];
            const modelItem = document.createElement('div');
            modelItem.className = `model-item ${settings.model === modelKey ? 'active' : ''}`;
            modelItem.innerHTML = `
                <div class="model-item-header">
                    <div class="model-item-name">
                        ${info.name}
                        ${info.reasoning ? '<span class="model-reasoning-badge">🧠 Reasoning</span>' : ''}
                    </div>
                    ${settings.model === modelKey ? '<i class="fas fa-check model-check-icon"></i>' : ''}
                </div>
                <div class="model-item-description">${info.description}</div>
            `;
            modelItem.addEventListener('click', () => {
                settings.model = modelKey;
                localStorage.setItem('selectedModel', settings.model);
                updateCurrentModelDisplay();
                renderModelList();
                modelModal.classList.remove('active');
                if (info.reasoning) {
                    console.log(`%c🧠 Switched to Reasoning Model: ${info.fullName}`, 'color: #0a84ff; font-weight: bold; font-size: 14px;');
                    console.log(`%c${info.description}`, 'color: #888; font-size: 12px;');
                }
            });
            modelList.appendChild(modelItem);
        });
    }
    
    function updateCurrentModelDisplay() {
        const currentModel = MODEL_INFO[settings.model];
        if (currentModel) {
            currentModelName.textContent = currentModel.name;
        }
    }
    
    function updateModelDescription() {
        const currentModel = MODEL_INFO[settings.model];
        if (currentModel && currentModel.reasoning) {
            console.log(`%c🧠 Reasoning Model Active: ${currentModel.fullName}`, 'color: #0a84ff; font-weight: bold; font-size: 14px;');
            console.log(`%c${currentModel.description}`, 'color: #888; font-size: 12px;');
            console.log('%cThis model provides detailed thinking process in responses.', 'color: #888; font-style: italic; font-size: 12px;');
        }
    }
    
    function loadSettings() {
        systemPromptTextarea.value = settings.systemPrompt;
        fontSizeSelect.value = settings.fontSize;
        codeThemeSelect.value = settings.codeTheme;
        document.body.className = `font-${settings.fontSize}`;
        loadCodeTheme(settings.codeTheme);
    }
    
    function loadCodeTheme(theme) {
        const link = document.querySelector('link[href*="highlight.js/11.7.0/styles/github-dark"]');
        if (link) {
            link.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/${theme}.min.css`;
        }
    }
    
    function saveSettings() {
        settings.systemPrompt = systemPromptTextarea.value;
        settings.fontSize = fontSizeSelect.value;
        settings.codeTheme = codeThemeSelect.value;
        localStorage.setItem('systemPrompt', settings.systemPrompt);
        localStorage.setItem('fontSize', settings.fontSize);
        localStorage.setItem('codeTheme', settings.codeTheme);
        document.body.className = `font-${settings.fontSize}`;
        loadCodeTheme(settings.codeTheme);
        settingsModal.classList.remove('active');
        showNotification('Settings saved successfully!');
    }
    
    function resetSettings() {
        settings.systemPrompt = DEFAULT_SYSTEM_PROMPT;
        settings.fontSize = 'medium';
        settings.codeTheme = 'github-dark';
        systemPromptTextarea.value = settings.systemPrompt;
        fontSizeSelect.value = settings.fontSize;
        codeThemeSelect.value = settings.codeTheme;
        showNotification('Settings reset to default');
    }
    
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--accent-color);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    function toggleTheme() {
        settings.darkMode = !settings.darkMode;
        localStorage.setItem('darkMode', settings.darkMode);
        if (settings.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggleBtn.querySelector('i').className = 'fas fa-sun';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            themeToggleBtn.querySelector('i').className = 'fas fa-moon';
        }
    }
    
    function createNewChat() {
        const newChat = {
            id: Date.now().toString(),
            title: 'New conversation',
            messages: [],
            createdAt: new Date().toISOString()
        };
        chats.unshift(newChat);
        currentChatId = newChat.id;
        localStorage.setItem('chats', JSON.stringify(chats));
        localStorage.setItem('currentChatId', currentChatId);
        chatBox.innerHTML = '';
        currentChatTitle.textContent = newChat.title;
        renderChatList();
        if (window.innerWidth <= 768) {
            closeSidebar();
        }
    }
    
    function loadChat(chatId) {
        const chat = chats.find(c => c.id === chatId);
        if (!chat) return;
        currentChatId = chatId;
        localStorage.setItem('currentChatId', currentChatId);
        chatBox.innerHTML = '';
        currentChatTitle.textContent = chat.title;
        chat.messages.forEach(msg => {
            displayMessage(msg.content, msg.role);
        });
        renderChatList();
        scrollToBottom();
    }
    
    function deleteChat(chatId) {
        chats = chats.filter(c => c.id !== chatId);
        localStorage.setItem('chats', JSON.stringify(chats));
        if (currentChatId === chatId) {
            if (chats.length > 0) {
                loadChat(chats[0].id);
            } else {
                createNewChat();
            }
        }
        renderChatList();
    }
    
    function renderChatList(searchTerm = '') {
        chatList.innerHTML = '';
        const filteredChats = searchTerm 
            ? chats.filter(chat => chat.title.toLowerCase().includes(searchTerm))
            : chats;
        
        if (filteredChats.length === 0 && searchTerm) {
            chatList.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary); font-size: 14px;">No conversations found</div>';
            return;
        }
        
        filteredChats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chat.id === currentChatId ? 'active' : ''}`;
            const chatText = document.createElement('span');
            chatText.className = 'chat-item-text';
            chatText.textContent = chat.title;
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-chat-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                if (confirm('Delete this conversation?')) {
                    deleteChat(chat.id);
                }
            };
            chatItem.appendChild(chatText);
            chatItem.appendChild(deleteBtn);
            chatItem.onclick = () => {
                loadChat(chat.id);
                closeSidebar();
            };
            chatList.appendChild(chatItem);
        });
    }
    
    async function handleSendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        displayMessage(message, 'user');
        const currentChat = chats.find(c => c.id === currentChatId);
        if (currentChat) {
            currentChat.messages.push({ role: 'user', content: message });
            if (currentChat.messages.length === 1) {
                currentChat.title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
                renderChatList();
            }
            localStorage.setItem('chats', JSON.stringify(chats));
        }
        userInput.value = '';
        userInput.style.height = 'auto';
        loading.classList.add('active');
        sendBtn.disabled = true;
        try {
            const messages = [
                { role: 'system', content: settings.systemPrompt },
                ...currentChat.messages
            ];
            settings.model = modelSelect.value;
            localStorage.setItem('selectedModel', settings.model);
            updateModelDescription();
            
            // Build API endpoint with model parameter
            const apiUrl = `${getAPIEndpoint()}?model=${encodeURIComponent(settings.model)}`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: messages
                })
            });
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            const data = await response.json();
            const aiMessage = data.choices[0].message.content;
            
            // Check if model is a reasoning model and log thinking process
            const currentModelInfo = MODEL_INFO[settings.model];
            if (currentModelInfo && currentModelInfo.reasoning) {
                console.group(`🧠 ${currentModelInfo.name} - Detailed Thinking Process`);
                console.log('%cModel:', 'font-weight: bold;', currentModelInfo.name);
                console.log('%cCapability:', 'font-weight: bold;', currentModelInfo.description);
                console.log('%cThinking Tags Visible:', 'font-weight: bold;', 'Check response for detailed reasoning steps');
                console.log('%cFull Response:', 'font-weight: bold; color: #0a84ff;');
                console.log(aiMessage);
                console.groupEnd();
            }
            
            displayMessage(aiMessage, 'assistant');
            currentChat.messages.push({ role: 'assistant', content: aiMessage });
            localStorage.setItem('chats', JSON.stringify(chats));
        } catch (error) {
            console.error('Error:', error);
            displayMessage('Sorry, there was an error processing your request. Please try again.', 'assistant');
        } finally {
            loading.classList.remove('active');
            sendBtn.disabled = false;
            scrollToBottom();
        }
    }
    
    function displayMessage(content, role) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role === 'user' ? 'user-message' : 'ai-message'}`;
        if (role === 'assistant') {
            // Check if this is a reasoning model and add indicator
            const currentModelInfo = MODEL_INFO[settings.model];
            if (currentModelInfo && currentModelInfo.reasoning) {
                const reasoningBadge = document.createElement('div');
                reasoningBadge.style.cssText = `
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    margin-bottom: 8px;
                `;
                reasoningBadge.innerHTML = '🧠 Reasoning Model - Detailed thinking visible in console (F12)';
                messageDiv.appendChild(reasoningBadge);
            }
            
            const html = marked.parse(content);
            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = processMarkdown(html);
            messageDiv.appendChild(contentDiv);
            
            messageDiv.querySelectorAll('pre code').forEach((block) => {
                if (window.hljs) {
                    hljs.highlightElement(block);
                }
            });
            if (window.renderMathInElement) {
                renderMathInElement(messageDiv, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\(', right: '\\)', display: false},
                        {left: '\\[', right: '\\]', display: true}
                    ],
                    throwOnError: false
                });
            }
        } else {
            messageDiv.textContent = content;
        }
        chatBox.appendChild(messageDiv);
        scrollToBottom();
    }
    
    function processMarkdown(html) {
        html = html.replace(/<pre><code class="language-(\w+)"([^>]*)>([\s\S]*?)<\/code><\/pre>/g, (match, lang, attrs, code) => {
            return `
                <pre>
                    <div class="code-header">
                        <span class="code-language">${lang}</span>
                        <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                    </div>
                    <code class="language-${lang}"${attrs}>${code}</code>
                </pre>
            `;
        });
        html = html.replace(/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g, (match, attrs, code) => {
            return `
                <pre>
                    <div class="code-header">
                        <span class="code-language">code</span>
                        <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                    </div>
                    <code${attrs}>${code}</code>
                </pre>
            `;
        });
        return html;
    }
    
    window.copyCode = function(button) {
        const pre = button.closest('pre');
        const code = pre.querySelector('code');
        const text = code.textContent;
        navigator.clipboard.writeText(text).then(() => {
            button.textContent = 'Copied!';
            button.classList.add('copied');
            setTimeout(() => {
                button.textContent = 'Copy';
                button.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    };
    
    function scrollToBottom() {
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    
    function toggleSidebar() {
        console.log('Toggle sidebar called');
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('active');
        console.log('Sidebar classes:', sidebar.className);
    }
    
    function closeSidebar() {
        console.log('Close sidebar called');
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
    }
    
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = Math.min(userInput.scrollHeight, 200) + 'px';
    });
    
    sendBtn.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    newChatBtn.addEventListener('click', createNewChat);
    if (mobileNewChatBtn) {
        mobileNewChatBtn.addEventListener('click', createNewChat);
    }
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Model modal handlers
    modelDisplayBtn.addEventListener('click', () => {
        console.log('Model button clicked');
        modelModal.classList.add('active');
        console.log('Modal classes:', modelModal.className);
    });
    closeModelBtn.addEventListener('click', () => {
        console.log('Close model button clicked');
        modelModal.classList.remove('active');
    });
    modelModal.addEventListener('click', (e) => {
        if (e.target === modelModal) {
            modelModal.classList.remove('active');
        }
    });
    
    // Settings modal handlers
    settingsBtn.addEventListener('click', () => {
        console.log('Settings button clicked');
        settingsModal.classList.add('active');
    });
    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('active');
    });
    saveSettingsBtn.addEventListener('click', saveSettings);
    resetSettingsBtn.addEventListener('click', resetSettings);
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('active');
        }
    });
    
    // Sidebar handlers
    toggleSidebarBtn.addEventListener('click', toggleSidebar);
    closeSidebarBtn.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);
    
    console.log('All event listeners attached');
    
    // Search chats
    searchChats.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        renderChatList(searchTerm);
    });
});
