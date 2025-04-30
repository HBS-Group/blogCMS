// app/generator/components/OutputTabs.tsx
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreviewTab } from "./PreviewTab";
import { HtmlTab } from "./HtmlTab"; // Ensure correct import path
import { ImagePromptsTab } from "./ImagePromptsTab";
import { AnalysisTab } from "./AnalysisTab";
import { HtmlTabEditor } from './HtmlTabEditor';

interface OutputTabsProps {
  rawGeneratedContent: string | null | undefined;
  formattedContent: string | null | undefined;
  generatedImagePrompts: string[];
  seoScore: number;
  readability: string;
  plagiarismResult: string;
  isLoading: boolean;
  isFormatting: boolean;
  isImagePromptGenerating: boolean;
  loadingText: string;
  onGenerateImagePrompts: () => void;
  onCopyToClipboard: (text: string | undefined | null, type?: string) => void;
}

export const OutputTabs: React.FC<OutputTabsProps> = (props) => {
  // State for the content being actively edited (HTML)
  const [editedContent, setEditedContent] = useState<string>('');

  // Effect to sync editor with formattedContent when it changes
  useEffect(() => {
    if (props.formattedContent !== undefined && props.formattedContent !== null) {
        setEditedContent(props.formattedContent);
    } else {
        setEditedContent('');
    }
  }, [props.formattedContent]);

  // Determine content for other tabs, prioritizing edited HTML
  const contentForImagePrompts = editedContent || props.rawGeneratedContent || '';
  const contentForAnalysis = editedContent || props.formattedContent || '';

  return (
    <Tabs defaultValue="preview" className="w-full">
      <TabsList className="grid gap-1 w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-4 bg-gray-800/50">
        <TabsTrigger 
            value="raw-text"
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
        >
            Raw Text
        </TabsTrigger>
        <TabsTrigger 
            value="edit-html"
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
        >
            Edit HTML
        </TabsTrigger>
        <TabsTrigger 
            value="preview"
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
        >
            Preview
        </TabsTrigger>
        <TabsTrigger 
            value="analysis"
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
        >
            Analysis
        </TabsTrigger>
        <TabsTrigger 
            value="image-prompts"
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
        >
            Image Prompts
        </TabsTrigger>
      </TabsList>

      {/* <<< Tab for Raw Text (Read-Only) >>> */}
      <TabsContent value="raw-text">
        <HtmlTab
             value={editedContent} // Use the editable state
             onChangeValue={setEditedContent} // Pass the state updater
             isLoading={props.isLoading}
             onCopyToClipboard={props.onCopyToClipboard}
             typeText={true} // Label as 'HTML'
             readOnly={false} // <<< Explicitly set as editable
        />
      </TabsContent>

      {/* Tab for Editing HTML */}
      <TabsContent value="edit-html"> {/* Renamed value */}
        <HtmlTabEditor
          value={editedContent} // Use the editable state
          onChangeValue={setEditedContent} // Pass the state updater
          isLoading={props.isLoading}
          onCopyToClipboard={props.onCopyToClipboard}
          typeText={false} // Label as 'HTML'
          readOnly={false} // <<< Explicitly set as editable
        />
      </TabsContent>

      {/* Tab for Preview (Displays editedContent or formattedContent) */}
      <TabsContent value="preview">
        <PreviewTab
          formattedContent={props.formattedContent}
          rawGeneratedContent={props.rawGeneratedContent} // Original raw for reformat check
          editedContent={editedContent} // Live edited HTML content
          isLoading={props.isLoading}
          isFormatting={props.isFormatting}
          loadingText={props.loadingText}
          onCopyToClipboard={props.onCopyToClipboard}
        />
      </TabsContent>

      {/* Image Prompts Tab */}
      <TabsContent value="image-prompts">
        <ImagePromptsTab
          generatedImagePrompts={props.generatedImagePrompts}
          isLoading={props.isLoading}
          isImagePromptGenerating={props.isImagePromptGenerating}
          canGenerate={!!contentForImagePrompts}
          loadingText={props.loadingText}
          onGenerateImagePrompts={props.onGenerateImagePrompts}
          onCopyToClipboard={props.onCopyToClipboard}
        />
      </TabsContent>

      {/* Analysis Tab */}
      <TabsContent value="analysis">
        <AnalysisTab
          contentToAnalyze={contentForAnalysis}
          seoScore={props.seoScore}
          readability={props.readability}
          plagiarismResult={props.plagiarismResult}
        />
      </TabsContent>
    </Tabs>
  );
};