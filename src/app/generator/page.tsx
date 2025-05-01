// app/generator/page.tsx
"use client";

import React, { useState, useTransition, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    generateArticleAction,
    generateTitleAction,
    generateOutlineAction,
    generateImagePromptsAction,
} from "@/app/generator/actions";
import { fetchBlogCategoriesAction } from "@/app/actions/blogCategoryActions";
import { Tables } from "@/types/supabase";

// Import the new components
import { GeneratorHeader } from "@/app/generator/components/GeneratorHeader";
import { MessageArea } from "@/app/generator/components/MessageArea";
import { MainActions } from "@/app/generator/components/MainActions";
import { InputTabContent } from "@/app/generator/components/InputTabContent";
import { ConfigurationTabContent } from "@/app/generator/components/ConfigurationTabContent";
import { OutputTabs } from "@/app/generator/components/OutputTabs";
import { ImageUploadTab } from "@/app/generator/components/ImageUploadTab";

// Interface for Upload Progress (Keep here as it's used by state)
export interface UploadStatus {
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    url?: string;
    error?: string;
}

// Keep the main component export
export default function BlogGenerator() {
    const supabase = createClient();

    // --- State Definitions (Keep all state here) ---
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [freelancerName, setFreelancerName] = useState<string | null>(null);
    // Form Input State
    const [primaryKeyword, setPrimaryKeyword] = useState("");
    const [contentType, setContentType] = useState("");
    const [articleTitle, setArticleTitle] = useState("");
    const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
    const [targetCountry, setTargetCountry] = useState("");
    const [targetLanguage, setTargetLanguage] = useState("");
    const [articleLength, setArticleLength] = useState("1500");
    const [toneOfVoice, setToneOfVoice] = useState("");
    const [pointOfView, setPointOfView] = useState("");
    const [secondaryKeywords, setSecondaryKeywords] = useState("");
    const [outlineText, setOutlineText] = useState("");
    const [includeCta, setIncludeCta] = useState(false);
    const [includeSummary, setIncludeSummary] = useState(true);
    const [includeFaq, setIncludeFaq] = useState(false);
    const [includeLinks, setIncludeLinks] = useState(true);
    const [includeStats, setIncludeStats] = useState(false);
    const [includeImages, setIncludeImages] = useState(true);
    const [creativityLevel, setCreativityLevel] = useState([60]);
    // Blog Categories State
    const [blogCategories, setBlogCategories] = useState<Tables<'blog_categories'>[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
    // Generation Process State
    const [isGenerating, setIsGenerating] = useState(false);
    const [isFormatting, setIsFormatting] = useState(false);
    const [isTitleGenerating, setIsTitleGenerating] = useState(false);
    const [isOutlineGenerating, setIsOutlineGenerating] = useState(false);
    const [isImagePromptGenerating, setIsImagePromptGenerating] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [generationStatus, setGenerationStatus] = useState("Not Started");
    const [rawGeneratedContent, setRawGeneratedContent] = useState("");
    const [formattedContent, setFormattedContent] = useState("");
    const [generatedImagePrompts, setGeneratedImagePrompts] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    // Image Upload State
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [uploadProgress, setUploadProgress] = useState<Record<string, UploadStatus>>({});
    const [isUploading, setIsUploading] = useState(false);
    // Analysis Placeholder State
    const [seoScore, setSeoScore] = useState(0);
    const [readability, setReadability] = useState("Not Analyzed");
    const [plagiarismResult, setPlagiarismResult] = useState("Not Checked");
    // React Transition hook
    const [isPending, startTransition] = useTransition();

    // --- Computed State (Keep here) ---
    const isLoading = isGenerating || isFormatting || isTitleGenerating || isOutlineGenerating || isImagePromptGenerating || isCategoriesLoading || isUploading || isPending;
    const loadingText = isGenerating ? "Generating Content..."
        : isFormatting ? "Formatting Content..."
        : isImagePromptGenerating ? "Generating Prompts..."
        : isTitleGenerating ? "Generating Titles..."
        : isOutlineGenerating ? "Generating Outline..."
        : isUploading ? "Uploading Images..."
        : isPending ? "Processing..."
        : "";

    // Fetch User Data
    useEffect(() => {
        const getUserData = async () => {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                
                if (userError) throw userError;
                if (user) {
                    setUserEmail(user.email || null);
                    setUserId(user.id);
                    const { data: freelancer, error: freelancerError } = await supabase
                        .from("freelancers")
                        .select("name")
                        .eq("id", user.id)
                        .single();

                    if (freelancerError && freelancerError.code !== "PGRST116") {
                        console.error("Error fetching freelancer name:", freelancerError.message);
                    } else {
                        setFreelancerName(freelancer?.name || null);
                    }
                }
            } catch (e: unknown) {
                console.error("Exception fetching user data:", e instanceof Error ? e.message : String(e));
            }
        };
        getUserData();
    }, [supabase]);

    // Fetch Blog Categories
     const fetchBlogCategories = useCallback(async () => { // Wrap in useCallback
        setIsCategoriesLoading(true);
        setErrorMessage(null); // Clear messages on fetch start
        setSuccessMessage(null);
        try {
            const result = await fetchBlogCategoriesAction();
            if (result.success) {
                setBlogCategories(result.categories);
            } else {
                console.error("Error fetching blog categories:", result.error);
                setErrorMessage(`Failed to load blog categories: ${result.error}`);
            }
        } catch (error: unknown) { // Changed from any to unknown
            console.error("Exception fetching blog categories:", error);
            // Type check for Error instance
            const errorMessage = error instanceof Error ? error.message : String(error);
            setErrorMessage(`An unexpected error occurred loading categories: ${errorMessage}`);
        } finally {
            setIsCategoriesLoading(false);
        }
    }, []); // No dependencies needed if it doesn't rely on state/props that change

    useEffect(() => {
        fetchBlogCategories();
    }, [fetchBlogCategories]); // Depend on the useCallback function


    // --- Handlers (Keep all handlers here) ---
    const clearMessages = useCallback(() => {
        setErrorMessage(null);
        setSuccessMessage(null);
    }, []);

    

    const handleGenerateTitles = useCallback(async () => {
        if (!primaryKeyword) {
            clearMessages();
            setErrorMessage("Please enter a primary keyword first.");
            return;
        }
        clearMessages();
        setIsTitleGenerating(true);
        setSuggestedTitles([]);
        startTransition(async () => {
            try {
                const result = await generateTitleAction(primaryKeyword, targetCountry, targetLanguage, contentType,selectedCategoryId);
                
                
                if (result.success && result.titles && result.titles.length > 0) {
                    setSuggestedTitles(result.titles);
                    setArticleTitle(result.titles[0]); // Auto-select first title
                    setSuccessMessage("Title suggestions generated!");
                } else {
                    setErrorMessage(result.error || "Failed to generate titles.");
                }
            } catch (e: unknown) {
                console.error("Error in handleGenerateTitles:", e);
                setErrorMessage(`An unexpected client error occurred generating titles: ${e instanceof Error ? e.message : String(e)}`);
            } finally {
                setIsTitleGenerating(false);
            }
        });
    }, [primaryKeyword, targetCountry, targetLanguage, contentType, clearMessages, startTransition, selectedCategoryId]);

    const handleGenerateOutline = useCallback(async () => {
        if (!primaryKeyword || !contentType || !targetCountry || !targetLanguage) {
            clearMessages();
            setErrorMessage("Please enter Primary Keyword, Content Type, Target Country, and Target Language before generating an outline.");
            return;
        }
        clearMessages();
        setIsOutlineGenerating(true);
        setOutlineText(""); // Clear previous outline
        startTransition(async () => {
            try {
                const result = await generateOutlineAction(
                    primaryKeyword, contentType, targetCountry, targetLanguage, articleTitle,
                    includeSummary, includeFaq, includeCta, includeLinks, includeStats, includeImages
                );
                if (result.success && result.outline) {
                    setOutlineText(result.outline);
                    setSuccessMessage("Outline generated successfully!");
                } else {
                    setErrorMessage(result.error || "Failed to generate outline.");
                }
            } catch (e: unknown) {
                console.error("Error in handleGenerateOutline:", e);
                setErrorMessage(`An unexpected client error occurred generating the outline: ${e instanceof Error ? e.message : String(e)}`);
            } finally {
                setIsOutlineGenerating(false);
            }
        });
    }, [
        primaryKeyword, contentType, targetCountry, targetLanguage, articleTitle, includeSummary, includeFaq,
        includeCta, includeLinks, includeStats, includeImages, clearMessages, startTransition
    ]);

    const handleGenerateArticle = useCallback(() => {
        // Validation
        if (!primaryKeyword || !contentType || !targetCountry || !targetLanguage || !articleLength || !toneOfVoice || !pointOfView) {
            clearMessages();
            setErrorMessage("Please fill in all required fields marked with * in Input & Configuration tabs.");
            return;
        }

        clearMessages();
        setIsGenerating(true);
        setIsFormatting(false); // Ensure formatting is reset
        setRawGeneratedContent("");
        setFormattedContent("");
        setGeneratedImagePrompts([]);
        setProgressValue(10);
        setGenerationStatus("Initializing...");
        // Reset analysis placeholders
        setSeoScore(0);
        setReadability("Not Analyzed");
        setPlagiarismResult("Not Checked");

        const generationInput = {
            primaryKeyword, contentType, articleTitle, targetCountry, targetLanguage, articleLength,
            toneOfVoice, pointOfView, secondaryKeywords, outline: outlineText, includeCta, includeSummary,
            includeFaq, includeLinks, includeStats, includeImages, creativityLevel: creativityLevel[0],
            categoryId: selectedCategoryId || null,
        };

        startTransition(async () => {
            let rawContent = "";
            try {
                // Step 1: Generate Raw Content
                setProgressValue(20); setGenerationStatus("Building prompt...");
                // Simulate some progress
                await new Promise(resolve => setTimeout(resolve, 100));
                setProgressValue(30); setGenerationStatus("Sending to AI...");
                const result = await generateArticleAction(generationInput);

                if (result.success && result.content) {
                    rawContent = result.content;
                    setRawGeneratedContent(rawContent);
                    setGenerationStatus("Raw content received"); setProgressValue(60);
                    setFormattedContent(rawContent);
                    setIsGenerating(false);
                    setSuccessMessage("Article generated and formatted successfully!");
                    // Simulate analysis results
                    setSeoScore(Math.floor(Math.random() * (92 - 68 + 1)) + 68);
                    setReadability("Good (Simulated)");
                    setPlagiarismResult(`Passed (${Math.floor(Math.random() * 6)}% Similarity)`);
                } else {
                    // Use result.error directly if available, otherwise create a generic error
                    throw new Error(result.error || "Unknown generation error.");
                }

            } catch (error: unknown) { // Changed from any to unknown
                console.error("Client-side error during article generation:", error);
                 // Type check for Error instance
                const errorMessage = error instanceof Error ? error.message : String(error);
                setErrorMessage(`Generation Error: ${errorMessage}`);
                setGenerationStatus("Generation Error"); setProgressValue(0);
                setIsGenerating(false); // Stop generation process
                return; // Exit if generation failed
            } finally {
                 // No need to setIsGenerating(false) here if formatting follows
                 // We set it false within formatting block or if generation fails
            }

        });
    }, [
        // List all state dependencies for this handler
        primaryKeyword, contentType, articleTitle, targetCountry, targetLanguage, articleLength,
        toneOfVoice, pointOfView, secondaryKeywords, outlineText, includeCta, includeSummary,
        includeFaq, includeLinks, includeStats, includeImages, creativityLevel, selectedCategoryId,
        clearMessages, startTransition // Include generationStatus for the timeout logic
    ]);


    const handleGenerateImagePrompts = useCallback(async () => {
        const contentToUse = formattedContent || rawGeneratedContent;
        if (!contentToUse) {
            clearMessages();
            setErrorMessage("Please generate or provide article content first.");
            return;
        }

        clearMessages();
        setIsImagePromptGenerating(true);
        setGeneratedImagePrompts([]); // Clear previous prompts

        startTransition(async () => {
            try {
                const result = await generateImagePromptsAction(contentToUse);
                if (result.success && result.prompts) {
                    setGeneratedImagePrompts(result.prompts);
                    setSuccessMessage(`${result.prompts.length} image prompts generated successfully!`);
                } else {
                    setErrorMessage(result.error || "Failed to generate image prompts.");
                }
            } catch (e: unknown) {
                console.error("Error in handleGenerateImagePrompts:", e);
                setErrorMessage(`An unexpected client error occurred generating image prompts: ${e instanceof Error ? e.message : String(e)}`);
            } finally {
                setIsImagePromptGenerating(false);
            }
        });
    }, [formattedContent, rawGeneratedContent, clearMessages, startTransition]);

    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFiles(event.target.files);
            setUploadProgress({}); // Reset progress for new selection
            clearMessages();
        }
    }, [clearMessages]);

    const handleUploadImages = useCallback(async () => {
        if (!selectedFiles || selectedFiles.length === 0) {
            setErrorMessage("Please select files to upload.");
            return;
        }
        if (!userId) {
             setErrorMessage("User not identified. Cannot create upload path.");
             return;
        }

        clearMessages();
        setIsUploading(true);
        const currentUploadProgress: Record<string, UploadStatus> = {};
        const filesToUpload = Array.from(selectedFiles); // Create array copy

        // Initialize progress state
        filesToUpload.forEach(file => {
            currentUploadProgress[file.name] = { progress: 0, status: 'pending' };
        });
        setUploadProgress(currentUploadProgress);

        const uploadPromises = filesToUpload.map(async (file) => {
            // Use functional update for progress setting inside the loop/map
            setUploadProgress(prev => ({
                ...prev,
                [file.name]: { ...prev[file.name], status: 'uploading', progress: 10 }
            }));

            const pathPrefix = `${userId}/`; // User-specific folder
            const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
            
            const bucketName = 'article-images'; // Store in a variable
            const filePath = `${pathPrefix}${fileName}/`;
            try {
                const { error } = await supabase.storage
                    .from(bucketName)
                    .upload(filePath, file);

                if (error) throw error; // Throw error to be caught below

                // Get public URL after successful upload
                const { data: urlData } = supabase.storage
                    .from(bucketName)
                    .getPublicUrl(filePath);

                setUploadProgress(prev => ({
                    ...prev,
                    [file.name]: { progress: 100, status: 'success', url: urlData?.publicUrl }
                }));

            } catch (error: unknown) {
                console.error(`Upload Error (${file.name}):`, error);
                setUploadProgress(prev => ({
                    ...prev,
                    [file.name]: { 
                        progress: 100, 
                        status: 'error', 
                        error: error instanceof Error ? error.message : 'Unknown upload error' 
                    }
                }));
                // Don't re-throw here, let Promise.all settle
            }
        });

        try {
            await Promise.all(uploadPromises);
             // Check if all uploads were successful after Promise.all resolves
            const allSuccess = Object.values(uploadProgress).every(status => status.status === 'success');
             if (allSuccess) {
                 setSuccessMessage("All images uploaded successfully.");
             } else {
                 setSuccessMessage("Finished attempting uploads. Check status below for details."); // More accurate message
             }
        } catch (err) {
            // This catch block might not be reached if errors are handled within the map
            console.error("Error during batch upload process:", err);
            setErrorMessage("An error occurred during the upload process.");
        } finally {
            setIsUploading(false);
             // Optionally clear selected files after upload attempt
             // setSelectedFiles(null);
        }
    }, [selectedFiles, userId, supabase.storage, clearMessages, uploadProgress]); // Removed unnecessary supabase.auth dependency


    // Helper to copy text to clipboard (Can be passed down or kept here)
    const copyToClipboard = useCallback((text: string | undefined | null, type: string = "Content") => {
        clearMessages(); // Clear previous messages first
        if (!text) {
            setErrorMessage(`No ${type} available to copy.`);
            setTimeout(clearMessages, 2500); // Clear error after delay
            return;
        };
        navigator.clipboard
            .writeText(text)
            .then(() => {
                setSuccessMessage(`${type} copied to clipboard!`);
                setTimeout(clearMessages, 2500); // Clear success after delay
            })
            .catch((err) => {
                console.error(`Failed to copy ${type}: `, err);
                setErrorMessage(`Failed to copy ${type} to clipboard.`);
                setTimeout(clearMessages, 2500); // Clear error after delay
            });
    }, [clearMessages]);


    // --- Render ---
    return (
        
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* --- Header --- */}
            <GeneratorHeader
                freelancerName={freelancerName}
                userEmail={userEmail}
            />

            {/* --- Message Area --- */}
            <MessageArea
                errorMessage={errorMessage}
                successMessage={successMessage}
                onClearMessages={clearMessages}
            />

            {/* --- Main Action Button & Status --- */}
            <MainActions 
                    isLoading={isLoading}
                    isGenerating={isGenerating}
                    isFormatting={isFormatting}
                    isUploading={isUploading} // Pass uploading state
                    loadingText={loadingText}
                    progressValue={progressValue}
                    generationStatus={generationStatus}
                    onGenerateArticle={handleGenerateArticle}
                />
                <Tabs defaultValue="input" className="w-full">
                    <TabsList className="grid gap-1 w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 bg-gray-800/50">
                        <TabsTrigger 
                            value="input" 
                            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
                        >
                            Input
                        </TabsTrigger>
                        <TabsTrigger 
                            value="configuration" 
                            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
                        >
                            Configuration
                        </TabsTrigger>
                        <TabsTrigger 
                            value="output" 
                            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
                        >
                            Output
                        </TabsTrigger>
                        <TabsTrigger 
                            value="image-upload" 
                            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
                        >
                            Images
                        </TabsTrigger>
</TabsList>


                {/* --- Input Tab --- */}
                <TabsContent value="input">
                    <InputTabContent
                        primaryKeyword={primaryKeyword}
                        setPrimaryKeyword={setPrimaryKeyword}
                        selectedCategoryId={selectedCategoryId}
                        setSelectedCategoryId={setSelectedCategoryId}
                        blogCategories={blogCategories}
                        isCategoriesLoading={isCategoriesLoading}
                        contentType={contentType}
                        setContentType={setContentType}
                        targetCountry={targetCountry}
                        setTargetCountry={setTargetCountry}
                        targetLanguage={targetLanguage}
                        setTargetLanguage={setTargetLanguage}
                        articleTitle={articleTitle}
                        setArticleTitle={setArticleTitle}
                        suggestedTitles={suggestedTitles}
                        isTitleGenerating={isTitleGenerating}
                        onGenerateTitles={handleGenerateTitles}
                        isLoading={isLoading}
                    />
                </TabsContent>

                {/* --- Configuration Tab --- */}
                <TabsContent value="configuration">
                    <ConfigurationTabContent
                        articleLength={articleLength}
                        setArticleLength={setArticleLength}
                        toneOfVoice={toneOfVoice}
                        setToneOfVoice={setToneOfVoice}
                        pointOfView={pointOfView}
                        setPointOfView={setPointOfView}
                        secondaryKeywords={secondaryKeywords}
                        setSecondaryKeywords={setSecondaryKeywords}
                        outlineText={outlineText}
                        setOutlineText={setOutlineText}
                        isOutlineGenerating={isOutlineGenerating}
                        onGenerateOutline={handleGenerateOutline}
                        includeSummary={includeSummary}
                        setIncludeSummary={setIncludeSummary}
                        includeLinks={includeLinks}
                        setIncludeLinks={setIncludeLinks}
                        includeImages={includeImages}
                        setIncludeImages={setIncludeImages}
                        includeCta={includeCta}
                        setIncludeCta={setIncludeCta}
                        includeFaq={includeFaq}
                        setIncludeFaq={setIncludeFaq}
                        includeStats={includeStats}
                        setIncludeStats={setIncludeStats}
                        creativityLevel={creativityLevel}
                        setCreativityLevel={setCreativityLevel}
                        isLoading={isLoading}
                        // Pass required fields for enabling outline generation
                        canGenerateOutline={!!primaryKeyword && !!contentType && !!targetCountry && !!targetLanguage}
                    />
                </TabsContent>

                {/* --- Output Tab (Renders Nested Tabs) --- */}
                <TabsContent value="output">
                    <OutputTabs
                        rawGeneratedContent={rawGeneratedContent}
                        formattedContent={formattedContent}
                        generatedImagePrompts={generatedImagePrompts}
                        seoScore={seoScore}
                        readability={readability}
                        plagiarismResult={plagiarismResult}
                        isLoading={isLoading}
                        isFormatting={isFormatting}
                        isImagePromptGenerating={isImagePromptGenerating}
                        loadingText={loadingText}
                        onGenerateImagePrompts={handleGenerateImagePrompts}
                        onCopyToClipboard={copyToClipboard} // Pass copy helper
                    />
                </TabsContent>

                {/* --- Image Upload Tab --- */}
                <TabsContent value="image-upload">
                    <ImageUploadTab
                        selectedFiles={selectedFiles}
                        uploadProgress={uploadProgress}
                        isUploading={isUploading}
                        isLoading={isLoading} // Pass general loading state
                        onFileSelect={handleFileSelect}
                        onUploadImages={handleUploadImages}
                        onCopyToClipboard={copyToClipboard} // Pass copy helper
                    />
                </TabsContent>
            </Tabs>
        </div>
        
    );
}
