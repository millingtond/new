import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import os
import datetime

# --- Configuration ---
# OPTION 1: Use environment variable (recommended)
# Ensure GOOGLE_APPLICATION_CREDENTIALS environment variable is set to the path of your service account key JSON file.

# OPTION 2: Explicitly point to your service account key file (replace with your actual path)
SERVICE_ACCOUNT_KEY_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "C:/Users/Dan Mill/Downloads/mgscompscihub2PK.json") # Fallback if env var not set

TARGET_WORKSHEET_ID = "j277-sysarch-lesson1-cpu-von-neumann"

# --- Firebase Initialization ---
try:
    if SERVICE_ACCOUNT_KEY_PATH and os.path.exists(SERVICE_ACCOUNT_KEY_PATH) and not firebase_admin._apps:
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
        firebase_admin.initialize_app(cred)
        print(f"Firebase Admin SDK initialized using key: {SERVICE_ACCOUNT_KEY_PATH}")
    elif not firebase_admin._apps: 
        firebase_admin.initialize_app()
        print("Firebase Admin SDK initialized using GOOGLE_APPLICATION_CREDENTIALS environment variable.")
    else:
        print("Firebase Admin SDK already initialized.")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")
    print("Please ensure you have set up your Firebase Admin credentials correctly.")
    exit()

db = firestore.client()

# --- Section Definitions (including MatchingPairs) ---

quiz_section_data = {
    "id": "cpu_lesson1_quiz1",
    "title": "CPU & Von Neumann Quiz",
    "type": "Quiz",
    "questions": [
        {
            "id": "q_mcq_registers_pc",
            "type": "MultipleChoiceQuestion",
            "prompt": "Which register holds the <strong>address</strong> of the next instruction to be fetched from memory?",
            "options": [
                {"id": "opt_pc", "text": "Program Counter (PC)"},
                {"id": "opt_mar", "text": "Memory Address Register (MAR)"},
                {"id": "opt_mdr", "text": "Memory Data Register (MDR)"},
                {"id": "opt_cir", "text": "Current Instruction Register (CIR)"}
            ],
            "correctAnswerId": "opt_pc",
            "feedback": {
                "correct": "Spot on! The PC always points to the memory location of the next instruction.",
                "opt_mar": "The MAR holds an address, but specifically the one being accessed now, not necessarily the 'next' instruction's address.",
                "opt_mdr": "The MDR holds data or instructions being moved to/from memory, not addresses of next instructions.",
                "opt_cir": "The CIR holds the current instruction being decoded/executed."
            }
        },
        {
            "id": "q_mcq_alu_role",
            "type": "MultipleChoiceQuestion",
            "prompt": "What is the primary role of the Arithmetic Logic Unit (ALU)?",
            "options": [
                {"id": "opt_alu_control", "text": "Controlling the overall operation of the CPU."},
                {"id": "opt_alu_calc", "text": "Performing arithmetic calculations and logical comparisons."},
                {"id": "opt_alu_fetch", "text": "Fetching instructions from memory."}
            ],
            "correctAnswerId": "opt_alu_calc",
            "feedback": {"correct": "Correct! The ALU is the calculator and decision-maker of the CPU."}
        }
    ]
}

order_sequence_data = {
    "id": "cpu_lesson1_fde_order",
    "title": "The Fetch-Decode-Execute Cycle Steps",
    "type": "OrderSequenceInteractive",
    "orderItems": [ 
        {"id": "fde_decode", "content": "<strong>Decode:</strong> The Control Unit interprets the instruction in the CIR."},
        {"id": "fde_execute", "content": "<strong>Execute:</strong> The instruction is carried out. This might involve the ALU for calculations, or moving data."},
        {"id": "fde_fetch_pc_to_mar", "content": "<strong>Fetch (1):</strong> The address held in the Program Counter (PC) is copied to the Memory Address Register (MAR)."},
        {"id": "fde_increment_pc", "content": "<strong>Fetch (2):</strong> The Program Counter (PC) is incremented to point to the next instruction."},
        {"id": "fde_fetch_instruction_to_mdr_cir", "content": "<strong>Fetch (3):</strong> The instruction at the address in MAR is fetched from memory, travels along the data bus to the Memory Data Register (MDR), and is then copied into the Current Instruction Register (CIR)."}
    ]
}

fill_blanks_data = {
    "id": "cpu_lesson1_von_neumann_fill",
    "title": "Key Von Neumann Architecture Concepts",
    "type": "FillInTheBlanksInteractive",
    "segments": [
        "The Von Neumann architecture is notable because it stores both program ",
        {"id": "vn_b1", "placeholder": "plural noun", "size": 15}, 
        " and the ",
        {"id": "vn_b2", "placeholder": "plural noun", "size": 8}, 
        " it operates on in the same ",
        {"id": "vn_b3", "placeholder": "singular noun", "size": 10}, 
        " unit. Instructions and data are fetched using a common ",
        {"id": "vn_b4", "placeholder": "singular noun", "size": 6}, 
        " system, which can lead to a bottleneck."
    ]
}

diagram_label_data = {
    "id": "cpu_lesson1_basic_cpu_diagram",
    "title": "Basic CPU Components Identification",
    "type": "DiagramLabelInteractive",
    "diagramImageUrl": "/assets/images/worksheets/j277/sysarch/lesson1/simple_cpu_diagram.png", 
    "diagramAltText": "Simplified diagram of CPU components: Control Unit, ALU, Registers, and Buses",
    "hotspots": [
        {"id": "hs_cu", "x": 30, "y": 30, "label": "Control Unit (CU)", "termKey": "control-unit"},
        {"id": "hs_alu", "x": 30, "y": 70, "label": "Arithmetic Logic Unit (ALU)", "termKey": "alu"},
        {"id": "hs_regs", "x": 70, "y": 30, "label": "Registers", "termKey": "registers"},
        {"id": "hs_buses", "x": 50, "y": 50, "label": "Buses", "termKey": "bus"}
    ]
}

# New: Example MatchingPairsInteractive Section
matching_pairs_data = {
    "id": "cpu_lesson1_registers_match",
    "title": "Match Registers to Their Descriptions",
    "type": "MatchingPairsInteractive",
    "matchSetA": [ # Terms
        {"id": "match_a_pc", "content": "Program Counter (PC)"},
        {"id": "match_a_mar", "content": "Memory Address Register (MAR)"},
        {"id": "match_a_mdr", "content": "Memory Data Register (MDR)"},
        {"id": "match_a_cir", "content": "Current Instruction Register (CIR)"},
        {"id": "match_a_acc", "content": "Accumulator (ACC)"}
    ],
    "matchSetB": [ # Descriptions (can be in a different order for the student)
        {"id": "match_b_holds_next_addr", "content": "Holds the memory address of the next instruction to be fetched."},
        {"id": "match_b_holds_current_addr", "content": "Holds the memory address of the data or instruction currently being accessed (read from or written to)."},
        {"id": "match_b_temp_data_storage", "content": "Temporarily stores data that has just been read from memory or is about to be written to memory."},
        {"id": "match_b_holds_current_instruction", "content": "Holds the current instruction while it is being decoded and executed."},
        {"id": "match_b_results_of_alu", "content": "Stores the results of calculations performed by the ALU."}
    ]
    # For your marking logic, you'd need a separate mapping of correct pairs, e.g.:
    # correctPairs: [{itemAId: "match_a_pc", itemBId: "match_b_holds_next_addr"}, ...]
}


new_sections_map = {
    quiz_section_data["id"]: quiz_section_data,
    order_sequence_data["id"]: order_sequence_data,
    fill_blanks_data["id"]: fill_blanks_data,
    diagram_label_data["id"]: diagram_label_data,
    matching_pairs_data["id"]: matching_pairs_data # Added matching pairs
}

# --- Main update logic ---
def update_worksheet_sections(worksheet_id):
    worksheet_ref = db.collection("worksheets").document(worksheet_id)
    
    try:
        doc = worksheet_ref.get()
        if not doc.exists:
            print(f"Error: Worksheet with ID '{worksheet_id}' not found.")
            return

        print(f"Updating worksheet: {worksheet_id}")
        worksheet_data = doc.to_dict()
        current_sections = worksheet_data.get("sections", [])
        
        existing_sections_map = {section["id"]: section for section in current_sections}
        updated_sections_list = []
        processed_new_section_ids = set()

        for existing_section in current_sections:
            section_id = existing_section["id"]
            if section_id in new_sections_map:
                print(f"  Updating existing section: {section_id} ({new_sections_map[section_id]['type']})")
                updated_sections_list.append(new_sections_map[section_id])
                processed_new_section_ids.add(section_id)
            else:
                updated_sections_list.append(existing_section)
        
        for section_id, section_data in new_sections_map.items():
            if section_id not in processed_new_section_ids:
                print(f"  Adding new section: {section_id} ({section_data['type']})")
                updated_sections_list.append(section_data)

        worksheet_ref.update({
            "sections": updated_sections_list,
            "lastScriptUpdate": firestore.SERVER_TIMESTAMP
        })
        print(f"Successfully updated sections for worksheet: {worksheet_id}")

    except Exception as e:
        print(f"An error occurred while updating worksheet {worksheet_id}: {e}")

if __name__ == "__main__":
    if not firebase_admin._apps:
        print("Firebase Admin SDK not initialized. Exiting.")
    else:
        print(f"Targeting worksheet ID: {TARGET_WORKSHEET_ID} for section updates.")
        update_worksheet_sections(TARGET_WORKSHEET_ID)

