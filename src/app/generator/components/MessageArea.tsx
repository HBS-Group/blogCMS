import React from 'react';
import { Button } from "@/components/ui/button";

interface MessageAreaProps {
    errorMessage: string | null;
    successMessage: string | null;
    onClearMessages: () => void;
}

export const MessageArea: React.FC<MessageAreaProps> = ({
    errorMessage,
    successMessage,
    onClearMessages,
}) => {
    return (
        <div className="mb-4 space-y-2 min-h-[50px]"> {/* Ensure consistent height */}
            {errorMessage && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm flex justify-between items-center">
                    <span><strong>Error:</strong> {errorMessage}</span>
                    <Button variant="ghost" size="sm" onClick={onClearMessages} className="text-red-700 hover:bg-red-200 h-6 w-6 p-0">X</Button>
                </div>
            )}
            {successMessage && (
                <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm flex justify-between items-center">
                    <span><strong>Success:</strong> {successMessage}</span>
                    <Button variant="ghost" size="sm" onClick={onClearMessages} className="text-green-700 hover:bg-green-200 h-6 w-6 p-0">X</Button>
                </div>
            )}
        </div>
    );
};