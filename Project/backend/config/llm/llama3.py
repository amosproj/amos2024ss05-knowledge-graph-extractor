# 1. Visit [consol.groq.com](https://consol.groq.com).
# 2. Navigate to the API Keys section and create a new key.
# 3. Important: Copy the key immediately as it will only be visible once.

# !pip install groq

import os
import json
from datetime import datetime
from dotenv import load_dotenv

# Assuming 'groq' is the correct library for the API you're using
from groq import Groq


def get_groq_client():
    # Ensure the API key is set in the environment
    # load the API key from the environment variables (could be remove if the env is loaded in the main file)
    load_dotenv("../../.env", override=True)

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("API key not found in environment variables")
    return Groq(api_key=api_key)


def generate_response(text_content, prompt_template):
    client = get_groq_client()

    # Combine text content and prompt template to form the message
    message = prompt_template.format(text_content=text_content)

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": message,
            }
        ],
        model="llama3-8b-8192",
    )

    response_data = {
        "response_text": chat_completion.choices[0].message.content,
        "chat_history": [
            {
                "message": message,
                "role": "user",
                "timestamp": datetime.now().isoformat(),  # You can replace None with actual timestamp if available
            },
            {
                "message": chat_completion.choices[0].message.content,
                "role": "model",
                "timestamp": datetime.now().isoformat(),  # You can replace None with actual timestamp if available
            },
        ],
    }

    # Return the response data in JSON format
    return json.dumps(response_data, indent=2)


if __name__ == "__main__":
    # Take text_content and prompt_template from the user
    text_content = (
        "When one thinks about what a holiday means for students, "
        "we notice how important it is for the kids. It is a time "
        "when they finally get the chance to take a break from studies "
        "and pursue their hobbies. They can join courses which give them "
        "special training to specialize in it. They can get expert in arts, "
        "craft, pottery, candle making and more. Furthermore, they also make "
        "new friends there who have the same interests. In addition, students "
        "get to visit new places on holiday. Like during summer or winter holidays, "
        "they go with their families to different cities and countries. Through holidays, "
        "they get new experiences and memories which they remember for a lifetime. "
        "Furthermore, it also gives them time to relax with their families. Other cousins "
        "also visit each other’s places and spend time there. They play games and go out "
        "with each other. Moreover, students also get plenty of time to complete their homework "
        "and revise the syllabus."
    )
    prompt_template = "Give me 3 important words for paragraph"

    # To get the inputs
    # text_content = input("Enter the paragraph: ")
    # prompt_template = input("Enter the prompt: ")

    response_json = generate_response(text_content, prompt_template)
    print(response_json)
