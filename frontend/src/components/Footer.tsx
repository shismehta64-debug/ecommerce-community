import React from 'react';
import { Flower2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-2 text-white font-bold mb-4 md:mb-0">
          <Flower2 className="h-5 w-5 text-accent" />
          <span>Community Connect</span>
        </div>
        
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Community Connect, Surat. All rights reserved.
        </p>
        
        <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Support Contact</a>
        </div>
      </div>
    </footer>
  );
}
