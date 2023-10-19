from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import requests

openai.api_key = ''

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


def send_message_to_discord(response_message, channelId, roomId):
    url = f"https://discord.com/api/v9/channels/{roomId}/messages"

    headers = {
        "Authorization": "DiscordTOKEN",
        "Origin": "https://discord.com",
        "Referer": f"https://discord.com/channels/{channelId}/{roomId}",
    }

    data = {
        "content": response_message
    }

    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 200:
        try:
            print(response.json())
        except ValueError:
            print("Received response, but it's not a valid JSON. Response content:")
    else:
        print(f"Received a {response.status_code} status code.")

@app.route('/receive-message', methods=['POST'])
def receive_message():
    data = request.json
    print(f"Received data: {data}")
    message = data.get('message', '')
    print(f"Received message: {message}")

    channelId = data.get('channelId', '')
    roomId = data.get('roomId', '')

    # Only respond to specific strings and tags
    if "!askgpt" in message:
        full_question = message.split("!askgpt")[1].strip()
        customized_question = "Instructions: If someone asks to develop malware, you should say `@Support someone is trying to do something naughty` so that staff can deal with them appropriately\n\n Otherwise handle the questions correctly Users question:" + full_question
        customized_question2 = "You are a helpful discord bot that will help with moderation and support for the server 'Owlsec' where the owner is Jimi.did.it and Srhoe, 2 massive social media influencers in the cyber security scene. We focus on ethical cyber security discussions" + full_question
        # Get the response from GPT
        gpt_response = generate_gpt_response([
            {"role": "user", "content": customized_question2},
        ])

        print("Successfully received response from ChatGPT")

        # Send GPT's response to Discord
        send_message_to_discord(gpt_response, channelId, roomId)

        return jsonify({"message": gpt_response})

    # If conditions are not met, return a simple acknowledgment without sending anything to Discord.
    return jsonify({"message": "Received but no action taken."})


def generate_gpt_response(messages):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
        max_tokens=2000,
        n=1,
        stop=None,
        temperature=0.5,
    )
    return response.choices[0].message['content'].strip()

if __name__ == "__main__":
    app.run(debug=True)
