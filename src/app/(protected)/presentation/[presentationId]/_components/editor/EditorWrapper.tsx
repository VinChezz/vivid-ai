'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Динамічний імпорт Editor без SSR, це також допоможе
const Editor = dynamic(() => import('./Editor'), { ssr: false });

export default function EditorWrapper(props: any) {
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(true);
    }, []);

    if (!hydrated) return null; // або <Skeleton /> або <div>Loading...</div>

    return <Editor {...props} />;
}
