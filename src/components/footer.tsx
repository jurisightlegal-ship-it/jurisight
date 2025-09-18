"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/dark.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  ExternalLink
} from "lucide-react";

export function Footer() {
  const [email, setEmail] = React.useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

  const quickLinks = [
    { name: "Articles", href: "/articles" },
    { name: "Supreme Court", href: "/sections/constitutional" },
    { name: "High Courts", href: "/sections/civil" },
    { name: "Know the Law", href: "/categories/know-the-law" },
    { name: "Legal Updates", href: "/updates" },
    { name: "Case Studies", href: "/case-studies" },
  ];

  const practiceAreas = [
    { name: "Constitutional Law", href: "/practice/constitutional" },
    { name: "Corporate Law", href: "/practice/corporate" },
    { name: "Criminal Law", href: "/practice/criminal" },
    { name: "Civil Law", href: "/practice/civil" },
    { name: "Family Law", href: "/practice/family" },
    { name: "Employment Law", href: "/practice/employment" },
  ];

  const resources = [
    { name: "Legal Forms", href: "/resources/forms" },
    { name: "Case Citations", href: "/resources/citations" },
    { name: "Legal Dictionary", href: "/resources/dictionary" },
    { name: "Court Directories", href: "/resources/courts" },
    { name: "Bar Associations", href: "/resources/bar" },
    { name: "Legal Aid", href: "/resources/aid" },
  ];


  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/jurisight" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/jurisight" },
    { name: "Facebook", icon: Facebook, href: "https://facebook.com/jurisight" },
    { name: "Instagram", icon: Instagram, href: "https://instagram.com/jurisight" },
    { name: "YouTube", icon: Youtube, href: "https://youtube.com/@jurisight" },
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Image src={logo} alt="Jurisight logo" className="h-12 w-auto" />
            </div>
            
            <p className="text-slate-300 mb-6 leading-relaxed">
              Your trusted source for legal insights, court judgments, and comprehensive analysis of the Indian legal landscape. Empowering legal professionals and citizens with knowledge.
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-slate-300">
                <Mail className="h-4 w-4 text-jurisight-teal" />
                <span className="text-sm">editorial@jurisight.in</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="h-4 w-4 text-jurisight-teal" />
                <span className="text-sm">+91 11 4567 8900</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <MapPin className="h-4 w-4 text-jurisight-teal" />
                <span className="text-sm">New Delhi, India</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-700 hover:bg-jurisight-navy rounded-lg transition-colors duration-200"
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-300 hover:text-white transition-colors duration-200 text-sm flex items-center gap-2 group"
                  >
                    <span>{link.name}</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Practice Areas */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Practice Areas</h4>
            <ul className="space-y-3">
              {practiceAreas.map((area) => (
                <li key={area.name}>
                  <Link
                    href={area.href}
                    className="text-slate-300 hover:text-white transition-colors duration-200 text-sm flex items-center gap-2 group"
                  >
                    <span>{area.name}</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Resources</h4>
            <ul className="space-y-3">
              {resources.map((resource) => (
                <li key={resource.name}>
                  <Link
                    href={resource.href}
                    className="text-slate-300 hover:text-white transition-colors duration-200 text-sm flex items-center gap-2 group"
                  >
                    <span>{resource.name}</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <Card className="bg-gradient-to-r from-jurisight-navy to-jurisight-royal border-0 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Stay Updated</h4>
                <p className="text-slate-200">
                  Get the latest legal insights, court judgments, and analysis delivered to your inbox weekly.
                </p>
              </div>
              
              <form onSubmit={handleNewsletterSubmit} className="flex gap-3">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-300"
                  required
                />
                <Button type="submit" className="bg-white text-jurisight-navy hover:bg-slate-100 font-semibold">
                  <Send className="h-4 w-4 mr-2" />
                  Subscribe
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700 bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-400">
              © 2025 Jurisight. All rights reserved. | Empowering legal knowledge since 2024.
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-slate-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
              <Link href="/disclaimer" className="text-slate-400 hover:text-white transition-colors">
                Legal Disclaimer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
