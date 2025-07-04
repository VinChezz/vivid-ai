import OpenAI from 'openai';

export const openrouter = new OpenAI({
    apiKey: process.env.OPEN_ROUTER_API_KEY!,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000',
    },
});
