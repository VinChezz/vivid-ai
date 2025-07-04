'use client';

import React, { useEffect, useState } from 'react';
import { useSlideStore } from '@/store/useSlideStore';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { redirect, useParams } from 'next/navigation';
import { getProjectById, updateSlides } from '@/actions/project';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { themes } from '@/lib/constants';
import { Loader2 } from 'lucide-react';
import { Slide } from '@/lib/types';
import { generateImages } from '@/actions/openai';

type Props = {};

const Page = (props: Props) => {
    const { setSlides, setProject, slides, currentTheme, setCurrentTheme } =
        useSlideStore();
    const { toast } = useToast();
    const params = useParams();
    const { setTheme } = useTheme();
    const [pageLoading, setPageLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            setImageLoading(true);
            try {
                const res = await getProjectById(
                    params.presentationId as string,
                );
                setPageLoading(false);
                if (res.status !== 200 || !res.data) {
                    toast({
                        title: 'Error',
                        description: 'Unable to fetch project',
                    });
                    redirect('/dashboard');
                }

                const findTheme = themes.find(
                    (theme) => theme.name === res.data.themeName,
                );
                setCurrentTheme(findTheme || themes[0]);
                setTheme(findTheme?.type === 'dark' ? 'dark' : 'light');
                setProject(res.data);

                const slides = JSON.parse(JSON.stringify(res.data.slides));

                if (res.data.slides && slides.length > 0) {
                    setSlides(slides);
                } else {
                    await fetchSlides();
                }
            } catch (error) {
                console.error('Error fetching slides:', error);
                toast({
                    title: 'Error',
                    description: 'An unexpected error occurred',
                });
                redirect('/dashboard');
            } finally {
                setIsLoading(false);
                setImageLoading(false);
            }
        })();
    }, []);

    const fetchSlides = async () => {
        try {
            const response = await fetch('/api/generateStreamLayouts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: params.presentationId }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate slides');
            }

            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const cleanedBuffer = buffer
                    .replace(/```json/g, '')
                    .replace(/```/g, '')
                    .trim();

                console.log('🟢 Buffer:', cleanedBuffer);

                try {
                    const data = JSON.parse(cleanedBuffer);
                    buffer = '';
                    setSlides(data);
                    console.log('🟢 Saving');

                    const updateSlide = await updateSlides(
                        params.presentationId as string,
                        JSON.parse(JSON.stringify(data)), // ✅ валідний JSON
                    );

                    if (updateSlide.status === 200 && updateSlide.data) {
                        setProject(updateSlide.data);
                    }

                    await fetchImages(data);
                    setIsLoading(false);
                } catch (error) {
                    if (cleanedBuffer.startsWith('[')) {
                        try {
                            const repaired =
                                cleanedBuffer.replace(/,(\s*)?$/, '') + ']';
                            const data = JSON.parse(repaired);
                            setSlides(data);
                            console.log('🟢 repaired data:', data);
                        } catch (innerError) {
                            // ignore, waiting for more data
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: 'Error',
                description: 'An unexpected error occurred',
            });
            redirect('/dashboard');
        }
    };

    const fetchImages = async (slides: Slide[]) => {
        try {
            console.log('🟢 Fetching images...');
            const updatedSlides = await generateImages(slides);

            if (updatedSlides.status !== 200 || !updatedSlides.data) {
                throw new Error('Failed to generate images');
            }

            console.log('🟢 Images generated, updating...');
            setSlides(updatedSlides.data);

            const updateSlide = await updateSlides(
                params.presentationId as string,
                JSON.parse(JSON.stringify(updatedSlides.data)), // ✅ також тут
            );

            if (updateSlide.status === 200 && updateSlide.data) {
                setProject(updateSlide.data);
            }
        } catch (error) {
            console.error('🔴 Error generating images:', error);
            toast({
                title: 'Error',
                description: 'Failed to generate images',
            });
        } finally {
            setImageLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen flex flex-col"></div>
        </DndProvider>
    );
};

export default Page;
