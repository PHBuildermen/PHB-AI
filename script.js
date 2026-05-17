let apiKey = localStorage.getItem('phb_openai_key') || '';
let currentModel = localStorage.getItem('phb_model') || 'gpt-4o-mini';

const messagesContainer = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

function addMessage(text, isUser) {
    const div = document.createElement('div');
    div.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;

    if (isUser) {
        div.innerHTML = `<div class="max-w-[75%] chat-bubble-user rounded-3xl rounded-tr-none px-6 py-4">${text}</div>`;
    } else {
        div.innerHTML = `
            <div class="flex gap-3 max-w-[80%]">
                <div class="w-8 h-8 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">P</div>
                <div class="chat-bubble-ai rounded-3xl rounded-tl-none px-6 py-4">${text}</div>
            </div>`;
    }
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Improved API Call with better error handling
async function sendToOpenAI(message) {
    if (!apiKey) {
        addMessage("Please connect your OpenAI API key first.", false);
        return;
    }

    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = "flex justify-start";
    thinkingDiv.innerHTML = `
        <div class="flex gap-3">
            <div class="w-8 h-8 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white font-bold">P</div>
            <div class="chat-bubble-ai rounded-3xl rounded-tl-none px-6 py-4">Thinking...</div>
        </div>`;
    messagesContainer.appendChild(thinkingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: currentModel,
                messages: [
                    { 
                        role: "system", 
                        content: "You are PHB AI, a friendly, smart, and helpful AI assistant from the Philippines. Respond naturally and helpfully." 
                    },
                    { role: "user", content: message }
                ],
                temperature: 0.7,
            })
        });

        const data = await response.json();

        // Remove thinking message
        thinkingDiv.remove();

        if (!response.ok) {
            console.error("OpenAI Error:", data);
            addMessage(`❌ OpenAI Error: ${data.error?.message || response.statusText}`, false);
            return;
        }

        if (data.choices && data.choices[0]?.message?.content) {
            addMessage(data.choices[0].message.content, false);
        } else {
            addMessage("Sorry, I received an unexpected response from OpenAI.", false);
        }
    } catch (err) {
        thinkingDiv.remove();
        console.error(err);
        addMessage("Network error. Please check your internet connection or API key.", false);
    }
}

function initChat() {
    messagesContainer.innerHTML = '';
    addMessage("Hello! I'm PHB AI. How can I help you today? 😊", false);
}

// Form Submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    chatInput.value = '';
    sendToOpenAI(message);
});

// API Key Functions (unchanged)
function saveAPIKey() {
    const key = document.getElementById('api-key-input').value.trim();
    const model = document.getElementById('model-select').value;

    if (key && key.startsWith('sk-')) {
        apiKey = key;
        currentModel = model;
        localStorage.setItem('phb_openai_key', key);
        localStorage.setItem('phb_model', model);
        document.getElementById('model-name').textContent = model;
        closeModal();
        addMessage("✅ Successfully connected! Let's try again.", false);
    } else {
        alert("Please enter a valid OpenAI API key (starts with sk-)");
    }
}

function connectAPI() {
    document.getElementById('api-modal').classList.remove('hidden');
    document.getElementById('api-key-input').value = apiKey;
}

function closeModal() {
    document.getElementById('api-modal').classList.add('hidden');
}

// Initialize
window.onload = () => {
    initChat();
    if (apiKey) {
        document.getElementById('model-name').textContent = currentModel;
    }
};
