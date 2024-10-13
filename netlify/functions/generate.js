const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const { inputs } = JSON.parse(event.body);

    const response = await fetch('https://api-inference.huggingface.co/models/google/gemma-2-2b-jpn-it', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer YOUR_HUGGINGFACE_API_KEY',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inputs: inputs,
        }),
    });

    const result = await response.json();

    return {
        statusCode: 200,
        body: JSON.stringify({ result }),
    };
};
 
