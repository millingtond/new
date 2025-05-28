// src/components/worksheets-new/sections/VideoPlaceholderSectionDisplay.tsx
import React from 'react';
import { VideoPlaceholderSection, TaskAttempt } from '@/types/worksheetNew';
import DOMPurify from 'isomorphic-dompurify';

interface VideoPlaceholderProps {
  section: VideoPlaceholderSection;
  onAnswerChange: (videoId: string, notes: string, isAttempted: boolean) => void;
  answers: Record<string, TaskAttempt>;
  onCompletedToggle: (completed: boolean) => void;
  isCompleted?: boolean;
}

const VideoPlaceholderSectionDisplay: React.FC<VideoPlaceholderProps> = ({ section, onAnswerChange, answers, onCompletedToggle, isCompleted }) => {
  const handleNotesChange = (videoId: string, notes: string) => onAnswerChange(videoId, notes, notes.trim() !== '');
  return (
    <div className="p-1">
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4"><span role="img" aria-label="video icon" className="mr-2">🎬</span>{section.title}</h2>
      {section.introText && <div className="mb-4 text-gray-700 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.introText) }} />}
      <div className="bg-purple-50 p-5 rounded-lg border border-purple-200 space-y-6">
        {section.videos.map((video) => (
          <div key={video.id} className="video-entry">
            <h4 className="font-semibold text-purple-800 mb-2">{video.title}</h4>
            <div className="aspect-video bg-black rounded-md overflow-hidden mb-2"><iframe width="560" height="315" src={video.embedUrl} title={video.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen className="w-full h-full"></iframe></div>
            <div><textarea value={(answers[video.id]?.value as string) || ''} onChange={(e) => handleNotesChange(video.id, e.target.value)} placeholder={video.notesPlaceholder || "Optional: Add notes here..."} rows={3} className="w-full p-2 border border-purple-300 rounded-md text-sm bg-white focus:ring-purple-500 focus:border-purple-500" /></div>
          </div>
        ))}
      </div>
      {!section.isActivity && (
        <div className="mt-6 p-3 bg-slate-50 rounded-md">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" checked={isCompleted} onChange={(e) => onCompletedToggle(e.target.checked)} className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
            <span className="text-gray-700">I have viewed the relevant videos.</span>
          </label>
        </div>
      )}
    </div>
  );
};
export default VideoPlaceholderSectionDisplay;
