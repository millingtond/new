import os

# Define the base directory for these components
BASE_COMPONENTS_DIR = "src/components/worksheets"

# --- TypeScript Type Definitions (shared or could be in a types file) ---
# These would typically be in your @/types/index.ts and imported,
# but for self-contained components in this script, we can redefine simplified versions
# or assume they will be imported from @/types.
# For this script, we'll add type definitions directly in the components
# and you can later centralize them in src/types/index.ts if they aren't already compatible.

WORKSHEET_TYPES_CONTENT = """// Basic types for worksheet rendering - ensure these align with your main types in @/types/index.ts

export interface Question {
  id: string;
  type: "ShortAnswer" | "StaticContent" | string; // Allow other types for future
  prompt?: string;
  placeholder?: string;
  htmlContent?: string;
  // Add other question-specific fields as needed, e.g., options for multiple choice
}

export interface Section {
  id: string;
  title: string;
  type: "Questionnaire" | "StaticContent" | string; // Allow other types
  questions?: Question[];
  htmlContent?: string;
}

export interface Worksheet {
  id: string; // Firestore document ID
  title: string;
  course?: string;
  unit?: string;
  specReference?: string;
  learningObjectives?: string[];
  keywords?: string[];
  sections: Section[];
  createdAt?: any; // Firestore Timestamp or Date
}
"""

# --- Component: StaticContentBlock.tsx ---
STATIC_CONTENT_BLOCK_CONTENT = """// src/components/worksheets/StaticContentBlock.tsx
'use client';

import React from 'react';

interface StaticContentBlockProps {
  htmlContent?: string;
}

const StaticContentBlock: React.FC<StaticContentBlockProps> = ({ htmlContent }) => {
  if (!htmlContent) {
    return null;
  }

  // Ensure styling for common HTML elements (p, ul, li, strong, em)
  // is handled by global CSS or Tailwind typography plugin if you use one.
  return (
    <div
      className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none text-gray-700"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default StaticContentBlock;
"""

# --- Component: ShortAnswerQuestion.tsx ---
SHORT_ANSWER_QUESTION_CONTENT = """// src/components/worksheets/ShortAnswerQuestion.tsx
'use client';

import React from 'react';
import type { Question } from './worksheetTypes'; // Assuming worksheetTypes.ts is created or types are imported
import StaticContentBlock from './StaticContentBlock';


interface ShortAnswerQuestionProps {
  question: Question; // Using the Question type
  isReadOnly?: boolean; // For later interactivity
  // onChange?: (questionId: string, answer: string) => void; // For later
  // value?: string; // For later
}

const ShortAnswerQuestion: React.FC<ShortAnswerQuestionProps> = ({ question, isReadOnly = true }) => {
  if (question.type !== "ShortAnswer") {
    console.warn(`ShortAnswerQuestion received question of type: ${question.type}`);
    return null;
  }

  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      {question.prompt && (
        <label htmlFor={question.id} className="block text-sm font-medium text-gray-800 mb-2">
          <StaticContentBlock htmlContent={question.prompt} />
        </label>
      )}
      <textarea
        id={question.id}
        rows={3}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-gray-50"
        placeholder={question.placeholder || "Your answer..."}
        readOnly={isReadOnly}
        // value={value} // For later interactivity
        // onChange={(e) => onChange && onChange(question.id, e.target.value)} // For later
        aria-label={question.prompt || "Short answer question"}
      />
      {/* In a read-only view, we might display a saved answer here later */}
    </div>
  );
};

export default ShortAnswerQuestion;
"""

# --- Component: Section.tsx ---
SECTION_COMPONENT_CONTENT = """// src/components/worksheets/Section.tsx
'use client';

import React from 'react';
import type { Section, Question } from './worksheetTypes'; // Assuming worksheetTypes.ts is created
import StaticContentBlock from './StaticContentBlock';
import ShortAnswerQuestion from './ShortAnswerQuestion';


interface SectionComponentProps {
  section: Section; // Using the Section type
  isReadOnly?: boolean; // For later interactivity
}

const SectionComponent: React.FC<SectionComponentProps> = ({ section, isReadOnly = true }) => {
  return (
    <section id={section.id} className="mb-8 p-4 sm:p-6 bg-slate-50 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold text-indigo-700 mb-4 pb-2 border-b border-indigo-200">
        {section.title}
      </h3>
      {section.type === "StaticContent" && section.htmlContent && (
        <StaticContentBlock htmlContent={section.htmlContent} />
      )}
      {section.type === "Questionnaire" && section.questions && section.questions.length > 0 && (
        <div className="space-y-4">
          {section.questions.map((question) => {
            if (question.type === "ShortAnswer") {
              return <ShortAnswerQuestion key={question.id} question={question} isReadOnly={isReadOnly} />;
            } else if (question.type === "StaticContent" && question.htmlContent) {
              // Allows embedding static content within a questionnaire section (e.g., instructions before a question)
              return (
                <div key={question.id} className="p-3 my-2 bg-indigo-50 rounded-md">
                     <StaticContentBlock htmlContent={question.htmlContent} />
                </div>
              );
            }
            // Add more question types here as needed
            // e.g., else if (question.type === "MultipleChoice") { return <MultipleChoiceQuestion ... />; }
            return <p key={question.id} className="text-red-500 text-sm">Unsupported question type: {question.type} in section {section.title}</p>;
          })}
        </div>
      )}
      {/* Add rendering for other section types as needed */}
      {section.type !== "StaticContent" && section.type !== "Questionnaire" && (
         <p className="text-red-500 text-sm">Unsupported section type: {section.type}</p>
      )}
    </section>
  );
};

export default SectionComponent;
"""

# --- Component: Worksheet.tsx ---
WORKSHEET_COMPONENT_CONTENT = """// src/components/worksheets/Worksheet.tsx
'use client';

import React from 'react';
import type { Worksheet } from './worksheetTypes'; // Assuming worksheetTypes.ts is created
import SectionComponent from './Section'; // Corrected import name
import StaticContentBlock from './StaticContentBlock';


interface WorksheetComponentProps {
  worksheet: Worksheet | null; // Allow worksheet to be null initially
  isLoading?: boolean;
  error?: string | null;
}

const WorksheetComponent: React.FC<WorksheetComponentProps> = ({ worksheet, isLoading, error }) => {
  if (isLoading) {
    return <p className="text-center mt-10 p-4 text-gray-600">Loading worksheet...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 p-4 text-red-600 bg-red-50 rounded-md">Error: {error}</p>;
  }

  if (!worksheet) {
    return <p className="text-center mt-10 p-4 text-gray-500">No worksheet data available.</p>;
  }

  return (
    <article className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-2xl my-8">
      <header className="mb-8 pb-6 border-b border-gray-300">
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-800 mb-2">{worksheet.title}</h1>
        {worksheet.course && (
          <p className="text-sm text-gray-500">
            <span className="font-semibold">Course:</span> {worksheet.course}
          </p>
        )}
        {worksheet.unit && (
          <p className="text-sm text-gray-500">
            <span className="font-semibold">Unit:</span> {worksheet.unit}
          </p>
        )}
        {worksheet.specReference && (
          <p className="text-xs text-gray-400 mt-1">
            <span className="font-semibold">Spec Ref:</span> {worksheet.specReference}
          </p>
        )}
      </header>

      {worksheet.learningObjectives && worksheet.learningObjectives.length > 0 && (
        <div className="mb-8 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <h2 className="text-lg font-semibold text-indigo-700 mb-2">Learning Objectives</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {worksheet.learningObjectives.map((obj, index) => (
              <li key={index}>{obj}</li>
            ))}
          </ul>
        </div>
      )}
      
      {worksheet.keywords && worksheet.keywords.length > 0 && (
        <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Keywords</h2>
            <div className="flex flex-wrap gap-2">
                {worksheet.keywords.map((keyword, index) => (
                    <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                        {keyword}
                    </span>
                ))}
            </div>
        </div>
      )}


      {worksheet.sections && worksheet.sections.length > 0 ? (
        worksheet.sections.map((section) => (
          <SectionComponent key={section.id} section={section} isReadOnly={true} />
        ))
      ) : (
        <p className="text-gray-500">This worksheet has no sections defined.</p>
      )}

      <footer className="mt-12 pt-6 border-t border-gray-300 text-center">
        <p className="text-xs text-gray-400">
            Worksheet content generated on {new Date().toLocaleDateString()}.
            {worksheet.createdAt && typeof worksheet.createdAt.toDate === 'function' && 
             ` Originally created: ${worksheet.createdAt.toDate().toLocaleDateString()}`
            }
        </p>
      </footer>
    </article>
  );
};

export default WorksheetComponent;
"""

# Files to create and their content
FILES_TO_CREATE = {
    "worksheetTypes.ts": WORKSHEET_TYPES_CONTENT, # Common types for worksheet components
    "StaticContentBlock.tsx": STATIC_CONTENT_BLOCK_CONTENT,
    "ShortAnswerQuestion.tsx": SHORT_ANSWER_QUESTION_CONTENT,
    "Section.tsx": SECTION_COMPONENT_CONTENT,
    "Worksheet.tsx": WORKSHEET_COMPONENT_CONTENT,
}

def create_file(file_path, content):
    """Creates a file with the given content, ensuring directory exists."""
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Successfully created file: {file_path}")
    except IOError as e:
        print(f"Error creating file {file_path}: {e}")
    except Exception as e:
        print(f"An unexpected error occurred while creating {file_path}: {e}")

def main():
    project_root = os.getcwd()
    base_path = os.path.join(project_root, BASE_COMPONENTS_DIR)

    print(f"Creating worksheet components in {base_path}...")

    for file_name, content in FILES_TO_CREATE.items():
        absolute_file_path = os.path.join(base_path, file_name)
        create_file(absolute_file_path, content)
    
    print("\nWorksheet component file creation process finished.")
    print("Next steps would be to create pages to display these worksheets, such as:")
    print("1. A Teacher's Resource Library page (e.g., src/app/(platform)/teacher/library/page.tsx)")
    print("2. A page for students to view an assigned worksheet (e.g., src/app/(platform)/student/worksheets/[worksheetId]/page.tsx)")

if __name__ == "__main__":
    main()