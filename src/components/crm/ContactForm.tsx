"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Contact } from '@/app/crm/page'; // Adjust path if needed
import { Loader2 } from 'lucide-react';

interface ContactFormProps {
    initialData?: Contact | null; // Contact data for editing, null for adding
    onSubmit: (formData: Omit<Contact, 'id'> & { id?: string }) => void; // Callback on successful submit
    onCancel: () => void; // Callback to close the form/modal
    isSubmitting?: boolean; // Optional flag to disable button during submission
}

export function ContactForm({ initialData, onSubmit, onCancel, isSubmitting = false }: ContactFormProps) {
    const [formData, setFormData] = useState<Omit<Contact, 'id'>>({
        name: '',
        email: '',
        phone: '',
        company: '',
        type: 'client', // Default type
    });

    useEffect(() => {
        // Pre-fill form if initialData is provided (for editing)
        if (initialData) {
            setFormData({
                name: initialData.name,
                email: initialData.email || '',
                phone: initialData.phone || '',
                company: initialData.company || '',
                type: initialData.type,
            });
        } else {
            // Reset form for adding
             setFormData({ name: '', email: '', phone: '', company: '', type: 'client' });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: 'client' | 'company') => {
        setFormData(prev => ({ ...prev, type: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            alert("Name is required."); // Basic validation
            return;
        }
        onSubmit({ ...formData, id: initialData?.id }); // Include id if editing
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="name" className="text-gray-300">Name <span className="text-red-500">*</span></Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="e.g., John Doe"
                />
            </div>
            <div>
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="e.g., john.doe@example.com"
                />
            </div>
            <div>
                <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="e.g., 123-456-7890"
                />
            </div>
            <div>
                <Label htmlFor="company" className="text-gray-300">Company</Label>
                <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="e.g., Acme Corporation"
                />
            </div>
            <div>
                <Label className="text-gray-300">Type <span className="text-red-500">*</span></Label>
                 <Select value={formData.type} onValueChange={handleSelectChange} required>
                    <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select contact type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="text-gray-300 border-gray-600 hover:bg-gray-700">
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {initialData ? 'Save Changes' : 'Add Contact'}
                </Button>
            </div>
        </form>
    );
}