// src/lib/api.js

export async function fetchChatResponse(message) {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3', // replace with your model name (e.g. 'mistral', 'gemma', etc.)
        prompt: message,
        stream: false,
      }),
    });

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error fetching response from Ollama:', error);
    return "Sorry, I couldn't respond.";
  }
}
