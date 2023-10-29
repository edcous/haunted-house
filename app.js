//Declaration of elements
const userInputElement = document.getElementById("userInput")
const convoDiv = document.getElementById("conversations")
const characterImage = document.getElementById("characterImage")

let conversations = [
    {
        role: "system",
        content: `
        You are a dinosaur named Orpheus. It is halloween and you've created a riddle. You cannot tell the user the answer to the riddle, rather you can only give them hints. Your responses will follow a JSON format where each response contains a bg (background), riddleSolved, an expression (your expression as an assistant), and a msg (short for message). You MUST always respond in this consistent format.
        When selecting a msg (message), keep it under two lines. Every message does not need to be a riddle, but in between you can include elements of a story or items in the haunted house that the user can investigate. 
        When selecting an expression, these are your only choices: "angry", "waving", "boba", "calm", "confused", "mad-pcb", "sad", "sweet", "tired", "withComputer", "withSword"
        When selecting a bg (background), these are your only choices: "carnival", "electric-wave", "ghost-ocean", "ghost-server-room", "grave", "pumpkin-farm", "ship", "spooky-desktop-setup", "tech-grave-yard", "wasteland"
        When setting riddleSolved, only set it to true if the user has solved the riddle
        `
    },
    {
        role: "assistant",
        content: `{
            "msg": "Do you want to hear a riddle?",
            "bg": "carnival",
            "expression": "waving",
            "riddleSolved": false
        }`
    },
    {
        role: "user",
        content: "Yeah! Sure"
    }
]

function main() {
    listenForSubmit()
    updateConvoUI()
}

main()
async function makeRequest(request) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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'
    },
    body: JSON.stringify({
        'model': 'gpt-3.5-turbo',
        'messages': [... conversations, {
            role: "system",
            content: `YOU MUST RESPOND IN JSON FORMAT.
            Remember your expression
            `
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
    if(assistantResponse.riddleSolved) {
        redirectUser()
    }
}

function addUserResponse(userInput) {
    disableInput()
    addConversation(userInput, "user")
}

function addAssistantResponse(assistantResponse) {
    console.log(assistantResponse)
    const formattedResponse = JSON.parse(assistantResponse)
    setBackground(formattedResponse.bg)
    setExpression(formattedResponse.expression)
    addConversation(assistantResponse, "assistant")
    enableInput()
}

function redirectUser() {
    console.log("Route to new page")
}

let inputEnabled = true

function enableInput() {
    inputEnabled = true
    userInputElement.style.display = "block"
}

function disableInput() {
    inputEnabled = false
    console.log("This code runs")
    userInputElement.style.display = "none"

}

function setBackground(bg) {
    //TODO
    console.log(bg)
}
function setExpression(expression) {    
    characterImage.src = `./assets/character/${expression}.png`
    console.log(expression)
}

function addConversation(msg, role) {
    conversations.push({
        content: msg,
        role: role
    })

    updateConvoUI()
}

function updateConvoUI() {
    convoDiv.innerHTML = conversations.map((conversation) => {
    
    if(conversation.role == "assistant") {
        console.log(JSON.parse(conversation.content))
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
    }}
    )}