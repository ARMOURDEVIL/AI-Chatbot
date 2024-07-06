// logic-service.js
const dbService = require('./db-service');
const prompts = require('./prompts.json');
const getOpenAIResponse = require('./openai-service');
const assert = require("node:assert");


const handleUserInput = async (messageHistory) => {

    // in case this is the very first message in conversation we should give some instructions to the bot
    if (messageHistory.length <= 1) {   // assuming we received some request, as user writes first
        // add instructions to the conv history
        const message = messageHistory[0];
        messageHistory[0] = {sender: 'user', content: prompts["init-message"]};
        messageHistory[1] = {sender: 'ai', content: "Hello! I am a restaurant assistant. How can I help you today?\""};
        messageHistory[2] = message;
    }

    // get response from OpenAI
    openAIResponse = await getOpenAIResponse(messageHistory);

    // make communication with DB as long as needed
    while (openAIResponse.message.content.startsWith(prompts["beginning-from-ai-to-db"])) {
        messageHistory.push({sender: 'ai', content: prompts["beginning-from-ai-to-db"] + openAIResponse.message.content});
        // for that we parse what AI told us to do and then do it
        response = await processDatabaseString(openAIResponse.message.content);
        messageHistory.push({sender: 'user', content: prompts["beginning-from-db-to-ai"] + response});
        console.log(messageHistory)
        openAIResponse = await getOpenAIResponse(messageHistory);
    }

    // and only then respond to the User
    return openAIResponse.message.content;
};

module.exports = handleUserInput;

// Function to parse the input string and call the corresponding function
async function processDatabaseString(inputString) {
    // Regular expression to match the function call in the input string
    const regex = /Database: ([a-zA-Z]+)\(([^)]*)\)/;
    const match = inputString.match(regex);

    if (match) {
        const functionName = match[1];
        const params = match[2].split(',').map(param => param.trim());

        // Dynamically call the function based on functionName and params
        switch (functionName) {
            case 'getTableById':
                return await dbService.getTableById(...params);

            case 'getUserById':
                return await dbService.getUserById(...params);

            case 'getReservationById':
                return await dbService.getReservationById(...params);

            case 'addTable':
                return await dbService.addTable(...params);

            case 'addUser':
                return await dbService.addUser(...params);

            case 'addReservation':
                return await dbService.addReservation(...params);

            case 'updateTable':
                return await dbService.updateTable(...params);

            case 'updateUser':
                return await dbService.updateUser(...params);

            case 'updateReservation':
                return await dbService.updateReservation(...params);

            case 'deleteTable':
                return await dbService.deleteTable(...params);

            case 'deleteUser':
                return await dbService.deleteUser(...params);

            case 'deleteReservation':
                return await dbService.deleteReservation(...params);

            default:
                console.log(`Function ${functionName} not found.`);
                return `Function ${functionName} not found.`;
        }
    } else {
        console.log('Invalid input string format.');
        return `Invalid input string format.`;
    }
}
