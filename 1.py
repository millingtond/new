import os

# Define the base directory for these components
BASE_COMPONENTS_DIR = "src/components/worksheets"

# --- Component: KeywordTooltipWrapper.tsx ---
KEYWORD_TOOLTIP_WRAPPER_CONTENT = r"""// src/components/worksheets/KeywordTooltipWrapper.tsx
"use client";

import React, { useState } from 'react';

interface KeywordTooltipWrapperProps {
  term: string; // The text to display
  definition: string; // The definition to show in the tooltip
  children?: React.ReactNode; // Optional: if you want to wrap other elements
}

const KeywordTooltipWrapper: React.FC<KeywordTooltipWrapperProps> = ({ term, definition, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Basic styling for the keyword and tooltip.
  // You can enhance this with Tailwind classes passed as props or more complex CSS.
  // This styling is inspired by your original style.css for .keyword and .tooltip
  const keywordStyle: React.CSSProperties = {
    position: 'relative',
    borderBottom: '2px dotted #60a5fa', // Tailwind blue-400
    cursor: 'help',
    fontWeight: 600,
    color: '#2563eb', // Tailwind blue-600
    display: 'inline-block', // Important for positioning the tooltip correctly relative to the text
  };

  const tooltipStyle: React.CSSProperties = {
    visibility: showTooltip ? 'visible' : 'hidden',
    width: '280px',
    backgroundColor: '#1f2937', // Tailwind gray-800
    color: '#fff',
    textAlign: 'left',
    borderRadius: '6px',
    padding: '8px 12px',
    position: 'absolute',
    zIndex: 50,
    bottom: '125%', // Position above the keyword
    left: '50%',
    marginLeft: '-140px', // Center the tooltip (half of its width)
    opacity: showTooltip ? 1 : 0,
    transition: 'opacity 0.3s, visibility 0.3s',
    fontSize: '0.8rem',
    fontWeight: 400,
    lineHeight: 1.4,
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    pointerEvents: 'none', // So it doesn't interfere with mouse events on the term itself if needed
  };

  return (
    <span
      style={keywordStyle}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)} // For accessibility
      onBlur={() => setShowTooltip(false)}  // For accessibility
      tabIndex={0} // Make it focusable
      aria-describedby={`tooltip-for-${term.replace(/\s+/g, '-').toLowerCase()}`}
    >
      {children || term}
      <span style={tooltipStyle} role="tooltip" id={`tooltip-for-${term.replace(/\s+/g, '-').toLowerCase()}`}>
        {definition}
      </span>
    </span>
  );
};

export default KeywordTooltipWrapper;
"""

# --- Component: StaticContentWithKeywords.tsx ---
# This component will parse HTML for <keyword data-term="key">Text</keyword>
# and replace them with KeywordTooltipWrapper components.
# This requires a safe HTML parser or a specific approach.
# For simplicity and safety, we'll use a regex-based approach here,
# but for complex HTML, a proper parser (like 'html-react-parser') would be better.
# This simplified version assumes keywords don't contain HTML themselves.
STATIC_CONTENT_WITH_KEYWORDS_CONTENT = r"""// src/components/worksheets/StaticContentWithKeywords.tsx
"use client";

import React from 'react';
import KeywordTooltipWrapper from './KeywordTooltipWrapper';
// For a more robust solution with complex HTML, consider:
// import parse, { domToReact, HTMLReactParserOptions, Element } from 'html-react-parser';

interface StaticContentWithKeywordsProps {
  htmlContent: string;
  keywordsData: Record<string, string>; // e.g., { "cpu": "Central Processing Unit..." }
}

const StaticContentWithKeywords: React.FC<StaticContentWithKeywordsProps> = ({ htmlContent, keywordsData }) => {
  if (!htmlContent || !keywordsData) {
    return <div dangerouslySetInnerHTML={{ __html: htmlContent || "" }} />;
  }

  // Regex to find <keyword data-term="some-key">Displayed Text</keyword>
  // This is a simplified parser. It might break with nested HTML within the keyword tag.
  const keywordRegex = /<keyword data-term=["']([^"']+)["']>([^<]+)<\/keyword>/g;

  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = keywordRegex.exec(htmlContent)) !== null) {
    const [fullMatch, termKey, displayedText] = match;
    const definition = keywordsData[termKey.toLowerCase()]; // Ensure keys are consistently cased

    // Add the text before this match
    if (match.index > lastIndex) {
      parts.push(htmlContent.substring(lastIndex, match.index));
    }

    // Add the keyword component or text if definition not found
    if (definition) {
      parts.push(
        <KeywordTooltipWrapper key={`${termKey}-${match.index}`} term={displayedText} definition={definition} />
      );
    } else {
      // If no definition, just render the text without tooltip functionality
      // or you could log a warning.
      console.warn(`StaticContentWithKeywords: No definition found for keyword key: ${termKey}`);
      parts.push(displayedText);
    }
    lastIndex = keywordRegex.lastIndex;
  }

  // Add any remaining text after the last match
  if (lastIndex < htmlContent.length) {
    parts.push(htmlContent.substring(lastIndex));
  }

  // Render the parts. Need to wrap in a div that can handle mixed string/ReactNode array.
  // We also need to handle the original HTML structure.
  // A more robust solution uses html-react-parser with a replace function.

  // Simplified rendering for now: join string parts and render React nodes.
  // This will lose the original HTML structure around the keywords if not careful.
  // For a quick solution, we can render the parts.
  // A better approach is to use html-react-parser:
  /*
  const options: HTMLReactParserOptions = {
    replace: domNode => {
      if (domNode instanceof Element && domNode.name === 'keyword') {
        const termKey = domNode.attribs['data-term'];
        const displayedText = domNode.children.length > 0 && domNode.children[0].type === 'text' ? domNode.children[0].data : termKey;
        const definition = keywordsData[termKey?.toLowerCase()];
        if (definition) {
          return <KeywordTooltipWrapper term={displayedText} definition={definition} />;
        }
        return <>{displayedText}</>; // Fallback if no definition
      }
    }
  };
  return <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none text-gray-700">{parse(htmlContent, options)}</div>;
  */

  // Current simplified approach: Render the processed parts.
  // This will render strings directly and KeywordTooltipWrapper components.
  // It might not perfectly preserve all HTML structure if keywords are inside complex tags.
  // The `prose` class helps style the raw HTML parts.
  return (
    <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none text-gray-700">
      {parts.map((part, index) => (
        typeof part === "string" ? 
        <span key={index} dangerouslySetInnerHTML={{ __html: part }} /> : 
        part 
      ))}
    </div>
  );
};

export default StaticContentWithKeywords;
"""

# --- Component: KeywordGlossary.tsx ---
KEYWORD_GLOSSARY_CONTENT = r"""// src/components/worksheets/KeywordGlossary.tsx
"use client";

import React from 'react';
import KeywordTooltipWrapper from './KeywordTooltipWrapper';
import StaticContentBlock from './StaticContentBlock'; // For the introduction

interface KeywordGlossaryProps {
  introduction?: string;
  displayTermKeys: string[]; // Array of keys from keywordsData to display
  keywordsData: Record<string, string>; // The main keywords dictionary
}

const KeywordGlossary: React.FC<KeywordGlossaryProps> = ({ introduction, displayTermKeys, keywordsData }) => {
  if (!displayTermKeys || displayTermKeys.length === 0 || !keywordsData) {
    return <p className="text-sm text-red-500">Keyword data missing for glossary.</p>;
  }

  return (
    <div>
      {introduction && <StaticContentBlock htmlContent={introduction} />}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {displayTermKeys.map((termKey) => {
          const definition = keywordsData[termKey.toLowerCase()]; // Ensure consistent key casing
          // The term to display might be the key itself, or you might want a mapping
          // if the key is e.g., "program-counter" but you want to display "Program Counter".
          // For simplicity, we'll format the key.
          const displayTerm = termKey
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          if (definition) {
            return (
              <KeywordTooltipWrapper
                key={termKey}
                term={displayTerm}
                definition={definition}
              />
            );
          } else {
            console.warn(`KeywordGlossary: No definition found for term key: ${termKey}`);
            // Render the term without tooltip if definition is missing
            return <span key={termKey} className="font-semibold text-gray-700 p-1 border-b-2 border-dotted border-gray-400">{displayTerm} (Definition not found)</span>;
          }
        })}
      </div>
    </div>
  );
};

export default KeywordGlossary;
"""

# Files to create and their content
FILES_TO_CREATE = {
    "KeywordTooltipWrapper.tsx": KEYWORD_TOOLTIP_WRAPPER_CONTENT,
    "StaticContentWithKeywords.tsx": STATIC_CONTENT_WITH_KEYWORDS_CONTENT,
    "KeywordGlossary.tsx": KEYWORD_GLOSSARY_CONTENT,
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

    print(f"Creating keyword-related worksheet components in {base_path}...")

    for file_name, content in FILES_TO_CREATE.items():
        absolute_file_path = os.path.join(base_path, file_name)
        create_file(absolute_file_path, content)
    
    print("\nKeyword component file creation process finished.")
    print("Next steps will involve creating components for other interactive elements like diagrams and fill-in-the-blanks,")
    print("and then updating Worksheet.tsx and Section.tsx to use these new components.")
    print("Consider installing 'html-react-parser' for a more robust StaticContentWithKeywords component if you encounter issues with complex HTML.")

if __name__ == "__main__":
    main()
