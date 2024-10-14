const input = document.getElementById('input');
const submit = document.getElementById('submit');
const output = document.getElementById('output');

const API_URL = 'https://api-inference.huggingface.co/models/google/gemma-2-2b-jpn-it';
const HUGGING_FACE_API_KEY = '{{ HUGGING_FACE_API_KEY }}';

async function retryFetch(url, options, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) return response;
            if (response.status === 503) {
                console.log('המודל עדיין בטעינה, ממתין לניסיון נוסף...');
                await new Promise(r => setTimeout(r, 2000));
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.log(`ניסיון ${i + 1} נכשל: ${error}`);
            if (i === maxRetries - 1) throw error;
        }
    }
}

async function isModelReady(url) {
    try {
        const response = await fetch(url, { method: 'GET' });
        return response.ok;
    } catch (error) {
        console.error('שגיאה בבדיקת זמינות המודל:', error);
        return false;
    }
}

submit.addEventListener('click', async () => {
    const prompt = input.value;
    if (!prompt) return;

    submit.disabled = true;
    submit.textContent = 'מייצר טקסט...';
    output.textContent = 'ממתין לתשובה...';

    try {
        if (!(await isModelReady(API_URL))) {
            throw new Error('המודל אינו זמין כרגע, נסה שוב מאוחר יותר');
        }

        const response = await retryFetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                inputs: prompt,
                options: { wait_for_model: true }
            })
        });

        const result = await response.json();
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
