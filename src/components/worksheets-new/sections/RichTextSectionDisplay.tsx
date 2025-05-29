// src/components/worksheets-new/sections/RichTextSectionDisplay.tsx
import {
  StaticTextSection,
  KeyTakeawaysSection,
} from '@/types/worksheetNew'; // Adjust if KeyTakeawaysSection is not directly used or is part of StaticTextSection type
import React from 'react';
import DOMPurify from 'isomorphic-dompurify';
import parse, { Element, HTMLReactParserOptions, domToReact } from 'html-react-parser';
import KeywordTooltipWrapper from '../keywords/KeywordTooltipWrapper';

interface RichTextSectionProps {
  section: StaticTextSection | KeyTakeawaysSection; // Or a more generic type if applicable
  keywordsData?: Record<string, { definition: string; link?: string }>;
  onCompletedToggle: (completed: boolean) => void;
  isCompleted?: boolean;
}

const RichTextSectionDisplay: React.FC<RichTextSectionProps> = ({
  section,
  keywordsData,
  onCompletedToggle,
  isCompleted,
}) => {
  const processHtmlWithKeywords = (htmlString: string) => {
    if (!htmlString) return '';
    // Ensure DOMPurify is configured to allow 'keyword' tags and 'data-key' attributes if not by default
    const cleanHtml = DOMPurify.sanitize(htmlString, { USE_PROFILES: { html: true }, ADD_TAGS: ['keyword'], ADD_ATTR: ['data-key'] });

    const options: HTMLReactParserOptions = {
      replace: domNode => {
        if (domNode instanceof Element && domNode.tagName.toLowerCase() === 'keyword') {
          const keywordKey = domNode.attribs['data-key'];
          const keywordContent = domNode.children ? domToReact(domNode.children as any[], options) : '';
          if (keywordsData && keywordKey && keywordsData[keywordKey]) {
            return (
              <KeywordTooltipWrapper keyword={keywordKey} definition={keywordsData[keywordKey].definition}>
                {keywordContent}
              </KeywordTooltipWrapper>
            );
          }
          return <>{keywordContent}</>; // Render content even if keyword not found, or handle differently
        }
      },
    };
    return parse(cleanHtml, options);
  };

  return (
    <div className="p-1">
      {section.title && <h2 className="text-2xl font-semibold text-indigo-600 mb-4">{section.title}</h2>}
      <div className="prose prose-sm max-w-none text-slate-700">
        {/* dangerouslySetInnerHTML is cleared because processHtmlWithKeywords returns React elements */}
        {processHtmlWithKeywords(section.content)}
      </div>
      {!section.isActivity && (
        <div className="mt-6 p-3 bg-slate-50 rounded-md">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={(e) => onCompletedToggle(e.target.checked)}
              className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-gray-700">I have read and understood this section.</span>
          </label>
        </div>
      )}
    </div>
  );
};

export default RichTextSectionDisplay;
