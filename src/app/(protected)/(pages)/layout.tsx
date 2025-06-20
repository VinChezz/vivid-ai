export const dynamic = 'force-dynamic';
import { getRecentProjects } from '@/actions/project';
import { onAuthenticateUser } from '@/actions/user';
import AppSideBar from '@/components/global/app-sidebar';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { redirect } from 'next/navigation';
import React from 'react';

type Props = {
    children: React.ReactNode;
};

const Layout = async ({ children }: Props) => {
    const recentProjects = await getRecentProjects();

    const checkUser = await onAuthenticateUser();
    if (!checkUser.user) redirect('/sign-in');

    return (
        <SidebarProvider>
            <AppSideBar
                recentProjects={recentProjects.data || []}
                user={checkUser.user}
            />
        </SidebarProvider>
    );
};

export default Layout;
