'use server';

import { client } from '@/lib/prisma';
import { onAuthenticateUser } from './user';

export const getAllProjects = async () => {
    try {
        const checkUser = await onAuthenticateUser();
        if (checkUser.status !== 200 || !checkUser.user) {
            return { status: 403, error: 'User not Authenticated' };
        }

        const projects = await client.project.findMany({
            where: {
                userId: checkUser.user.id,
                isDeleted: false,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        if (projects.length === 0) {
            return { status: 404, error: 'No Projects Found' };
        }
    } catch (error) {
        console.log('🔴 Error', error);
        return { status: 500, error: 'Internal Server Error' };
    }
};

export const getRecentProjects = async () => {
    try {
        const checkUser = await onAuthenticateUser();

        if (checkUser.status !== 200 || !checkUser.user) {
            return { status: 403, error: 'User not authenticated' };
        }

        const projects = await client.project.findMany({
            where: {
                userId: checkUser.user.id,
                isDeleted: false,
            },
            orderBy: {
                updatedAt: 'desc',
            },
            take: 5,
        });

        if (projects.length === 0) {
            return {
                status: 404,
                error: 'No recent projects available',
            };
        }

        return { status: 200, data: projects };
    } catch (error) {
        console.error('🔴 ERROR', error);
        return { status: 500, error: 'Internal server error' };
    }
};

export const recoverProject = async (projectId: string) => {
    try {
        console.log('Recovering project with ID:', projectId);
        const checkUser = await onAuthenticateUser();

        if (checkUser.status !== 200 || !checkUser.user) {
            return { status: 403, error: 'User not authenticated' };
        }

        // Update the project to mark it as deleted
        const updatedProject = await client.project.update({
            where: {
                id: projectId,
            },
            data: {
                isDeleted: false,
            },
        });

        if (!updatedProject) {
            return { status: 500, error: 'Failed to recover project' };
        }

        return { status: 200, data: updatedProject };
    } catch (error) {
        console.log('🔴 ERROR', error);
        return { status: 500, error: 'Internal server error' };
    }
};

export const deleteProject = async (projectId: string) => {
    try {
        console.log('Deleting project with ID:', projectId);
        const checkUser = await onAuthenticateUser();

        if (checkUser.status !== 200 || !checkUser.user) {
            return { status: 403, error: 'User not authenticated' };
        }

        const updatedProject = await client.project.update({
            where: {
                id: projectId,
            },
            data: {
                isDeleted: true,
            },
        });

        if (!updatedProject) {
            return { status: 500, error: 'Failed to delete project' };
        }

        return { status: 200, data: updatedProject };
    } catch (error) {
        console.log('🔴 ERROR', error);
        return { status: 500, error: 'Internal server error' };
    }
};
