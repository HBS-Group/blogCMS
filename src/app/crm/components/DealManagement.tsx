'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Filter, ArrowUpDown, DollarSign, Calendar, BarChart } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { Tables } from '@/types/supabase';

// Interfaces for the Deal and other data types
interface Deal {
  id: number | null;
  name: string;
  company: string;
  contactId: number | null; // Changed from string to number | null
  contactName: string; // Added to store contact name for display
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: string;
}

interface Contact {
  id: number;
  name: string;
  company?: string;
}

interface DealManagementProps {
  initialDeals: Tables<'deals'>[];
  loading: boolean;
}

const stages = ['Discovery', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

export default function DealManagement({ initialDeals = [], loading: initialLoading = false }: DealManagementProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [currentDeal, setCurrentDeal] = useState<Deal | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(initialLoading);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Initialize deals from props
  useEffect(() => {
    if (initialDeals && initialDeals.length > 0) {
      const formattedDeals = initialDeals.map(deal => ({
        id: deal.id,
        name: deal.name || '',
        company: deal.company_name || '',
        contactId: deal.contact_id || null,
        contactName: '', // Will be populated when contacts are loaded
        contactCompany: '', // Will be populated when contacts are loaded
        value: deal.value || 0,
        stage: deal.stage || 'Discovery',
        probability: deal.probability || 20,
        expectedCloseDate: deal.expected_close_date || new Date().toISOString().split('T')[0],
      }));
      setDeals(formattedDeals);
    }
  }, [initialDeals]);

  // Fetch contacts when component mounts
  useEffect(() => {
    const fetchContacts = async () => {
      setLoadingContacts(true);
      const supabase = createClient();
      
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('id, name, company')
          .order('name');
          
        if (error) throw error;
        
        setContacts(data || []);
        
        // Update deal contact names
        if (data && deals.length > 0) {
          setDeals(prevDeals => 
            prevDeals.map(deal => {
              const contact = data.find(c => c.id === deal.contactId);
              return {
                ...deal,
                contactName: contact ? contact.name : ''
              };
            })
          );
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast.error("Error", {
          description: "Failed to load contacts. Please refresh the page."
        });
      } finally {
        setLoadingContacts(false);
      }
    };
    
    fetchContacts();
  }, [deals.length]);

  const handleAddDeal = () => {
    setCurrentDeal({
      id: null,
      name: '',
      company: '',
      contactId: null,
      contactName: '',
      value: 0,
      stage: 'Discovery',
      probability: 20,
      expectedCloseDate: new Date().toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
  };

  const handleEditDeal = (deal: Deal) => {
    setCurrentDeal(deal);
    setIsDialogOpen(true);
  };

  const handleDeleteDeal = async (id: number | null) => {
    if (!id) return;
    
    setLoading(true);
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setDeals(prev => prev.filter(deal => deal.id !== id));
      
      toast.success("Deal deleted", {
        description: "The deal has been successfully removed."
      });
    } catch (error) {
      console.error('Error deleting deal:', error);
      toast.error("Error", {
        description: "There was an error deleting the deal. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDeal = async () => {
    if (!currentDeal) return;
    
    setLoading(true);
    const supabase = createClient();
    
    try {
      // Prepare data for Supabase
      const dealData = {
        name: currentDeal.name,
        company_name: currentDeal.company,
        contact_id: currentDeal.contactId,
        value: currentDeal.value,
        stage: currentDeal.stage,
        probability: currentDeal.probability,
        expected_close_date: currentDeal.expectedCloseDate,
      };
      
      if (currentDeal.id) {
        // Update existing deal
        const { error } = await supabase
          .from('deals')
          .update(dealData)
          .eq('id', currentDeal.id);
          
        if (error) throw error;
        
        // Update local state
        const contact = contacts.find(c => c.id === currentDeal.contactId);
        const updatedDeal = {
          ...currentDeal,
          contactName: contact ? contact.name : '',
          contactCompany: contact ? contact.company || '' : ''
        };
        
        setDeals(prev => prev.map(deal => 
          deal.id === currentDeal.id ? updatedDeal : deal
        ));
        
        toast.success("Deal updated", {
          description: "The deal has been successfully updated."
        });
      } else {
        // Create new deal
        const { data, error } = await supabase
          .from('deals')
          .insert(dealData)
          .select();
          
        if (error) throw error;
        
        // Update local state with the returned data
        if (data && data.length > 0) {
          const contact = contacts.find(c => c.id === currentDeal.contactId);
          const newDeal = {
            ...currentDeal,
            id: data[0].id,
            contactName: contact ? contact.name : '',
            contactCompany: contact ? contact.company || '' : ''
          };
          setDeals(prev => [...prev, newDeal]);
        }
        
        toast.success("Deal added", {
          description: "The new deal has been successfully added."
        });
      }
    } catch (error) {
      console.error('Error saving deal:', error);
      toast.error("Error", {
        description: "There was an error saving the deal. Please try again."
      });
    } finally {
      setLoading(false);
      setIsDialogOpen(false);
    }
  };

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const weightedValue = deals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Deal Management</h2>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="flex items-center gap-2 border-gray-700 bg-gray-800/60 text-gray-200 hover:bg-gray-700/60">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
          <Button 
            onClick={handleAddDeal} 
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            disabled={loading}
          >
            <Plus className="h-4 w-4" />
            <span>Add Deal</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-gray-700 bg-gray-800/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-indigo-400 mr-2" />
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">${totalValue.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-700 bg-gray-800/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Weighted Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart className="h-4 w-4 text-purple-400 mr-2" />
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">${Math.round(weightedValue).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-700 bg-gray-800/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-indigo-400 mr-2" />
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{deals.filter(deal => deal.stage !== 'Closed Won' && deal.stage !== 'Closed Lost').length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-700 bg-gray-800/60 backdrop-blur-sm">
        <CardContent className="">
          {loading && !deals.length ? (
            <div className="text-center py-8 text-gray-400">Loading deals data...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Deal Name</TableHead>
                  <TableHead className="text-gray-300">Company</TableHead>
                  <TableHead className="text-gray-300">Contact</TableHead>
                  <TableHead className="text-gray-300">
                    <div className="flex items-center">
                      Value
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-gray-300">Stage</TableHead>
                  <TableHead className="text-gray-300">Probability</TableHead>
                  <TableHead className="text-gray-300">Expected Close</TableHead>
                  <TableHead className="text-right text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.length > 0 ? (
                  deals.map((deal) => (
                    <TableRow key={deal.id} className="border-gray-700">
                      <TableCell className="font-medium text-gray-200">{deal.name}</TableCell>
                      <TableCell className="text-gray-200">{deal.company}</TableCell>
                      <TableCell className="text-gray-200">{deal.contactName}</TableCell>
                      <TableCell className="text-gray-200">${deal.value.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border-gray-700",
                          {
                            "from-green-500/20 to-green-500/20 text-green-300": deal.stage === "Closed Won",
                            "from-red-500/20 to-red-500/20 text-red-300": deal.stage === "Closed Lost",
                            "from-yellow-500/20 to-yellow-500/20 text-yellow-300": deal.stage === "Negotiation",
                            "from-blue-500/20 to-blue-500/20 text-blue-300": deal.stage === "Discovery"
                          }
                        )}>
                          {deal.stage}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-200">{deal.probability}%</TableCell>
                      <TableCell className="text-gray-200">{deal.expectedCloseDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="hover:bg-gray-700/60 text-gray-300" 
                            onClick={() => handleEditDeal(deal)}
                            disabled={loading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="hover:bg-gray-700/60" 
                            onClick={() => handleDeleteDeal(deal.id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-gray-400">
                      No deals found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-gray-800 border-gray-700 text-gray-200">
          <DialogHeader>
            <DialogTitle className="text-white">{currentDeal?.id ? 'Edit Deal' : 'Add New Deal'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {currentDeal?.id 
                ? 'Update the details of the existing deal.' 
                : 'Fill in the information to create a new deal.'}
            </DialogDescription>
          </DialogHeader>
          
          {currentDeal && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">Deal Name</Label>
                  <Input
                    id="name"
                    value={currentDeal.name}
                    onChange={(e) => setCurrentDeal({ ...currentDeal, name: e.target.value })}
                    placeholder="Deal Name"
                    className="bg-gray-700/60 border-gray-600 text-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-gray-300">Company</Label>
                  <Input
                    id="company"
                    value={currentDeal.company}
                    onChange={(e) => setCurrentDeal({ ...currentDeal, company: e.target.value })}
                    placeholder="Company"
                    className="bg-gray-700/60 border-gray-600 text-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-gray-300">Contact</Label>
                  <Select
                    value={currentDeal.contactId?.toString() || ""}
                    onValueChange={(value) => setCurrentDeal({ 
                      ...currentDeal, 
                      contactId: value ? parseInt(value) : null,
                      contactName: contacts.find(c => c.id === parseInt(value))?.name || ''
                    })}
                  >
                    <SelectTrigger id="contact" className="bg-gray-700/60 border-gray-600 text-gray-200">
                      <SelectValue placeholder="Select a contact" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                      {loadingContacts ? (
                        <SelectItem value="loading" disabled>Loading contacts...</SelectItem>
                      ) : contacts.length > 0 ? (
                        contacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id.toString()} className="focus:bg-gray-700 text-gray-200">
                            {contact.name} {contact.company ? `(${contact.company})` : ''}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-contacts" disabled>No contacts found</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value" className="text-gray-300">Deal Value</Label>
                  <Input
                    id="value"
                    type="number"
                    value={currentDeal.value}
                    onChange={(e) => setCurrentDeal({ ...currentDeal, value: Number(e.target.value) })}
                    placeholder="Deal Value"
                    className="bg-gray-700/60 border-gray-600 text-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stage" className="text-gray-300">Deal Stage</Label>
                  <Select
                    name="stage"
                    value={currentDeal.stage}
                    onValueChange={(value) => setCurrentDeal({ ...currentDeal, stage: value })}
                  >
                    <SelectTrigger className="bg-gray-700/60 border-gray-600 text-gray-200">
                      <SelectValue placeholder="Select Stage" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                      {stages.map((stage) => (
                        <SelectItem key={stage} value={stage} className="focus:bg-gray-700 text-gray-200">{stage}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="probability" className="text-gray-300">Probability</Label>
                  <Input
                    id="probability"
                    type="number"
                    value={currentDeal.probability}
                    onChange={(e) => setCurrentDeal({ ...currentDeal, probability: Number(e.target.value) })}
                    placeholder="Probability (%)"
                    className="bg-gray-700/60 border-gray-600 text-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedCloseDate" className="text-gray-300">Expected Close Date</Label>
                <Input
                  id="expectedCloseDate"
                  type="date"
                  value={currentDeal.expectedCloseDate}
                  onChange={(e) => setCurrentDeal({ ...currentDeal, expectedCloseDate: e.target.value })}
                  className="bg-gray-700/60 border-gray-600 text-gray-200"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)} className="bg-gray-700 hover:bg-gray-600 text-gray-200" disabled={loading}>Cancel</Button>
            <Button 
              onClick={handleSaveDeal} 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
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
