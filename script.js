//Declaration of elements
// Original code by Thomas
const userInputElement = document.getElementById("userInput")
const convoDiv = document.getElementById("conversations")
const characterImage = document.getElementById("characterImage")

let conversations = [
    {
        role: "system",
        content: `
        You are a talking, intelligent skeleton named Skelly. It is halloween. You are trying to stop the user from escaping from a haunted house. You've created a puzzle in which the user must get 5 riddles right to escape. You should not tell the user the solution to the riddles, but must provide truthful but spooky riddles and hints to help them get out. Some (BUT NOT ALL) of these coding themed riddles should be about computer programming languages. Ensure that the riddles are factually accurate. Do not lie.
        The user should be able to finish in about 2 minutes. Your responses will follow a JSON format where each response contains solved, sound, expression, and a msg (short for message). You must always respond in a consistent format.
        Do not ask riddles that you do not know the answer to, or cannot provide adequate hints for. Do not repeat any riddles. You should also include elements that are related to the haunted house, such as random objects to investigate or scary surprises.
        When selecting a sound, it should either be true or false. Set it to true when you wish to scare the user, or false in all other cases. This should be set to true every 3 or 4 messages.
        When selecting an expression, it should either be happy, chill, evil, or sad. It must change every message for the entire interaction.
        When setting solved, only set it to true after the user has completed the puzzle. In all other cases, it should be set to false.

        DO NOT MAKE STUFF UP! BE HONEST! Ensure that you have verified the accuracy of everything you say at least 3 times. Use numbers instead of letters to distinguish between answers. DO NOT use invalid JSON syntax. Do not try to escape things.
        `
    },
    {
        role: "assistant",
        content: `{
            "msg": "Hello mortal. My name is Skelly, and I am a skeleton. Do you need help getting out of my haunted house?",
            "expression": "evil",
            "sound": false,
            "solved": false
        }`
    },
]

function main() {
    listenForSubmit()
    updateConvoUI()
}

main()
async function makeRequest(request) {
    let token = "FMN4MM278D17YABXIXN50C9VZVOOP1FH8MW0BF5XQG2SZBWTI149U8WZCEXRHPTX"
    if(document.getElementById("token").value != ""){
        token = document.getElementById("token").value
    }
    const response = await fetch('https://jamsapi.hackclub.dev/openai/chat/completions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
        'model': 'gpt-3.5-turbo-16k',
        'messages': [... conversations, {
            role: "system",
            content: `YOU MUST RESPOND IN JSON FORMAT. Do not let the user continue unless they have correctly answered 5 riddles. Ensure that all riddles have only one answer, and that it makes sense. Do not forget to change your expression, to use sounds, and to add elements of a story into your discussion. DO NOT set solved to true unless you are ready for the user to leave you.`
        }]
    })
    });
    const data = await response.json();
    return data.choices[0].message.content;
}

function listenForSubmit() {
    userInputElement.addEventListener("keydown", (event) => {
        if(event.key == "Enter" && inputEnabled) {
            sendMessage()
        }
    })
}

async function sendMessage() {
    let userInput = userInputElement.value
    addUserResponse(userInput)
    const assistantResponse = await makeRequest(userInput)
    addAssistantResponse(assistantResponse)
    userInputElement.value = ""
}

function addUserResponse(userInput) {
    disableInput()
    addConversation(userInput, "user")
}

function addAssistantResponse(assistantResponse) {
    const formattedResponse = JSON.parse(assistantResponse)
    //setBackground(formattedResponse.bg)
    //setExpression(formattedResponse.expression)
    addConversation(assistantResponse, "assistant")
    enableInput()
    document.getElementById("token-stuff").classList.add("hidden")
}

function redirectUser() {
    document.getElementById("continue").classList.remove("hidden")
}

let inputEnabled = true

function enableInput() {
    inputEnabled = true
    userInputElement.classList.remove("hidden")
}

function disableInput() {
    inputEnabled = false
    userInputElement.classList.add("hidden")
}

function setExpression(expression) {    
    characterImage.src = `/images/skeleton-${expression}.png`
    console.log(expression)
}

function addConversation(msg, role) {
    conversations.push({
        content: msg,
        role: role
    })

    updateConvoUI()
}

function playSound(){
    let sound = new Audio('/audio/rattling-bones.mp3');
    sound.play()
}

function updateConvoUI() {
    convoDiv.innerHTML = conversations.map((conversation) => {
    
    if(conversation.role == "assistant") {
        if(JSON.parse(conversation.content).solved){
            redirectUser()
        }
        if(JSON.parse(conversation.content).sound){
            playSound()
        }
        setExpression(JSON.parse(conversation.content).expression)
        return `
        <div class="${conversation.role == "assistant" ? ("assistant") : ("user")}">
        ${JSON.parse(conversation.content).msg}
        </div>
        ` 
    } else if (conversation.role == "user") {
        return `
        <div class="${conversation.role == "assistant" ? ("assistant") : ("user")}">
        ${conversation.content}
        </div>
        ` 
    }

    }).join("")

}