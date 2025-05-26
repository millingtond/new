// src/components/worksheets/DiagramLabelInteractive.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Hotspot } from './worksheetTypes'; // Make sure Hotspot is defined in worksheetTypes
import KeywordTooltipWrapper from './KeywordTooltipWrapper';

interface DiagramLabelInteractiveProps {
  diagramImageUrl?: string;
  diagramAltText?: string;
  hotspots?: Hotspot[];
  keywordsData?: Record<string, string>;
  isReadOnly?: boolean;
  answers?: Record<string, Set<string>>; // Tracks revealed hotspots for a section: { [sectionId]: Set<hotspotId> }
  onAnswerChange?: (sectionId: string, hotspotId: string, isRevealed: boolean) => void;
  sectionId: string; 
}

const DiagramLabelInteractive: React.FC<DiagramLabelInteractiveProps> = ({
  diagramImageUrl,
  diagramAltText = "Interactive Diagram",
  hotspots = [],
  keywordsData = {},
  isReadOnly = false,
  answers,
  onAnswerChange,
  sectionId,
}) => {
  const getInitialRevealedState = () => {
    const initialState: Record<string, boolean> = {};
    const sectionAnswers = answers?.[sectionId];
    hotspots.forEach(hotspot => {
      if (isReadOnly || hotspot.defaultRevealed) {
        initialState[hotspot.id] = true;
      } else if (sectionAnswers) {
        initialState[hotspot.id] = sectionAnswers.has(hotspot.id);
      } else {
        initialState[hotspot.id] = false;
      }
    });
    return initialState;
  };

  const [revealedState, setRevealedState] = useState<Record<string, boolean>>(getInitialRevealedState());

  useEffect(() => {
    setRevealedState(getInitialRevealedState());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, sectionId, hotspots, isReadOnly]);

  const handleHotspotClick = (hotspotId: string) => {
    if (isReadOnly && !hotspots.find(h => h.id === hotspotId)?.defaultRevealed) return;

    const currentlyRevealed = revealedState[hotspotId];
    const newRevealedStatus = !currentlyRevealed;

    if (!isReadOnly) {
      setRevealedState(prev => ({ ...prev, [hotspotId]: newRevealedStatus }));
      if (onAnswerChange) {
        onAnswerChange(sectionId, hotspotId, newRevealedStatus);
      }
    }
  };

  if (!diagramImageUrl) {
    return <p className="text-red-500">Diagram image URL is missing.</p>;
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto my-6">
      <div style={{ position: 'relative', width: '100%', paddingBottom: '75%' }}> {/* Aspect ratio container */}
        <Image
          src={diagramImageUrl}
          alt={diagramAltText}
          layout="fill"
          objectFit="contain"
          className="rounded-md shadow-md bg-gray-100"
          priority
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement?.parentElement; // Access the outer div
            if (parent) {
                 const errorMsg = document.createElement('p');
                 errorMsg.textContent = `Failed to load image: ${diagramAltText}`;
                 errorMsg.className = "text-red-500 text-center p-4";
                 parent.appendChild(errorMsg);
            }
          }}
        />
      </div>
      {hotspots.map((hotspot) => {
        const isRevealed = revealedState[hotspot.id];
        const definition = hotspot.termKey ? keywordsData[hotspot.termKey.toLowerCase()] : undefined;

        return (
          <div
            key={hotspot.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
          >
            <button
              type="button"
              onClick={() => handleHotspotClick(hotspot.id)}
              className={`p-1.5 rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                ${isRevealed ? 'bg-indigo-500 text-white shadow-lg scale-110' : 'bg-white text-indigo-600 hover:bg-indigo-100 shadow-md border border-indigo-300'}
                ${(isReadOnly && !hotspot.defaultRevealed) ? 'cursor-default opacity-75' : 'cursor-pointer'}`}
              aria-label={`Reveal label for hotspot ${hotspot.id}`}
              aria-expanded={isRevealed}
              disabled={isReadOnly && !hotspot.defaultRevealed}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isRevealed ? 2.5 : 2}>
                {isRevealed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l6.032 6.032" />
                )}
                 {isRevealed && <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />}
              </svg>
            </button>

            {isRevealed && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2.5 min-w-[160px] text-center bg-gray-800 text-white text-xs sm:text-sm rounded-lg shadow-xl z-10 whitespace-nowrap pointer-events-none">
                {definition ? (
                  <KeywordTooltipWrapper term={hotspot.label} definition={definition} />
                ) : (
                  hotspot.label
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DiagramLabelInteractive;
