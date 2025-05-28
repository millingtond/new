// src/app/(platform)/cpu-lesson/page.tsx
"use client"; // Required for components with hooks like useState, useEffect

import CpuArchitectureWorksheet from '@/components/worksheets/CpuArchitectureWorksheet';
import React from 'react'; // Import React if not already implicitly available

export default function CpuLessonPage() {
  return (
    <div className="container mx-auto px-4 py-8"> 
      {/* Added container, mx-auto and some padding for better presentation */}
      <CpuArchitectureWorksheet />
    </div>
  );
}