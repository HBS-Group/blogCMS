import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from 'next/link';
import { Mail, Send, TrendingUp } from 'lucide-react'; // Added TrendingUp for a general marketing icon

export default function MarketingDashboard() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      {/* Header Card */}
      <Card className="mb-6 bg-gradient-to-br from-purple-900/50 to-violet-800/50 border-purple-800/50">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-purple-300" />
            <div>
              <CardTitle className="text-2xl font-bold text-white">
                Marketing Dashboard
              </CardTitle>
              <CardDescription className="text-purple-200/90">
                Tools to power your email campaigns and outreach.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm hover:border-indigo-500/50 transition-colors">
          <CardHeader>
            <Mail className="h-8 w-8 text-indigo-400 mb-3" />
            <CardTitle className="text-xl text-white">Generate Email Content</CardTitle>
            <CardDescription className="text-gray-400">
              Use AI to craft compelling email copy for various purposes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-lg hover:shadow-indigo-500/20 transition-all">
              <Link href="/emailgenerator">
                <Mail className="mr-2 h-4 w-4" /> Generate Email
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm hover:border-teal-500/50 transition-colors">
          <CardHeader>
            <Send className="h-8 w-8 text-teal-400 mb-3" />
            <CardTitle className="text-xl text-white">Send Emails</CardTitle>
            <CardDescription className="text-gray-400">
              Compose and send professional emails to your audience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-teal-500/20 transition-all">
              <Link href="/sendEmail">
                <Send className="mr-2 h-4 w-4" /> Send Email
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}