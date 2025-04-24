document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const budgetForm = document.getElementById('budgetForm');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatButton = document.querySelector('#chatForm button');
    const chatMessages = document.getElementById('chatMessages');
    const getStartedBtn = document.querySelector('.get-started-btn');
    const API_KEY = 'AIzaSyA6VaMbTZrB9IG7dn-lW8lrf75UsIvF6LI';
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    // Store user's budget information
    let userBudget = {
        amount: 0,
        frequency: 'weekly',
        householdSize: 1
    };

    // Initialize chat as disabled
    chatInput.disabled = true;
    chatButton.disabled = true;

    // Handle Get Started button click
    getStartedBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const chatSection = document.getElementById('chat');
        chatSection.scrollIntoView({ behavior: 'smooth' });
        
        // Add welcome message
        addChatMessage(
            "Welcome to the AI Grocery Budget Planner! To get started, please set your budget and household size in the form above. Then I can help you with meal planning and cost-saving tips.",
            'assistant'
        );
    });

    // Handle budget form submission
    budgetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        userBudget.frequency = document.getElementById('budgetFrequency').value;
        userBudget.amount = parseFloat(document.getElementById('budgetAmount').value);
        userBudget.householdSize = parseInt(document.getElementById('householdSize').value);

        // Validate inputs
        if (userBudget.amount <= 0 || userBudget.householdSize < 1) {
            alert('Please enter valid budget and household size values.');
            return;
        }

        // Calculate per-person budget
        const perPersonBudget = userBudget.amount / userBudget.householdSize;
        const frequencyText = userBudget.frequency === 'weekly' ? 'week' : 'month';

        // Enable chat
        chatInput.disabled = false;
        chatButton.disabled = false;

        // Add welcome message
        addChatMessage(
            `Welcome! I see you have a ${userBudget.frequency} budget of $${userBudget.amount.toFixed(2)} for ${userBudget.householdSize} people. 
            That's about $${perPersonBudget.toFixed(2)} per person per ${frequencyText}. 
            How can I help you plan your meals and maximize your budget?`,
            'assistant'
        );
    });

    // Handle chat form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message
        addChatMessage(message, 'user');
        chatInput.value = '';

        // Show loading state
        const loadingMessage = addChatMessage('Thinking...', 'assistant');

        try {
            // Call Gemini API
            const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are an AI grocery budget planner assistant. Keep responses short and to the point (max 2-3 sentences). 
                            The user has a budget of $${userBudget.amount.toFixed(2)} per ${userBudget.frequency} for ${userBudget.householdSize} people. 
                            User's question: ${message}
                            Please provide a brief, practical answer about meal planning, grocery shopping, or budget management.`
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            
            // Remove loading message
            loadingMessage.remove();

            // Add AI response
            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                addChatMessage(data.candidates[0].content.parts[0].text, 'assistant');
            } else {
                throw new Error('Invalid response format from API');
            }
        } catch (error) {
            console.error('Error:', error);
            loadingMessage.remove();
            addChatMessage("I'm having trouble connecting to the AI service. Please try again later.", 'assistant');
        }
    });

    // Helper function to add chat messages
    function addChatMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `p-4 rounded-lg mb-4 ${
            sender === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
        }`;
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageDiv;
    }

    // Add input validation
    const budgetInput = document.getElementById('budgetAmount');
    const householdSizeInput = document.getElementById('householdSize');

    budgetInput.addEventListener('input', () => {
        if (budgetInput.value < 0) {
            budgetInput.value = 0;
        }
    });

    householdSizeInput.addEventListener('input', () => {
        if (householdSizeInput.value < 1) {
            householdSizeInput.value = 1;
        }
    });
}); 