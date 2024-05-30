import os
import json
import google.generativeai as genai
from datetime import datetime
from dotenv import load_dotenv


def configure_genai():
    load_dotenv("Project/backend/.env", override=True)
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("API key not found in environment variables")

    genai.configure(
        api_key=api_key,
    )


def create_model():
    """
    Create and configure a generative model with specified generation and safety settings.

    Returns:
        genai.GenerativeModel: A configured generative model instance.
    """
    generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 8192,
        "response_mime_type": "text/plain",
    }
    safety_settings = [
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE",
        },
    ]

    return genai.GenerativeModel(
        model_name="gemini-1.5-pro-latest",
        safety_settings=safety_settings,
        generation_config=generation_config,
    )


def serialize_chat_history(history):
    """
    Convert the chat history to a serializable format.

    Args:
        history (list): A list of chat entries where each entry is an object containing message details.

    Returns:
        list: A list of dictionaries, each containing the serialized chat entry with message, timestamp, and role.
    """
    serialized_history = []
    for entry in history:
        # Extract relevant information from the entry object
        serialized_entry = {
            "message": str(entry),
            "timestamp": datetime.now().isoformat(),
            "role": entry.role if hasattr(entry, "role") else None,
        }
        serialized_history.append(serialized_entry)
    return serialized_history


def generate_response(text_content, prompt_template):
    """
    Generate a response from a generative model based on provided text content and a prompt template.

    Args:
        text_content (str): The main text content to be used within the prompt template.
        prompt_template (str): A template string for the prompt, containing a placeholder for the text content.

    Returns:
        str: A JSON-formatted string containing the response text and the serialized chat history.

    Raises:
        ValueError: If the API key is not found in the environment variables.
        Exception: If there are issues in configuring the model or generating the response.
    """
    configure_genai()
    model = create_model()

    chat_session = model.start_chat(history=[])

    # Combine text content and prompt template to form the message
    message = prompt_template.format(text_content=text_content)

    # Send the message to the chat session
    response = chat_session.send_message(message)

    # Extract the response text and the chat history
    response_data = {
        "response_text": response.text,
        "chat_history": serialize_chat_history(chat_session.history),
    }

    # Return the response data in JSON format
    return json.dumps(response_data, indent=2)


if __name__ == "__main__":
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
    prompt_template = "Give important 3 words which is: {text_content}"

    # text_content = input("Input your paragraph: ")
    # prompt_template = input("Enter your prompt: ")

    response_json = generate_response(text_content, prompt_template)
    print(response_json)