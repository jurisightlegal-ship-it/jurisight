import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Instagram, Mail, Globe, FileText, Scale, Gavel, Facebook, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/Jurisight.png";

export const metadata: Metadata = {
  title: "Jurisight - Link in Bio | Legal Knowledge Platform",
  description: "Connect with Jurisight across all platforms. Access our legal resources, social media, and important links in one place.",
  keywords: ["Jurisight", "legal platform", "social media", "legal resources", "link in bio"],
  openGraph: {
    title: "Jurisight - Link in Bio | Legal Knowledge Platform",
    description: "Connect with Jurisight across all platforms. Access our legal resources, social media, and important links in one place.",
    images: ["/Jurisight.png"],
  },
};

const socialLinks = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/juri.sight/",
    icon: Instagram,
    description: "Follow us for legal insights",
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/profile.php?id=61581218661866",
    icon: Facebook,
    description: "Connect with us on Facebook",
    color: "bg-gradient-to-r from-blue-600 to-blue-800",
  },
  {
      name: "LinkedIn",
      url: "https://www.linkedin.com/company/jurisight-legal/",
      icon: () => <img src="/linkedin-app-icon.svg" alt="LinkedIn" className="w-7 h-7" />,
      description: "Connect professionally",
      color: "from-blue-700 to-blue-900"
    },
    {
      name: "WhatsApp Community",
      url: "https://chat.whatsapp.com/Df10PVVWVde7Akhe1hPUmV?mode=ems_copy_c",
      icon: MessageCircle,
      description: "Join our community",
      color: "from-green-500 to-green-700"
    },
  {
    name: "X",
    url: "https://x.com/jurisightlegal",
    icon: () => <img src="/x-social-media-logo-icon.svg" alt="X" className="w-7 h-7" />,
    description: "Follow us on X",
    color: "from-gray-600 to-black",
  },
  {
    name: "Email",
    url: "mailto:editorial@jurisight.in",
    icon: Mail,
    description: "Get in touch with us",
    color: "bg-gradient-to-r from-green-500 to-green-600",
  },
];

const importantLinks = [
  {
    name: "Main Website",
    url: "/",
    icon: Globe,
    description: "Explore our legal platform",
    color: "bg-gradient-to-r from-indigo-500 to-purple-600",
  },
  {
    name: "Supreme Court Judgements",
    url: "/supreme-court-judgements",
    icon: Scale,
    description: "Latest SC rulings",
    color: "bg-gradient-to-r from-amber-500 to-orange-500",
  },
  {
    name: "High Court Judgements",
    url: "/high-court-judgements",
    icon: Gavel,
    description: "HC decisions & analysis",
    color: "bg-gradient-to-r from-teal-500 to-cyan-500",
  },
  {
    name: "Legal Articles",
    url: "/articles",
    icon: FileText,
    description: "In-depth legal analysis",
    color: "bg-gradient-to-r from-slate-600 to-slate-700",
  },
  {
    name: "Know Your Law",
    url: "/know-your-law",
    icon: FileText,
    description: "Legal education content",
    color: "bg-gradient-to-r from-emerald-500 to-emerald-600",
  },
  {
    name: "Legal News",
    url: "/news",
    icon: FileText,
    description: "Latest legal developments",
    color: "bg-gradient-to-r from-rose-500 to-pink-500",
  },
];

export default function LinkInBio() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto max-w-md px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 p-4 shadow-lg ring-1 ring-gray-200">
              <Image 
                src={logo} 
                alt="Jurisight logo" 
                className="h-16 w-auto" 
                priority
              />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Jurisight</h1>
          <p className="text-gray-600">Democratizing Legal Knowledge</p>
          <Badge variant="secondary" className="mt-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200">
            Legal Knowledge Platform
          </Badge>
        </div>

        {/* Social Media Links */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 text-center">Our Socials</h2>
          <div className="space-y-3">
            {socialLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <Link key={link.name} href={link.url} target="_blank" rel="noopener noreferrer">
                  <Card className="border-gray-200 bg-white shadow-sm transition-all hover:scale-105 hover:shadow-md ring-1 ring-gray-100">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className={`rounded-full p-3 bg-gradient-to-r ${link.color}`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{link.name}</h3>
                        <p className="text-sm text-gray-600">{link.description}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Important Links */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 text-center">Explore Our Platform</h2>
          <div className="space-y-3">
            {importantLinks.map((link) => {
              const IconComponent = link.icon;
              const isExternal = link.url.startsWith('http');
              return (
                <Link 
                  key={link.name} 
                  href={link.url} 
                  {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <Card className="border-gray-200 bg-white shadow-sm transition-all hover:scale-105 hover:shadow-md ring-1 ring-gray-100">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className={`rounded-full p-3 ${link.color}`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{link.name}</h3>
                        <p className="text-sm text-gray-600">{link.description}</p>
                      </div>
                      {isExternal && <ExternalLink className="h-4 w-4 text-gray-400" />}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            © 2024 Jurisight. Empowering the legal community.
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Link href="/privacy">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                Privacy Policy
              </Button>
            </Link>
            <Link href="/disclaimer">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                Disclaimer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}