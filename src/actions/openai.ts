'use server';

import { openrouter } from '@/lib/openrouter';
import axios from 'axios';
import { Slide, ContentItem } from '@/lib/types';
import { uploadDirect } from '@uploadcare/upload-client';

export const generateCreativePrompt = async (userPrompt: string) => {
    const systemMsg = {
        role: 'system' as const,
        content:
            'You are a helpful AI that generates outlines for presentations. ONLY respond with valid JSON exactly in the format specified below, without any extra text or explanation.',
    };

    const userMsg = {
        role: 'user' as const,
        content: `
  Create a coherent and relevant outline for the following prompt: "${userPrompt}".

  The outline should consist of exactly 6 points, each as a single sentence.

  Return ONLY valid JSON in the exact format:

  {
    "outlines": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5", "Point 6"]
  }
      `,
    };

    try {
        const completion = await openrouter.chat.completions.create({
            model: 'mistralai/mistral-7b-instruct:free',
            messages: [systemMsg, userMsg],
            max_tokens: 1000,
            temperature: 0,
            response_format: { type: 'json_object' }, // якщо підтримується
        });

        console.log('🟢 FULL API RESPONSE:', completion);

        if (!completion.choices || completion.choices.length === 0) {
            throw new Error('No choices returned from AI');
        }

        // AI може повертати або об’єкт, або рядок з JSON
        const content = completion.choices[0].message.content;

        // Якщо content вже об’єкт (json_object), повертаємо напряму
        if (typeof content === 'object') {
            return { status: 200, data: content };
        }

        // Якщо content - рядок, намагаємось витягти JSON з нього
        const raw = String(content);
        const jsonMatch = raw.match(/{[\s\S]*}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in AI response');
        }

        const parsed = JSON.parse(jsonMatch[0]);
        return { status: 200, data: parsed };
    } catch (error) {
        console.error('❌ Error parsing AI response:', error);

        return { status: 500, error: 'Invalid or no JSON from AI response' };
    }
};

export const generateImages = async (slides: any) => {
    try {
        console.log('🟢 Generating images for slides...');
        console.log('slides перед generateImages:', slides);
        console.log('Це масив?', Array.isArray(slides));

        let slidesArray: Slide[];

        if (Array.isArray(slides)) {
            slidesArray = slides;
        } else if (typeof slides === 'object' && slides !== null) {
            slidesArray = [slides];
        } else {
            return {
                status: 400,
                error: 'Invalid slides data; expected array or object',
            };
        }

        // Глибоке копіювання, щоб не мутувати оригінал
        const slidesCopy: Slide[] = JSON.parse(JSON.stringify(slidesArray));

        const processedSlides = await Promise.all(
            slidesCopy.map(async (slide) => {
                const updatedContent = await processSlideContent(slide.content);
                return { ...slide, content: updatedContent };
            }),
        );

        console.log('🟢 Images generated successfully');
        return { status: 200, data: processedSlides };
    } catch (error) {
        console.error('🔴 ERROR:', error);
        return { status: 500, error: 'Internal server error' };
    }
};

const processSlideContent = async (
    content: ContentItem,
): Promise<ContentItem> => {
    // Create a deep clone of the content structure
    const contentClone: ContentItem = JSON.parse(JSON.stringify(content));
    const imageComponents = findImageComponents(contentClone);

    // Process images in parallel while maintaining structure
    await Promise.all(
        (
            await imageComponents
        ).map(async (component) => {
            try {
                const newUrl = await generateImageUrl(
                    component.alt || 'Placeholder Image',
                );
                component.content = newUrl;
            } catch (error) {
                console.error('🔴 Image generation failed:', error);
                component.content = 'https://via.placeholder.com/1024';
            }
        }),
    );

    return contentClone;
};

export const findImageComponents = async (
    layout: ContentItem,
): Promise<ContentItem[]> => {
    const images: ContentItem[] = [];

    const traverse = (node: ContentItem) => {
        if (node.type === 'image') {
            images.push(node);
        }

        if (Array.isArray(node.content)) {
            node.content.forEach((child) => traverse(child as ContentItem));
        } else if (typeof node.content === 'object' && node.content !== null) {
            traverse(node.content);
        }
    };

    traverse(layout);
    return images;
};

export const generateImageUrl = async (prompt: string): Promise<string> => {
    try {
        const improvedPrompt = `Create a highly realistic, professional image based on the following description. The image should look as if captured in real life, with attention to detail, lighting, and texture. ${prompt}`;

        const response = await axios.post(
            'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
            {
                inputs: improvedPrompt,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json',
                    Accept: 'image/png',
                },
                responseType: 'arraybuffer',
            },
        );

        const imageBuffer = Buffer.from(response.data);

        const uploadResult = await uploadDirect(imageBuffer, {
            publicKey: process.env.UPLOADCARE_PUBLIC_KEY!,
            store: 'auto',
        });

        console.log('🟢 Image uploaded to Uploadcare:', uploadResult?.uuid);

        return uploadResult?.uuid
            ? `https://ucarecdn.com/${uploadResult.uuid}/-/preview/`
            : 'https://via.placeholder.com/1024';
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data) {
            const errData = error.response.data;
            const errText = Buffer.isBuffer(errData)
                ? errData.toString('utf-8')
                : typeof errData === 'string'
                ? errData
                : JSON.stringify(errData);

            console.error('Failed to generate image (decoded error):', errText);
        } else {
            console.error('Failed to generate image:', error);
        }
        return 'https://via.placeholder.com/1024';
    }
};
