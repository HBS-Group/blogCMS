'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import Dashboard from './components/Dashboard';
import LeadManagement from './components/LeadManagement';
import ContactManagement from './components/ContactManagement';
import DealManagement from './components/DealManagement';
import TaskManagement from './components/TaskManagement';
import Reports from './components/Reports';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Tables } from '@/types/supabase';

// Define types for our data
interface CrmData {
  leads: Tables<'leads'>[];
  contacts: Tables<'contacts'>[];
  deals: Tables<'deals'>[];
  tasks: Tables<'tasks'>[];
  stats: {
    totalLeads: number;
    totalContacts: number;
    activeDeals: number;
    completedTasks: number;
  };
}

export default function CRMPage() {
  const [data, setData] = useState<CrmData>({
    leads: [],
    contacts: [],
    deals: [],
    tasks: [],
    stats: {
      totalLeads: 0,
      totalContacts: 0,
      activeDeals: 0,
      completedTasks: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrmData = async () => {
      setLoading(true);
      const supabase = createClient();
      
      try {
        // Fetch leads
        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });
          
        // Fetch contacts
        const { data: contactsData, error: contactsError } = await supabase
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: false });
          
        // Fetch deals
        const { data: dealsData, error: dealsError } = await supabase
          .from('deals')
          .select('*')
          .order('created_at', { ascending: false });
          
        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });
          
        // Calculate stats
        const activeDeals = dealsData?.filter(deal => 
          deal.stage !== 'Closed Won' && deal.stage !== 'Closed Lost'
        ).length || 0;
        
        const completedTasks = tasksData?.filter(task => 
          task.status === 'Completed'
        ).length || 0;
        
        setData({
          leads: leadsData || [],
          contacts: contactsData || [],
          deals: dealsData || [],
          tasks: tasksData || [],
          stats: {
            totalLeads: leadsData?.length || 0,
            totalContacts: contactsData?.length || 0,
            activeDeals,
            completedTasks
          }
        });
        
        if (leadsError || contactsError || dealsError || tasksError) {
          console.error('Error fetching CRM data:', { leadsError, contactsError, dealsError, tasksError });
        }
      } catch (error) {
        console.error('Error in CRM data fetching:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCrmData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white p-4 md:p-6 lg:p-8">
      <div className="max-w-screen-xl mx-auto py-8 px-4">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">CRM System</h1>
            <p className="text-gray-400">Manage your leads, contacts, and deals</p>
          </div>
        </div>

        <Card className="p-6 shadow-lg border border-gray-800 bg-gray-900/70 backdrop-blur-sm rounded-xl">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid grid-cols-6 gap-2 mb-6 p-1 rounded-lg bg-gray-800/60 border-gray-700">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">Dashboard</TabsTrigger>
              <TabsTrigger value="leads" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">Leads</TabsTrigger>
              <TabsTrigger value="contacts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">Contacts</TabsTrigger>
              <TabsTrigger value="deals" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">Deals</TabsTrigger>
              <TabsTrigger value="tasks" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">Tasks</TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="p-4 rounded-lg border border-gray-700 bg-gray-800/40">
              <Dashboard 
                initialStats={data.stats}
                initialLeads={data.leads} 
                loading={loading} 
              />
            </TabsContent>
            <TabsContent value="leads" className="p-4 rounded-lg border border-gray-700 bg-gray-800/40">
              <LeadManagement 
                initialLeads={data.leads} 
                loading={loading} 
              />
            </TabsContent>
            <TabsContent value="contacts" className="p-4 rounded-lg border border-gray-700 bg-gray-800/40">
              <ContactManagement 
                initialContacts={data.contacts} 
                loading={loading} 
              />
            </TabsContent>
            <TabsContent value="deals" className="p-4 rounded-lg border border-gray-700 bg-gray-800/40">
              <DealManagement 
                initialDeals={data.deals} 
                loading={loading} 
              />
            </TabsContent>
            <TabsContent value="tasks" className="p-4 rounded-lg border border-gray-700 bg-gray-800/40">
              <TaskManagement 
                initialTasks={data.tasks} 
                loading={loading} 
              />
            </TabsContent>
            <TabsContent value="reports" className="p-4 rounded-lg border border-gray-700 bg-gray-800/40">
              <Reports 
                leads={data.leads}
                deals={data.deals}
                contacts={data.contacts}
                tasks={data.tasks}
                loading={loading} 
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
