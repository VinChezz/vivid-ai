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
        console.log('Error', error);
        return { status: 500, error: 'Internal Server Error' };
    }
};
