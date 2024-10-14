const input = document.getElementById('input');
const submit = document.getElementById('submit');
const output = document.getElementById('output');

//const API_URL = 'https://api-inference.huggingface.co/models/google/gemma-2b-it';
const API_URL = 'https://api-inference.huggingface.co/Nitzantry1/mistralai-Mixtral-8x7B-Instruct-v0.1';
//let HUGGING_FACE_API_KEY = '{{HUGGING_FACE_API_KEY}}';
let HUGGING_FACE_API_KEY = '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';


async function query(data) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            inputs: data + " Please provide a comprehensive and complete answer of at least 100 words, covering all aspects of the topic of: ",
            parameters: {
                max_new_tokens: 1000,
                temperature: 0.7,
                top_p: 0.95,
                do_sample: true
            },
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
        if (p.startsWith('## ')) {
            // כותרת ראשית
            return `<h1 class="main-header">${p.slice(3)}</h1>`;
        } else if (p.startsWith('# ')) {
            // כותרת משנית
            return `<h2 class="sub-header">${p.slice(2)}</h2>`;
        } else if (p.startsWith('* ')) {
            // נקודת תבליט
            return `<li>${p.slice(2)}</li>`;
        } else if (p.includes('**')) {
            // טקסט מודגש
            return `<p>${p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
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
    output.innerHTML = '<div class="loading">ממתין לתשובה...<div class="spinner"></div></div>';

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

