// Updated version using shadcn/ui, lucide-react, Tailwind CSS
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Button,
} from '@/components/ui/button';
import {
  Input
} from '@/components/ui/input';
import {
  Textarea
} from '@/components/ui/textarea';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Avatar,
} from '@/components/ui/avatar';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Tables } from '@/types/supabase';

interface Contact {
  id: number | null;
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  notes: string;
}

interface ContactManagementProps {
  initialContacts: Tables<'contacts'>[];
  loading: boolean;
}

export default function ContactManagement({ initialContacts = [], loading: initialLoading = false }: ContactManagementProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(initialLoading);

  // Initialize contacts from props
  useEffect(() => {
    if (initialContacts && initialContacts.length > 0) {
      const formattedContacts = initialContacts.map(contact => ({
        id: contact.id,
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        title: contact.title || '',
        notes: contact.notes || '',
      }));
      setContacts(formattedContacts);
    }
  }, [initialContacts]);

  const openDialog = (contact?: Contact) => {
    setCurrentContact(contact ?? {
      id: null,
      name: '',
      email: '',
      phone: '',
      company: '',
      title: '',
      notes: '',
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setCurrentContact(null);
  };

  const saveContact = async () => {
    if (!currentContact) return;
    
    setLoading(true);
    const supabase = createClient();
    
    try {
      if (currentContact.id) {
        // Update existing contact
        const { error } = await supabase
          .from('contacts')
          .update({
            name: currentContact.name,
            email: currentContact.email,
            phone: currentContact.phone,
            company: currentContact.company,
            title: currentContact.title,
            notes: currentContact.notes,
          })
          .eq('id', currentContact.id);
          
        if (error) throw error;
        
        // Update local state
        setContacts(prev => prev.map(c => c.id === currentContact.id ? currentContact : c));
        toast.success('Contact updated');
      } else {
        // Create new contact
        const { data, error } = await supabase
          .from('contacts')
          .insert({
            name: currentContact.name,
            email: currentContact.email,
            phone: currentContact.phone,
            company: currentContact.company,
            title: currentContact.title,
            notes: currentContact.notes,
          })
          .select();
          
        if (error) throw error;
        
        // Update local state with the returned data
        if (data && data.length > 0) {
          setContacts(prev => [...prev, { ...currentContact, id: data[0].id }]);
        }
        toast.success('Contact added');
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      toast.error('Error', {
        description: 'There was an error saving the contact. Please try again.'
      });
    } finally {
      setLoading(false);
      closeDialog();
    }
  };

  const deleteContact = async (id: number) => {
    setLoading(true);
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setContacts(prev => prev.filter(c => c.id !== id));
      toast.success('Contact deleted');
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Error', {
        description: 'There was an error deleting the contact. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Contact Management</h2>
        <Button 
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600" 
          onClick={() => openDialog()}
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Contact
        </Button>
      </div>

      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
          <Input
            className="pl-8 bg-gray-800/60 border-gray-700 text-gray-200 placeholder:text-gray-500"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-gray-700 bg-gray-800/60 backdrop-blur-sm">
        <CardContent className="overflow-x-auto">
          {loading && !filteredContacts.length ? (
            <div className="text-center py-8 text-gray-400">Loading contacts data...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Name</TableHead>
                  <TableHead className="text-gray-300">Company</TableHead>
                  <TableHead className="text-gray-300">Title</TableHead>
                  <TableHead className="text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-300">Phone</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.length > 0 ? (
                  filteredContacts.map(contact => (
                    <TableRow key={contact.id} className="border-gray-700">
                      <TableCell className="flex items-center space-x-2 text-gray-200">
                        <Avatar className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500" />
                        <span className="font-medium">{contact.name}</span>
                      </TableCell>
                      <TableCell className="text-gray-200">{contact.company}</TableCell>
                      <TableCell className="text-gray-200">{contact.title}</TableCell>
                      <TableCell className="text-gray-200">{contact.email}</TableCell>
                      <TableCell className="text-gray-200">{contact.phone}</TableCell>
                      <TableCell className="space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-gray-700/60 text-gray-300" 
                          onClick={() => openDialog(contact)}
                          disabled={loading}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-gray-700/60" 
                          onClick={() => deleteContact(contact.id!)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-400">
                      No contacts found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-gray-200">
          <DialogHeader>
            <DialogTitle className="text-white">{currentContact?.id ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
            <DialogDescription className="text-gray-400">Fill in the contact details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Full name"
              className="bg-gray-700/60 border-gray-600 text-gray-200"
              value={currentContact?.name || ''}
              onChange={(e) => setCurrentContact({ ...currentContact!, name: e.target.value })}
            />
            <Input
              placeholder="Company"
              className="bg-gray-700/60 border-gray-600 text-gray-200"
              value={currentContact?.company || ''}
              onChange={(e) => setCurrentContact({ ...currentContact!, company: e.target.value })}
            />
            <Input
              placeholder="Job title"
              className="bg-gray-700/60 border-gray-600 text-gray-200"
              value={currentContact?.title || ''}
              onChange={(e) => setCurrentContact({ ...currentContact!, title: e.target.value })}
            />
            <Input
              type="email"
              placeholder="Email address"
              className="bg-gray-700/60 border-gray-600 text-gray-200"
              value={currentContact?.email || ''}
              onChange={(e) => setCurrentContact({ ...currentContact!, email: e.target.value })}
            />
            <Input
              placeholder="Phone number"
              className="bg-gray-700/60 border-gray-600 text-gray-200"
              value={currentContact?.phone || ''}
              onChange={(e) => setCurrentContact({ ...currentContact!, phone: e.target.value })}
            />
            <Textarea
              placeholder="Additional notes"
              className="bg-gray-700/60 border-gray-600 text-gray-200"
              value={currentContact?.notes || ''}
              onChange={(e) => setCurrentContact({ ...currentContact!, notes: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600" 
              onClick={saveContact}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" className="text-gray-300 hover:bg-gray-700/60">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}