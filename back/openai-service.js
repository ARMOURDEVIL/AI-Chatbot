// openai-service.js

const OpenAI = require("openai");
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const openai = new OpenAI({ apiKey: config.openai });
// console.log("openai-service loaded")


async function main(messageHistory) {
    const completion = await openai.chat.completions.create({
        messages: messageHistory.map(message => ({
            role: message.sender === 'user' ? 'user' : 'assistant',
            content: message.content
        })),
        model: "gpt-3.5-turbo-0125",
    });

    return completion.choices[0];
}

module.exports = main;
