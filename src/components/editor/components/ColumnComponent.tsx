'use client';

import React, { useState, useEffect } from 'react';
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from '@/components/ui/resizable';
import { MasterRecursiveComponent } from '@/app/(protected)/presentation/[presentationId]/_components/editor/MasterRecursiveComponent';
import { v4 as uuidv4 } from 'uuid';
import { ContentItem } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ColumnProps {
    content: ContentItem[];
    className?: string;
    isPreview?: boolean;
    slideId: string;
    onContentChange: (
        contentId: string,
        newContent: string | string[] | string[][],
    ) => void;
    isEditable?: boolean;
    imageLoading: boolean;
}

export const ColumnComponent: React.FC<ColumnProps> = ({
    content,
    className,
    slideId,
    onContentChange,
    isPreview = false,
    isEditable = true,
    imageLoading = false,
}) => {
    const [columns, setColumns] = useState<ContentItem[]>([]);

    useEffect(() => {
        // Ensure content is always an array and has at least one item
        const normalizedContent = Array.isArray(content) ? content : [];
        if (normalizedContent.length === 0) {
            setColumns(createDefaultColumns(2));
        } else {
            setColumns(normalizedContent);
        }
    }, [content]);

    const createDefaultColumns = (count: number): ContentItem[] => {
        return Array(count)
            .fill(null)
            .map(() => ({
                id: uuidv4(),
                type: 'paragraph',
                name: 'Paragraph',
                content: '',
                placeholder: 'Start typing...',
            }));
    };

    // Safely get the content for rendering
    const renderColumns =
        columns.length > 0 ? columns : createDefaultColumns(2);

    return (
        <div className="relative w-full h-full">
            <ResizablePanelGroup
                direction="horizontal"
                className={cn(
                    'h-full w-full flex',
                    !isEditable && '!border-0',
                    className,
                )}
            >
                {renderColumns.map((item, index) => (
                    <React.Fragment key={item.id || `column-${index}`}>
                        <ResizablePanel
                            minSize={20}
                            defaultSize={100 / renderColumns.length}
                        >
                            <div
                                className={cn('h-full w-full', item.className)}
                            >
                                <MasterRecursiveComponent
                                    content={item}
                                    isPreview={isPreview}
                                    onContentChange={onContentChange}
                                    slideId={slideId}
                                    isEditable={isEditable}
                                    imageLoading={imageLoading}
                                />
                            </div>
                        </ResizablePanel>
                        {index < renderColumns.length - 1 && isEditable && (
                            <ResizableHandle withHandle={!isPreview} />
                        )}
                    </React.Fragment>
                ))}
            </ResizablePanelGroup>
        </div>
    );
};
