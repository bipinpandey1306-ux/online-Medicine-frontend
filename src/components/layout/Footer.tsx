import React from "react";
import { Link } from "wouter";
import { HeartPulse, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-primary">
                <HeartPulse className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Krishna<span className="text-secondary">Pharmacy</span>
              </span>
            </Link>
            <p className="text-primary-foreground/80 text-sm max-w-xs">
              Your trusted neighborhood pharmacy, now delivering genuine medicines directly to your doorstep across India.
            </p>
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                <span className="font-bold text-sm">f</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                <span className="font-bold text-sm">in</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                <span className="font-bold text-sm">x</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/medicines" className="text-primary-foreground/80 hover:text-white transition-colors text-sm">Order Medicines</Link></li>
              <li><Link href="/prescriptions" className="text-primary-foreground/80 hover:text-white transition-colors text-sm">Upload Prescription</Link></li>
              <li><Link href="/orders" className="text-primary-foreground/80 hover:text-white transition-colors text-sm">Track Order</Link></li>
              <li><Link href="/about" className="text-primary-foreground/80 hover:text-white transition-colors text-sm">About Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Legal & Trust</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>Drug License: DL-XYZ-123456</li>
              <li>GSTIN: 22AAAAA0000A1Z5</li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Return Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4 text-sm text-primary-foreground/80">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-secondary shrink-0" />
                <span>123 Health Avenue, Medical District, New Delhi, India 110001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-secondary shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-secondary shrink-0" />
                <span>support@krishnapharmacy.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 text-center text-sm text-primary-foreground/60 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Krishna Pharmacy. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-400"></span> Government Licensed</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-400"></span> Genuine Medicines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
