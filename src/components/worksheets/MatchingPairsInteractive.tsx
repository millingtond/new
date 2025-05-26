// src/components/worksheets/MatchingPairsInteractive.tsx
"use client";

import React, { useState, useEffect } from 'react';
import type { MatchItem } from './worksheetTypes';

export interface StudentMatchPair {
  itemAId: string;
  itemBId: string;
}

interface MatchingPairsInteractiveProps {
  sectionId: string;
  setA: MatchItem[]; // e.g., terms, premises
  setB: MatchItem[]; // e.g., definitions, responses
  studentPairedIds?: StudentMatchPair[]; // Student's current pairings
  isReadOnly?: boolean;
  onPairChange: (sectionId: string, newPairs: StudentMatchPair[]) => void;
}

const MatchingPairsInteractive: React.FC<MatchingPairsInteractiveProps> = ({
  sectionId,
  setA = [],
  setB = [],
  studentPairedIds = [],
  isReadOnly = false,
  onPairChange,
}) => {
  const [selectedA, setSelectedA] = useState<string | null>(null);
  const [selectedB, setSelectedB] = useState<string | null>(null);
  const [currentPairs, setCurrentPairs] = useState<StudentMatchPair[]>([]);

  useEffect(() => {
    // Synchronize currentPairs with studentPairedIds from props
    // This ensures that if the parent updates the saved pairs (e.g., from Firestore),
    // the component reflects that.
    setCurrentPairs(studentPairedIds || []);
  }, [studentPairedIds]);

  const handleSelectA = (itemId: string) => {
    if (isReadOnly || isItemAPaired(itemId)) return;
    setSelectedA(prev => (prev === itemId ? null : itemId));
    // setSelectedB(null); // Keep B selected if user re-clicks A to deselect A
  };

  const handleSelectB = (itemId: string) => {
    if (isReadOnly || isItemBPaired(itemId)) return;
    setSelectedB(prev => (prev === itemId ? null : itemId));
  };

  useEffect(() => {
    // If one item from each set is selected, form a pair
    if (selectedA && selectedB && !isReadOnly) {
      const newPair: StudentMatchPair = { itemAId: selectedA, itemBId: selectedB };
      // Avoid duplicate pairs for the same itemAId or itemBId before adding
      const filteredPairs = currentPairs.filter(p => p.itemAId !== selectedA && p.itemBId !== selectedB);
      const updatedPairs = [...filteredPairs, newPair];
      
      // setCurrentPairs(updatedPairs); // Let parent control via studentPairedIds for single source of truth
      onPairChange(sectionId, updatedPairs);
      
      // Reset selections after pairing
      setSelectedA(null);
      setSelectedB(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedA, selectedB, sectionId, isReadOnly]); // currentPairs removed from deps, onPairChange added

  const unpair = (itemAIdToUnpair: string) => {
    if (isReadOnly) return;
    const updatedPairs = currentPairs.filter(p => p.itemAId !== itemAIdToUnpair);
    // setCurrentPairs(updatedPairs); // Let parent control
    onPairChange(sectionId, updatedPairs);
     // If the unpaired itemA was selected, deselect it
    if (selectedA === itemAIdToUnpair) {
        setSelectedA(null);
    }
  };

  const isItemAPaired = (itemAId: string): boolean => currentPairs.some(p => p.itemAId === itemAId);
  const isItemBPaired = (itemBId: string): boolean => currentPairs.some(p => p.itemBId === itemBId);
  const getPairedItemBForA = (itemAId: string): MatchItem | undefined => {
    const pair = currentPairs.find(p => p.itemAId === itemAId);
    return pair ? setB.find(b => b.id === pair.itemBId) : undefined;
  };

  if (setA.length === 0 || setB.length === 0) {
    return <p className="text-sm text-gray-500">Matching sets are incomplete.</p>;
  }
  
  return (
    <div className="my-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        {/* Column A (Premises) */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-600 mb-1 px-1">Match from this column:</h4>
          {setA.map(itemA => {
            const isPaired = isItemAPaired(itemA.id);
            const pairedItemB = getPairedItemBForA(itemA.id);
            return (
              <div key={itemA.id} 
                className={`p-3 border rounded-md transition-all duration-150 flex flex-col justify-between min-h-[60px] ${
                selectedA === itemA.id ? 'bg-indigo-100 border-indigo-500 ring-2 ring-indigo-400 shadow-md' : 
                isPaired ? 'bg-green-50 border-green-400 shadow-sm' : 'bg-white border-gray-300'
              } ${!isReadOnly && !isPaired ? 'hover:bg-indigo-50 cursor-pointer' : ''} 
                 ${isReadOnly && !isPaired ? 'opacity-75 cursor-default' : ''}
                 ${isPaired && !isReadOnly ? 'cursor-default' : ''}
                 `}
                onClick={() => handleSelectA(itemA.id)}
                role="button"
                tabIndex={isReadOnly || isPaired ? -1 : 0}
                aria-pressed={selectedA === itemA.id}
                aria-disabled={isReadOnly || isPaired}
              >
                <div className="prose prose-sm max-w-none flex-grow" dangerouslySetInnerHTML={{ __html: itemA.content }} />
                {isPaired && pairedItemB && (
                     <div className="text-xs mt-2 pt-2 border-t border-green-200">
                        <span className="text-green-700 font-medium">Matched with: </span>
                        <span className="italic text-gray-600" dangerouslySetInnerHTML={{ __html: pairedItemB.content }} />
                     </div>
                )}
                 {isPaired && !isReadOnly && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); unpair(itemA.id); }}
                    className="text-xs text-red-500 hover:text-red-700 mt-1 self-end focus:outline-none focus:ring-1 focus:ring-red-400 rounded px-1.5 py-0.5 hover:bg-red-100"
                    aria-label={`Unpair ${itemA.content.substring(0,20)}...`}
                  >
                    Unpair
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Column B (Responses) */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-600 mb-1 px-1">To an item in this column:</h4>
          {setB.map(itemB => {
            const isPaired = isItemBPaired(itemB.id);
            return (
              <div key={itemB.id} 
                className={`p-3 border rounded-md transition-all duration-150 min-h-[60px] ${
                selectedB === itemB.id ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-400 shadow-md' : 
                isPaired ? 'bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed' : 'bg-white border-gray-300'
              } ${!isReadOnly && !isPaired && selectedA ? 'hover:bg-blue-50 cursor-pointer' : ''} 
                 ${isReadOnly && !isPaired ? 'opacity-75 cursor-default' : ''}
                 ${!selectedA && !isPaired && !isReadOnly ? 'cursor-not-allowed opacity-60' : ''}
                 `}
                onClick={() => selectedA && !isPaired && handleSelectB(itemB.id)}
                role="button"
                tabIndex={isReadOnly || isPaired || !selectedA ? -1 : 0}
                aria-pressed={selectedB === itemB.id}
                aria-disabled={isReadOnly || isPaired || !selectedA}
              >
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: itemB.content }} />
                 {isPaired && <p className="text-xs text-gray-500 mt-1">(Already matched)</p>}
              </div>
            );
          })}
        </div>
      </div>
      {isReadOnly && currentPairs.length > 0 && (
        <p className="text-xs text-gray-500 mt-3 text-center">Pairings are fixed in read-only mode.</p>
      )}
       {!isReadOnly && setA.length > 0 && currentPairs.length === setA.length && (
        <p className="text-sm text-green-600 mt-4 font-semibold text-center">All items matched!</p>
      )}
    </div>
  );
};

export default MatchingPairsInteractive;
