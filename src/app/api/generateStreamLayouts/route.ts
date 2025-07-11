import { NextResponse } from 'next/server';
import { client } from '@/lib/prisma';
import { generateImages } from '@/actions/openai';

export async function POST(request: Request) {
    try {
        const { projectId } = await request.json();

        // 1. Отримуємо проект з бази
        const project = await client.project.findUnique({
            where: { id: projectId },
        });

        if (!project || !project.outlines || project.outlines.length === 0) {
            return NextResponse.json(
                { error: 'Project not found or has no outlines' },
                { status: 404 },
            );
        }

        // 2. Формуємо промпт
        const prompt = `
You are an AI that generates slide layouts for a presentation in JSON format ONLY.

Given the following outline:
${JSON.stringify(project.outlines)}

Return valid JSON with an array of slides like this format:
[
  {
    "title": "Slide Title",
    "content": {
      "type": "column",
      "content": [
        {
          "type": "heading1",
          "content": "Main Heading"
        },
        {
          "type": "paragraph",
          "content": "Some description of the slide"
        },
        {
          "type": "image",
          "content": "",
          "alt": "A relevant illustration"
        }
      ]
    }
  }
]

Important: Use only the following types for content:
- For titles: "heading1", "heading2", "heading3", "heading4", "title"
- For paragraphs: "paragraph"
- For images: "image"
- For vertical containers: "column"
- For horizontal containers: "resizable-column"

DO NOT use "text" or "vertical" types. Use "paragraph" for text content and "column" for vertical containers.

⚠️ DO NOT return any explanation, markdown, or extra text.
Return ONLY the JSON array.
`.trim();

        // 3. Викликаємо OpenRouter
        const response = await fetch(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.OPEN_ROUTER_API_KEY!}`,
                },
                body: JSON.stringify({
                    model: 'mistralai/mistral-7b-instruct:free',
                    messages: [{ role: 'user', content: prompt }],
                    stream: false,
                }),
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('🔴 OpenRouter API error:', errorText);
            return NextResponse.json(
                { error: 'Failed to get response from OpenRouter' },
                { status: 500 },
            );
        }

        const json = await response.json();
        const rawContent = json.choices?.[0]?.message?.content;

        if (!rawContent) {
            console.error('🔴 No content returned by AI');
            return NextResponse.json(
                { error: 'No AI content' },
                { status: 500 },
            );
        }

        let slidesArray;
        try {
            console.log('🟡 RAW AI RESPONSE CONTENT:', rawContent);

            // Якщо AI повернув лишній текст — пробуємо витягти JSON
            const match = rawContent.match(/\[.*\]/s);
            if (!match) {
                throw new Error('No valid JSON array found in AI response');
            }

            slidesArray = JSON.parse(match[0]);
        } catch (err) {
            console.error('🔴 Failed to parse AI response as JSON:', err);
            return NextResponse.json(
                { error: 'Invalid JSON from AI' },
                { status: 500 },
            );
        }

        // 4. Генеруємо зображення
        const generateImagesResult = await generateImages(slidesArray);

        if (generateImagesResult.status !== 200) {
            return NextResponse.json(
                {
                    error:
                        generateImagesResult.error || 'Image generation failed',
                },
                { status: 500 },
            );
        }

        // 5. Повертаємо slides з картинками
        return NextResponse.json(generateImagesResult.data, { status: 200 });
    } catch (error) {
        console.error(
            '🔴 Internal error in POST /generateStreamLayouts:',
            error,
        );
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}
