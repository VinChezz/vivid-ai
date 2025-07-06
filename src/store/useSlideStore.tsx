import { ContentItem, Slide, Theme } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { Project } from '@prisma/client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SlideState {
    project: Project | null;
    slides: Slide[];
    setProject: (project: Project) => void;
    setSlides: (slides: Slide[]) => void;
    currentTheme: Theme;
    setCurrentTheme: (theme: Theme) => void;
    currentSlide: number;
    removeSlide: (id: string) => void;
    setCurrentSlide: (index: number) => void;
    updateContentItem: (
        slideId: string,
        contentId: string,
        newContent: string | string[] | string[][],
    ) => void;
    getOrderedSlides: () => Slide[];
    reorderedSlides: (fromIndex: number, toIndex: number) => void;
    resetSlideStore: () => void;
    addSlideAtIndex: (slide: Slide, index: number) => void;
    addComponentInSlide: (
        slideId: string,
        item: ContentItem,
        parentId: string,
        index: number,
    ) => void;
}

const defaultTheme: Theme = {
    name: 'Default',
    fontFamily: "'Inter', sans-serif",
    fontColor: '#333333',
    backgroundColor: '#f0f0f0',
    slideBackgroundColor: '#ffffff',
    accentColor: '#3b82f6',
    type: 'light',
};

export const useSlideStore = create(
    persist<SlideState>(
        (set, get) => ({
            project: null,
            setProject: (project: Project) => set({ project }),
            slides: [],
            setSlides: (slides: Slide[]) => set({ slides }),
            currentTheme: defaultTheme,
            setCurrentTheme: (theme: Theme) => set({ currentTheme: theme }),
            updateContentItem: (slideId, contentId, newContent) =>
                set((state) => {
                    const updateContentRecursively = (
                        item: ContentItem,
                    ): ContentItem => {
                        if (item.id === contentId) {
                            // Ensure newContent matches the correct type
                            return { ...item, content: newContent };
                        }
                        if (
                            Array.isArray(item.content) &&
                            item.content.every((i) => typeof i !== 'string')
                        ) {
                            return {
                                ...item,
                                content: item.content.map((subItem) => {
                                    if (typeof subItem !== 'string') {
                                        return updateContentRecursively(
                                            subItem as ContentItem,
                                        );
                                    }
                                    return subItem; // String remains unchanged
                                }) as ContentItem[], // Explicitly type the content as ContentItem[]
                            };
                        }
                        return item;
                    };

                    return {
                        slides: state.slides.map((slide) =>
                            slide.id === slideId
                                ? {
                                      ...slide,
                                      content: updateContentRecursively(
                                          slide.content,
                                      ),
                                  }
                                : slide,
                        ),
                    };
                }),
            currentSlide: 0,
            removeSlide: (id) =>
                set((state) => ({
                    slides: state.slides.filter((slide) => slide.id !== id),
                })),

            setCurrentSlide: (index) => set({ currentSlide: index }),
            getOrderedSlides: () => {
                const state = get();
                return [...state.slides].sort(
                    (a, b) => a.slideOrder - b.slideOrder,
                );
            },
            addSlideAtIndex: (slide: Slide, index: number) =>
                set((state) => {
                    const newSlides = [...state.slides];
                    newSlides.splice(index, 0, { ...slide, id: uuidv4() });

                    newSlides.forEach((s, i) => {
                        s.slideOrder = i;
                    });

                    return { slides: newSlides, currentSlide: index };
                }),
            addComponentInSlide: (
                slideId: string,
                item: ContentItem,
                parentId: string,
                index: number,
            ) => {
                set((state) => {
                    const updatedSlides = state.slides.map((slide) => {
                        if (slide.id !== slideId) return slide;

                        const updateContent = (
                            content: ContentItem,
                        ): ContentItem => {
                            // Check if this is the direct parent
                            if (content.id === parentId) {
                                return {
                                    ...content,
                                    content: [
                                        ...(
                                            content.content as ContentItem[]
                                        ).slice(0, index),
                                        item,
                                        ...(
                                            content.content as ContentItem[]
                                        ).slice(index),
                                    ],
                                };
                            }

                            // Recursively search nested content
                            if (Array.isArray(content.content)) {
                                return {
                                    ...content,
                                    content: (
                                        content.content as ContentItem[]
                                    ).map(updateContent),
                                };
                            }

                            return content;
                        };

                        return {
                            ...slide,
                            content: updateContent(slide.content),
                        };
                    });

                    return { slides: updatedSlides };
                });
            },
            resetSlideStore: () => {
                console.log('🟢 Resetting slide store');
                set({
                    project: null,
                    slides: [],
                    currentSlide: 0,
                    currentTheme: defaultTheme,
                });
                console.log('🟢 Resetting slide store');
            },
            reorderedSlides: (fromIndex: number, toIndex: number) => {
                set((state) => {
                    const newSlides = [...state.slides];
                    const [removed] = newSlides.splice(fromIndex, 1);
                    newSlides.splice(toIndex, 0, removed);
                    return {
                        slides: newSlides.map((slide, i) => ({
                            ...slide,
                            slideOrder: i,
                        })),
                    };
                });
            },
        }),
        {
            name: 'slides-storage',
        },
    ),
);
