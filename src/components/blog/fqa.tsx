"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export interface FaqItemProps {
  id: string;
  question: string;
  answer: string;
}

export default function FaqItem({ id, question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      id={id}
      className="group py-2 mb-3 rounded-xl bg-gray-900/70 hover:bg-gray-800/60 
      transition-all duration-300 border border-gray-700/50 hover:border-green-logo/30
      shadow-sm hover:shadow-green-logo/10 cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <div className="flex justify-between items-center px-5">
        <h4 className="text-lg font-medium text-white/90 group-hover:text-green-logo/90 
        transition-colors duration-200">
          {question}
        </h4>
        <div className={`ml-4 p-1.5  rounded-full transition-all duration-300 
        ${open ? 'bg-green-logo/20 rotate-180' : 'bg-gray-700/60 group-hover:bg-green-logo/10'} `}>
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-300 
            ${open ? 'text-green-logo rotate-180' : 'text-gray-400 group-hover:text-green-logo'}`}
          />
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] 
        ${open ? 'max-h-screen opacity-100 mt-3' : 'max-h-0 opacity-0'}`}
        aria-hidden={!open}
      >
        <div className="px-5  text-gray-300/90 border-l-2 border-green-logo/70 pl-4 
        ml-5 transition-all duration-500">
          <div className="prose prose-invert prose-sm">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}