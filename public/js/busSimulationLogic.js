// public/js/busSimulationLogic.js
// ADAPT YOUR gcse-sysarch-arch.js BUS SIMULATION LOGIC HERE
// Ensure functions simulateBus_task4 and resetBusSimulation_task4 are defined
// and attached to the window object, or export them if using ES modules.
// These functions should accept an 'elements' object as their second parameter.

/*
Example structure:

let busTimeout_task4;

function adaptedSimulateBus(operation, elements) {
    // elements will be:
    // { addrPacket, dataPacket, ctrlPacket, description, addrBusLine, dataBusLine, ctrlBusLine }
    if (!elements || !elements.addrPacket || !elements.description) {
        console.error("Bus simulation elements missing!");
        if (elements.description) elements.description.textContent = "Error: Simulation elements not found.";
        return;
    }
    clearTimeout(busTimeout_task4);

    // Reset classes on elements
    elements.addrPacket.className = 'bus-sim-packet address';
    elements.dataPacket.className = 'bus-sim-packet data';
    elements.ctrlPacket.className = 'bus-sim-packet control';
    elements.addrBusLine.classList.remove('active');
    elements.dataBusLine.classList.remove('active');
    elements.ctrlBusLine.classList.remove('active');


    if (operation === 'read') {
        elements.addrPacket.textContent = 'Addr: 5';
        elements.ctrlPacket.textContent = 'Read';
        elements.dataPacket.textContent = 'Data: 12'; // Example data
        elements.description.textContent = "1. CPU places address 5 on Address Bus.";
        elements.addrBusLine.classList.add('active');
        elements.addrPacket.classList.add('show');

        busTimeout_task4 = setTimeout(() => {
            elements.addrPacket.style.left = elements.addrBusLine.offsetWidth - elements.addrPacket.offsetWidth + 'px'; // Move to end of bus line
            elements.description.textContent = "2. Address 5 travels to RAM.";
            
            busTimeout_task4 = setTimeout(() => {
                elements.addrBusLine.classList.remove('active');
                elements.description.textContent = "3. CPU sends 'Read' signal on Control Bus.";
                elements.ctrlBusLine.classList.add('active');
                elements.ctrlPacket.classList.add('show');
                elements.ctrlPacket.style.left = elements.ctrlBusLine.offsetWidth - elements.ctrlPacket.offsetWidth + 'px';

                busTimeout_task4 = setTimeout(() => {
                    elements.ctrlBusLine.classList.remove('active');
                    elements.description.textContent = "4. RAM places data (12) on Data Bus.";
                    elements.dataPacket.style.left = elements.dataBusLine.offsetWidth - elements.dataPacket.offsetWidth + 'px'; // Start at RAM side
                    elements.dataBusLine.classList.add('active');
                    elements.dataPacket.classList.add('show');

                    busTimeout_task4 = setTimeout(() => {
                        elements.description.textContent = "5. Data (12) travels back to CPU.";
                        elements.dataPacket.style.left = '0px'; // Move to CPU side

                        busTimeout_task4 = setTimeout(() => {
                            elements.dataBusLine.classList.remove('active');
                            elements.description.textContent = "Read cycle complete.";
                        }, 2000);
                    }, 600);
                }, 2000);
            }, 2000);
        }, 600);
    } else if (operation === 'write') {
        elements.addrPacket.textContent = 'Addr: 7';
        elements.ctrlPacket.textContent = 'Write';
        elements.dataPacket.textContent = 'Data: 99';
        elements.description.textContent = "1. CPU places address 7 on Address Bus.";
        elements.addrBusLine.classList.add('active');
        elements.addrPacket.classList.add('show');
        elements.addrPacket.style.left = '0px';


        busTimeout_task4 = setTimeout(() => {
            elements.addrPacket.style.left = elements.addrBusLine.offsetWidth - elements.addrPacket.offsetWidth + 'px';
            elements.description.textContent = "2. Address 7 travels to RAM.";
            
            busTimeout_task4 = setTimeout(() => {
                elements.addrBusLine.classList.remove('active');
                elements.description.textContent = "3. CPU places data (99) on Data Bus.";
                elements.dataBusLine.classList.add('active');
                elements.dataPacket.classList.add('show');
                elements.dataPacket.style.left = '0px';

                busTimeout_task4 = setTimeout(() => {
                    elements.dataPacket.style.left = elements.dataBusLine.offsetWidth - elements.dataPacket.offsetWidth + 'px';
                    elements.description.textContent = "4. Data (99) travels to RAM.";

                    busTimeout_task4 = setTimeout(() => {
                        elements.dataBusLine.classList.remove('active');
                        elements.description.textContent = "5. CPU sends 'Write' signal on Control Bus.";
                        elements.ctrlBusLine.classList.add('active');
                        elements.ctrlPacket.classList.add('show');
                        elements.ctrlPacket.style.left = elements.ctrlBusLine.offsetWidth - elements.ctrlPacket.offsetWidth + 'px';

                        busTimeout_task4 = setTimeout(() => {
                            elements.ctrlBusLine.classList.remove('active');
                            elements.description.textContent = "Write cycle complete.";
                        }, 2000);
                    }, 2000);
                }, 600);
            }, 2000);
        }, 600);
    }
}

function adaptedResetBusSimulation(elements) {
    if (!elements || !elements.addrPacket) return;
    clearTimeout(busTimeout_task4);
    
    const packets = [elements.addrPacket, elements.dataPacket, elements.ctrlPacket];
    packets.forEach(p => {
        if(p) {
            p.style.left = '0px'; // Reset position
            p.classList.remove('show'); // Hide
            // Reset base classes if they were changed
            if (p.id.includes('address')) p.className = 'bus-sim-packet address';
            if (p.id.includes('data')) p.className = 'bus-sim-packet data';
            if (p.id.includes('control')) p.className = 'bus-sim-packet control';
        }
    });

    const lines = [elements.addrBusLine, elements.dataBusLine, elements.ctrlBusLine];
    lines.forEach(l => l?.classList.remove('active'));
    
    if(elements.description) elements.description.textContent = "Click a button to start the simulation.";
}

// Make functions globally accessible for the React component to call
window.simulateBus_task4 = adaptedSimulateBus;
window.resetBusSimulation_task4 = adaptedResetBusSimulation;

console.log("busSimulationLogic.js loaded and functions attached to window.");
*/
