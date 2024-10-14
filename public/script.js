const input = document.getElementById('input');
const submit = document.getElementById('submit');
const output = document.getElementById('output');

const API_URL = 'https://api-inference.huggingface.co/models/google/gemma-2-2b-jpn-it';
const HUGGING_FACE_API_KEY = '{{ HUGGING_FACE_API_KEY }}';

async function query(data) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

async function retryQuery(data, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await query(data);
        } catch (error) {
            console.log(`ניסיון ${i + 1} נכשל: ${error.message}`);
            if (i === maxRetries - 1) throw error;
            await new Promise(r => setTimeout(r, 2000));
        }
    }
}

submit.addEventListener('click', async () => {
    const prompt = input.value;
    if (!prompt) return;

    submit.disabled = true;
    submit.textContent = 'מייצר טקסט...';
    output.textContent = 'ממתין לתשובה...';

    try {
        const result = await retryQuery({ inputs: prompt });
        if (result && result[0] && result[0].generated_text) {
            output.textContent = result[0].generated_text;
        } else {
            throw new Error('תגובה לא תקינה מה-API');
        }
    } catch (error) {
        console.error('שגיאה:', error);
        output.textContent = `אירעה שגיאה בעת יצירת הטקסט: ${error.message}`;
    } finally {
        submit.disabled = false;
        submit.textContent = 'צור טקסט';
    }
});

// בדיקת תקינות הקישור ל-API בטעינת הדף
(async () => {
    try {
        await query({ inputs: "Test" });
        console.log('API connection successful');
    } catch (error) {
        console.error('API connection failed:', error);
    }
})();
