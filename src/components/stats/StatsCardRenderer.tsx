
import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableCardItem } from '@/components/stats/SortableCardItem';

interface StatsCardRendererProps {
    cardOrder: string[];
    onCardOrderChange: (newOrder: string[]) => void;
    isDndEnabled: boolean;
    cardComponents: Record<string, React.ReactNode>;
}

export const StatsCardRenderer: React.FC<StatsCardRendererProps> = ({
    cardOrder,
    onCardOrderChange,
    isDndEnabled,
    cardComponents,
}) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = cardOrder.indexOf(active.id as string);
            const newIndex = cardOrder.indexOf(over.id as string);
            if (oldIndex === -1 || newIndex === -1) return;
            const newOrder = arrayMove(cardOrder, oldIndex, newIndex);
            onCardOrderChange(newOrder);
        }
    };

    console.log('Available card components:', Object.keys(cardComponents));
    console.log('Card order:', cardOrder);

    const cards = cardOrder.map((cardId) => {
        const component = cardComponents[cardId];
        console.log(`Card ${cardId}:`, component ? 'exists' : 'MISSING');
        return {
            id: cardId,
            component: component,
        };
    }).filter(card => card.component !== undefined);

    console.log('Final cards to render:', cards.map(c => c.id));

    if (!isDndEnabled) {
        return (
            <div className="space-y-4">
                {cards.map((card) => (
                    <div key={card.id}>
                        {card.component}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={cardOrder} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                    {cards.map((card) => (
                        <SortableCardItem key={card.id} id={card.id} isDndEnabled={isDndEnabled}>
                            {card.component}
                        </SortableCardItem>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};
