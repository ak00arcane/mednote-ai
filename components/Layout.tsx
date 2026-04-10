
import React from 'react';
import { Activity } from 'lucide-react';
import { Provider } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  provider: Provider | null;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, provider, onLogout }) => {
  const initials = provider?.name
    ? provider.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Activity className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">MedNote <span className="text-blue-600">AI</span></h1>
          </div>
          
          {provider && (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Current Provider</span>
                <span className="text-sm text-slate-700 font-semibold">{provider.name}</span>
                <span className="text-[10px] text-slate-500">{provider.practice}</span>
              </div>
              <button 
                onClick={onLogout}
                className="group relative w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shadow-sm hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
                title="Logout"
              >
                <span className="group-hover:hidden">{initials}</span>
                <span className="hidden group-hover:block text-[8px] uppercase">Exit</span>
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} MedNote AI. Confidential & Secure Clinical Assistant.
          </p>
          {provider && (
            <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-widest font-bold">
              Licensed to: {provider.practice} ({provider.id})
            </p>
          )}
        </div>
      </footer>
    </div>
  );
};
