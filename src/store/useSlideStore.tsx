import { Slide, Theme } from '@/lib/types';
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
    setCurrentSlide: (index: number) => void;
    resetSlideStore: () => void;
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
        (set) => ({
            project: null,
            setProject: (project: Project) => set({ project }),
            slides: [],
            setSlides: (slides: Slide[]) => set({ slides }),
            currentTheme: defaultTheme,
            setCurrentTheme: (theme: Theme) => set({ currentTheme: theme }),
            currentSlide: 0,
            setCurrentSlide: (index) => set({ currentSlide: index }),
            resetSlideStore: () => {
                console.log('🟢 Resetting slide store');
                set({
                    project: null,
                    slides: [],
                    currentSlide: 0,
                    currentTheme: defaultTheme,
                });
                console.log('🟢 Resetting slide store');
                // Clear persisted data from storage
            },
        }),
        {
            name: 'slides-storage',
        },
    ),
);
