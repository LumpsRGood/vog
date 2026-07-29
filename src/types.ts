export interface GuestIssue {
  name: string;
  contactMethod: 'email' | 'phone';
  email: string;
  phone: string;
  date: string;
  state: string;
  city: string;
  address: string;
  issue: string;
}
