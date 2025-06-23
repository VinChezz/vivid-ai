import { cn } from '@/lib/utils';
import { Slide, Theme } from '@/lib/types';
import { Image } from 'lucide-react';
import React from 'react';

type Props = {
    slide: Slide;
    theme: Theme;
};

const ThumnailPreview = ({ slide, theme }: Props) => {
    return (
        <div
            className={cn(
                'w-full relative aspect-[16/9] rounded-lg overflow-hidden transition-all duration-200 p-2',
            )}
            style={{
                fontFamily: theme.fontFamily,
                color: theme.accentColor,
                backgroundColor: theme.slideBackgroundColor,
                backgroundImage: theme.gradientBackground,
            }}
        >
            Test
        </div>
    );
};

export default ThumnailPreview;
