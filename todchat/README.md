# TodChat

A simple AI chatbot built with Streamlit and OpenAI.

## Setup

1. Clone the repository
2. Install the required packages:
   ```
   pip install -r requirements.txt
   ```
3. Create a `.env` file based on the `.env.example` file and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   - You can get an API key from [OpenAI's website](https://platform.openai.com/api-keys)

## Running the App

To run the chatbot app, use the following command:

```
streamlit run app.py
```

This will start the Streamlit server and open the app in your default web browser.

## Features

- Simple and clean UI for chatting
- Powered by OpenAI's GPT-3.5 Turbo model
- Chat history is maintained during the session 