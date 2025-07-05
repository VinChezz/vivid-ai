'use server';

import { onAuthenticateUser } from './user';
import { client } from '@/lib/prisma';

export const addProductVarientId = async (
    projectId: string,
    varientId: string,
) => {
    try {
        const checkUser = await onAuthenticateUser();

        if (checkUser.status !== 200 || !checkUser.user) {
            return { status: 403, error: 'User not authenticated' };
        }

        if (!checkUser.user.lemonSqueezyApiKey) {
            return {
                status: 403,
                error: 'Add Lemon Squeezy API key in Settings',
            };
        }

        console.log(
            'Adding product varient id...',
            typeof projectId,
            typeof varientId,
        );
        const project = await client.project.update({
            where: { id: projectId },
            data: {
                varientId: varientId,
                isSellable: true,
            },
        });

        if (!project) {
            return { status: 500, error: 'Failed to add product varient id' };
        }

        return { status: 200, data: project };
    } catch (error) {
        console.error('🔴 ERROR', error);
        return { message: 'Internal Server Error', status: 500, error };
    }
};
