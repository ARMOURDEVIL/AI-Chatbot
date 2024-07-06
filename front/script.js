// Select DOM elements
const chatbotToggler = document.querySelector(".chatbot-toggler"); // Toggle button for the chatbot
const closeBtn = document.querySelector(".close-btn"); // Close button inside the chatbot
const chatbox = document.querySelector(".chatbox"); // Container for chat messages
const chatInput = document.querySelector(".chat-input textarea"); // Textarea for user input
const sendChatBtn = document.querySelector(".chat-input span"); // Send button

let userMessage = null; // Variable to store user's message
const inputInitHeight = chatInput.scrollHeight; // Initial height of the textarea

const ws = new WebSocket('ws://localhost:3001'); // WebSocket connection
let messageHistory = []; // Array to store message history

ws.onopen = () => {
    console.log('Connected to the WebSocket server');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received response:', data);

    if (data.response) {
        const aiMessage = data.response.message.content;
        messageHistory.push({ sender: 'ai', content: aiMessage });
        displayMessage('ai', aiMessage);
    } else if (data.error) {
        console.error('Error from server:', data.error);
    }
};

ws.onclose = () => {
    console.log('Disconnected from the WebSocket server');
};

// Function to create chat list items
const createChatLi = (message, className) => {
    const chatLi = document.createElement("li"); // Create a new list item element
    chatLi.classList.add("chat", `${className}`); // Add chat and className classes to the element
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`; // Define chat content based on the class name
    chatLi.innerHTML = chatContent; // Set the inner HTML of the list item
    chatLi.querySelector("p").textContent = message; // Set the message text
    return chatLi; // Return the chat list item
}

// Function to handle chat input and response
const handleChat = () => {
    userMessage = chatInput.value.trim(); // Get and trim the user's message
    if(!userMessage) return; // Return if the message is empty

    chatInput.value = ""; // Clear the textarea
    chatInput.style.height = `${inputInitHeight}px`; // Reset the textarea height

    chatbox.appendChild(createChatLi(userMessage, "outgoing")); // Add the user's message to the chatbox
    chatbox.scrollTo(0, chatbox.scrollHeight); // Scroll to the bottom of the chatbox

    messageHistory.push({ sender: 'user', content: userMessage });
    ws.send(JSON.stringify({ messageHistory })); // Send message history to WebSocket server

    const incomingChatLi = createChatLi("Thinking...", "incoming"); // Add a "Thinking..." message
    chatbox.appendChild(incomingChatLi); // Append the "Thinking..." message to the chatbox
    chatbox.scrollTo(0, chatbox.scrollHeight); // Scroll to the bottom of the chatbox
}

// Function to display messages
const displayMessage = (sender, message) => {
    const className = sender === 'user' ? 'outgoing' : 'incoming';
    chatbox.appendChild(createChatLi(message, className)); // Add the message to the chatbox
    chatbox.scrollTo(0, chatbox.scrollHeight); // Scroll to the bottom of the chatbox
}

// Adjust textarea height based on input
chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`; // Reset the height
    chatInput.style.height = `${chatInput.scrollHeight}px`; // Adjust the height based on scroll height
});

// Handle Enter key press for sending a message
chatInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) { // Check if Enter key is pressed without Shift key
        e.preventDefault(); // Prevent default action
        handleChat(); // Handle chat input and response
    }
});

// Handle send button click
sendChatBtn.addEventListener("click", handleChat); // Handle chat input and response on send button click

// Handle close button click
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot")); // Hide the chatbot

// Handle chatbot toggle button click
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot")); // Toggle the chatbot visibility
