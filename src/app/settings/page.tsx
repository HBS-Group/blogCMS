import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Blog Settings
          </CardTitle>
          <CardDescription className="text-gray-400/90">
            Configure your blog preferences and appearance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="blog-name" className="text-gray-300">Blog Name</Label>
            <Input 
              id="blog-name" 
              placeholder="Enter blog name" 
              className="bg-gray-800/50 border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Input 
              id="description" 
              placeholder="Enter blog description" 
              className="bg-gray-800/50 border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-indigo-500/20 transition-all">
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}