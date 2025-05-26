// src/components/worksheets/StaticContentWithKeywords.tsx
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
