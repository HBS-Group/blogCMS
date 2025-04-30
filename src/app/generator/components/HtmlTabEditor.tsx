// app/generator/components/HtmlTab.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Loader2 } from "lucide-react";
import Editor from '@monaco-editor/react'; // Use the main editor component

interface HtmlTabProps {
    value: string | null | undefined;
    isLoading: boolean;
    onCopyToClipboard: (text: string | undefined | null, type?: string) => void;
    typeText: boolean; // true for plaintext, false for HTML
    readOnly?: boolean;
    onChangeValue?: (newContent: string) => void;
}

export const HtmlTabEditor: React.FC<HtmlTabProps> = ({
    value,
    isLoading,
    onCopyToClipboard,
    typeText,
    readOnly = false,
    onChangeValue,
}) => {
    const contentToDisplay = value || '';
    const canCopy = !!contentToDisplay && !isLoading;
    // *** Crucial: Set language correctly for Monaco ***
    const language = typeText ? 'plaintext' : 'html';
    const contentTypeLabel = typeText ? 'Text' : 'HTML';
    const titleAction = readOnly ? 'View' : 'Edit';
    const descriptionAction = readOnly
        ? `View the raw ${contentTypeLabel} content below.`
        : `Edit the ${contentTypeLabel} content below. Changes will reflect live in the Preview tab.`;

    const handleEditorChange = (newValue: string | undefined) => {
        if (!readOnly && onChangeValue && newValue !== undefined) {
            onChangeValue(newValue);
        }
    };

    // *** Refined Monaco Editor Options for IDE-like feel ***
    const editorOptions = {
        readOnly: readOnly || isLoading, // Editor is read-only if prop says so OR while loading parent data
        minimap: { enabled: true, scale: 1 }, // Show minimap
        wordWrap: 'on' as const,              // Enable word wrapping
        fontSize: 13,                        // Standard editor font size
        fontFamily: 'var(--font-geist-mono)', // Use consistent monospace font
        lineNumbers: 'on' as const,          // Show line numbers
        scrollBeyondLastLine: false,          // Don't scroll past the last line
        automaticLayout: true,                // Auto-resize editor to container
        renderLineHighlight: 'all' as const,  // Highlight current line fully
        scrollbar: {                          // Customize scrollbars slightly
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
        },
        padding: {                            // Add some internal padding
            top: 10,
            bottom: 10
        },
        // --- Features often expected (defaults are usually good, but can be explicit) ---
        suggest: {
            // Options for the suggestion widget (auto-complete)
            showMethods: true,
            showFunctions: true,
            showConstructors: true,
            showFields: true,
            showVariables: true,
            showClasses: true,
            showStructs: true,
            showInterfaces: true,
            showModules: true,
            showProperties: true,
            showEvents: true,
            showOperators: true,
            showUnits: true,
            showValues: true,
            showConstants: true,
            showEnums: true,
            showEnumMembers: true,
            showKeywords: true,
            showWords: true,
            showColors: true,
            showFiles: true,
            showFolders: true,
            showTypeParameters: true,
            showSnippets: true, // Enable snippet suggestions (like Emmet abbreviations)
        },
        suggestOnTriggerCharacters: true,     // Trigger suggestions on characters like '<', '.', etc.
        acceptSuggestionOnEnter: 'on' as const, // Accept suggestion with Enter key
        tabCompletion: 'on' as const,         // Enable suggestion completion with Tab key
        snippetSuggestions: 'inline' as const, // Show snippets inline with other suggestions

        // --- Auto-closing features (defaults are usually 'languageDefined') ---
        autoClosingBrackets: 'languageDefined' as const,
        autoClosingQuotes: 'languageDefined' as const,
        // Note: Auto-closing HTML tags is typically handled by the HTML language service itself,
        // activated when language="html" is set.

        // --- Formatting ---
        formatOnPaste: true, // Format content when pasting
        formatOnType: false, // Optional: format code automatically as you type (can be disruptive)

        // --- Other useful options ---
        mouseWheelZoom: true, // Allow zooming with Ctrl+MouseWheel
        multiCursorModifier: 'alt' as const, // Use Alt+Click for multi-cursor
    };

    return (
        <Card className="flex flex-col h-[calc(70vh)] bg-gray-900/80 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-700 bg-gray-800/50 shrink-0">
                <div>
                    <CardTitle className="text-base text-white">{titleAction} Raw {contentTypeLabel}</CardTitle>
                    <CardDescription className="mt-1 text-xs text-gray-400/80">
                        {descriptionAction}
                    </CardDescription>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    onClick={() => onCopyToClipboard(contentToDisplay, `Raw ${contentTypeLabel}`)}
                    disabled={!canCopy}
                    title={`Copy raw ${contentTypeLabel}`}
                >
                    <Copy className="mr-2 h-4 w-4 text-indigo-400" /> Copy {contentTypeLabel}
                </Button>
            </CardHeader>
            <CardContent className="p-0 grow overflow-hidden">
                <Editor
                    height="100%"
                    language={language}
                    value={contentToDisplay}
                    onChange={handleEditorChange}
                    theme="vs-dark"
                    options={editorOptions}
                    loading={
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading Editor...
                        </div>
                    }
                />
            </CardContent>
        </Card>
    );
};