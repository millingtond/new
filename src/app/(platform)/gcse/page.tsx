// src/app/(platform)/gcse/page.tsx
"use client";

import React from 'react';
import Link from 'next/link';
// Added Users to the import from lucide-react
import { BookOpen, ChevronLeft, ExternalLink, Youtube, FileText, Brain, Users } from 'lucide-react'; 

// Data for General Resources
const generalResources = [
  { name: "Join Quizlet Class", href: "#", icon: Users }, // Now uses Users from lucide-react
  { name: "Craig n Dave YouTube (J277)", href: "https://www.youtube.com/@craigndave", icon: Youtube, external: true },
  { name: "OCR J277 Specification (PDF)", href: "https://www.ocr.org.uk/Images/558027-specification-gcse-computer-science-j277.pdf", icon: FileText, external: true },
  { name: "MGS Notion Resources", href: "#", icon: BookOpen }, // Placeholder href
];

// Data for Component 01 Topics
const component01Topics = [
  { id: "j277-1-1", title: "Systems Architecture", href: "/gcse/j277/unit-1-1" },
  { id: "j277-1-2", title: "Memory and Storage", href: "/gcse/j277/unit-1-2" },
  { id: "j277-1-3", title: "Computer Networks, Connections and Protocols", href: "/gcse/j277/unit-1-3" },
  { id: "j277-1-4", title: "Network Security", href: "/gcse/j277/unit-1-4" },
  { id: "j277-1-5", title: "Systems Software", href: "/gcse/j277/unit-1-5" },
  { id: "j277-1-6", title: "Ethical, Legal, Cultural and Environmental Concerns", href: "/gcse/j277/unit-1-6" },
];

// Data for Component 02 Topics
const component02Topics = [
  { id: "j277-2-1", title: "Algorithms", href: "/gcse/j277/unit-2-1" },
  { id: "j277-2-2", title: "Programming Fundamentals", href: "/gcse/j277/unit-2-2" },
  { id: "j277-2-3", title: "Producing Robust Programs", href: "/gcse/j277/unit-2-3" }, // Assuming unit number for consistency
  { id: "j277-2-4", title: "Boolean Logic", href: "/gcse/j277/unit-2-4" },
  { id: "j277-2-5", title: "Programming Languages and Integrated Development Environments (IDEs)", href: "/gcse/j277/unit-2-5" },
];

// Helper component for topic links/buttons
const TopicLink: React.FC<{ title: string; href: string }> = ({ title, href }) => (
  <Link href={href} className="block w-full">
    <div className="text-center p-3 bg-white hover:bg-indigo-50 border border-gray-200 rounded-lg shadow-sm transition-all duration-200 ease-in-out hover:border-indigo-300">
      <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">{title}</span>
    </div>
  </Link>
);

// Helper component for general resource buttons
const GeneralResourceButton: React.FC<{ name: string; href: string; icon: React.ElementType; external?: boolean }> = ({ name, href, icon: Icon, external }) => (
  <Link href={href} target={external ? "_blank" : "_self"} rel={external ? "noopener noreferrer" : ""}
    className="flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-100 hover:bg-indigo-200 py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm">
    <Icon size={16} />
    {name}
    {external && <ExternalLink size={14} className="opacity-70" />}
  </Link>
);


export default function GcsePageNewLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center mb-4 group">
              <ChevronLeft className="w-5 h-5 mr-1 transition-transform group-hover:-translate-x-1" />
              Back to Home
          </Link>
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-indigo-800">
              GCSE Computer Science Resources
            </h1>
          </div>
        </header>

        {/* General Resources Section */}
        <section className="mb-10 p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-center text-gray-700 mb-6">General Resources</h2>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {generalResources.map(resource => (
              <GeneralResourceButton key={resource.name} {...resource} />
            ))}
          </div>
        </section>

        {/* Components Section - Two Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Component 01 */}
          <section className="p-6 bg-white rounded-xl shadow-lg">
            <div className="flex items-center mb-5">
                <Brain className="w-7 h-7 text-purple-600 mr-3" />
                <h2 className="text-2xl font-semibold text-purple-700 border-b-2 border-purple-200 pb-2 flex-grow">
                    Component 01: Computer Systems
                </h2>
            </div>
            <div className="space-y-3">
              {component01Topics.map(topic => (
                <TopicLink key={topic.id} title={topic.title} href={topic.href} />
              ))}
            </div>
          </section>

          {/* Component 02 */}
          <section className="p-6 bg-white rounded-xl shadow-lg">
            <div className="flex items-center mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-teal-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <h2 className="text-2xl font-semibold text-teal-700 border-b-2 border-teal-200 pb-2 flex-grow">
                    Component 02: Computational Thinking, Algorithms and Programming
                </h2>
            </div>
            <div className="space-y-3">
              {component02Topics.map(topic => (
                <TopicLink key={topic.id} title={topic.title} href={topic.href} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Removed the dummy Users icon component as it's now imported from lucide-react

