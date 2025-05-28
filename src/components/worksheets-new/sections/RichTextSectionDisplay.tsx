// src/components/worksheets-new/sections/RichTextSectionDisplay.tsx
import React, { useMemo } from 'react';
import { StaticTextSection } from '@/types/worksheetNew';
import KeywordTooltipWrapper from '../keywords/KeywordTooltipWrapper';
import DOMPurify from 'isomorphic-dompurify';
import parse, { Element, HTMLReactParserOptions, domToReact } from 'html-react-parser';

interface RichTextSectionProps {
  section: StaticTextSection;
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
  const processHtml = (htmlString: string) => {
    if (!htmlString) return '';
    const cleanHtml = DOMPurify.sanitize(htmlString, { USE_PROFILES: { html: true } });
    const options: HTMLReactParserOptions = {
      replace: domNode => {
        if (domNode instanceof Element && domNode.tagName === 'keyword') {
          const keywordKey = domNode.attribs['data-key'];
          if (keywordsData && keywordKey && keywordsData[keywordKey]) {
            const children = domNode.children ? domToReact(domNode.children as any[], options) : '';
            return (
              <KeywordTooltipWrapper keyword={keywordKey} definition={keywordsData[keywordKey].definition}>
                {children}
              </KeywordTooltipWrapper>
            );
          }
        }
      },
    };
    return parse(cleanHtml, options);
  };

  const memoizedContent = useMemo(() => processHtml(section.content), [section.content, keywordsData]);

  return (
    <div className="p-1">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">{section.title}</h2>
      <div className="prose prose-sm sm:prose max-w-none prose-indigo">{memoizedContent}</div>
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
