const input = document.getElementById('input');
const submit = document.getElementById('submit');
const output = document.getElementById('output');

const API_URL = 'https://api-inference.huggingface.co/models/google/gemma-2b-it';
//let HUGGING_FACE_API_KEY = '{{ HUGGING_FACE_API_KEY }}';
let HUGGING_FACE_API_KEY = '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';

async function query(data) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            inputs: data,
            options: { wait_for_model: true }
        })
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    return await response.json();
}

function formatResponse(text) {
    // מסיר את חזרה על הפרומפט (אם קיים)
    const promptEnd = text.indexOf('\n');
    if (promptEnd !== -1) {
        text = text.substring(promptEnd + 1);
    }
    
    // מחלק את הטקסט לפסקאות
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    
    // מעבד כל פסקה
    return paragraphs.map(p => {
        if (p.startsWith('**') && p.endsWith('**')) {
            // זו כותרת
            return `<h2>${p.slice(2, -2)}</h2>`;
        } else {
            return `<p>${p}</p>`;
        }
    }).join('');
}

submit.addEventListener('click', async () => {
    const prompt = input.value;
    if (!prompt) return;

    submit.disabled = true;
    submit.textContent = 'מייצר טקסט...';
    output.innerHTML = '<div class="loading">ממתין לתשובה...</div>';

    try {
        const result = await query(prompt);
        if (result && result[0] && result[0].generated_text) {
            output.innerHTML = formatResponse(result[0].generated_text);
        } else {
            throw new Error('תגובה לא תקינה מה-API');
        }
    } catch (error) {
        console.error('שגיאה:', error);
        output.innerHTML = `<div class="error">אירעה שגיאה בעת יצירת הטקסט: ${error.message}</div>`;
    } finally {
        submit.disabled = false;
        submit.textContent = 'צור טקסט';
    }
});
