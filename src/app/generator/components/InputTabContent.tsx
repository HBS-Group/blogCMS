
// app/generator/components/InputTabContent.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, ChevronDown, RefreshCw } from "lucide-react";
import { Tables } from "@/types/supabase"; // Ensure this path is correct

interface InputTabContentProps {
    primaryKeyword: string;
    setPrimaryKeyword: (value: string) => void;
    selectedCategoryId: string;
    setSelectedCategoryId: (value: string) => void;
    blogCategories: Tables<'blog_categories'>[];
    isCategoriesLoading: boolean;
    contentType: string;
    setContentType: (value: string) => void;
    targetCountry: string;
    setTargetCountry: (value: string) => void;
    targetLanguage: string;
    setTargetLanguage: (value: string) => void;
    articleTitle: string;
    setArticleTitle: (value: string) => void;
    suggestedTitles: string[];
    isTitleGenerating: boolean;
    onGenerateTitles: () => void;
    isLoading: boolean; // General loading state for disabling fields
}

export const InputTabContent: React.FC<InputTabContentProps> = ({
    primaryKeyword, setPrimaryKeyword,
    selectedCategoryId, setSelectedCategoryId, blogCategories, isCategoriesLoading,
    contentType, setContentType,
    targetCountry, setTargetCountry,
    targetLanguage, setTargetLanguage,
    articleTitle, setArticleTitle, suggestedTitles, isTitleGenerating, onGenerateTitles,
    isLoading,
}) => {
    return (
        <Card className="bg-gray-900/80 border-gray-800">
            <CardHeader>
                <CardTitle className="text-white">Content Setup</CardTitle>
                <CardDescription className="text-gray-400/80">Define the core topic, audience, and basic parameters for your content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-gray-200">
                {/* Primary Keyword */}
                <div className="space-y-2">
                    <Label htmlFor="primaryKeyword" className="font-semibold text-gray-300">Primary Keyword/Topic *</Label>
                    <Input
                        id="primaryKeyword"
                        placeholder="e.g., benefits of remote work for productivity"
                        required
                        value={primaryKeyword}
                        onChange={(e) => setPrimaryKeyword(e.target.value)}
                        disabled={isLoading}
                        className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500"
                    />
                </div>

                {/* Blog Category Dropdown */}
                <div className="space-y-2">
                    <Label htmlFor="blogCategory" className="font-semibold text-gray-300">Blog Category (Optional)</Label>
                    <Select
                        value={selectedCategoryId}
                        onValueChange={setSelectedCategoryId}
                        disabled={isLoading || isCategoriesLoading}
                    >
                        <SelectTrigger id="blogCategory" className="bg-gray-800/50 border-gray-700 text-white">
                            <SelectValue placeholder={isCategoriesLoading ? "Loading categories..." : "Select a category..."} />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                            {isCategoriesLoading ? (
                                <SelectItem value="loading" disabled>Loading...</SelectItem>
                            ) : blogCategories.length > 0 ? (
                                blogCategories.map((category) => (
                                    <SelectItem key={category.id} value={category.name}>
                                        {category.name}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="no-categories" disabled>No categories found</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* Content Type */}
                <div className="space-y-2">
                    <Label htmlFor="contentType" className="font-semibold text-gray-300">Content Goal/Type *</Label>
                    <Select required value={contentType} onValueChange={setContentType} disabled={isLoading}>
                        <SelectTrigger id="contentType" className="bg-gray-800/50 border-gray-700 text-white">
                            <SelectValue placeholder="Select content type..." />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="Blog Post">Blog Post / Article</SelectItem>
                            <SelectItem value="Product Review">Product Review</SelectItem>
                            <SelectItem value="How-To Guide">How-To Guide</SelectItem>
                            <SelectItem value="Listicle">Listicle</SelectItem>
                            <SelectItem value="Case Study">Case Study</SelectItem>
                            <SelectItem value="White Paper">White Paper</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Country & Language */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="targetCountry" className="font-semibold text-gray-300">Target Country/Region *</Label>
                        <Select required value={targetCountry} onValueChange={setTargetCountry} disabled={isLoading}>
                            <SelectTrigger id="targetCountry" className="bg-gray-800/50 border-gray-700 text-white">
                                <SelectValue placeholder="Select country..." />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectItem value="United States">United States</SelectItem>
                                <SelectItem value="Egypt">Egypt</SelectItem>
                                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                <SelectItem value="Canada">Canada</SelectItem>
                                <SelectItem value="Australia">Australia</SelectItem>
                                <SelectItem value="India">India</SelectItem>
                                <SelectItem value="Germany">Germany</SelectItem>
                                <SelectItem value="France">France</SelectItem>
                                <SelectItem value="Global">Global (Default English)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="targetLanguage" className="font-semibold text-gray-300">Target Language *</Label>
                        <Select required value={targetLanguage} onValueChange={setTargetLanguage} disabled={isLoading}>
                            <SelectTrigger id="targetLanguage" className="bg-gray-800/50 border-gray-700 text-white">
                                <SelectValue placeholder="Select language..." />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectItem value="English">English</SelectItem>
                                <SelectItem value="Arabic">Arabic</SelectItem>
                                <SelectItem value="French">French</SelectItem>
                                <SelectItem value="Spanish">Spanish</SelectItem>
                                <SelectItem value="German">German</SelectItem>
                                <SelectItem value="Hindi">Hindi</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Article Title */}
                <div className="space-y-2">
                    <Label htmlFor="articleTitle" className="font-semibold text-gray-300">Article Title (Optional - will be generated if blank)</Label>
                    <div className="flex flex-wrap sm:flex-nowrap gap-2 items-start">
                        <Input
                            id="articleTitle"
                            placeholder="Enter title or generate ideas..."
                            value={articleTitle}
                            onChange={(e) => setArticleTitle(e.target.value)}
                            disabled={isLoading}
                            className="flex-grow bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500"
                        />
                        <div className="flex-shrink-0 w-full sm:w-auto">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={!suggestedTitles.length && !isTitleGenerating ? onGenerateTitles : undefined}
                                        disabled={isLoading || !primaryKeyword}
                                        className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white"
                                    >
                                        {isTitleGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {isTitleGenerating ? "Generating..." : suggestedTitles.length > 0 ? "Suggestions" : "Generate Ideas"}
                                        {suggestedTitles.length > 0 && !isTitleGenerating && (<ChevronDown className="ml-2 h-4 w-4" />)}
                                    </Button>
                                </DropdownMenuTrigger>
                                {suggestedTitles.length > 0 && !isTitleGenerating && (
                                    <DropdownMenuContent align="end" className="w-[300px] sm:w-[400px] max-h-60 overflow-y-auto bg-gray-800 border-gray-700">
                                        {suggestedTitles.map((title, index) => (
                                            <DropdownMenuItem key={index} onSelect={() => setArticleTitle(title)} className="text-gray-200 hover:bg-gray-700">
                                                {title}
                                            </DropdownMenuItem>
                                        ))}
                                        <Separator className="bg-gray-700" />
                                        <DropdownMenuItem onSelect={onGenerateTitles} className="text-indigo-400 hover:bg-gray-700">
                                            <RefreshCw className="mr-2 h-4 w-4" /> Generate More
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                )}
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-gray-500">* Required fields for generation.</p>
            </CardContent>
        </Card>
    );
};