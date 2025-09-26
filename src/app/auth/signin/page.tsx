'use client';

import { signIn, getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SunIcon as Sunburst } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/animated-button';

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isMagicLinkMode, setIsMagicLinkMode] = useState(false);

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push('/dashboard');
      }
    });
  }, [router]);

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setMessage('');
    setEmailError('');
    setPasswordError('');
    
    try {
      const result = await signIn('credentials', { 
        email,
        password,
        callbackUrl: '/dashboard',
        redirect: false 
      });
      
      if (result?.error) {
        setMessage('Invalid email or password');
      } else if (result?.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setMessage('An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    setEmailError('');
    
    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('Magic link sent! Check your email.');
      } else {
        setMessage(data.error || 'Failed to send magic link');
      }
    } catch (error) {
      console.error('Magic link error:', error);
      setMessage('Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    } else {
      setEmailError('');
    }

    if (isMagicLinkMode) {
      handleMagicLinkSignIn(e);
    } else {
      if (!password) {
        setPasswordError('Password is required.');
        return;
      } else {
        setPasswordError('');
      }
      handleEmailSignIn(e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden p-4">
      <div className="w-full relative max-w-5xl overflow-hidden flex flex-col md:flex-row shadow-xl">
        <div className="w-full h-full z-2 absolute bg-gradient-to-t from-transparent to-black"></div>
        <div className="flex absolute z-2 overflow-hidden backdrop-blur-2xl">
          <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-r from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-r from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-r from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-r from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-r from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-r from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
        </div>
        <div className="w-[15rem] h-[15rem] bg-gradient-to-br from-jurisight-royal to-jurisight-navy absolute z-1 rounded-full bottom-0"></div>
        <div className="w-[8rem] h-[5rem] bg-white absolute z-1 rounded-full bottom-0"></div>
        <div className="w-[8rem] h-[5rem] bg-white absolute z-1 rounded-full bottom-0"></div>

        <div className="bg-black text-white p-8 md:p-12 md:w-1/2 relative rounded-bl-3xl overflow-hidden">
          <h1 className="text-2xl md:text-3xl font-medium leading-tight z-10 tracking-tight relative">
            Your trusted source for legal insights, court judgments, and comprehensive analysis of the Indian legal landscape.
          </h1>
        </div>

        <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-secondary z-99 text-secondary-foreground">
          <div className="flex flex-col items-left mb-8">
            <div className="text-jurisight-royal mb-4">
              <Sunburst className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-medium mb-2 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-left opacity-80">
              Sign in to access your legal insights dashboard
            </p>
          </div>

          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
            noValidate
          >
            <div>
              <label htmlFor="email" className="block text-sm mb-2">
                Your email
              </label>
              <input
                type="email"
                id="email"
                placeholder="your-email@example.com"
                className={`text-sm w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-1 bg-white text-black focus:ring-jurisight-royal ${
                  emailError ? "border-red-500" : "border-gray-300"
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!emailError}
                aria-describedby="email-error"
              />
              {emailError && (
                <p id="email-error" className="text-red-500 text-xs mt-1">
                  {emailError}
                </p>
              )}
            </div>

            {!isMagicLinkMode && (
              <div>
                <label htmlFor="password" className="block text-sm mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  className={`text-sm w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-1 bg-white text-black focus:ring-jurisight-royal ${
                    passwordError ? "border-red-500" : "border-gray-300"
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!passwordError}
                  aria-describedby="password-error"
                />
                {passwordError && (
                  <p id="password-error" className="text-red-500 text-xs mt-1">
                    {passwordError}
                  </p>
                )}
              </div>
            )}

            <div className="w-full flex justify-center">
              <AnimatedButton
                type="submit"
                disabled={isLoading || !email || (!isMagicLinkMode && !password)}
                variant="secondary"
                className="w-full max-w-xs"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isMagicLinkMode ? 'Sending...' : 'Signing in...'}
                  </div>
                ) : (
                  isMagicLinkMode ? 'Send Magic Link' : 'Sign In'
                )}
              </AnimatedButton>
            </div>

            <div className="w-full flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setIsMagicLinkMode(!isMagicLinkMode);
                  setMessage('');
                  setEmailError('');
                  setPasswordError('');
                }}
                className="w-full max-w-xs text-jurisight-royal hover:text-jurisight-royal-dark font-medium py-2 px-4 rounded-lg transition-colors border border-jurisight-royal/20 hover:border-jurisight-royal/40 hover:bg-jurisight-royal/5"
              >
                {isMagicLinkMode ? 'Use Email & Password' : 'Use Magic Link Instead'}
              </button>
            </div>

            {message && (
              <div className={`text-center text-sm ${
                message.includes('sent') || message.includes('success') 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {message}
              </div>
            )}

            <div className="text-center text-gray-600 text-sm">
              Don&apos;t have an account?{" "}
              <span className="text-secondary-foreground font-medium">
                Contact an administrator to get started.
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}