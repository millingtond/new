// src/components/worksheets-new/sections/BusSimulationSectionDisplay.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import { BusSimulationSection, StaticTextSection } from '@/types/worksheetNew';
import RichTextSectionDisplay from './RichTextSectionDisplay'; // For parsing introText with keywords
import DOMPurify from 'isomorphic-dompurify';

interface BusSimElements {
  addrPacket: HTMLElement | null; dataPacket: HTMLElement | null; ctrlPacket: HTMLElement | null;
  description: HTMLElement | null; addrBusLine: HTMLElement | null; dataBusLine: HTMLElement | null; ctrlBusLine: HTMLElement | null;
}
type BusSimElementsRequired = Required<BusSimElements>;


const BusSimulationSectionDisplay: React.FC<{ section: BusSimulationSection, keywordsData?: Record<string, {definition: string}> }> = ({ section, keywordsData }) => {
  const simContainerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<BusSimElements | null>(null);
  const busTimeoutRef = useRef<number | undefined>(undefined);

  const setupElements = useCallback(() => {
    if (simContainerRef.current) {
        elementsRef.current = {
            addrPacket: simContainerRef.current.querySelector<HTMLElement>('#bus-packet-address-task4'),
            dataPacket: simContainerRef.current.querySelector<HTMLElement>('#bus-packet-data-task4'),
            ctrlPacket: simContainerRef.current.querySelector<HTMLElement>('#bus-packet-control-task4'),
            description: simContainerRef.current.querySelector<HTMLElement>('#bus-sim-description-task4'),
            addrBusLine: simContainerRef.current.querySelector<HTMLElement>('.bus-sim-address-task4'),
            dataBusLine: simContainerRef.current.querySelector<HTMLElement>('.bus-sim-data-task4'),
            ctrlBusLine: simContainerRef.current.querySelector<HTMLElement>('.bus-sim-control-task4'),
        };
    }
  }, []);

  useEffect(() => {
    setupElements(); // Initial setup
    // Cleanup on unmount
    return () => {
      if (busTimeoutRef.current) {
        clearTimeout(busTimeoutRef.current);
      }
    };
  }, [setupElements]);

  const adaptedResetBusSimulation = useCallback(() => {
    if (!elementsRef.current || !Object.values(elementsRef.current).every(el => el)) return;
    const elements = elementsRef.current as BusSimElementsRequired;

    clearTimeout(busTimeoutRef.current);
    
    const packets = [elements.addrPacket, elements.dataPacket, elements.ctrlPacket];
    packets.forEach(p => {
        if(p) {
            p.style.left = '0px';
            p.classList.remove('show', 'move-right', 'move-left');
            p.style.opacity = '0'; // Ensure hidden
             // Reset base classes
            if (p.id.includes('address')) p.className = 'bus-sim-packet address absolute bg-red-500 text-white text-xs px-2 py-0.5 rounded top-[60px] left-36 opacity-0 transition-all duration-700 ease-in-out whitespace-nowrap';
            if (p.id.includes('data')) p.className = 'bus-sim-packet data absolute bg-blue-600 text-white text-xs px-2 py-0.5 rounded top-1/2 -translate-y-1/2 left-36 opacity-0 transition-all duration-700 ease-in-out whitespace-nowrap';
            if (p.id.includes('control')) p.className = 'bus-sim-packet control absolute bg-green-500 text-white text-xs px-2 py-0.5 rounded bottom-[60px] left-36 opacity-0 transition-all duration-700 ease-in-out whitespace-nowrap';
        }
    });

    const lines = [elements.addrBusLine, elements.dataBusLine, elements.ctrlBusLine];
    lines.forEach(l => l?.classList.remove('active', 'bg-red-500', 'bg-blue-600', 'bg-green-500')); // Remove active colors
    lines.forEach(l => l?.classList.add('bg-slate-300')); // Reset to base color

    if(elements.description) elements.description.textContent = "Click a button to start the simulation.";
  }, []);


  const adaptedSimulateBus = useCallback((operation: 'read' | 'write') => {
    if (!elementsRef.current || !Object.values(elementsRef.current).every(el => el)) {
        console.warn("Bus simulation elements not ready for simulation.");
        const descEl = elementsRef.current?.description;
        if(descEl) descEl.textContent = "Simulation elements not found. Please refresh.";
        return;
    }
    const elements = elementsRef.current as BusSimElementsRequired;
    adaptedResetBusSimulation(); // Reset before starting a new simulation

    const setPacketLeft = (packet: HTMLElement, targetBusLine: HTMLElement) => {
        // Position packet at the start of its bus line relative to the sim container
        const containerRect = simContainerRef.current!.getBoundingClientRect();
        const busRect = targetBusLine.getBoundingClientRect();
        packet.style.left = `${busRect.left - containerRect.left}px`;
    };
    
    const movePacketRight = (packet: HTMLElement, targetBusLine: HTMLElement) => {
        const containerRect = simContainerRef.current!.getBoundingClientRect();
        const busRect = targetBusLine.getBoundingClientRect();
        const endPosition = (busRect.right - containerRect.left) - packet.offsetWidth;
        packet.style.left = `${endPosition}px`;
    };


    if (operation === 'read') {
        elements.addrPacket.textContent = 'Addr: 5';
        elements.ctrlPacket.textContent = 'Read';
        elements.dataPacket.textContent = 'Data: 12';
        elements.description.textContent = "1. CPU places address 5 on Address Bus.";
        elements.addrBusLine.classList.remove('bg-slate-300'); elements.addrBusLine.classList.add('active', 'bg-red-500');
        setPacketLeft(elements.addrPacket, elements.addrBusLine);
        elements.addrPacket.style.opacity = '1'; elements.addrPacket.classList.add('show');

        busTimeoutRef.current = window.setTimeout(() => {
            movePacketRight(elements.addrPacket, elements.addrBusLine);
            elements.description.textContent = "2. Address 5 travels to RAM.";
            busTimeoutRef.current = window.setTimeout(() => {
                elements.addrBusLine.classList.remove('active', 'bg-red-500'); elements.addrBusLine.classList.add('bg-slate-300');
                elements.description.textContent = "3. CPU sends 'Read' signal on Control Bus.";
                elements.ctrlBusLine.classList.remove('bg-slate-300'); elements.ctrlBusLine.classList.add('active', 'bg-green-500');
                setPacketLeft(elements.ctrlPacket, elements.ctrlBusLine);
                elements.ctrlPacket.style.opacity = '1'; elements.ctrlPacket.classList.add('show');
                movePacketRight(elements.ctrlPacket, elements.ctrlBusLine);
                busTimeoutRef.current = window.setTimeout(() => {
                    elements.ctrlBusLine.classList.remove('active', 'bg-green-500'); elements.ctrlBusLine.classList.add('bg-slate-300');
                    elements.description.textContent = "4. RAM places data (12) on Data Bus.";
                    movePacketRight(elements.dataPacket, elements.dataBusLine); // Position at RAM end
                    elements.dataBusLine.classList.remove('bg-slate-300'); elements.dataBusLine.classList.add('active', 'bg-blue-600');
                    elements.dataPacket.style.opacity = '1'; elements.dataPacket.classList.add('show');
                    busTimeoutRef.current = window.setTimeout(() => {
                        elements.description.textContent = "5. Data (12) travels back to CPU.";
                        setPacketLeft(elements.dataPacket, elements.dataBusLine); // Move to CPU end
                        busTimeoutRef.current = window.setTimeout(() => {
                            elements.dataBusLine.classList.remove('active', 'bg-blue-600'); elements.dataBusLine.classList.add('bg-slate-300');
                            elements.description.textContent = "Read cycle complete.";
                        }, 1500);
                    }, 800);
                }, 1500);
            }, 800);
        }, 800);
    } else if (operation === 'write') {
        // Similar logic for write, using setPacketLeft and movePacketRight
        elements.addrPacket.textContent = 'Addr: 7';
        elements.ctrlPacket.textContent = 'Write';
        elements.dataPacket.textContent = 'Data: 99';
        elements.description.textContent = "1. CPU places address 7 on Address Bus.";
        elements.addrBusLine.classList.remove('bg-slate-300'); elements.addrBusLine.classList.add('active', 'bg-red-500');
        setPacketLeft(elements.addrPacket, elements.addrBusLine);
        elements.addrPacket.style.opacity = '1'; elements.addrPacket.classList.add('show');

        busTimeoutRef.current = window.setTimeout(() => {
            movePacketRight(elements.addrPacket, elements.addrBusLine);
            elements.description.textContent = "2. Address 7 travels to RAM.";
            busTimeoutRef.current = window.setTimeout(() => {
                elements.addrBusLine.classList.remove('active', 'bg-red-500'); elements.addrBusLine.classList.add('bg-slate-300');
                elements.description.textContent = "3. CPU places data (99) on Data Bus.";
                elements.dataBusLine.classList.remove('bg-slate-300'); elements.dataBusLine.classList.add('active', 'bg-blue-600');
                setPacketLeft(elements.dataPacket, elements.dataBusLine);
                elements.dataPacket.style.opacity = '1'; elements.dataPacket.classList.add('show');
                busTimeoutRef.current = window.setTimeout(() => {
                    movePacketRight(elements.dataPacket, elements.dataBusLine);
                    elements.description.textContent = "4. Data (99) travels to RAM.";
                    busTimeoutRef.current = window.setTimeout(() => {
                        elements.dataBusLine.classList.remove('active', 'bg-blue-600'); elements.dataBusLine.classList.add('bg-slate-300');
                        elements.description.textContent = "5. CPU sends 'Write' signal on Control Bus.";
                        elements.ctrlBusLine.classList.remove('bg-slate-300'); elements.ctrlBusLine.classList.add('active', 'bg-green-500');
                        setPacketLeft(elements.ctrlPacket, elements.ctrlBusLine);
                        elements.ctrlPacket.style.opacity = '1'; elements.ctrlPacket.classList.add('show');
                        movePacketRight(elements.ctrlPacket, elements.ctrlBusLine);
                        busTimeoutRef.current = window.setTimeout(() => {
                            elements.ctrlBusLine.classList.remove('active', 'bg-green-500'); elements.ctrlBusLine.classList.add('bg-slate-300');
                            elements.description.textContent = "Write cycle complete.";
                        }, 1500);
                    }, 800);
                }, 1500);
            }, 800);
        }, 800);
    }
  }, [adaptedResetBusSimulation]);
  
  const introStaticSection: StaticTextSection = { id: section.id + "-intro", title: "", type: 'StaticText', content: section.introText, isActivity: false };

  return (
    <div className="p-1 task-container">
      <h3 className="text-xl task-title text-indigo-700"><span role="img" aria-label="route icon" className="mr-2">🛣️</span>{section.title}</h3>
      <RichTextSectionDisplay section={introStaticSection} keywordsData={keywordsData} onCompletedToggle={()=>{}} isCompleted={false} />
      <div ref={simContainerRef} className="mt-4">
        <div className="bus-sim-container relative h-52 bg-slate-50 border border-slate-200 rounded-md overflow-hidden mb-4">
            <div className="bus-sim-component bus-sim-cpu absolute left-8 top-1/2 -translate-y-1/2 border-2 border-blue-400 bg-blue-100 text-blue-800 px-6 py-4 rounded-md font-semibold">CPU</div>
            <div className="bus-sim-component bus-sim-ram absolute right-8 top-1/2 -translate-y-1/2 border-2 border-amber-400 bg-amber-100 text-amber-800 px-6 py-4 rounded-md font-semibold">RAM</div>
            <div className="bus-sim-line bus-sim-address-task4 absolute left-32 right-32 h-1.5 bg-slate-300 top-16 rounded-full"></div>
            <div className="bus-sim-line bus-sim-data-task4 absolute left-32 right-32 h-1.5 bg-slate-300 top-1/2 -translate-y-px rounded-full"></div>
            <div className="bus-sim-line bus-sim-control-task4 absolute left-32 right-32 h-1.5 bg-slate-300 bottom-16 rounded-full"></div>
            <div id="bus-packet-address-task4" className="bus-sim-packet address absolute bg-red-500 text-white text-xs px-2 py-0.5 rounded top-[60px] left-36 opacity-0 transition-all duration-700 ease-in-out whitespace-nowrap z-10"></div>
            <div id="bus-packet-data-task4" className="bus-sim-packet data absolute bg-blue-600 text-white text-xs px-2 py-0.5 rounded top-1/2 -translate-y-1/2 left-36 opacity-0 transition-all duration-700 ease-in-out whitespace-nowrap z-10"></div>
            <div id="bus-packet-control-task4" className="bus-sim-packet control absolute bg-green-500 text-white text-xs px-2 py-0.5 rounded bottom-[60px] left-36 opacity-0 transition-all duration-700 ease-in-out whitespace-nowrap z-10"></div>
        </div>
        <div id="bus-sim-description-task4" className="min-h-[40px] bg-indigo-50 border border-indigo-200 p-3 rounded-md mt-4 text-indigo-800 text-sm text-center">Click a button to start the simulation.</div>
      </div>
      <div className="mt-6 text-center space-x-2">
        <button className="sim-button bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded font-medium" onClick={() => adaptedSimulateBus('read')}>Simulate Read from Address 5</button>
        <button className="sim-button bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded font-medium" onClick={() => adaptedSimulateBus('write')}>Simulate Write 99 to Address 7</button>
        <button className="sim-button reset bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium" onClick={adaptedResetBusSimulation}>Reset Simulation</button>
      </div>
    </div>
  );
};
export default BusSimulationSectionDisplay;
