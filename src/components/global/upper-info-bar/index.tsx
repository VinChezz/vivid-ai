import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@radix-ui/react-separator';
import React from 'react';

import SearchBar from './upper-info-searchbar';
import { User } from '@prisma/client';
import ThemeSwitcher from '../mode-toogle';
import { Upload } from 'lucide-react';
import NewProjectButton from './new-project-button';

const UpperInfoBar = ({ user }: { user: User }) => {
    return (
        <header className="sticky top-0 z-[10] flex shrink-0 flex-wrap items-center gap-2 border-b bg-background p-4 justify-between">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />

            <div className="w-full max-w-[95%] flex items-center justify-between gap-4 flex-wrap">
                {/* Search */}
                <SearchBar />
                {/* Mode Toggle */}
                <ThemeSwitcher />
                <div className="flex flex-wrap gap-4 items-center justify-end">
                    <Button
                        size={'lg'}
                        className="bg-primary-80 rounded-lg hover:bg-background-80 text-primary font-semibold cursor-not-allowed"
                    >
                        <Upload />
                        Import
                    </Button>
                    <NewProjectButton user={user} />
                </div>
            </div>
        </header>
    );
};

export default UpperInfoBar;
