import React, { useMemo, useEffect } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { GuestIssue } from '../types';
import { STORE_LOCATIONS, STATES } from '../data/locations';

export function ContactForm() {
  const [formData, setFormData] = React.useState<GuestIssue>({
    name: '',
    contactMethod: 'email',
    email: '',
    phone: '',
    date: '',
    state: '',
    city: '',
    address: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Reset city and address if state changes
      if (name === 'state') {
        newData.city = '';
        newData.address = '';
      }
      // Reset address if city changes
      if (name === 'city') {
        newData.address = '';
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
      
      // If the key is not set, we'll simulate success for demo purposes, 
      // but in production on Cloudflare, it will use the real key.
      if (!accessKey) {
        console.warn("VITE_WEB3FORMS_ACCESS_KEY is missing. Simulating submission.");
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSuccess(true);
      } else {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            access_key: accessKey,
            subject: `New Guest Issue Report from ${formData.name}`,
            from_name: "Voice of the Guest",
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            contactMethod: formData.contactMethod,
            incidentDate: formData.date,
            state: formData.state,
            city: formData.city,
            address: formData.address,
            issueDescription: formData.issue,
          })
        });

        const result = await response.json();

        if (result.success) {
          setIsSuccess(true);
        } else {
          throw new Error(result.message || 'Form submission failed');
        }
      }

      setFormData({ 
        name: '', contactMethod: 'email', email: '', phone: '', 
        date: '', state: '', city: '', address: '', issue: '' 
      });
    } catch (error) {
      console.error("Submission failed", error);
      alert("There was an issue submitting your report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 md:p-12 text-center animate-in fade-in zoom-in duration-500 shadow-sm max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <h3 className="text-3xl font-semibold text-green-900 mb-4 tracking-tight">Thank You</h3>
        <p className="text-green-800 text-lg leading-relaxed max-w-lg mx-auto">
          We have received your report. Our team will review the details and be in touch with you within 24 hours to help resolve your concern.
        </p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="mt-8 px-8 py-3 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 transition-colors inline-flex items-center gap-2"
        >
          Submit another report
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
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
              {STATES.map(state => (
                <option key={state} value={state}>{state}</option>
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
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={!formData.city || availableAddresses.length === 0}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all bg-white disabled:bg-stone-100 disabled:text-stone-500"
          >
            <option value="" disabled>Select a location</option>
            {availableAddresses.map(loc => (
              <option key={loc.storeNumber} value={`${loc.address} (Store #${loc.storeNumber})`}>
                {loc.address} (Store #{loc.storeNumber})
              </option>
            ))}
          </select>
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
