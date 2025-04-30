// app/generator/components/UploadStatusList.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, File as FileIcon, Copy } from "lucide-react";
import { UploadStatus } from '@/app/generator/page'; // Import the interface from parent

interface UploadStatusListProps {
    uploadProgress: Record<string, UploadStatus>;
    onCopyToClipboard: (text: string | undefined | null, type?: string) => void; // Receive copy function
}

export const UploadStatusList: React.FC<UploadStatusListProps> = ({
    uploadProgress,
    onCopyToClipboard,
}) => {
    const progressEntries = Object.entries(uploadProgress);

    return (
        <div className="space-y-3">
            <h4 className="font-semibold">Upload Status:</h4>
            {progressEntries.length > 0 ? (
                <ul className="space-y-2 border rounded-md p-3 bg-muted/30 max-h-60 overflow-y-auto">
                    {progressEntries.map(([fileName, status]) => (
                        <li key={fileName} className="text-sm flex flex-wrap items-center justify-between gap-x-3 gap-y-1 p-2 rounded hover:bg-muted/50">
                            <div className="flex items-center gap-2 flex-grow min-w-0 basis-full sm:basis-1/2 lg:basis-auto">
                                <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="font-medium truncate" title={fileName}>{fileName}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {status.status === 'uploading' && (
                                    <span className="flex items-center gap-1 text-blue-600">
                                        <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
                                        {/* Optionally show progress: ({status.progress}%) */}
                                    </span>
                                )}
                                {status.status === 'success' && status.url && (
                                    <span className="flex items-center gap-1 text-green-600">
                                        <CheckCircle2 className="h-4 w-4" /> Success
                                        <Button variant="link" size="sm" asChild className="h-auto p-0 text-xs ml-1">
                                            <a href={status.url} target="_blank" rel="noopener noreferrer">(View)</a>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 ml-1 text-gray-500 hover:text-gray-800"
                                            onClick={() => onCopyToClipboard(status.url, 'Image URL')} // Use passed function
                                            title="Copy URL"
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </span>
                                )}
                                {status.status === 'error' && (
                                    <span className="flex items-center gap-1 text-red-600" title={status.error}>
                                        <XCircle className="h-4 w-4" /> Error
                                        {status.error && <span className="text-xs hidden sm:inline max-w-[200px] truncate">: {status.error}</span>}
                                    </span>
                                )}
                                {status.status === 'pending' && (
                                    <span className="text-xs text-muted-foreground">Pending...</span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-5">
                    Select images and click upload to see status here.
                </p>
            )}
        </div>
    );
};