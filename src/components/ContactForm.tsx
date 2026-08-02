import React, { useMemo, useEffect } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { GuestIssue } from '../types';
import { STORE_LOCATIONS, STATE_OPTIONS } from '../data/locations';
import { supabase } from '../lib/supabase';

export function ContactForm() {
  const [formData, setFormData] = React.useState<GuestIssue>({
    name: '',
    contactType: 'opportunity',
    contactMethod: 'email',
    email: '',
    phone: '',
    date: '',
    state: '',
    city: '',
    address: '',
    storeNumber: '',
    issue: ''
  });
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Filter cities based on selected state
  const availableCities = useMemo(() => {
    if (!formData.state) return [];
    const cities = STORE_LOCATIONS.filter(loc => loc.state === formData.state).map(loc => loc.city);
    return Array.from(new Set(cities)).sort();
  }, [formData.state]);

  // Filter addresses based on selected state and city
  const availableAddresses = useMemo(() => {
    if (!formData.state || !formData.city) return [];
    return STORE_LOCATIONS.filter(loc => loc.state === formData.state && loc.city === formData.city);
  }, [formData.state, formData.city]);

  const selectedLocation = useMemo(() => {
    return STORE_LOCATIONS.find(loc => loc.storeNumber === formData.storeNumber);
  }, [formData.storeNumber]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Reset city and address if state changes
      if (name === 'state') {
        newData.city = '';
        newData.address = '';
        newData.storeNumber = '';
      }
      // Reset address if city changes
      if (name === 'city') {
        newData.address = '';
        newData.storeNumber = '';
      }
      if (name === 'storeNumber') {
        const location = STORE_LOCATIONS.find(loc => loc.storeNumber === value);
        newData.address = location ? location.address : '';
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. Save to Supabase for tracking
      if (supabase) {
        const issueRecord = {
          name: formData.name,
          contact_type: formData.contactType,
          contact_method: formData.contactMethod,
          email: formData.email,
          phone: formData.phone,
          date: formData.date,
          state: formData.state,
          city: formData.city,
          address: formData.address,
          store_number: formData.storeNumber,
          store_email: formData.storeNumber ? `ihop${formData.storeNumber}@opportunityrestaurantgroup.com` : null,
          intake_channel: 'Website Form',
          source: 'voiceoftheguest.com',
          issue: formData.issue
        };

        const { data, error: submitError } = await supabase.functions.invoke('public-intake', {
          body: { ...issueRecord, contact_type: formData.contactType === 'celebration' ? 'Celebration' : 'Opportunity', contact_method: formData.contactMethod === 'phone' ? 'Phone' : formData.contactMethod === 'text' ? 'Text' : 'Email', store_name: formData.storeNumber ? `IHOP ${formData.storeNumber}` : null },
        });
        if (submitError || !data?.ok) throw new Error(data?.error || submitError?.message || 'Failed to create case');
      } else {
        console.warn('Supabase not configured, skipping db insert. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
      }

      setIsSuccess(true);
    } catch (error) {
      console.error("Submission failed", error);
      alert("There was an issue submitting your report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    let successMessage = "";
    if (formData.contactMethod === 'email') {
      successMessage = "We have received your report. Please expect a message from feedback@voiceoftheguest.com and check your spam folder to make sure replies are going through if nothing is received in 24 hours.";
    } else {
      successMessage = "We have received your report. Please expect a call or text message from (555) 555-5555 within the next 24 hours.";
    }

    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 md:p-12 text-center animate-in fade-in zoom-in duration-500 shadow-sm max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <h3 className="text-3xl font-semibold text-green-900 mb-4 tracking-tight">Thank You</h3>
        <p className="text-green-800 text-lg leading-relaxed max-w-lg mx-auto">
          {successMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Type */}
        <div className="space-y-2">
          <label htmlFor="contactType" className="text-sm font-medium text-stone-700">Kind of Contact</label>
          <select
            id="contactType"
            name="contactType"
            value={formData.contactType}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none transition-all"
            required
          >
            <option value="opportunity">Opportunity (Feedback/Issue)</option>
            <option value="celebration">Celebration (Praise/Compliment)</option>
          </select>
        </div>

        {/* Name and Contact Method */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-stone-700">Full Name</label>
            <input 
              required
              type="text" 
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all"
              placeholder="Jane Doe"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="contactMethod" className="text-sm font-medium text-stone-700">Preferred Contact Method</label>
            <select 
              id="contactMethod"
              name="contactMethod"
              value={formData.contactMethod}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all bg-white"
            >
              <option value="email">Email</option>
              <option value="phone">Phone Number</option>
              <option value="text">Text Message</option>
            </select>
          </div>
        </div>

        {/* Dynamic Contact Field */}
        <div className="space-y-2">
          {formData.contactMethod === 'email' ? (
            <>
              <label htmlFor="email" className="text-sm font-medium text-stone-700">Email Address</label>
              <input 
                required
                type="email" 
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all"
                placeholder="jane@example.com"
              />
            </>
          ) : (
            <>
              <label htmlFor="phone" className="text-sm font-medium text-stone-700">Phone Number</label>
              <input 
                required
                type="tel" 
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all"
                placeholder="(555) 123-4567"
              />
            </>
          )}
        </div>

        {/* Incident Date */}
        <div className="space-y-2">
          <label htmlFor="date" className="text-sm font-medium text-stone-700">When did the incident occur?</label>
          <input 
            required
            type="datetime-local" 
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all"
          />
        </div>

        {/* Location Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label htmlFor="state" className="text-sm font-medium text-stone-700">State</label>
            <select 
              required
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all bg-white"
            >
              <option value="" disabled>Select a state</option>
              {STATE_OPTIONS.map(state => (
                <option key={state.code} value={state.code}>{state.name} ({state.code})</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium text-stone-700">City</label>
            <select 
              required
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={!formData.state || availableCities.length === 0}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all bg-white disabled:bg-stone-100 disabled:text-stone-500"
            >
              <option value="" disabled>Select a city</option>
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="address" className="text-sm font-medium text-stone-700">Address</label>
          <select 
            required
            id="storeNumber"
            name="storeNumber"
            value={formData.storeNumber}
            onChange={handleChange}
            disabled={!formData.city || availableAddresses.length === 0}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all bg-white disabled:bg-stone-100 disabled:text-stone-500"
          >
            <option value="" disabled>Select a location</option>
            {availableAddresses.map(loc => (
              <option key={loc.storeNumber} value={loc.storeNumber}>
                {loc.address} (Store #{loc.storeNumber})
              </option>
            ))}
          </select>
          {selectedLocation && (
            <p className="text-xs text-stone-500">
              Store email: ihop{selectedLocation.storeNumber}@opportunityrestaurantgroup.com
            </p>
          )}
        </div>

        {/* Issue Description */}
        <div className="space-y-2">
          <label htmlFor="issue" className="text-sm font-medium text-stone-700">What happened?</label>
          <textarea 
            required
            id="issue"
            name="issue"
            value={formData.issue}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all resize-none"
            placeholder="Please describe the incident in detail..."
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full md:w-auto px-8 py-3 bg-stone-900 text-white font-medium rounded-lg hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending...' : (
            <>
              Talk to us
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
