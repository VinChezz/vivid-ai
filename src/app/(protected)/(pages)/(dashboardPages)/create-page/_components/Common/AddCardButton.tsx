import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddCardButtonProps {
    onAddCard: () => void;
}

const AddCardButton = ({ onAddCard }: AddCardButtonProps) => {
    const [showGap, setShowGap] = useState(false);

    return (
        <motion.div
            className="w-full relative"
            initial={{ height: '0.75rem' }}
            animate={{
                height: showGap ? '2.5rem' : '0.75rem',
                transition: { duration: 0.3, ease: 'easeInOut' },
            }}
            onHoverStart={() => setShowGap(true)}
            onHoverEnd={() => setShowGap(false)}
        >
            <AnimatePresence>
                {showGap && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="flex items-center w-full gap-3 px-4">
                            <div className="flex-grow h-[1px] bg-muted" />
                            <Button
                                variant="default"
                                size="sm"
                                className="group rounded-full h-8 w-8 p-0 bg-white hover:bg-muted"
                                onClick={onAddCard}
                                aria-label="Add new card"
                            >
                                <Plus className="h-4 w-4 text-black group-hover:text-white transition-colors" />
                            </Button>

                            <div className="flex-grow h-[1px] bg-muted" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AddCardButton;
