'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ShaderAnimation } from '@/components/ui/shader-animation';
import { getImageDisplayUrl } from '@/lib/client-storage-utils';
import { 
  BookOpen, 
  Lightbulb,
  Shield,
  Globe,
  Users,
  ExternalLink,
  Mail,
  Linkedin
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: 'CONTRIBUTOR' | 'EDITOR' | 'ADMIN';
  bio: string | null;
  linkedin_url: string | null;
  personal_email: string | null;
  created_at: string;
}

export default function AboutPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarUrls, setAvatarUrls] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch('/api/team');
        if (response.ok) {
          const data = await response.json();
          const team = data.team || [];
          console.log('Team members data:', team); // Debug log
          setTeamMembers(team);

          // Process avatar URLs
          const avatarPromises = team.map(async (member: TeamMember) => {
            if (member.image) {
              try {
                const processedUrl = await getImageDisplayUrl(member.image);
                return { id: member.id, url: processedUrl };
              } catch (error) {
                console.error('Error processing avatar URL:', error);
                return { id: member.id, url: null };
              }
            }
            return { id: member.id, url: null };
          });
          
          const avatarResults = await Promise.all(avatarPromises);
          const avatarMap: Record<string, string | null> = {};
          avatarResults.forEach(({ id, url }) => {
            avatarMap[id] = url;
          });
          setAvatarUrls(avatarMap);
        } else {
          console.error('Failed to fetch team members');
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-gray-900 text-white border-gray-900';
      case 'EDITOR':
        return 'bg-gray-800 text-white border-gray-800';
      case 'CONTRIBUTOR':
        return 'bg-gray-700 text-white border-gray-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Chief Editor';
      case 'EDITOR':
        return 'Editor';
      case 'CONTRIBUTOR':
        return 'Contributor';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Full-screen Shader Animation Background */}
      <div className="fixed inset-0 z-0">
        <ShaderAnimation />
      </div>
      
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-10"></div>
      
      {/* Navbar */}
      <div className="relative z-20">
        <Navbar />
      </div>
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="relative z-20 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight">
            Making law
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> human</span>
          </h1>
          
          <p className="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
            We believe every Indian deserves to understand their constitutional rights, legal protections, and how the law affects their daily lives. From fundamental rights to consumer protection, property laws to family matters – we make complex legal concepts simple, clear, and always accessible.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-white/95 backdrop-blur-sm z-20">
        <div className="max-w-4xl mx-auto">
          
          {/* Simple Mission */}
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              We make legal knowledge simple
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              No jargon, no complexity. Just clear explanations that help you understand your rights and make better decisions.
            </p>
          </div>

          {/* Three Core Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-6 w-6 text-gray-900" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Clear</h3>
              <p className="text-gray-600 text-sm">
                We explain complex legal concepts in plain language.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-gray-900" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Trusted</h3>
              <p className="text-gray-600 text-sm">
                Our content is created and verified by legal experts.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-gray-900" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Accessible</h3>
              <p className="text-gray-600 text-sm">
                Legal knowledge for everyone, everywhere.
              </p>
            </div>
          </div>

          {/* Simple CTA */}
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Ready to understand your rights?
            </p>
            <Link href="/articles">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
              >
                Start Learning
                <BookOpen className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 z-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Our Legal Experts
            </h2>
            <p className="text-lg text-gray-600">
              Meet the legal professionals who make complex law simple for you
            </p>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-1/3" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse mb-2 w-1/4" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : teamMembers.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members yet</h3>
                <p className="text-gray-600">Check back soon to meet our contributors and editors.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {teamMembers.map((member) => (
                <Card key={member.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {avatarUrls[member.id] ? (
                          <Image
                            src={avatarUrls[member.id]!}
                            alt={member.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {member.name}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getRoleColor(member.role)}`}
                          >
                            {getRoleLabel(member.role)}
                          </Badge>
                        </div>

                        {member.bio && (
                          <p className="text-gray-600 text-sm mb-3">
                            {member.bio}
                          </p>
                        )}

                        {/* Contact Links */}
                        <div className="flex items-center gap-4">
                          {member.linkedin_url ? (
                            <a
                              href={member.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              <Linkedin className="h-4 w-4" />
                              LinkedIn
                            </a>
                          ) : (
                            <div className="flex items-center gap-1 text-sm text-gray-400">
                              <Linkedin className="h-4 w-4" />
                              LinkedIn
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span 
                              className="cursor-pointer hover:text-gray-700 transition-colors"
                              onClick={() => {
                                navigator.clipboard.writeText(member.email || 'contact@jurisight.in');
                                alert('Email copied to clipboard!');
                              }}
                              title="Click to copy email"
                            >
                              {member.email || 'contact@jurisight.in'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="relative z-20">
        <Footer />
      </div>
    </div>
  );
}
