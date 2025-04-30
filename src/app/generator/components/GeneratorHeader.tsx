
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GeneratorHeaderProps {
    freelancerName: string | null;
    userEmail: string | null;
    onSignOut: () => void;
    isSignOutPending: boolean;
    className?: string;
}

export const GeneratorHeader: React.FC<GeneratorHeaderProps> = ({
    freelancerName,
    userEmail,
    onSignOut,
    isSignOutPending,
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
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onSignOut} 
                    disabled={isSignOutPending}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                    {isSignOutPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sign Out
                </Button>
            </div>
        </div>
    );
};
