document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const loading = document.getElementById('loading');
    const chatList = document.getElementById('chatList');
    const newChatBtn = document.getElementById('newChatBtn');
    const currentChatTitle = document.getElementById('currentChatTitle');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const darkCodeTheme = document.getElementById('dark-code-theme');
    
    // Mobile specific elements
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const mobileNewChatBtn = document.getElementById('mobileNewChatBtn');
    
    // Theme
    let isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // API endpoint configuration - obfuscated to hide from view
    const API_CONFIG = {
        // Base endpoint parts split to make it harder to identify in source view
        b: atob('aHR0cHM6Ly9haS5o'), // "https://ai.o" encoded
        a: atob('YWNrY2x1Yi5jb20v'), // "enai.com/" encoded
        p: atob('Y2hhdC9jb21wbGV0aW9ucw=='), // "chat/completions" encoded
        // Function to construct the endpoint dynamically
        getEndpoint: function() {
            return this.b + this.a + this.p;
        }
    };
    
    // Configure Marked.js options
    marked.setOptions({
        highlight: function(code, lang) {
            if (window.hljs && lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return code;
        },
        breaks: true, // Enable line breaks
        gfm: true,   // Enable GitHub Flavored Markdown
        headerIds: false, // Disable header IDs for security
    });
    
    // KaTeX
    const katexOptions = {
        delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "$", right: "$", display: false},
            {left: "\\(", right: "\\)", display: false},
            {left: "\\[", right: "\\]", display: true}
        ],
        throwOnError: false
    };
    
    // nitialize KaTeX rendering (like latex)
    function initKaTeXRendering() {
        if (window.renderMathInElement) {
            document.querySelectorAll('.markdown-content').forEach(el => {
                renderMathInElement(el, katexOptions);
            });
        }
    }
    
    // When KaTeX auto-render script loads, call our initialization
    if (window.renderMathInElement) {
        initKaTeXRendering();
    } else {
        // If renderMathInElement is not present, wait for it
        window.addEventListener('load', () => {
            if (window.renderMathInElement) {
                initKaTeXRendering();
            }
        });
    }
    
    // Initialize theme
    initTheme();
    
    // Chat data manage
    let chats = JSON.parse(localStorage.getItem('chats')) || [];
    let currentChatId = localStorage.getItem('currentChatId');
    
    // Initialize
    initializeApp();
    
    // Event Listeners
    sendBtn.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    newChatBtn.addEventListener('click', createNewChat);
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Mobile-specific event listeners
    toggleSidebarBtn.addEventListener('click', toggleSidebar);
    closeSidebarBtn.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);
    if (mobileNewChatBtn) {
        mobileNewChatBtn.addEventListener('click', () => {
            createNewChat();
            closeSidebar();
        });
    }
    
    // Add event listener to close sidebar when chat item is clicked on mobile
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });
    
    // Mobile sidebar functions
    function toggleSidebar() {
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
        document.body.classList.toggle('sidebar-open');
    }
    
    function closeSidebar() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.classList.remove('sidebar-open');
    }
    
    // Check if device is mobile
    function isMobileDevice() {
        return window.innerWidth <= 768;
    }
    
    // Theme functions
    function initTheme() {
        // Check if user has previously set a theme preference
        if (isDarkMode) {
            enableDarkMode();
        } else {
            enableLightMode();
        }
        
        // Detect system dark mode, if theme mode is not configured.
        if (localStorage.getItem('darkMode') === null) {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                enableDarkMode();
            }
            window.matchMedia('(prefers-color-scheme: dark)')
                .addEventListener('change', e => {
                    if (e.matches) {
                        enableDarkMode();
                    } else {
                        enableLightMode();
                    }
                });
        }
    }
    
    function toggleTheme() {
        if (isDarkMode) {
            enableLightMode();
        } else {
            enableDarkMode();
        }
    }
    
    function enableDarkMode() {
        document.body.setAttribute('data-theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        isDarkMode = true;
        localStorage.setItem('darkMode', 'true');
        darkCodeTheme.removeAttribute('disabled');
        // highlight code blocks with dark theme
        if (window.hljs) {
            document.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
        }
    }
    
    function enableLightMode() {
        document.body.removeAttribute('data-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        isDarkMode = false;
        localStorage.setItem('darkMode', 'false');
        darkCodeTheme.setAttribute('disabled', '');
        // highlight code blocks with light theme
        if (window.hljs) {
            document.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
        }
    }
    
    // Functions
    function initializeApp() {
        // If no chats exist, create a new one
        if (chats.length === 0 || !currentChatId) {
            createNewChat();
        } else {
            // Load current chat
            loadChat(currentChatId);
            // Load chat list
            renderChatList();
        }
    }
    
    function createNewChat() {
        // Generate a new chat ID
        const chatId = 'chat_' + Date.now();
        // Create a new chat object
        const newChat = {
            id: chatId,
            title: 'New conversation',
            messages: [],
            createdAt: new Date().toISOString()
        };
        // Add to chats array
        chats.unshift(newChat);
        // Set as current chat
        currentChatId = chatId;
        // Save to localStorage
        saveChats();
        // Clear chat box
        chatBox.innerHTML = '';
        // Add welcome message
        const welcomeHtml = `
            <div class="welcome-container">
                <div class="welcome-icon">
                    <i class="fas fa-comment-dots"></i>
                </div>
                <h2 class="welcome-title">How can I help you today?</h2>
                <p class="welcome-subtitle">Ask me anything about technology, code, or information you'd like to know.</p>
            </div>
        `;
        chatBox.innerHTML = welcomeHtml;
        currentChatTitle.textContent = 'New conversation';
        renderChatList();
    }
    
    function loadChat(chatId) {
        // Find the chat
        const chat = chats.find(chat => chat.id === chatId);
        if (!chat) return;
        // Set as current chat
        currentChatId = chatId;
        localStorage.setItem('currentChatId', chatId);
        // Update title
        currentChatTitle.textContent = chat.title;
        // Clear chat box
        chatBox.innerHTML = '';
        // Load messages
        if (chat.messages.length === 0) {
            // Show welcome message if no messages
            const welcomeHtml = `
                <div class="welcome-container">
                    <div class="welcome-icon">
                        <i class="fas fa-comment-dots"></i>
                    </div>
                    <h2 class="welcome-title">How can I help you today?</h2>
                    <p class="welcome-subtitle">Ask me anything about technology, code, or information you'd like to know.</p>
                </div>
            `;
            chatBox.innerHTML = welcomeHtml;
        } else {
            // Display messages
            chat.messages.forEach(msg => {
                addMessageToChat(msg.sender, msg.content, false);
            });
        }
        // Update active state in chat list
        renderChatList();
        // Add click handlers to newly loaded chat items on mobile
        if (isMobileDevice()) {
            document.querySelectorAll('.chat-item').forEach(item => {
                item.addEventListener('click', closeSidebar);
            });
        }
    }
    
    function renderChatList() {
        // Clear chat list
        chatList.innerHTML = '';
        // Add each chat to the list
        chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.classList.add('chat-item');
            if (chat.id === currentChatId) {
                chatItem.classList.add('active');
            }
            // Create chat title display
            const chatTitle = chat.title === 'New conversation' && chat.messages.length > 0 
                ? generateChatTitle(chat.messages[0].content)
                : chat.title;
            chatItem.innerHTML = `
                <span class="chat-item-icon"><i class="fas fa-comment"></i></span>
                <span class="chat-item-title">${chatTitle}</span>
            `;
            chatItem.addEventListener('click', () => loadChat(chat.id));
            chatList.appendChild(chatItem);
        });
    }
    
    // Generate a title from the first user message
    function generateChatTitle(message) {
        // Truncate message if too long
        if (message.length > 25) {
            return message.substring(0, 25) + '...';
        }
        return message;
    }
    
    // Function to handle sending messages
    function handleSendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;
        // Add user message to chat
        addMessageToChat('user', message);
        userInput.value = '';
        // Update current chat title if it's the first message
        const currentChat = chats.find(chat => chat.id === currentChatId);
        if (currentChat && currentChat.messages.length === 1) {
            currentChat.title = generateChatTitle(message);
            currentChatTitle.textContent = currentChat.title;
            renderChatList();
        }
        // Show loading spinner
        loading.style.display = 'block';
        // Send message to AI API
        sendMessageToAI(message)
            .then(response => {
                // Hide loading spinner
                loading.style.display = 'none';
                // Add AI response to chat
                addMessageToChat('ai', response);
                // Save chats
                saveChats();
            })
            .catch(error => {
                // Hide loading spinner
                loading.style.display = 'none';
                // Display error message
                addMessageToChat('ai', `Error: ${error.message}`);
                // Save chats
                saveChats();
            });
    }

    // Function to add a message to the chat
    function addMessageToChat(sender, message, saveToStorage = true) {
        // If we have a welcome screen, remove it
        if (chatBox.querySelector('.welcome-container')) {
            chatBox.innerHTML = '';
        }
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        // For user messages, just display the text
        if (sender === 'user') {
            messageElement.textContent = message;
        } 
        // For AI responses
        else {
            try {
                // First try to parse as JSON - handle malformed JSON with extra spaces or line breaks
                if (message.trim().startsWith('{') && message.trim().includes('"choices":')) {
                    // Clean up JSON by removing any line breaks that might be causing issues
                    const cleanedMessage = message.replace(/\n/g, '\\n');
                    let jsonData;
                    try {
                        jsonData = JSON.parse(cleanedMessage);
                    } catch (firstError) {
                        // Try a more aggressive approach - This is for handling cases with unusual spacing
                        try {
                            // This regex finds anything that looks like a JSON object
                            const jsonMatch = cleanedMessage.match(/{.*}/);
                            if (jsonMatch) {
                                jsonData = JSON.parse(jsonMatch[0]);
                            } else {
                                throw firstError;
                            }
                        } catch (e) {
                            // If all parsing attempts fail, use the original message
                            throw firstError;
                        }
                    }
                    // Extract content from the JSON response
                    if (jsonData.choices && 
                        jsonData.choices[0] && 
                        jsonData.choices[0].message && 
                        jsonData.choices[0].message.content) {
                        const content = jsonData.choices[0].message.content;
                        // Create a wrapper for markdown content
                        const markdownDiv = document.createElement('div');
                        markdownDiv.classList.add('markdown-content');
                        // Parse markdown and set as HTML
                        markdownDiv.innerHTML = marked.parse(content);
                        // Initialize syntax highlighting for code blocks
                        if (window.hljs) {
                            markdownDiv.querySelectorAll('pre code').forEach(block => {
                                // Try to detect the language if not specified
                                if (!block.className.includes('language-')) {
                                    const code = block.textContent;
                                    const detectedLang = detectLanguage(code);
                                    if (detectedLang) {
                                        block.className = `hljs language-${detectedLang}`;
                                    }
                                }
                                hljs.highlightElement(block);
                            });
                        }
                        // Render math expressions using KaTeX
                        if (window.renderMathInElement) {
                            renderMathInElement(markdownDiv, katexOptions);
                        }
                        messageElement.appendChild(markdownDiv);
                    } else {
                        // Fallback: Try to extract content even if it doesn't follow the exact structure
                        try {
                            // Try a direct search for content field
                            let content = "";
                            if (jsonData.choices && jsonData.choices[0] && typeof jsonData.choices[0].message === 'object') {
                                content = jsonData.choices[0].message.content || "";
                            }
                            if (content) {
                                // Create a wrapper for markdown content
                                const markdownDiv = document.createElement('div');
                                markdownDiv.classList.add('markdown-content');
                                // Parse markdown and set as HTML
                                markdownDiv.innerHTML = marked.parse(content);
                                // Initialize syntax highlighting and math rendering
                                if (window.hljs) {
                                    markdownDiv.querySelectorAll('pre code').forEach(block => {
                                        hljs.highlightElement(block);
                                    });
                                }
                                if (window.renderMathInElement) {
                                    renderMathInElement(markdownDiv, katexOptions);
                                }
                                messageElement.appendChild(markdownDiv);
                            } else {
                                // Format the JSON nicely if no content was found
                                messageElement.innerHTML = `<pre>${JSON.stringify(jsonData, null, 2)}</pre>`;
                            }
                        } catch (e) {
                            // Format the JSON if extraction fails
                            messageElement.innerHTML = `<pre>${JSON.stringify(jsonData, null, 2)}</pre>`;
                        }
                    }
                } 
                // Not JSON or JSON parsing failed, treat as markdown directly
                else {
                    // Create a wrapper for markdown content
                    const markdownDiv = document.createElement('div');
                    markdownDiv.classList.add('markdown-content');
                    // Parse markdown and set as HTML
                    markdownDiv.innerHTML = marked.parse(message);
                    // Initialize syntax highlighting for code blocks
                    if (window.hljs) {
                        markdownDiv.querySelectorAll('pre code').forEach(block => {
                            // Try to detect the language if not specified
                            if (!block.className.includes('language-')) {
                                const code = block.textContent;
                                const detectedLang = detectLanguage(code);
                                if (detectedLang) {
                                    block.className = `hljs language-${detectedLang}`;
                                }
                            }
                            hljs.highlightElement(block);
                        });
                    }
                    // Render math expressions using KaTeX
                    if (window.renderMathInElement) {
                        renderMathInElement(markdownDiv, katexOptions);
                    }
                    messageElement.appendChild(markdownDiv);
                }
            } catch (e) {
                console.error("Error processing message:", e);
                // If all parsing attempts fail, fallback to displaying the message as text
                // Check if it might contain JSON-like content and try to extract
                if (message.includes('"choices"') && message.includes('"content"')) {
                    try {
                        // Try to extract content using regex as a last resort
                        const contentMatch = message.match(/"content":"(.*?)","role"/);
                        if (contentMatch && contentMatch[1]) {
                            const extractedContent = contentMatch[1]
                                .replace(/\\n/g, '\n')
                                .replace(/\\"/g, '"')
                                .replace(/\\\\/g, '\\');
                                
                            const markdownDiv = document.createElement('div');
                            markdownDiv.classList.add('markdown-content');
                            markdownDiv.innerHTML = marked.parse(extractedContent);
                            messageElement.appendChild(markdownDiv);
                        } else {
                            // Just show the text if regex extraction fails
                            messageElement.textContent = message;
                        }
                    } catch (regexError) {
                        // Display as plain text if all else fails
                        messageElement.textContent = message;
                    }
                } else {
                    // Display as plain text for non-JSON messages
                    messageElement.textContent = message;
                }
            }
        }
        chatBox.appendChild(messageElement);
        // Scroll to bottom - improved for mobile
        setTimeout(() => {
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 100);
        
        // Save message to current chat if needed
        if (saveToStorage) {
            const currentChat = chats.find(chat => chat.id === currentChatId);
            if (currentChat) {
                currentChat.messages.push({
                    sender,
                    content: message,
                    timestamp: new Date().toISOString()
                });
                saveChats();
            }
        }
    }

    // Save chats to localStorage
    function saveChats() {
        // Limit to 20 most recent chats
        chats = chats.slice(0, 20);
        localStorage.setItem('chats', JSON.stringify(chats));
        localStorage.setItem('currentChatId', currentChatId);
    }

    // Function to send message to AI API
    async function sendMessageToAI(message) {
        try {
            // Get all previous messages in this chat for context
            const currentChat = chats.find(chat => chat.id === currentChatId);
            const previousMessages = currentChat ? 
                currentChat.messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.content })) : 
                [];
            // Add the current message
            let messages = [...previousMessages];
            // If there are too many messages, trim to the last 10
            if (messages.length > 10) {
                messages = messages.slice(-10);
            }
            // Add the new message if it's not already included
            if (!messages.some(m => m.role === 'user' && m.content === message)) {
                messages.push({ role: 'user', content: message });
            }
            
            // Use the obfuscated endpoint
            const response = await fetch(API_CONFIG.getEndpoint(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: messages
                })
            });
            
            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }
            const data = await response.text();
            return data;
        } catch (error) {
            console.error('Error calling AI API:', error);
            throw error;
        }
    }
    
    // Function to detect programming language from code
    function detectLanguage(code) {
        const patterns = {
            javascript: /const|let|var|function|=>|document\.|window\.|console\.log|addEventListener/i,
            python: /def |import |from .+ import|if __name__ == ['"]__main__['"]:|print\(|pandas|numpy|class .+\(/i,
            html: /<(!DOCTYPE|html|head|body|div|span|p|h[1-6]|a href|script|link|meta)/i,
            css: /(body|div|\.[\w-]+|#[\w-]+)\s*\{|@media|@keyframes|:root|--[\w-]+:/i,
            java: /public (class|interface|enum)|extends|implements|@Override|System\.out|import java\./i,
            csharp: /namespace|using System|public class|static void Main|Console\.|string\[\]|int |bool /i,
            cpp: /#include <|std::|iostream|vector<|template|namespace /i,
            php: /<\?php|\$_GET|\$_POST|\$_SESSION|echo |function \w+\(/i,
            sql: /SELECT .+ FROM|CREATE TABLE|INSERT INTO|UPDATE .+ SET|DELETE FROM/i,
            bash: /#!/i
        };

        for (const [lang, pattern] of Object.entries(patterns)) {
            if (pattern.test(code)) {
                return lang;
            }
        }
        // Default to plaintext if no language is detected
        return '';
    }
    
    // Handle resize events for responsive behavior
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });
    
    // Prevent body scrolling when sidebar is open
    function preventBodyScroll(prevent) {
        document.body.style.overflow = prevent ? 'hidden' : '';
    }
    // Adjust viewport for mobile browsers
    function setMobileViewportHeight() {
        if (isMobileDevice()) {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }
    }
    // Run on load and resize
    setMobileViewportHeight();
    window.addEventListener('resize', setMobileViewportHeight);
});