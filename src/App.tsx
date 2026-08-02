/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { ContactForm } from './components/ContactForm';
import { StaffIntake } from './components/StaffIntake';

export default function App() {
  if (window.location.pathname.replace(/\/$/, '') === '/staff') {
    return <StaffIntake />;
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans selection:bg-stone-200">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold tracking-tight">VG</span>
            </div>
            <h1 className="text-xl font-semibold text-stone-900 tracking-tight">
              Voice of the Guest
            </h1>
          </div>
          <div className="text-sm font-medium text-stone-500">
            Guest Support & Resolution
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-stone-900 tracking-tight mb-4">
            We're here to listen.
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Tell us about your experience. We'd love to know how we can celebrate someone if it was great or coach someone if there was an opportunity.
          </p>
        </div>

        <ContactForm />
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 text-center text-sm text-stone-400">
        <p>&copy; 2026 Lumps Are Good</p>
        <p className="mt-1">We love you &bull; But you've reached the end</p>
      </footer>
    </div>
  );
}
