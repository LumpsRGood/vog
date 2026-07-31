export interface GuestIssue {
  name: string;
  contactType: 'celebration' | 'opportunity';
  contactMethod: 'email' | 'phone' | 'text';
  email: string;
  phone: string;
  date: string;
  state: string;
  city: string;
  address: string;
  storeNumber: string;
  issue: string;
}
