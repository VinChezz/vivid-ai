'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import useCreativeAIStore from '@/store/useCreativeAIStore';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { v4 as uuidv4 } from 'uuid';
import { OutlineCard } from '@/lib/types';
import { useSlideStore } from '@/store/useSlideStore';
import usePromptStore from '@/store/usePromptStore';
import CardList from '../Common/CardList';
import { useToast } from '@/hooks/use-toast';
import { RecentPrompts } from '../GenerateAI/RecentPrompts';
import { createProject } from '@/actions/project';
import { generateCreativePrompt } from '@/actions/openai';

type Props = {
    onBack: () => void;
};

const CreateAI = ({ onBack }: Props) => {
    const router = useRouter();
    const { toast } = useToast();
    const { prompts, addPrompt } = usePromptStore();
    const { setProject } = useSlideStore();
    const [editText, setEditText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingCard, setEditingCard] = useState<string | null>(null);
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
    const [noOfCards, setNoOfCards] = useState(0);

    const {
        outlines,
        currentAiPrompt,
        setCurrentAiPrompt,
        resetOutlines,
        addMultipleOutlines,
        addOutline,
    } = useCreativeAIStore();

    const handleGenerate = async () => {
        setIsGenerating(true);
        if (outlines.length === 0) {
            toast({
                title: 'Error',
                description: 'Please add at least one card to generate PPT',
            });
            return;
        }
        try {
            const res = await createProject(
                currentAiPrompt,
                outlines.slice(0, noOfCards),
            );
            if (res.status !== 200 || !res.data) {
                throw new Error('Unable to create project');
            }

            router.push(`/presentation/${res.data.id}/select-theme`);
            setProject(res.data);

            addPrompt({
                id: uuidv4(),
                title: currentAiPrompt || outlines?.[0]?.title,
                outlines: outlines,
                createdAt: new Date().toISOString(),
            });

            toast({
                title: 'Success',
                description: 'Project created successfully!',
            });
            setCurrentAiPrompt('');
            resetOutlines();
        } catch (e) {
            console.log(e);
            toast({
                title: 'Error',
                description: 'Failed to create project',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleBack = () => {
        onBack();
    };

    const resetCards = () => {
        setEditingCard(null);
        setSelectedCard(null);
        setEditText('');
        // zustand
        setCurrentAiPrompt('');
        resetOutlines();
    };

    const generateOutline = async () => {
        if (currentAiPrompt === '') {
            toast({
                title: 'Error',
                description: 'Please enter a prompt to generate an outline.',
            });
            console.log('Please enter a prompt to generate an outline.');
            return;
        }
        setIsGenerating(true);

        const res = await generateCreativePrompt(currentAiPrompt);
        // console.log(res);
        if (res.status === 200 && res?.data?.outlines) {
            // console.log(res?.data?.outlines);
            const cardsData: OutlineCard[] = [];
            res?.data?.outlines.map((outline: string, idx: number) => {
                const newCard = {
                    id: uuidv4(),
                    title: outline,
                    order: idx + 1,
                };
                cardsData.push(newCard);
            });
            addMultipleOutlines(cardsData);
            setNoOfCards(cardsData.length);
            toast({
                title: 'Success',
                description: 'Outline generated successfully!',
            });
        } else {
            toast({
                title: 'Error',
                description: 'Failed to generate outline. Please try again.',
            });
        }
        setIsGenerating(false);
    };

    useEffect(() => {
        setNoOfCards(outlines.length);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [outlines.length]);

    return (
        <motion.div
            className="space-y-6 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Button onClick={handleBack} variant="outline" className="mb-4">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
            </Button>

            <motion.div
                variants={itemVariants}
                className="text-center space-y-2"
            >
                <h1 className="text-4xl font-bold text-primary">
                    Generate with{' '}
                    <span className="text-vivid">Creative AI</span>
                </h1>
                <p className="text-secondary">
                    What would like to create today?
                </p>
            </motion.div>
            <motion.div
                className="bg-primary/10 p-4 rounded-xl"
                variants={itemVariants}
            >
                <div className="flex flex-col sm:flex-row justify-between gap-3 items-center rounded-xl">
                    <Input
                        value={currentAiPrompt}
                        onChange={(e) => setCurrentAiPrompt(e.target.value)}
                        placeholder="Enter Prompt and add to the cards..."
                        className="text-base sm:text-xl border-0 focus-visible:ring-0 shadow-none p-0 bg-transparent flex-grow"
                        required
                    />
                    <div className="flex items-center gap-3">
                        <Select
                            value={noOfCards.toString()}
                            onValueChange={(value) =>
                                setNoOfCards(parseInt(value))
                            }
                        >
                            <SelectTrigger className="w-fit gap-2 font-semibold shadow-xl">
                                <SelectValue placeholder="Select number of cards" />
                            </SelectTrigger>
                            <SelectContent className="w-fit">
                                {outlines.length === 0 ? (
                                    <SelectItem
                                        value="0"
                                        className="font-semibold"
                                    >
                                        No cards
                                    </SelectItem>
                                ) : (
                                    Array.from(
                                        { length: outlines.length },
                                        (_, idx) => idx + 1,
                                    ).map((num) => (
                                        <SelectItem
                                            key={num}
                                            value={num.toString()}
                                            className="font-semibold"
                                        >
                                            {num} {num === 1 ? 'Card' : 'Cards'}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>

                        <Button
                            variant={'destructive'}
                            onClick={resetCards}
                            size={'icon'}
                            aria-label="Reset cards"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </motion.div>

            <div className="w-full flex justify-center items-center">
                <Button
                    className="font-medium text-lg flex gap-2 items-center bg-primary-80"
                    onClick={generateOutline}
                    disabled={isGenerating}
                    variant={'ghost'}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="animate-spin mr-2" />
                        </>
                    ) : (
                        <span className="font-semibold border-collapse text-vivid">
                            Generate Outline
                        </span>
                    )}
                </Button>
            </div>

            <CardList
                outlines={outlines}
                addOutline={addOutline}
                addMultipleOutlines={addMultipleOutlines}
                editingCard={editingCard}
                selectedCard={selectedCard}
                editText={editText}
                onEditChange={setEditText}
                onCardSelect={setSelectedCard}
                onCardDoubleClick={(id, title) => {
                    setEditingCard(id);
                    setEditText(title);
                }}
                setEditText={setEditText}
                setEditingCard={setEditingCard}
                setSelectedCard={setSelectedCard}
            />

            {outlines?.length > 0 && (
                <Button
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-4 h-4" />
                            <span className="font-semibold border-collapse text-vivid">
                                Generating...
                            </span>
                        </>
                    ) : (
                        <span className="font-semibold border-collapse text-vivid">
                            Generate PPT
                        </span>
                    )}
                </Button>
            )}
            {prompts?.length > 0 && <RecentPrompts />}
        </motion.div>
    );
};
export default CreateAI;
