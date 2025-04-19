import streamlit as st
import openai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Configure Streamlit page
st.set_page_config(
    page_title="TodChat - Simple AI Chatbot",
    page_icon="💬",
    layout="centered"
)

# Initialize session state for chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# App header
st.title("TodChat")
st.subheader("A simple AI chatbot powered by OpenAI")

# Function to get response from OpenAI
def get_openai_response(prompt):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                *[{"role": m["role"], "content": m["content"]} for m in st.session_state.messages],
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: {str(e)}"

# Display chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# User input
user_input = st.chat_input("Type your message here...")

# Process user input
if user_input:
    # Display user message
    with st.chat_message("user"):
        st.markdown(user_input)
    
    # Add user message to chat history
    st.session_state.messages.append({"role": "user", "content": user_input})
    
    # Get and display assistant response
    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            response = get_openai_response(user_input)
            st.markdown(response)
    
    # Add assistant response to chat history
    st.session_state.messages.append({"role": "assistant", "content": response}) 