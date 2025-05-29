import os
import shutil
import re

# Define the root of your Next.js project
PROJECT_ROOT = "."
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")

# Directory for shared assets needed by standalone tasks
COMMON_ASSETS_DIR = os.path.join(PUBLIC_DIR, "common-task-assets")
COMMON_CSS_DIR = os.path.join(COMMON_ASSETS_DIR, "css")
COMMON_JS_DIR = os.path.join(COMMON_ASSETS_DIR, "js")

# Directory for standalone HTML task pages
STANDALONE_TASKS_DIR = os.path.join(PUBLIC_DIR, "standalone-tasks")

# Source files from your 'old' directory
OLD_FILES_DIR = "old" # Ensure this 'old' directory is in your project root
ORIGINAL_HTML_FILE_FULL = os.path.join(OLD_FILES_DIR, "gcse-sysarch-arch.html")
ORIGINAL_JS_FILE_TASK = os.path.join(OLD_FILES_DIR, "gcse-sysarch-arch.js")
ORIGINAL_STYLE_CSS_FILE = os.path.join(OLD_FILES_DIR, "style.css")
ORIGINAL_WORKSHEET_COMMON_JS_FILE = os.path.join(OLD_FILES_DIR, "worksheet-common.js")

# Target for the new standalone task HTML
STANDALONE_CPU_DND_HTML = os.path.join(STANDALONE_TASKS_DIR, "cpu-diagram-dnd.html")

def extract_section_html(html_content, section_id):
    """
    Extracts a specific <section> by its ID.
    """
    try:
        match = re.search(r'<section\s+id=["\']' + re.escape(section_id) + r'["\'](?:[^>]*class=["\'][^"\']*["\'])?[^>]*>(.*?)</section>', html_content, re.IGNORECASE | re.DOTALL)
        if match:
            return match.group(0) 
        else:
            print(f"Warning: Section with ID '{section_id}' not found in the HTML content.")
            return f"<p>Error: Content for section '{section_id}' could not be extracted. Please check the ID in the original HTML.</p>"
    except Exception as e:
        print(f"Error extracting section '{section_id}': {e}")
        return f"<p>Error during extraction for section '{section_id}'.</p>"

def create_standalone_html_page(task_html_content, page_title, common_asset_path_prefix="../common-task-assets"):
    """
    Creates the full HTML content for a standalone task page.
    """
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{page_title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="{common_asset_path_prefix}/css/style.css">
    <style>
        body {{ padding: 20px; background-color: #f8fafc; font-family: 'Inter', sans-serif; }}
        .task-container {{ max-width: 800px; margin: 20px auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .back-link {{ display: inline-block; margin-bottom: 20px; color: #4f46e5; text-decoration: none; font-weight: 500; padding: 8px 12px; background-color: #eef2ff; border-radius: 6px; }}
        .back-link:hover {{ text-decoration: underline; background-color: #e0e7ff;}}
        /* Minimal styles to ensure basic layout if main CSS doesn't cover everything for the snippet */
        .diagram-layout-container {{
            position: relative; width: 100%; max-width: 600px; min-height: 420px; /* Use min-height */
            margin: 1rem auto; background-color: #f0f0f0; border: 1px solid #ccc;
            border-radius: 8px; overflow: auto; /* Allow scroll if content overflows */
        }}
         /* Add other critical styles from your style.css that are needed for task1-dragdrop if they are not globally applied */
    </style>
</head>
<body>
    <a href="javascript:history.back()" class="back-link">&larr; Back to Lesson</a>
    <div class="task-container">
        {task_html_content}
    </div>
    {'''
    '''}
    <script src="{common_asset_path_prefix}/js/worksheet-common.js"></script>
    <script src="{common_asset_path_prefix}/js/gcse-sysarch-arch.js"></script>
</body>
</html>
"""

def main():
    print(f"Project root assumed at: {os.path.abspath(PROJECT_ROOT)}")
    print(f"Looking for original files in: {os.path.abspath(OLD_FILES_DIR)}")

    if not os.path.isdir(OLD_FILES_DIR):
        print(f"Error: The 'old' directory was not found at '{os.path.abspath(OLD_FILES_DIR)}'. Please create it and place your original worksheet files there.")
        return

    os.makedirs(COMMON_CSS_DIR, exist_ok=True)
    os.makedirs(COMMON_JS_DIR, exist_ok=True)
    print(f"Ensured common asset directories exist: {COMMON_ASSETS_DIR}")

    os.makedirs(STANDALONE_TASKS_DIR, exist_ok=True)
    print(f"Ensured standalone tasks directory exists: {STANDALONE_TASKS_DIR}")

    files_to_copy = [
        (ORIGINAL_STYLE_CSS_FILE, os.path.join(COMMON_CSS_DIR, "style.css")),
        (ORIGINAL_JS_FILE_TASK, os.path.join(COMMON_JS_DIR, "gcse-sysarch-arch.js")),
        (ORIGINAL_WORKSHEET_COMMON_JS_FILE, os.path.join(COMMON_JS_DIR, "worksheet-common.js")),
    ]

    for src, dest in files_to_copy:
        if os.path.exists(src):
            shutil.copy(src, dest)
            print(f"Copied '{src}' to '{dest}'")
        else:
            print(f"Warning: Source file '{src}' not found at '{os.path.abspath(src)}'.")

    if os.path.exists(ORIGINAL_HTML_FILE_FULL):
        with open(ORIGINAL_HTML_FILE_FULL, 'r', encoding='utf-8') as f:
            full_html_content = f.read()
        
        task1_html_snippet = extract_section_html(full_html_content, "task1-dragdrop")
        
        if "<p>Error:" not in task1_html_snippet:
            standalone_task1_content = create_standalone_html_page(
                task1_html_snippet, # Corrected variable name
                page_title="Task: Label CPU Components",
                common_asset_path_prefix="../common-task-assets"
            )
            
            with open(STANDALONE_CPU_DND_HTML, 'w', encoding='utf-8') as f:
                f.write(standalone_task1_content)
            print(f"Created standalone HTML for CPU Diagram D&D task at: {STANDALONE_CPU_DND_HTML}")
        else:
            print(f"Skipping creation of standalone HTML for Task 1 due to extraction error.")
            print(f"Extracted snippet was: {task1_html_snippet}")
    else:
        print(f"Error: Original full HTML file '{ORIGINAL_HTML_FILE_FULL}' not found at '{os.path.abspath(ORIGINAL_HTML_FILE_FULL)}'. Cannot create standalone task.")

    print("\n--- File Organization Summary ---")
    print(f"Shared assets (CSS, JS) are in: {COMMON_ASSETS_DIR}")
    print(f"Standalone CPU Diagram D&D task HTML is at: {STANDALONE_CPU_DND_HTML}")
    print("This standalone task should be accessible at the URL: /standalone-tasks/cpu-diagram-dnd.html")
    print("\nNext steps:")
    print("1. Ensure the 'old' directory with your original files is in the project root when running this script.")
    print("2. Verify that the standalone page '/standalone-tasks/cpu-diagram-dnd.html' loads and functions correctly in your browser (check console for JS errors).")
    print("3. Update your lesson data (sampleCpuLessonData.ts) for 'Task 1' to be a StaticTextSection linking to this standalone page.")

if __name__ == "__main__":
    main()
