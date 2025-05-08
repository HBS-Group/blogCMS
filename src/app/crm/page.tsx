// "use client";

// import React, { useState, useMemo, useEffect } from "react";
// import {
//   Card, CardContent, CardDescription, CardHeader, CardTitle
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Table, TableBody, TableCell, TableHeader, TableRow ,TableHead } from "@/components/ui/table";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue  } from "@/components/ui/select";
// import { Loader2, Users, Building, Search, PlusCircle, Mail, FileUp, Edit, Trash2 } from "lucide-react";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
// } from "@/components/ui/dialog";
// import { EmailDialog } from "@/components/crm/EmailDialog"; // Import the new dialog
// import { ContactForm } from "@/components/crm/ContactForm";
// import { v4 as uuidv4 } from 'uuid';

// // --- Types ---
// // Make Contact exportable if ContactForm is in a different file structure
// export interface Contact { // Added export
//   id: string;
//   name: string;
//   email?: string;
//   phone?: string;
//   company?: string;
//   type: 'client' | 'company';
// }

// // --- Mock Data (Replace with actual data fetching later) ---
// const MOCK_CONTACTS: Contact[] = [
//   { id: '1', name: 'Alice Wonderland', email: 'alice@example.com', phone: '123-456-7890', company: 'Wonder Industries', type: 'client' },
//   { id: '2', name: 'Bob The Builder', email: 'bob@build.co', phone: '987-654-3210', type: 'client' },
//   { id: '3', name: 'Cheshire Cat Co.', email: 'info@cheshire.co', type: 'company' },
//   { id: '4', name: 'Mad Hatter Inc.', phone: '555-TEA-TIME', type: 'company' },
//   { id: '5', name: 'Queen of Hearts', email: 'queen@royal.gov', company: 'Royal Court', type: 'client' },
// ];

// // --- Component ---
// export default function CrmContactsPage() {
//   // --- State ---
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterType, setFilterType] = useState<"all" | "client" | "company">("all");
//   const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
//   const [isLoading, setIsLoading] = useState(false); // Keep for potential future API calls
//   const [errorMessage, setErrorMessage] = useState<string | null>(null); // Keep for potential future API calls
//   const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingContact, setEditingContact] = useState<Contact | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false); // State for email dialog
//   const [emailRecipients, setEmailRecipients] = useState<string[]>([]); // State for email recipients

//   // --- Derived State ---
//   const filteredContacts = useMemo(() => {
//     return contacts.filter(contact => {
//       const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                             contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                             contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchesType = filterType === 'all' || contact.type === filterType;
//       return matchesSearch && matchesType;
//     });
//   }, [contacts, searchTerm, filterType]);

//   const isAllVisibleSelected = useMemo(() => {
//       return filteredContacts.length > 0 && filteredContacts.every(contact => selectedContacts.has(contact.id));
//   }, [filteredContacts, selectedContacts]);

//   // --- Handlers ---

//   // Open modal for adding
//   const handleAddContactClick = () => {
//     setEditingContact(null); // Ensure we are adding, not editing
//     setIsModalOpen(true);
//   };

//   // Open modal for editing
//   const handleEditContactClick = (contact: Contact) => {
//     setEditingContact(contact);
//     setIsModalOpen(true);
//   };

//   // Save or Update Contact
//   const handleSaveContact = async (formData: Omit<Contact, 'id'> & { id?: string }) => {
//     setIsSubmitting(true);
//     setErrorMessage(null);
//     // Simulate API call
//     await new Promise(resolve => setTimeout(resolve, 500));
//     try {
//       if (formData.id) {
//         // Update existing contact
//         setContacts(prev => prev.map(c => c.id === formData.id ? { ...c, ...formData } : c));
//       } else {
//         // Add new contact
//         const newContact: Contact = { ...formData, id: uuidv4() };
//         setContacts(prev => [newContact, ...prev]);
//       }
//       setIsModalOpen(false); // Close modal on success
//       setEditingContact(null); // Reset editing state
//     } catch (error) {
//       console.error("Failed to save contact:", error);
//       setErrorMessage("Failed to save contact. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//    // Delete Contact
//   const handleDeleteContact = (contactId: string) => {
//     // Optional: Add confirmation dialog here
//     if (window.confirm("Are you sure you want to delete this contact?")) {
//       setContacts(prev => prev.filter(c => c.id !== contactId));
//       setSelectedContacts(prev => {
//           const newSelection = new Set(prev);
//           newSelection.delete(contactId);
//           return newSelection;
//       });
//     }
//   };


//   const handleSelectContact = (contactId: string, checked: boolean | 'indeterminate') => { // Corrected type
//     setSelectedContacts(prev => {
//       const newSelection = new Set(prev);
//       if (checked === true) { // Explicitly check for true
//         newSelection.add(contactId);
//       } else {
//         newSelection.delete(contactId);
//       }
//       return newSelection;
//     });
//   };

//   const handleSelectAllVisible = (checked: boolean | 'indeterminate') => { // Corrected type
//       setSelectedContacts(prev => {
//           const newSelection = new Set(prev);
//           if (checked === true) { // Explicitly check for true
//               filteredContacts.forEach(contact => newSelection.add(contact.id));
//           } else {
//               // Clear only the visible ones if unchecked
//               filteredContacts.forEach(contact => newSelection.delete(contact.id));
//           }
//           return newSelection;
//       });
//   };

//   const handleSendEmail = (contact: Contact) => {
//     if (!contact.email) {
//       alert(`${contact.name} does not have an email address.`);
//       return;
//     }
//     console.log(`Opening email dialog for ${contact.name} (${contact.email})`);
//     setEmailRecipients([contact.email]); // Set single recipient
//     setIsEmailDialogOpen(true); // Open the dialog
//   };

//   const handleSendBulkEmail = () => {
//     if (selectedContacts.size === 0) return;
//     const selectedEmails = Array.from(selectedContacts)
//       .map(id => contacts.find(c => c.id === id)?.email)
//       .filter((email): email is string => !!email); // Type guard to ensure emails are strings

//     if (selectedEmails.length === 0) {
//         alert("None of the selected contacts have email addresses.");
//         return;
//     }

//     console.log(`Opening email dialog for ${selectedEmails.length} contacts`);
//     setEmailRecipients(selectedEmails); // Set multiple recipients
//     setIsEmailDialogOpen(true); // Open the dialog
//     // Clear selection after opening dialog? Optional.
//     // setSelectedContacts(new Set());
//   };

//   // --- NEW: Handler for actually sending the email via API ---
//   const handleSendEmailSubmit = async (subject: string, body: string) => {
//     console.log("Attempting to send email via API...");
//     console.log("Recipients:", emailRecipients);
//     console.log("Subject:", subject);
//     // console.log("Body:", body); // Avoid logging potentially large body

//     // **BACKEND INTEGRATION POINT**
//     // Replace this with your actual API call
//     try {
//       const response = await fetch('/api/send-email', { // Your API endpoint
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           to: emailRecipients,
//           subject,
//           text: body, // Or use 'html: body' if sending HTML content
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({ message: 'Failed to send email. Check server logs.' }));
//         throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
//       }

//       // Handle success
//       console.log("Email sent successfully via API");
//       alert("Email sent successfully!"); // Provide user feedback
//       setIsEmailDialogOpen(false); // Close the dialog on success
//       setSelectedContacts(new Set()); // Clear selection after sending bulk email

//     } catch (error) {
//       console.error("API Error sending email:", error);
//       // The error will be displayed within the EmailDialog component
//       throw error; // Re-throw error so EmailDialog can catch it and display message
//     }
//   };


//   const handleImportExcel = () => {
//       // TODO: Implement Excel import logic (e.g., using a library like 'xlsx')
//       console.log("Import from Excel clicked");
//       alert("Excel import functionality not yet implemented.");
//   };


//   // Clear selection when filters change or modal closes
//   useEffect(() => {
//       setSelectedContacts(new Set());
//   }, [searchTerm, filterType, isModalOpen]);


//   // --- Render ---
//   return (
//     <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
//       <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white p-4 md:p-6 lg:p-8">
//         <div className="container mx-auto max-w-6xl">
//           {/* Header Card */
//           <Card className="mb-6 bg-gray-900/70 border-gray-800 backdrop-blur-sm shadow-xl">
//             <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
//               <div>
//                 <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
//                   <Users className="h-7 w-7" /> CRM Contacts
//                 </CardTitle>
//                 <CardDescription className="text-gray-400 mt-1">
//                   Manage your clients and company contacts.
//                 </CardDescription>
//               </div>
//               <div className="flex flex-wrap gap-2">
//                    <Button onClick={handleImportExcel} variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-900/30 hover:text-blue-300">
//                       <FileUp className="mr-2 h-4 w-4" /> Import Excel
//                    </Button>
//                    <Button
//                       onClick={handleSendBulkEmail} // Updated handler
//                       disabled={selectedContacts.size === 0}
//                       className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
//                    >
//                       <Mail className="mr-2 h-4 w-4" /> Send Bulk Email ({selectedContacts.size})
//                    </Button>
//                    {/* Use DialogTrigger for Add/Edit modal */}
//                    <DialogTrigger asChild>
//                        <Button onClick={handleAddContactClick} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white">
//                          <PlusCircle className="mr-2 h-4 w-4" /> Add Contact
//                        </Button>
//                    </DialogTrigger>
//               </div>
//             </CardHeader>
//           </Card>

//           {/* Filter/Search Card (Ensure this section is present) */}
//           <Card className="bg-gray-900/70 border-gray-800 backdrop-blur-sm shadow-lg mb-8">
//             <CardHeader>
//               <CardTitle className="text-white text-xl">Filter & Search</CardTitle>
//             </CardHeader>
//             <CardContent className="flex flex-col md:flex-row gap-4">
//               <div className="flex-grow space-y-2">
//                 <Label htmlFor="search" className="text-gray-300">Search</Label>
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                   <Input
//                     id="search"
//                     type="text"
//                     placeholder="Search by name, email, company..."
//                     value={searchTerm}
//                     onChange={e => setSearchTerm(e.target.value)}
//                     className="bg-gray-800/60 border-gray-700 text-white pl-10" // Added padding for icon
//                   />
//                 </div>
//               </div>
//               <div className="space-y-2 md:w-1/4"> {/* Adjusted width */}
//                 <Label className="text-gray-300">Type</Label>
//                 <Select value={filterType} onValueChange={(value: "all" | "client" | "company") => setFilterType(value)}>
//                   <SelectTrigger className="w-full bg-gray-800/60 border-gray-700 text-white">
//                     <SelectValue placeholder="Filter by type" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-gray-800 border-gray-700 text-white">
//                     <SelectItem value="all">All Types</SelectItem>
//                     <SelectItem value="client">Clients</SelectItem>
//                     <SelectItem value="company">Companies</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Contacts Table Card */}
//           <Card className="bg-gray-900/80 border-gray-800">
//             <CardHeader>
//               <CardTitle className="text-white text-xl">Contact List</CardTitle>
//               {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
//             </CardHeader>
//             <CardContent className="p-0"> {/* Remove padding for full-width table */}
//               <ScrollArea className="h-[60vh] w-full"> {/* Adjust height as needed */}
//                 <Table>
//                   <TableHeader className="sticky top-0 bg-gray-900/90 backdrop-blur-sm z-10"> {/* Removed comment from here */}
//                     <TableRow className="border-gray-700 hover:bg-gray-800/50">
//                       <TableHead className="w-[50px] px-4">
//                         <Checkbox
//                           checked={
//                             filteredContacts.length > 0 && isAllVisibleSelected
//                               ? true
//                               : filteredContacts.length > 0 && selectedContacts.size > 0 && !isAllVisibleSelected
//                               ? 'indeterminate' // Set indeterminate state if some but not all are selected
//                               : false
//                           }
//                           onCheckedChange={handleSelectAllVisible}
//                           aria-label="Select all visible rows"
//                           className="border-gray-600 data-[state=checked]:bg-cyan-500 data-[state=indeterminate]:bg-cyan-800 data-[state=checked]:border-cyan-500 data-[state=indeterminate]:border-cyan-700"
//                         />
//                       </TableHead>
//                       <TableHead className="text-cyan-300">Name</TableHead>
//                       <TableHead className="text-cyan-300">Email</TableHead>
//                       <TableHead className="text-cyan-300">Phone</TableHead>
//                       <TableHead className="text-cyan-300">Company</TableHead>
//                       <TableHead className="text-cyan-300">Type</TableHead>
//                       <TableHead className="text-right text-cyan-300 pr-4">Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {isLoading ? (
//                       <TableRow>
//                         <TableCell colSpan={7} className="text-center py-10">
//                           <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
//                         </TableCell>
//                       </TableRow>
//                     ) : filteredContacts.length > 0 ? (
//                       filteredContacts.map((contact) => (
//                         <TableRow key={contact.id} className="border-gray-800 hover:bg-gray-800/40">
//                           <TableCell className="px-4">
//                             <Checkbox
//                               checked={selectedContacts.has(contact.id)}
//                               onCheckedChange={(checked) => handleSelectContact(contact.id, checked)} // Pass checked directly
//                               aria-label={`Select row for ${contact.name}`}
//                               className="border-gray-600 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
//                             />
//                           </TableCell>
//                           <TableCell className="font-medium text-gray-100 flex items-center gap-2">
//                             {contact.type === 'client' ? <Users className="h-4 w-4 text-cyan-400" /> : <Building className="h-4 w-4 text-blue-400" />}
//                             {contact.name}
//                           </TableCell>
//                           <TableCell className="text-gray-300">{contact.email || '-'}</TableCell>
//                           <TableCell className="text-gray-300">{contact.phone || '-'}</TableCell>
//                           <TableCell className="text-gray-300">{contact.company || '-'}</TableCell>
//                           <TableCell className="text-gray-300 capitalize">{contact.type}</TableCell>
//                           <TableCell className="text-right pr-4">
//                              {/* Add Mail button back if desired, using the updated handleSendEmail */}
//                              <Button variant="ghost" size="icon" className="text-purple-400 hover:text-purple-300 hover:bg-gray-700/50" onClick={() => handleSendEmail(contact)} disabled={!contact.email} title="Send Email">
//                                <Mail className="h-4 w-4" />
//                              </Button>
//                              <Button variant="ghost" size="icon" className="text-cyan-400 hover:text-cyan-300 hover:bg-gray-700/50 ml-1" onClick={() => handleEditContactClick(contact)} title="Edit Contact">
//                                <Edit className="h-4 w-4" />
//                              </Button>
//                              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400 hover:bg-gray-700/50 ml-1" onClick={() => handleDeleteContact(contact.id)} title="Delete Contact">
//                                <Trash2 className="h-4 w-4" />
//                              </Button>
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     ) : (
//                       <TableRow>
//                         <TableCell colSpan={7} className="text-center text-gray-500 py-10">
//                           No contacts found matching your criteria.
//                         </TableCell>
//                       </TableRow>
//                     )}
//                   </TableBody>
//                 </Table>
//               </ScrollArea>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Dialog Content for Add/Edit Form */}
//       <DialogContent className="sm:max-w-[425px] bg-gray-800 border-gray-700 text-white">
//         <DialogHeader>
//           <DialogTitle>{editingContact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
//           <DialogDescription>
//             {editingContact ? 'Update the details for this contact.' : 'Fill in the details for the new contact.'}
//           </DialogDescription>
//         </DialogHeader>
//         {/* Pass necessary props to ContactForm */}
//         <ContactForm
//           initialData={editingContact}
//           onSubmit={handleSaveContact}
//           onCancel={() => setIsModalOpen(false)}
//           isSubmitting={isSubmitting}
//         />
//          {errorMessage && <p className="text-red-500 text-sm mt-2 px-6">{errorMessage}</p>}
//       </DialogContent>
//     </Dialog>
//   );

//       {/* Email Dialog (can be placed outside the main layout div) */}
//       <EmailDialog
//         isOpen={isEmailDialogOpen}
//         onOpenChange={setIsEmailDialogOpen}
//         recipients={emailRecipients}
//         onSend={handleSendEmailSubmit} // Pass the new handler
//       />
//     </>
//   );