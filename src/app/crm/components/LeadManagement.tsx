'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

import { toast } from 'sonner'; // Updated import for Sonner
import { createClient } from '@/utils/supabase/client';
import { Tables } from '@/types/supabase';

interface Lead {
  id: number | null;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  source: string;
}

interface LeadManagementProps {
  initialLeads: Tables<'leads'>[];
  loading: boolean;
}

const statusColors: Record<Lead['status'], string> = {
  New: 'bg-indigo-500/20 text-indigo-300',
  Contacted: 'bg-purple-500/20 text-purple-300',
  Qualified: 'bg-green-500/20 text-green-300',
  Lost: 'bg-red-500/20 text-red-300',
};

export default function LeadManagement({ initialLeads, loading: initialLoading }: LeadManagementProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(initialLoading);

  // Initialize leads from props
  useEffect(() => {
    if (initialLeads && initialLeads.length > 0) {
      const formattedLeads = initialLeads.map(lead => ({
        id: lead.id,
        name: lead.name || '',
        company: lead.company || '',
        email: lead.email || '',
        phone: lead.phone || '',
        status: (lead.status as Lead['status']) || 'New',
        source: lead.source || '',
      }));
      setLeads(formattedLeads);
    }
  }, [initialLeads]);

  const openDialog = (lead: Lead | null) => {
    setCurrentLead(
      lead ?? {
        id: null,
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'New',
        source: '',
      }
    );
    setDialogOpen(true);
  };

  const saveLead = async () => {
    if (!currentLead) return;
    
    setLoading(true);
    const supabase = createClient();
    
    try {
      if (currentLead.id) {
        // Update existing lead
        const { error } = await supabase
          .from('leads')
          .update({
            name: currentLead.name,
            company: currentLead.company,
            email: currentLead.email,
            phone: currentLead.phone,
            status: currentLead.status,
            source: currentLead.source,
          })
          .eq('id', currentLead.id);
          
        if (error) throw error;
        
        // Update local state
        setLeads(prev =>
          prev.map(l => (l.id === currentLead.id ? currentLead : l))
        );
        
        // Updated toast notification using Sonner
        toast.success('Lead updated', {
          description: 'Lead has been successfully updated.'
        });
      } else {
        // Create new lead
        const { data, error } = await supabase
          .from('leads')
          .insert({
            name: currentLead.name,
            company: currentLead.company,
            email: currentLead.email,
            phone: currentLead.phone,
            status: currentLead.status,
            source: currentLead.source,
          })
          .select();
          
        if (error) throw error;
        
        // Update local state with the returned data
        if (data && data.length > 0) {
          setLeads(prev => [...prev, { ...currentLead, id: data[0].id }]);
        }
        
        // Updated toast notification using Sonner
        toast.success('Lead created', {
          description: 'New lead has been successfully created.'
        });
      }
    } catch (error) {
      console.error('Error saving lead:', error);
      // Updated error toast notification using Sonner
      toast.error('Error', {
        description: 'There was an error saving the lead. Please try again.'
      });
    } finally {
      setLoading(false);
      setDialogOpen(false);
    }
  };

  const deleteLead = async (id: number | null) => {
    if (!id) return;
    
    setLoading(true);
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setLeads(prev => prev.filter(l => l.id !== id));
      
      // Updated toast notification using Sonner
      toast.success('Lead deleted', {
        description: 'Lead has been successfully deleted.'
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
      // Updated error toast notification using Sonner
      toast.error('Error', {
        description: 'There was an error deleting the lead. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(l =>
    [l.name, l.email, l.company, l.status].some(field =>
      field.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Lead Management</h1>
        <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600" onClick={() => openDialog(null)}>
          <Plus className="w-4 h-4 mr-2" /> Add Lead
        </Button>
      </div>

      <div className="flex justify-between gap-4 mb-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search leads..."
            className="pl-10 bg-gray-800/60 border-gray-700 text-gray-200 placeholder:text-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-gray-700 bg-gray-800/60 text-gray-200 hover:bg-gray-700/60">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
            <DropdownMenuItem className="text-gray-200 focus:bg-gray-700" onSelect={() => setSearchQuery('')}>All Leads</DropdownMenuItem>
            <DropdownMenuItem className="text-gray-200 focus:bg-gray-700" onSelect={() => setSearchQuery('New')}>New</DropdownMenuItem>
            <DropdownMenuItem className="text-gray-200 focus:bg-gray-700" onSelect={() => setSearchQuery('Contacted')}>Contacted</DropdownMenuItem>
            <DropdownMenuItem className="text-gray-200 focus:bg-gray-700" onSelect={() => setSearchQuery('Qualified')}>Qualified</DropdownMenuItem>
            <DropdownMenuItem className="text-gray-200 focus:bg-gray-700" onSelect={() => setSearchQuery('Lost')}>Lost</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading leads data...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">Name</TableHead>
              <TableHead className="text-gray-300">Company</TableHead>
              <TableHead className="text-gray-300">Email</TableHead>
              <TableHead className="text-gray-300">Phone</TableHead>
              <TableHead className="text-gray-300">Status</TableHead>
              <TableHead className="text-gray-300">Source</TableHead>
              <TableHead className="text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="border-gray-700">
                  <TableCell className="text-gray-200">{lead.name}</TableCell>
                  <TableCell className="text-gray-200">{lead.company}</TableCell>
                  <TableCell className="text-gray-200">{lead.email}</TableCell>
                  <TableCell className="text-gray-200">{lead.phone}</TableCell>
                  <TableCell>
                    <Badge className={cn("px-2 py-1 text-xs rounded", statusColors[lead.status])}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-200">{lead.source}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-gray-700/60 text-gray-300"
                        onClick={() => openDialog(lead)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-gray-700/60"
                        onClick={() => deleteLead(lead.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-gray-400">
                  No leads found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-gray-800 border-gray-700 text-gray-200">
          <DialogHeader>
            <DialogTitle className="text-white">{currentLead?.id ? 'Edit Lead' : 'Add Lead'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-300">Name</Label>
              <Input
                id="name"
                className="bg-gray-700/60 border-gray-600 text-gray-200"
                value={currentLead?.name || ''}
                onChange={(e) =>
                  setCurrentLead({ ...currentLead!, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="company" className="text-gray-300">Company</Label>
              <Input
                id="company"
                className="bg-gray-700/60 border-gray-600 text-gray-200"
                value={currentLead?.company || ''}
                onChange={(e) =>
                  setCurrentLead({ ...currentLead!, company: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                className="bg-gray-700/60 border-gray-600 text-gray-200"
                value={currentLead?.email || ''}
                onChange={(e) =>
                  setCurrentLead({ ...currentLead!, email: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-gray-300">Phone</Label>
              <Input
                id="phone"
                className="bg-gray-700/60 border-gray-600 text-gray-200"
                value={currentLead?.phone || ''}
                onChange={(e) =>
                  setCurrentLead({ ...currentLead!, phone: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="status" className="text-gray-300">Status</Label>
              <Select
                value={currentLead?.status}
                onValueChange={(val) =>
                  setCurrentLead({
                    ...currentLead!,
                    status: val as Lead['status'],
                  })
                }
              >
                <SelectTrigger className="bg-gray-700/60 border-gray-600 text-gray-200" />
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectItem className="focus:bg-gray-700 text-gray-200" value="New">New</SelectItem>
                  <SelectItem className="focus:bg-gray-700 text-gray-200" value="Contacted">Contacted</SelectItem>
                  <SelectItem className="focus:bg-gray-700 text-gray-200" value="Qualified">Qualified</SelectItem>
                  <SelectItem className="focus:bg-gray-700 text-gray-200" value="Lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="source" className="text-gray-300">Source</Label>
              <Input
                id="source"
                className="bg-gray-700/60 border-gray-600 text-gray-200"
                value={currentLead?.source || ''}
                onChange={(e) =>
                  setCurrentLead({ ...currentLead!, source: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600" 
              onClick={saveLead}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
