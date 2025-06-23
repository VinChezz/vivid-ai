import { containerVariants } from '@/lib/constants';
import { Project } from '@prisma/client';
import { motion } from 'framer-motion';
import React from 'react';
import ProjectCard from '../project-card';

type Props = {
    projects: Project[];
};

const Projects = ({ projects }: Props) => {
    return (
        <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={containerVariants}
            initial="hiddden"
            animate="visible"
        >
            {projects.map((project, i) => (
                <ProjectCard
                    key={i}
                    projectId={project?.id}
                    title={project?.title}
                    createdAt={project?.createdAt.toString()}
                    themeName={project.themeName}
                    isDelete={project?.isDeleted}
                    slideData={project?.slides}
                />
            ))}
        </motion.div>
    );
};

export default Projects;
