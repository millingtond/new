// src/components/worksheets/OrderSequenceInteractive.tsx
"use client";

import React, { useState, useEffect } from 'react';
import type { OrderSequenceItem } from './worksheetTypes';

interface OrderSequenceInteractiveProps {
  sectionId: string;
  items: OrderSequenceItem[]; // Items in their initial order from Firestore
  // Student's current order of item IDs. If undefined, defaults to initial order of IDs.
  studentOrder?: string[]; 
  isReadOnly?: boolean;
  onOrderChange: (sectionId: string, newOrderIds: string[]) => void;
}

const OrderSequenceInteractive: React.FC<OrderSequenceInteractiveProps> = ({
  sectionId,
  items = [],
  studentOrder,
  isReadOnly = false,
  onOrderChange,
}) => {
  const [currentOrderIds, setCurrentOrderIds] = useState<string[]>([]);

  useEffect(() => {
    if (studentOrder && studentOrder.length > 0) {
      // Ensure all IDs in studentOrder exist in items and maintain that order
      // Also, ensure that the resulting list has the same items as `items`, even if new items were added to the question
      // or if studentOrder contains stale IDs.
      const itemIdsFromProps = new Set(items.map(item => item.id));
      
      // Filter studentOrder to only include valid, current item IDs
      const validStudentOrderFromSaved = studentOrder.filter(id => itemIdsFromProps.has(id));
      const validStudentOrderSet = new Set(validStudentOrderFromSaved);
      
      // Add any new items from `items` that weren't in the saved `studentOrder`
      const allRelevantItemIds = [
        ...validStudentOrderFromSaved,
        ...items.filter(item => !validStudentOrderSet.has(item.id)).map(item => item.id)
      ];
      setCurrentOrderIds(allRelevantItemIds);

    } else {
      // Default to the initial order of items from props
      setCurrentOrderIds(items.map(item => item.id));
    }
  }, [items, studentOrder]);

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (isReadOnly) return;

    const newOrderIds = [...currentOrderIds];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newOrderIds.length) {
      return; // Cannot move outside bounds
    }

    // Swap elements
    [newOrderIds[index], newOrderIds[targetIndex]] = [newOrderIds[targetIndex], newOrderIds[index]];
    
    // setCurrentOrderIds(newOrderIds); // Let parent control via studentOrder prop for single source of truth
    onOrderChange(sectionId, newOrderIds); // Notify parent of the change
  };

  if (items.length === 0) {
    return <p className="text-sm text-gray-500">No items provided for ordering.</p>;
  }

  // Create a map for quick lookup of item content by ID
  const itemsById = React.useMemo(() => 
    items.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {} as Record<string, OrderSequenceItem>), 
  [items]);

  return (
    <div className="space-y-2 my-4">
      {currentOrderIds.map((itemId, index) => {
        const item = itemsById[itemId];
        if (!item) return null; // Should not happen if IDs are consistent

        return (
          <div 
            key={item.id} 
            className="flex items-center p-3 border rounded-md bg-gray-50 shadow-sm transition-shadow hover:shadow-md"
            aria-roledescription="sortable item"
          >
            {!isReadOnly && (
              <div className="flex flex-col mr-3 space-y-1">
                <button
                  type="button"
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0 || isReadOnly}
                  className="p-1 text-indigo-600 hover:text-indigo-800 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-full hover:bg-indigo-100"
                  aria-label={`Move item '${item.content.substring(0,20)}...' up`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === currentOrderIds.length - 1 || isReadOnly}
                  className="p-1 text-indigo-600 hover:text-indigo-800 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-full hover:bg-indigo-100"
                  aria-label={`Move item '${item.content.substring(0,20)}...' down`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 17a1 1 0 01-.707-.293l-3-3a1 1 0 011.414-1.414L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3A1 1 0 0110 17z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
            <div className="flex-grow prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.content }} />
          </div>
        );
      })}
      {isReadOnly && currentOrderIds.length > 0 && (
        <p className="text-xs text-gray-500 mt-2">Order is fixed in read-only mode.</p>
      )}
    </div>
  );
};

export default OrderSequenceInteractive;
