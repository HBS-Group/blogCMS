
// app/generator/components/ImageUploadTab.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Upload } from "lucide-react";
import { UploadStatusList } from './UploadStatusList'; // Import the new list component
import { UploadStatus } from '@/app/generator/page'; // Import the interface from parent

interface ImageUploadTabProps {
    selectedFiles: FileList | null;
    uploadProgress: Record<string, UploadStatus>;
    isUploading: boolean;
    isLoading: boolean; // General loading state to disable input
    onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onUploadImages: () => void;
    onCopyToClipboard: (text: string | undefined | null, type?: string) => void; // Pass copy function
}

export const ImageUploadTab: React.FC<ImageUploadTabProps> = ({
    selectedFiles,
    uploadProgress,
    isUploading,
    isLoading,
    onFileSelect,
    onUploadImages,
    onCopyToClipboard,
}) => {
    const numSelectedFiles = selectedFiles?.length || 0;
    const disableUploadButton = isLoading || isUploading || numSelectedFiles === 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upload Images</CardTitle>
                <CardDescription>Upload generated or selected images to your storage bucket.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* File Input */}
                <div className="space-y-2">
                    <Label htmlFor="image-upload-input" className="font-semibold">Select Images</Label>
                    <Input
                        id="image-upload-input"
                        type="file"
                        multiple // Allow multiple files
                        onChange={onFileSelect}
                        disabled={isLoading || isUploading} // Disable during general load or specific upload
                        accept="image/png, image/jpeg, image/webp, image/gif" // Specify acceptable image types
                    />
                    {selectedFiles && <p className="text-sm text-muted-foreground mt-1">{numSelectedFiles} file(s) selected.</p>}
                </div>

                {/* Upload Button */}
                <Button
                    onClick={onUploadImages}
                    disabled={disableUploadButton}
                    className="w-full sm:w-auto"
                >
                    {isUploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Upload className="mr-2 h-4 w-4" />
                    )}
                    {isUploading ? "Uploading..." : `Upload ${numSelectedFiles} Image(s)`}
                </Button>

                <Separator />

                {/* Upload Status Area */}
                <UploadStatusList
                    uploadProgress={uploadProgress}
                    onCopyToClipboard={onCopyToClipboard} // Pass down the copy function
                />
            </CardContent>
        </Card>
    );
};