export const dynamic = 'force-dynamic';
import { onAuthenticateUser } from '@/actions/user';
import AppSideBar from '@/components/global/add-sidebar';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { redirect } from 'next/navigation';
import React from 'react';

type Props = {
    children: React.ReactNode;
};

const Layout = async ({ children }: Props) => {
    // const recentProjects = await getRecentProjects()

    const checkUser = await onAuthenticateUser();
    if (!checkUser.user) redirect('/sign-in');

    return (
        <SidebarProvider>
            <AppSideBar recentProjects={[]} user={checkUser.user}></AppSideBar>
        </SidebarProvider>
    );
};

export default Layout;
