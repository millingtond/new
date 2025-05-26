import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import datetime

# --- Configuration ---
# IMPORTANT: Replace with the actual path to your Firebase Admin SDK JSON file
PATH_TO_FIREBASE_ADMIN_SDK_JSON = "C:/Users/Dan Mill/Downloads/mgscompscihub2PK.json" # <<< ENSURE THIS IS CORRECT

# Worksheet Document ID
WORKSHEET_DOC_ID = "j277-sysarch-lesson1-cpu-von-neumann"

# --- Detailed Worksheet Data for "Lesson 1: Inside the CPU & Von Neumann Architecture" ---
LESSON1_CPU_VON_NEUMANN_DATA = {
  "title": "Lesson 1: Inside the CPU & Von Neumann Architecture",
  "courseSlug": "j277", # GCSE Computer Science
  "unitSlug": "systems-architecture-lesson-1", # Example slug
  "courseDisplayName": "GCSE Computer Science (J277)",
  "unitDisplayName": "1.1 Systems Architecture",
  "learningObjectives": [
    "Identify the main components of the CPU and know their purpose.",
    "Explain the role of the different CPU registers (PC, MAR, MDR, Accumulator).",
    "Understand the Von Neumann architecture, including the Stored Program Concept and the use of buses.",
    "Describe the stages of the Fetch-Decode-Execute (FDE) cycle."
  ],
  "keywordsData": {
    "architecture": "The design of a computer, including the way its components are organised and the rules that make them work together. Von Neumann invented a type of this.", # }
    "von neumann architecture": "Basic design of most modern computers. Consists of a CPU, Memory (where instructions and data are held), I/O, and uses buses for communication. Key idea: Stored Program Concept.",
    "stored program concept": "Instructions and data are both stored within memory during execution. Von Neumann architecture uses this - both instructions and data are stored in the same memory system.",
    "instructions": "A single operation, one of these is executed each time the CPU performs the fetch-execute cycle.",
    "main memory": "Also known as RAM or Primary Storage, this is where data and instructions are stored in the Von Neumann architecture.",
    "ram": "Random Access Memory (Main memory). Volatile storage where currently running programs and data are held for the CPU.",
    "memory": "Usually refers to RAM (Main Memory), where data and instructions are stored for the CPU to access quickly.",
    "cpu": "Central Processing Unit - it processes all the data and instructions that make the computer system work. Often called the 'brain' of the computer.",
    "alu": "Arithmetic Logic Unit - performs calculations (e.g. addition, subtraction) and logical operations (e.g. AND, OR, NOT).",
    "cu": "Control Unit - coordinates all the activities of the CPU. It directs the flow of data between the CPU and other devices. Manages the Fetch-Decode-Execute cycle.",
    "cache": "Small, very fast memory located close to or inside the CPU. Stores frequently accessed data and instructions, speeding up processing.",
    "registers": "Tiny, extremely fast memory locations within the CPU. Used to hold data, instructions, or memory addresses temporarily during processing.",
    "mar": "Memory Address Register - holds the memory address of the instruction or piece of data that is to be fetched from or written to.",
    "mdr": "Memory Data Register - holds the data or instruction that has just been fetched from memory, or is about to be written to memory.",
    "program counter": "Program Counter (PC) - holds the memory address of the next instruction to be fetched from main memory.",
    "accumulator": "Accumulator (ACC) - a register that stores the results of calculations performed by the ALU.",
    "buses": "Pathways that transmit data and control signals between components of the CPU and other parts of the computer system (e.g., Address Bus, Data Bus, Control Bus).",
    "address bus": "Carries memory addresses from the CPU to other components such as primary storage and input/output devices. It is unidirectional.",
    "data bus": "Carries the actual data between the CPU and other components. It is bidirectional.",
    "control bus": "Carries control signals from the CPU to coordinate activities of all other units. It is bidirectional.",
    "fetch-decode-execute cycle": "The fundamental process by which a CPU operates. It fetches an instruction from memory, decodes it to understand what to do, and then executes it.",
    "clock speed": "Measured in Hertz (Hz), it indicates how many FDE cycles the CPU can perform per second (e.g., GHz). Higher clock speed generally means faster processing.",
    "cores": "A processing unit within the CPU. A multi-core CPU has multiple independent cores, allowing it to perform multiple tasks simultaneously (parallel processing)."
  },
  "sections": [
    {
      "id": "task1-starter",
      "title": "Starter Activity: What do you know about the CPU?",
      "type": "Questionnaire",
      "introduction": "<p>Before we dive in, let's see what you already know or can guess about the computer's processor. Don't worry if you're not sure, just give it your best shot!</p>",
      "questions": [
        {
          "id": "starter-q1-components",
          "type": "TextArea",
          "prompt": "What different parts or components do you think make up a computer's CPU (Central Processing Unit)? List as many as you can.",
          "placeholder": "e.g., The 'thinking' part, wires, magic smoke...",
          "rows": 4
        },
        {
          "id": "starter-q2-job",
          "type": "TextArea",
          "prompt": "In simple terms, what do you believe is the main job or purpose of the CPU in a computer system?",
          "placeholder": "e.g., To make the computer go brrrr...",
          "rows": 3
        }
      ]
    },
    {
      "id": "learning-objectives-display", # Renamed to avoid confusion
      "title": "Today's Learning Objectives",
      "type": "StaticContentList", # You'll need a component to render this list nicely
      "itemsKey": "learningObjectives" # Points to top-level learningObjectives for content
    },
 {
      "id": "task2-key-terms",
      "title": "Key Terms Unveiled",
      "type": "KeywordGlossary",
      "introduction": "<p>These terms are your building blocks for understanding today's topic. Hover over (or tap on mobile) each <span class='interactive-keyword example-keyword-style'>keyword</span> to reveal its definition. Try to familiarize yourself with them!</p>",
      "displayTermKeys": ["cpu", "alu", "cu", "cache", "registers", "von neumann architecture", "fetch-decode-execute cycle", "buses", "stored program concept", "main memory", "mar", "mdr", "program counter", "accumulator"]
    },
    {
      "id": "task3-cpu-explanation",
      "title": "Zooming In: The CPU and its Components",
      "type": "StaticContentWithKeywords",
      "htmlContent": "<p>The <keyword data-term='cpu'>CPU</keyword> is the heart of the computer. It's a complex microchip responsible for processing instructions and data. It consists of several key components working together:</p><ul><li><strong><keyword data-term='cu'>Control Unit (CU)</keyword>:</strong> The manager. It directs and coordinates most of the operations in the CPU. It fetches instructions from memory, decodes them, and then directs the other components on what to do. It controls the flow of data within the CPU and between the CPU and other parts of the computer.</li><li><strong><keyword data-term='alu'>Arithmetic Logic Unit (ALU)</keyword>:</strong> The calculator and decision-maker. It performs all arithmetic operations (like addition, subtraction) and logical operations (like AND, OR, NOT, comparisons).</li><li><strong><keyword data-term='cache'>Cache</keyword>:</strong> Super-fast, small amount of memory that's either part of the CPU chip or very close to it. It stores copies of frequently used instructions and data from RAM so that the CPU can access them much quicker than going to main memory.</li><li><strong><keyword data-term='registers'>Registers</keyword>:</strong> Tiny, extremely fast storage locations directly within the CPU. They are used to temporarily hold data, instructions, or memory addresses that the CPU is actively working with. Key registers include the <keyword data-term='program counter'>Program Counter (PC)</keyword>, <keyword data-term='mar'>Memory Address Register (MAR)</keyword>, <keyword data-term='mdr'>Memory Data Register (MDR)</keyword>, and the <keyword data-term='accumulator'>Accumulator (ACC)</keyword>.</li></ul>"
    },
    {
      "id": "task4-von-neumann",
      "title": "The Blueprint: Von Neumann Architecture",
      "type": "StaticContentWithKeywords",
      "htmlContent": "<p>Most modern computers are based on the <keyword data-term='von neumann architecture'>Von Neumann architecture</keyword>, proposed by John von Neumann. Its key characteristics are:<ul><li>It has a single main <keyword data-term='memory'>memory</keyword> unit that holds both program <keyword data-term='instructions'>instructions</keyword> and the data that those instructions will process. This is known as the <keyword data-term='stored program concept'>Stored Program Concept</keyword>.</li><li>The CPU fetches instructions and data from this memory, processes the data according to the instructions, and then writes results back to memory or sends them to an output device.</li><li>It uses <keyword data-term='buses'>buses</keyword> (the <keyword data-term='address bus'>Address Bus</keyword>, <keyword data-term='data bus'>Data Bus</keyword>, and <keyword data-term='control bus'>Control Bus</keyword>) to transfer data and control signals between the CPU, memory, and input/output devices.</li></ul></p><div class='diagram-container' style='text-align: center;'><img src='/images/gcse_vn_annotated.png' alt='Von Neumann Architecture Diagram' style='max-width: 450px; margin: 1em auto; border: 1px solid #ccc; padding: 5px; border-radius: 4px;'> <p class='caption-text text-xs text-center text-gray-600 mt-1'>Annotated Von Neumann Architecture.</p></div><p>The CPU communicates with memory using the MAR and MDR. The <keyword data-term='mar'>MAR</keyword> holds the address of the memory location to be accessed, and the <keyword data-term='mdr'>MDR</keyword> temporarily stores the data being read from or written to that location.</p>"
      # You will need to place 'gcse_vn_annotated.png' in your project's /public/images/ directory.
    },
    {
      "id": "task5-cpu-diagram-interactive",
      "title": "Task: CPU Component Jigsaw",
      "type": "DiagramLabelInteractive",
      "introduction": "<p>Drag the labels from the side and drop them onto the correct boxes in the CPU diagram below. Let's see if you can identify each part!</p>",
      "backgroundImageUrl": "/images/cpu_blank_for_labels.png", # Place in /public/images/
      "imageWidth": 500, 
      "imageHeight": 380, 
      "draggableLabels": [
        {"id": "label-cu", "text": "Control Unit (CU)"},
        {"id": "label-alu", "text": "Arithmetic Logic Unit (ALU)"},
        {"id": "label-cache", "text": "Cache Memory"},
        {"id": "label-registers", "text": "Registers (PC, MAR, MDR, ACC)"}
      ],
      "dropTargets": [ 
        {"id": "dt-cu", "labelName": "Control Unit Area", "x": 50, "y": 30, "width": 180, "height": 60, "accepts": "label-cu"},
        {"id": "dt-alu", "labelName": "ALU Area", "x": 50, "y": 120, "width": 180, "height": 60, "accepts": "label-alu"},
        {"id": "dt-cache", "labelName": "Cache Area", "x": 270, "y": 30, "width": 180, "height": 60, "accepts": "label-cache"},
        {"id": "dt-registers", "labelName": "Registers Area", "x": 270, "y": 120, "width": 180, "height": 60, "accepts": "label-registers"}
      ],
      "feedbackMessages": {
          "correct": "That's the correct spot!",
          "incorrect": "Not quite right, try another label or spot."
      }
    },
    {
      "id": "task7-fde-cycle", # Corresponds to Task 7 in HTML
      "title": "Task: The CPU's Routine - Fetch, Decode, Execute",
      "type": "FillInTheBlanksInteractive",
      "introduction": "<p>The CPU continuously performs the Fetch-Decode-Execute (FDE) cycle to process instructions. Complete the description below by filling in the missing words from the word bank (or your own knowledge!).</p><p class='text-sm text-gray-600 mb-2'><strong>Word Bank:</strong> decodes, memory, Program Counter, instruction, ALU, MDR, MAR, result, interprets, data, address, accumulator, control unit</p>",
      "segments": [
        {"type": "text", "content": "<strong>1. FETCH:</strong> The <keyword data-term='cu'>Control Unit</keyword> fetches the next "},
        {"type": "blank", "id": "fde_b1", "size": 12, "correctAnswers": ["instruction"]},
        {"type": "text", "content": " from <keyword data-term='main memory'>main memory</keyword> (RAM). The "},
        {"type": "blank", "id": "fde_b1a", "size": 10, "correctAnswers": ["address"]},
        {"type": "text", "content": " of this instruction is held in the <keyword data-term='program counter'>Program Counter</keyword> (PC). This address is copied to the <keyword data-term='mar'>Memory Address Register (MAR)</keyword>. The instruction at that address in memory is then copied, via the <keyword data-term='data bus'>Data Bus</keyword>, into the <keyword data-term='mdr'>Memory Data Register (MDR)</keyword>. The Program Counter is then incremented."},
        {"type": "text", "content": "<br/><br/><strong>2. DECODE:</strong> The Control Unit "},
        {"type": "blank", "id": "fde_b2", "size": 10, "correctAnswers": ["decodes", "interprets"]},
        {"type": "text", "content": " the instruction now held in the MDR to understand what operation needs to be performed and what data (if any) is needed."},
        {"type": "text", "content": "<br/><br/><strong>3. EXECUTE:</strong> The instruction is carried out. This might involve the <keyword data-term='alu'>ALU</keyword> performing a calculation or logical operation, data being moved between <keyword data-term='registers'>registers</keyword>, or data being written back to memory. The <keyword data-term='result'>result</keyword> of an ALU operation is often stored in the <keyword data-term='accumulator'>Accumulator (ACC)</keyword>. The cycle then repeats."}
      ]
    },
    {
      "id": "task8-exam-practice", # Corresponds to Task 8 in HTML
      "title": "Exam Practice Questions",
      "type": "Questionnaire",
      "introduction": "<p>Test your understanding with these exam-style questions. For written answers, try to be precise. Some questions might have self-marking options where applicable.</p>",
      "questions": [
        {
          "id": "exam-q1-vn-components",
          "type": "TextArea",
          "prompt": "<p><strong>Question 1:</strong> Identify <strong>three</strong> essential components of the Von Neumann architecture and briefly describe the purpose of each. (3 marks)</p>",
          "placeholder": "Component 1 and its purpose...\nComponent 2 and its purpose...\nComponent 3 and its purpose...",
          "rows": 6
        },
        {
          "id": "exam-q2-fde-order",
          "type": "OrderSequenceInteractive", # New component type
          "prompt": "<p><strong>Question 2:</strong> The Fetch-Decode-Execute cycle has three main stages. Drag and drop the stages below into the correct order of operation. (1 mark)</p>",
          "itemsToOrder": [
            {"id": "seq-decode", "text": "DECODE the instruction"},
            {"id": "seq-execute", "text": "EXECUTE the instruction"},
            {"id": "seq-fetch", "text": "FETCH the next instruction from memory"}
          ],
          "correctOrderIds": ["seq-fetch", "seq-decode", "seq-execute"]
        },
        {
            "id": "exam-q3-register-match",
            "type": "MatchingPairsInteractive", # New component type
            "prompt": "<p><strong>Question 3:</strong> Match each CPU register on the left with its correct description on the right. (4 marks)</p>",
            "stemsTitle": "Register",
            "optionsTitle": "Description",
            "stems": [
                {"id": "reg-pc", "text": "Program Counter (PC)"},
                {"id": "reg-mar", "text": "Memory Address Register (MAR)"},
                {"id": "reg-mdr", "text": "Memory Data Register (MDR)"},
                {"id": "reg-acc", "text": "Accumulator (ACC)"}
            ],
            "options": [ # These are the descriptions that will be matched to
                {"id": "desc-next-instr", "text": "Holds the address of the next instruction to be fetched."},
                {"id": "desc-mem-addr", "text": "Holds the address of the memory location to be read from or written to."},
                {"id": "desc-data-buffer", "text": "Temporarily holds data that has just been read from memory or is about to be written to memory."},
                {"id": "desc-alu-result", "text": "Stores the immediate results of calculations from the ALU."}
            ],
            "correctPairs": { # Key is stem.id, Value is option.id
                "reg-pc": "desc-next-instr",
                "reg-mar": "desc-mem-addr",
                "reg-mdr": "desc-data-buffer",
                "reg-acc": "desc-alu-result"
            }
        }
      ]
    }
  ],
  "createdAt": firestore.SERVER_TIMESTAMP # Use server timestamp when adding to Firestore
}

def add_detailed_worksheet_to_firestore(db_client, worksheet_id, worksheet_data):
    """
    Adds or overwrites a specific worksheet in the 'worksheets' collection.
    """
    try:
        # Remove the 'createdAt' from the Python dict if we want Firestore to generate it
        data_to_set = worksheet_data.copy()
        if "createdAt" in data_to_set and data_to_set["createdAt"] == firestore.SERVER_TIMESTAMP:
            # Handled by Firestore on set
            pass # No need to remove if it's already the sentinel

        worksheet_ref = db_client.collection("worksheets").document(worksheet_id)
        worksheet_ref.set(data_to_set)
        print(f"Successfully added/updated worksheet with ID: {worksheet_id}")
    except Exception as e:
        print(f"Error adding/updating worksheet {worksheet_id}: {e}")

def main():
    """
    Initializes Firebase Admin SDK and adds the detailed worksheet.
    """
    if PATH_TO_FIREBASE_ADMIN_SDK_JSON == "path/to/your-service-account-key.json" or \
       (PATH_TO_FIREBASE_ADMIN_SDK_JSON == "C:/Users/Dan Mill/Downloads/mgscompscihub2PK.json" and \
       not os.path.exists(PATH_TO_FIREBASE_ADMIN_SDK_JSON)):
        print("ERROR: Please ensure 'PATH_TO_FIREBASE_ADMIN_SDK_JSON' in this script is the correct path to your Firebase Admin SDK JSON key file.")
        if not os.path.exists(PATH_TO_FIREBASE_ADMIN_SDK_JSON):
             print(f"The specified path does not exist: {PATH_TO_FIREBASE_ADMIN_SDK_JSON}")
        return

    try:
        cred = credentials.Certificate(PATH_TO_FIREBASE_ADMIN_SDK_JSON)
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
            print("Firebase Admin SDK initialized successfully.")
        else:
            print("Firebase Admin SDK already initialized.")
        db = firestore.client()
    except Exception as e:
        print(f"Error initializing Firebase Admin SDK: {e}")
        print("Please ensure the path to your service account key is correct and the file is accessible.")
        return

    print(f"\nAttempting to add/update detailed worksheet '{WORKSHEET_DOC_ID}' to Firestore...")
    # For firestore.SERVER_TIMESTAMP to work correctly when setting data,
    # it needs to be passed directly in the data object.
    # The Python Firestore client library handles this sentinel value.
    LESSON1_CPU_VON_NEUMANN_DATA["createdAt"] = firestore.SERVER_TIMESTAMP
    add_detailed_worksheet_to_firestore(db, WORKSHEET_DOC_ID, LESSON1_CPU_VON_NEUMANN_DATA)
    print("\nScript finished.")

if __name__ == "__main__":
    import os # Ensure os is imported for path check
    main()
