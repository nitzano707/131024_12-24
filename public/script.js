const input = document.getElementById('input');
const submit = document.getElementById('submit');
const output = document.getElementById('output');

// Netlify will replace this with the actual API key at build time
const HUGGING_FACE_API_KEY = '{{ HUGGING_FACE_API_KEY }}';

submit.addEventListener('click', async () => {
    const prompt = input.value;
    if (!prompt) return;

    submit.disabled = true;
    submit.textContent = 'Generating...';
    output.textContent = 'Waiting for response...';

    try {
        const response = await fetch('https://api-inference.huggingface.co/models/google/gemma-2-2b-jpn-it', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: prompt })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        output.textContent = result[0].generated_text;
    } catch (error) {
        console.error('Error:', error);
        output.textContent = 'An error occurred while generating text.';
    } finally {
        submit.disabled = false;
        submit.textContent = 'Generate Text';
    }
});
