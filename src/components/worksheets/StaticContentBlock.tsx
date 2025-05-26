// src/components/worksheets/StaticContentBlock.tsx
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
