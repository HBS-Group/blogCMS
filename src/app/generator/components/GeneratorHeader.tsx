
import React from 'react';


interface GeneratorHeaderProps {
    freelancerName: string | null;
    userEmail: string | null;
    className?: string;
}

export const GeneratorHeader: React.FC<GeneratorHeaderProps> = ({
    freelancerName,
    userEmail,


    className
}) => {
    return (
        <div className={`flex flex-wrap justify-between items-center gap-4 p-4 ${className}`}>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                AI Blog Generator
            </h1>
            <div className="flex items-center gap-4">
                <div className="text-sm text-indigo-300 truncate max-w-[200px] sm:max-w-xs">
                    {freelancerName ? `Welcome, ${freelancerName}` : userEmail ? `Welcome, ${userEmail}` : "Welcome, Guest"}
                </div>
               
            </div>
        </div>
    );
};
