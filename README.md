# 🤖 ChatGPT-Discord-Tampermonkey

Easily chat with ChatGPT using the combination of Tampermonkey, Discord, and Flask.

---

## 📌 Prerequisites

1. **API key for ChatGPT**  
   You can get it [here](https://platform.openai.com/account/api-keys).

2. **Discord Token**  
   - Open Discord in your web browser.
   - Launch the developer tools (usually F12 or right-click -> Inspect).
   - Navigate to the "Network" tab.
   - Send a message in chat. You'll notice a request titled "messages".
   - Click on this "messages" request and head over to the "Headers" tab.
   - Look for the section labeled "Authorization". The string you see there is your Discord token.

---

## 🚀 Getting Started

1. Update the `listener.py` file:
   - Set the ChatGPT API key.
   - Set the Discord token.

2. Install the Tampermonkey script.

3. Start the `listener.py` file.

---

## 📝 Note

Any message containing `!askgpt` will trigger the script. It sends the message to ChatGPT and forwards the response back to the Discord server via a POST request.
- It first takes the most recent messages in a discord server as they come in and sends them to the flask app.
- The flask app then takes that input and handles it to ChatGPT.
- It then sends a post request to the discord channel with the response.
