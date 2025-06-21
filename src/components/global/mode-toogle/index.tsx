'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';

const ThemeSwitcher = () => {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className="">
            <Switch
                checked={theme === 'light'}
                className="h-10 w-20 pl-1 data-[state=checked]:bg-primary-80"
                onCheckedChange={() =>
                    setTheme(theme === 'dark' ? 'light' : 'dark')
                }
                aria-label="Toogle dark mode"
            />
        </div>
    );
};

export default ThemeSwitcher;
