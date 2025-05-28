// src/components/worksheets-new/sections/WhatsNextSectionDisplay.tsx
import React from 'react';
import { WhatsNextSection } from '@/types/worksheetNew';
import DOMPurify from 'isomorphic-dompurify';
import Link from 'next/link';
import parse, { Element, HTMLReactParserOptions, domToReact } from 'html-react-parser';
import KeywordTooltipWrapper from '../keywords/KeywordTooltipWrapper';

interface WhatsNextProps {
  section: WhatsNextSection;
  keywordsData?: Record<string, { definition: string; link?: string }>;
  onCompletedToggle: (completed: boolean) => void;
  isCompleted?: boolean;
}

const WhatsNextSectionDisplay: React.FC<WhatsNextProps> = ({ section, keywordsData, onCompletedToggle, isCompleted }) => {
  const processHtmlWithKeywords = (htmlString: string) => {
    if (!htmlString) return '';
    const cleanHtml = DOMPurify.sanitize(htmlString, { USE_PROFILES: { html: true } });
    const options: HTMLReactParserOptions = {
      replace: domNode => {
        if (domNode instanceof Element && domNode.tagName === 'keyword') {
          const keywordKey = domNode.attribs['data-key'];
          if (keywordsData && keywordKey && keywordsData[keywordKey]) {
            const children = domNode.children ? domToReact(domNode.children as any[], options) : '';
            return (<KeywordTooltipWrapper keyword={keywordKey} definition={keywordsData[keywordKey].definition}>{children}</KeywordTooltipWrapper>);
          }
        }
      },
    };
    return parse(cleanHtml, options);
  };

  return (
    <div className="p-1">
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4">{section.title}</h2>
      <div className="bg-teal-50 p-5 rounded-lg border border-teal-300">
        <div className="prose prose-sm max-w-none prose-teal">{processHtmlWithKeywords(section.description)}</div>
        <ul className="list-disc list-inside space-y-1 text-teal-700 mt-3 pl-4">
          {section.links.map((link, index) => (
            <li key={index}>
              {link.url ? (<Link href={link.url} className="hover:underline hover:text-teal-900">{processHtmlWithKeywords(link.text)}</Link>) : (<span>{processHtmlWithKeywords(link.text)}</span>)}
              {link.specReference && <span className="text-xs italic ml-1">({link.specReference})</span>}
            </li>
          ))}
        </ul>
      </div>
      {!section.isActivity && (
        <div className="mt-6 p-3 bg-slate-50 rounded-md">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" checked={isCompleted} onChange={(e) => onCompletedToggle(e.target.checked)} className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
            <span className="text-gray-700">I have reviewed the next steps.</span>
          </label>
        </div>
      )}
    </div>
  );
};
export default WhatsNextSectionDisplay;
