const input = document.getElementById('input');
const submit = document.getElementById('submit');
const output = document.getElementById('output');

// Netlify יחליף זאת במפתח ה-API האמיתי בזמן הבנייה
const HUGGING_FACE_API_KEY = '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';

console.log('API Key length:', HUGGING_FACE_API_KEY.length);

submit.addEventListener('click', async () => {
    const prompt = input.value;
    if (!prompt) return;

    submit.disabled = true;
    submit.textContent = 'מייצר טקסט...';
    output.textContent = 'ממתין לתשובה...';

    try {
        const response = await fetch('https://api-inference.huggingface.co/models/google/gemma-2-2b-jpn-it', {
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

        const responseText = await response.text();
        console.log('Full API Response:', responseText);

        if (!response.ok) {
            throw new Error(`שגיאת HTTP! סטטוס: ${response.status}, תשובה: ${responseText}`);
        }

        const result = JSON.parse(responseText);
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

// בדיקת תקינות הקישור ל-API
fetch('https://api-inference.huggingface.co/models/google/gemma-2-2b-jpn-it', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`
    },
    body: JSON.stringify({ inputs: "Hello" })
})
.then(response => response.text())
.then(result => console.log('API Test Response:', result))
.catch(error => console.error('API Test Error:', error));
