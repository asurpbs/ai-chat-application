# AI Chat Application# Modern Chat Application



A modern, Grok-inspired AI chat application with advanced markdown rendering, code syntax highlighting, mathematical equations, and customizable settings.A responsive web-based chat interface for conversations with an AI assistant.



## ✨ Features## Features



### Core Features1. Chat with an AI assistant in real-time

- 🎨 **Grok-inspired UI** - Beautiful, modern interface with clean design2. Supports markdown and syntax highlighting

- 🌓 **Dark/Light Mode** - Toggle between themes with smooth transitions3. Conversations are stored locally for seamless interactions across devices

- 📱 **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop4. Start new conversations using the **New Chat** button

- 💬 **Multiple Conversations** - Manage and switch between different chat sessions5. Switch between past conversations using the sidebar

- 💾 **Auto-save** - All conversations saved locally in browser storage6. Toggle between light and dark modes using the theme button in the header



### Advanced Formatting## API Integration

- 📝 **Markdown Support** - Full markdown rendering with GFM support

- 💻 **Code Highlighting** - Syntax highlighting for 100+ programming languagesThis application is configured to connect seamlessly with AI APIs to provide intelligent conversational experiences.

- 🔢 **Math Equations** - LaTeX/KaTeX support for mathematical expressions
- 📋 **Copy Code** - One-click copy button for all code blocks
- 🎯 **Professional Typography** - Noto Sans for text, Cascadia Mono for code

### AI Models
- 🤖 **Multiple Models** - Choose from 5 different AI models:
  - Qwen 3 32B (default)
  - GPT OSS 120B
  - GPT OSS 20B
  - Llama 4 Maverick
  - Kimi K2 Instruct

### Customization
- ⚙️ **Settings Panel** - Customize your experience:
  - System Prompt - Define AI behavior and responses
  - Font Size - Small, Medium, or Large
  - Code Theme - Choose from multiple syntax themes
- 🎨 **Code Themes Available**:
  - GitHub Dark
  - Monokai
  - Atom One Dark
  - VS 2015

## 🚀 Getting Started

1. **Clone or Download** this repository
2. **Open** `index.html` in your web browser
3. **Start Chatting!** - No installation or API key required

## 💡 Usage

### Basic Chat
- Type your message in the input field
- Press `Enter` or click the send button
- View AI responses with beautiful formatting

### Managing Chats
- Click "New Chat" to start a new conversation
- Click on any chat in the sidebar to switch to it
- Hover over a chat and click the trash icon to delete it

### Settings
- Click the ⚙️ gear icon to open settings
- Customize the system prompt to change AI behavior
- Adjust font size for better readability
- Choose your preferred code highlighting theme
- Click "Save Settings" to apply changes
- Click "Reset to Default" to restore defaults

### Model Selection
- Use the dropdown in the header to select a different AI model
- Selection is saved automatically for future sessions

### Dark Mode
- Click the 🌙/☀️ icon to toggle between light and dark themes
- Theme preference is saved automatically

## 🛠️ Technologies Used

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **JavaScript (ES6+)** - Modern async/await patterns

### Libraries
- **Marked.js** - Markdown parsing
- **Highlight.js** - Code syntax highlighting
- **KaTeX** - Mathematical equation rendering
- **Font Awesome** - Icon library

### Fonts
- **Noto Sans** - Main UI font (Google Fonts)
- **Cascadia Mono** - Code font (Google Fonts)

### API
- **Hack Club AI** - Free AI API endpoint (ai.hackclub.com)

## 📁 Project Structure

```
ai-chat-application/
├── index.html          # Main HTML file
├── README.md           # This file
├── css/
│   └── styles.css      # All styles and themes
└── js/
    └── script.js       # Application logic and API integration
```

## 🎯 Key Features Explained

### Markdown Rendering
The app parses and renders markdown with full GFM support:
- Headers (H1-H6)
- Lists (ordered and unordered)
- Code blocks (inline and fenced)
- Tables
- Blockquotes
- Links and images
- Horizontal rules

### Code Syntax Highlighting
Code blocks are automatically detected and highlighted:
```python
def hello_world():
    print("Hello, World!")
```

### Mathematical Equations
Supports both inline and display math:
- Inline: `$E = mc^2$`
- Display: `$$\int_{a}^{b} f(x) dx$$`

## 🔧 Customization

### System Prompt
The default system prompt optimizes AI for:
- Programming assistance
- Mathematical problem-solving
- Scientific explanations
- Clear, structured responses

You can customize this in Settings to change AI behavior.

### Styling
All colors and themes are defined using CSS variables in `styles.css`, making it easy to customize the appearance.

## 📱 Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

Feel free to fork, modify, and submit pull requests!

## 📄 License

MIT License - Free to use for personal and commercial projects

## 🙏 Acknowledgments

- **Hack Club** for providing the free AI API
- **Grok (X.AI)** for design inspiration
- Open source community for amazing libraries
