'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Briefcase,
  CheckSquare,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Tables } from '@/types/supabase';

// Define types for our component
type StatType = {
  id: number;
  name: string;
  value: number;
  icon: React.ReactElement;
  change: string;
  changeType: 'increase' | 'decrease';
};

type LeadType = {
  id: number;
  name: string;
  company: string | null;
  email: string | null;
  status: string | null;
  date: string | null;
};

interface DashboardProps {
  initialStats: {
    totalLeads: number;
    totalContacts: number;
    activeDeals: number;
    completedTasks: number;
  };
  initialLeads: Tables<'leads'>[];
  loading: boolean;
}

// Helper function to format a single lead (deterministic, fine for SSR)
const formatLeadData = (lead: Tables<'leads'>): LeadType => ({
  id: lead.id,
  name: lead.name || 'Unknown',
  company: lead.company || 'N/A',
  email: lead.email || 'N/A',
  status: lead.status || 'New',
  date: lead.created_at ? new Date(lead.created_at).toISOString().split('T')[0] : 'N/A',
});

// Base configuration for stats (icons, names, ids)
const BASE_STAT_CONFIG = [
  { id: 1, name: 'Total Leads', icon: <UserPlus className="w-8 h-8 text-indigo-400" /> },
  { id: 2, name: 'Total Contacts', icon: <Users className="w-8 h-8 text-purple-400" /> },
  { id: 3, name: 'Active Deals', icon: <Briefcase className="w-8 h-8 text-indigo-400" /> },
  { id: 4, name: 'Completed Tasks', icon: <CheckSquare className="w-8 h-8 text-purple-400" /> },
];

// Helper to map prop values to stat names for easier access
const mapInitialStatsToValues = (currentInitialStats: DashboardProps['initialStats']): Record<string, number> => ({
  'Total Leads': currentInitialStats.totalLeads,
  'Total Contacts': currentInitialStats.totalContacts,
  'Active Deals': currentInitialStats.activeDeals,
  'Completed Tasks': currentInitialStats.completedTasks,
});


export default function Dashboard({ initialStats, initialLeads, loading }: DashboardProps) {
  // Initialize stats with placeholder for 'change' to ensure SSR/client match
  const [stats, setStats] = useState<StatType[]>(() => {
    const statValues = mapInitialStatsToValues(initialStats);
    return BASE_STAT_CONFIG.map(config => ({
      ...config,
      value: statValues[config.name] ?? 0,
      change: '...', // Placeholder for SSR and initial client render
      changeType: 'increase', // Default, will be updated client-side
    }));
  });

  useEffect(() => {
    // This effect runs only on the client, after hydration.
    // It updates the stats with actual values from props and random 'change' values.
    const getPercentageChange = () => {
      const change = Math.floor(Math.random() * 16) + 5;
      return `+${change}%`;
    };

    const statValues = mapInitialStatsToValues(initialStats);
    const clientSideStats = BASE_STAT_CONFIG.map(config => ({
      ...config,
      value: statValues[config.name] ?? 0,
      change: getPercentageChange(),
      changeType: 'increase' as 'increase' | 'decrease', // For demo, always 'increase'
    }));

    setStats(clientSideStats);
  }, [initialStats]); // Re-run if initialStats prop changes

  // Derive recentLeads using useMemo (deterministic, fine for SSR)
  const recentLeads: LeadType[] = useMemo(() => {
    const sortedLeads = [...initialLeads].sort((a, b) => {
      if (!a.created_at) return 1;
      if (!b.created_at) return -1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return sortedLeads.map(formatLeadData);
  }, [initialLeads]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.id} className="p-6 border border-gray-700 bg-gray-800/60 backdrop-blur-sm rounded-lg shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-gray-300 truncate">
                  {stat.name}
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {loading ? '...' : stat.value}
                </div>
                <div
                  className={cn(
                    'text-sm mt-1',
                    stat.changeType === 'increase' ? 'text-green-400' : 'text-red-400'
                  )}
                >
                  {/* Show placeholder if loading, otherwise show the (client-generated) change */}
                  {loading ? '...' : stat.change}
                </div>
              </div>
              <div>{stat.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 border border-gray-700 bg-gray-800/60 backdrop-blur-sm rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold mb-4 text-white">Recent Leads</h2>
        {loading ? (
          <div className="text-center py-4 text-gray-400">Loading leads data...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Name</TableHead>
                <TableHead className="text-gray-300">Company</TableHead>
                <TableHead className="text-gray-300">Email</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Date Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLeads.length > 0 ? (
                recentLeads.map((lead) => (
                  <TableRow key={lead.id} className="border-gray-700">
                    <TableCell className="text-gray-200">{lead.name}</TableCell>
                    <TableCell className="text-gray-200">{lead.company}</TableCell>
                    <TableCell className="text-gray-200">{lead.email}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300">
                        {lead.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-200">{lead.date}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-gray-400">
                    No leads found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}