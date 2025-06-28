import { Slide } from '@/lib/types';
import { Project } from '@prisma/client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SlideState {
    project: Project | null;
    slides: Slide[];
    setProject: (project: Project) => void;
    setSlides: (slides: Slide[]) => void;
}

export const useSlideStore = create(
    persist<SlideState>(
        (set) => ({
            project: null,
            setProject: (project: Project) => set({ project }),
            slides: [],
            setSlides: (slides: Slide[]) => set({ slides }),
        }),
        {
            name: 'slides-storage',
        },
    ),
);
