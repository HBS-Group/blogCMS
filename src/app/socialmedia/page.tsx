"use client";

import React, { useState, useMemo } from "react"; // Import useMemo
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs,  TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Copy, Twitter, Facebook, Instagram, Linkedin } from "lucide-react";
import { generateSocialPostsAction } from "./actions"; // Adjust the path if needed

const SOCIAL_PLATFORMS = [
  { key: "twitter", label: "Twitter", icon: <Twitter className="h-4 w-4" /> },
  { key: "facebook", label: "Facebook", icon: <Facebook className="h-4 w-4" /> },
  { key: "instagram", label: "Instagram", icon: <Instagram className="h-4 w-4" /> },
  { key: "linkedin", label: "LinkedIn", icon: <Linkedin className="h-4 w-4" /> },
];

type GeneratedPosts = Record<string, string[]>;

const TONES = [
  { key: "neutral", label: "Neutral - محايد"},
  { key: "friendly", label: "Friendly - ودود" },
  { key: "professional", label: "Professional - احترافي"},
  { key: "witty", label: "Witty - بارع"},
  { key: "inspirational", label: "Inspirational - ملهم"},
  { key: "marketing", label: "Marketing - تسويقي"},
  { key: "humorous", label: "Humorous - فكاهي"},
  { key: "informative", label: "Informative - إعلامي"},
  { key: "urgent", label: "Urgent - عاجل"},
  { key: "casual", label: "Casual - رسمي"},
  { key: "empathetic", label: "Empathetic - متعاطف"},
  { key: "authoritative", label: "Authoritative - موثوق"},
  { key: "playful", label: "Playful - مرح"},
  { key: "conversational", label: "Conversational - حواري"},
];

const LENGTHS = [
  { key: "short", label: "Short (under 100 words)" }, // Added detail for clarity
  { key: "medium", label: "Medium (100-150 words)" }, // Added detail for clarity
  { key: "long", label: "Long (150-200 words)" }, // Added detail for clarity
  { key: "Very Long", label: "Very Long (500-750 words)" }, // Added detail for clarity
];

const LANGUAGES = [ // Define available languages
  { key: "english", label: "English" },
  { key: "arabic", label: "Arabic" },
  { key: "french", label: "French" },
];

// Define accents for each language
const ACCENTS: Record<string, { key: string; label: string }[]> = {
  english: [
    { key: "american", label: "American" },
    { key: "british", label: "British" },
    { key: "australian", label: "Australian" },
    { key: "canadian", label: "Canadian" },
  ],
  arabic: [
    { key: "msa", label: "Modern Standard (MSA)" },
    { key: "egyptian", label: "Egyptian" },
    { key: "saudi", label: "Saudi (Najdi)" },
    { key: "levantine", label: "Levantine" },
    { key: "maghrebi", label: "Maghrebi" },
    { key: "algarian", label: "Algarian" },
  ],
  french: [
    { key: "parisian", label: "Parisian" },
    { key: "quebecois", label: "Canadian (Québécois)" },
    { key: "belgian", label: "Belgian" },
    { key: "swiss", label: "Swiss" },
  ],
};


// Add Hashtag Styles
const HASHTAG_STYLES = [
  { key: "mixed", label: "Mixed (Popular & Niche)" },
  { key: "popular", label: "Popular / Trending" },
  { key: "niche", label: "Niche / Specific" },
];

export default function SocialMediaGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("twitter");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPosts>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tone, setTone] = useState("neutral");
  const [length, setLength] = useState("medium");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [numberOfPosts, setNumberOfPosts] = useState<number>(3);
  const [language, setLanguage] = useState("english"); // Add state for language
  const [accent, setAccent] = useState(""); // Add state for accent
  const [targetAudience, setTargetAudience] = useState("");
  const [hashtagStyle, setHashtagStyle] = useState("mixed");
  const [callToAction, setCallToAction] = useState(""); // <-- Add state for CTA

  // Update available accents when language changes
  const availableAccents = useMemo(() => ACCENTS[language] || [], [language]);

  // Reset accent if the selected language doesn't have the current accent
  React.useEffect(() => {
      if (availableAccents.length > 0 && !availableAccents.find(a => a.key === accent)) {
          setAccent(availableAccents[0].key); // Default to the first available accent
      } else if (availableAccents.length === 0) {
          setAccent(""); // Clear accent if language has no defined accents
      }
  }, [language, availableAccents, accent]);


  const handleGenerate = async () => {
    setErrorMessage(null);
    if (!topic.trim()) {
      setErrorMessage("Please enter a topic or keywords.");
      return;
    }
    setIsGenerating(true);

    try {
      const result = await generateSocialPostsAction({
        topic,
        platform,
        tone,
        length,
        numberOfPosts,
        language,
        accent: availableAccents.length > 0 ? accent : undefined,
        targetAudience: targetAudience.trim() || undefined,
        hashtagStyle: hashtagStyle,
        callToAction: callToAction.trim() || undefined, // <-- Pass CTA, undefined if empty
      });

      if (result.success) {
        setGeneratedPosts({ [platform]: result.posts || [] });
        setHashtags(result.hashtags || []);
      } else {
        setErrorMessage(result.error || "Failed to generate posts.");
      }
    } catch (err) {
      console.error("Error generating posts:", err);
      setErrorMessage("An error occurred while generating posts.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white p-4 md:p-6 lg:p-8">
      <div className="container mx-auto max-w-3xl">
        <Card className="mb-6 bg-gray-900/70 border-gray-800 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Social Media Posts Generator
            </CardTitle>
            <CardDescription className="text-gray-400">
              Instantly generate engaging posts for your favorite social platforms.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-gray-900/70 border-gray-800 backdrop-blur-sm shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-white text-xl">Generate Posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Topic Input */}
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-gray-300">Topic / Keywords</Label>
              <Input
                id="topic"
                type="text"
                placeholder="e.g. AI in Marketing"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                disabled={isGenerating}
                className="bg-gray-800/60 border-gray-700 text-white"
              />
            </div>
            {/* Target Audience Input */}
            <div className="space-y-2">
              <Label htmlFor="targetAudience" className="text-gray-300">Target Audience (Optional)</Label>
              <Input
                id="targetAudience"
                type="text"
                placeholder="e.g. Small business owners, students, tech enthusiasts"
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
                disabled={isGenerating}
                className="bg-gray-800/60 border-gray-700 text-white"
              />
            </div>
            {/* --- End Target Audience Input --- */}

            {/* Call to Action Input */}
            <div className="space-y-2">
              <Label htmlFor="callToAction" className="text-gray-300">Call to Action (Optional)</Label>
              <Input
                id="callToAction"
                type="text"
                placeholder="e.g. Learn more, Sign up, Visit our website"
                value={callToAction}
                onChange={e => setCallToAction(e.target.value)}
                disabled={isGenerating}
                className="bg-gray-800/60 border-gray-700 text-white"
              />
            </div>
            {/* --- End Call to Action Input --- */}

            {/* Tone and Length Row */}
            <div className="flex flex-col md:flex-row gap-4">
            </div>
              {/* Tone Select */}
              <div className="flex-1 space-y-2">
                <Label className="text-gray-300">Tone</Label>
                <select
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-gray-800/60 border-gray-700 text-white rounded px-3 py-2"
                >
                  {TONES.map(t => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
              </div>
              {/* Length Select */}
              <div className="flex-1 space-y-2">
                <Label className="text-gray-300">Length</Label>
                <select
                  value={length}
                  onChange={e => setLength(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-gray-800/60 border-gray-700 text-white rounded px-3 py-2"
                >
                  {LENGTHS.map(l => (
                    <option key={l.key} value={l.key}>{l.label}</option>
                  ))}
                </select>
              </div>
              {/* Number of Posts and Hashtag Style */}
              <div className="flex flex-col md:flex-row gap-4">
                 {/* Number of Posts Input */}
                 <div className="flex-1 space-y-2">
                   <Label htmlFor="numberOfPosts" className="text-gray-300">Number of Posts</Label>
                   <Input
                     id="numberOfPosts"
                     type="number"
                     min="1"
                     max="10"
                     value={numberOfPosts}
                     onChange={e => setNumberOfPosts(parseInt(e.target.value, 10) || 1)}
                     disabled={isGenerating}
                     className="w-full bg-gray-800/60 border-gray-700 text-white rounded px-3 py-2"
                   />
                 </div>
                 {/* Hashtag Style Select */}
                 <div className="flex-1 space-y-2">
                   <Label className="text-gray-300">Hashtag Style</Label>
                   <select
                     value={hashtagStyle} // <-- Now correctly references state
                     onChange={e => setHashtagStyle(e.target.value)} // <-- Now correctly references state setter
                     disabled={isGenerating}
                     className="w-full bg-gray-800/60 border-gray-700 text-white rounded px-3 py-2"
                   >
                     {HASHTAG_STYLES.map(style => (
                       <option key={style.key} value={style.key}>{style.label}</option>
                     ))}
                   </select>
                 </div>
              </div>

            {/* Language and Accent Select */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Language Select */}
                <div className="flex-1 space-y-2">
                    <Label className="text-gray-300">Language</Label>
                    <select
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      disabled={isGenerating}
                      className="w-full bg-gray-800/60 border-gray-700 text-white rounded px-3 py-2"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang.key} value={lang.key}>{lang.label}</option>
                      ))}
                    </select>
                </div>
                {/* Accent Select (Conditional) */}
                <div className="flex-1 space-y-2">
                    <Label className="text-gray-300">Accent</Label>
                    <select
                      value={accent}
                      onChange={e => setAccent(e.target.value)}
                      disabled={isGenerating || availableAccents.length === 0} // Disable if no accents for language
                      className="w-full bg-gray-800/60 border-gray-700 text-white rounded px-3 py-2 disabled:opacity-50"
                    >
                      {availableAccents.length === 0 ? (
                          <option value="">N/A for selected language</option>
                      ) : (
                          availableAccents.map(acc => (
                              <option key={acc.key} value={acc.key}>{acc.label}</option>
                          ))
                      )}
                    </select>
                </div>
            </div>

            {/* Platform Tabs */}
            <div className="space-y-2">
              <Label className="text-gray-300">Platform</Label>
              <Tabs value={platform} onValueChange={setPlatform} className="w-full">
                <TabsList className="grid grid-cols-4 bg-gray-800/60">
                  {SOCIAL_PLATFORMS.map(p => (
                    <TabsTrigger key={p.key} value={p.key} className="data-[state=active]:bg-indigo-900/50 data-[state=active]:text-indigo-300 flex items-center gap-2">
                      {p.icon}
                      {p.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
            >
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isGenerating ? "Generating..." : "Generate Posts"}
            </Button>
            {errorMessage && (
              <div className="text-red-400 text-sm mt-2">{errorMessage}</div>
            )}
          </CardContent>
        </Card>

        {/* Hashtag Suggestions */}
        <Card className="bg-gray-900/80 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-lg">Hashtag Suggestions</CardTitle>
            <CardDescription className="text-gray-400">Relevant hashtags for your topic (click to copy)</CardDescription> {/* Updated description */}
          </CardHeader>
          <CardContent>
            {hashtags.length ? (
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, idx) => (
                  // Change span to button and add onClick
                  <button
                    key={idx}
                    onClick={() => handleCopy(tag)}
                    className="bg-indigo-700/30 text-indigo-200 px-3 py-1 rounded-full text-sm font-medium hover:bg-indigo-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-150"
                    title={`Copy ${tag}`} // Add tooltip
                  >
                    {tag}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">Hashtags will appear here after generation.</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Generated Posts</CardTitle>
            <CardDescription className="text-gray-400">Copy and use these posts on your selected platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 rounded-md border border-gray-700 p-4 bg-gray-800/40">
              {generatedPosts[platform]?.length ? (
                <ul className="space-y-4">
                  {generatedPosts[platform].map((post, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="flex-1 text-gray-200">{post}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        onClick={() => handleCopy(post)}
                        title="Copy post"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500 text-center py-10">
                  {isGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Generating posts...
                    </span>
                  ) : (
                    "Generated posts will appear here."
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}