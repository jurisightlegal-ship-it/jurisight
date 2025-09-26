"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsletterSignupProps {
  title: string;
  description: string;
  placeholder?: string;
  buttonText?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  variant?: "default" | "footer" | "cta" | "premium";
  showIcon?: boolean;
  showBadge?: boolean;
  badgeText?: string;
}

export function NewsletterSignup({
  title,
  description,
  placeholder = "Enter your email",
  buttonText = "Subscribe",
  className = "",
  inputClassName = "",
  buttonClassName = "",
  variant = "default",
  showIcon = true,
  showBadge = false,
  badgeText = "Free"
}: NewsletterSignupProps) {
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setIsSuccess(false);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Successfully subscribed to newsletter!');
        setIsSuccess(true);
        setEmail("");
      } else {
        setMessage(data.error || 'Failed to subscribe to newsletter');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setMessage('An error occurred. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced variant styles with better design
  const getVariantStyles = () => {
    switch (variant) {
      case "footer":
        return {
          container: "space-y-4",
          form: "flex flex-col sm:flex-row gap-3",
          input: "bg-white/10 border-white/20 text-white placeholder:text-slate-300 focus:bg-white/20 focus:border-white/40 transition-all duration-200",
          button: "bg-white text-jurisight-navy hover:bg-slate-100 font-semibold shadow-lg hover:shadow-xl transition-all duration-200",
          message: "text-sm p-4 rounded-xl backdrop-blur-sm",
          icon: "text-jurisight-teal"
        };
      case "cta":
        return {
          container: "space-y-6",
          form: "flex flex-col sm:flex-row gap-4 max-w-lg mx-auto",
          input: "flex-1 bg-white/10 border-white/20 text-white placeholder:text-blue-100 focus:bg-white/20 focus:border-white/40 transition-all duration-200 backdrop-blur-sm",
          button: "bg-white text-blue-600 hover:bg-gray-100 px-8 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold",
          message: "text-sm p-4 rounded-xl backdrop-blur-sm max-w-lg mx-auto",
          icon: "text-blue-400"
        };
      case "premium":
        return {
          container: "space-y-6",
          form: "flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto",
          input: "flex-1 bg-gradient-to-r from-white/10 to-white/5 border-white/30 text-white placeholder:text-slate-200 focus:bg-white/20 focus:border-white/50 transition-all duration-300 backdrop-blur-md",
          button: "bg-gradient-to-r from-jurisight-royal to-jurisight-teal text-white hover:from-jurisight-navy hover:to-jurisight-royal px-8 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold",
          message: "text-sm p-4 rounded-xl backdrop-blur-md max-w-2xl mx-auto",
          icon: "text-jurisight-teal"
        };
      default:
        return {
          container: "space-y-4",
          form: "flex flex-col sm:flex-row gap-3",
          input: "bg-white/10 border-white/20 text-white placeholder:text-slate-300 focus:bg-white/20 focus:border-white/40 transition-all duration-200",
          button: "bg-white text-jurisight-navy hover:bg-slate-100 font-semibold shadow-lg hover:shadow-xl transition-all duration-200",
          message: "text-sm p-4 rounded-xl backdrop-blur-sm",
          icon: "text-jurisight-teal"
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={cn("relative", styles.container, className)}>
      {/* Badge */}
      {showBadge && (
        <div className="flex justify-center mb-4">
          <Badge 
            variant="secondary" 
            className="bg-jurisight-teal/20 text-jurisight-teal border-jurisight-teal/30 px-4 py-1.5 text-sm font-medium"
          >
            <Sparkles className="h-3 w-3 mr-1.5" />
            {badgeText}
          </Badge>
        </div>
      )}

      <form onSubmit={handleNewsletterSubmit} className={styles.form}>
        <div className="relative flex-1">
          <div className="relative">
            {showIcon && (
              <Mail className={cn(
                "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200",
                isFocused ? styles.icon : "text-slate-400"
              )} />
            )}
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className={cn(
                styles.input,
                showIcon && "pl-10",
                inputClassName
              )}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <Button 
          type="submit" 
          className={cn(styles.button, buttonClassName)}
          disabled={isSubmitting || !email.trim()}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          {isSubmitting ? 'Subscribing...' : buttonText}
          {!isSubmitting && variant === "premium" && (
            <ArrowRight className="h-4 w-4 ml-2" />
          )}
        </Button>
      </form>
      
      {/* Enhanced message display */}
      {message && (
        <div className={cn(
          styles.message,
          "animate-in slide-in-from-top-2 duration-300",
          isSuccess 
            ? 'bg-green-500/20 text-green-200 border border-green-500/30' 
            : 'bg-red-500/20 text-red-200 border border-red-500/30'
        )}>
          <div className="flex items-center gap-2">
            {isSuccess ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400" />
            )}
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced CTA Section Component for pages
export function NewsletterCTA({
  title,
  description,
  gradient = "from-blue-600 to-purple-600",
  textColor = "text-blue-100",
  buttonColor = "text-blue-600",
  className = "",
  variant = "cta",
  showBadge = true,
  badgeText = "Free Newsletter"
}: {
  title: string;
  description: string;
  gradient?: string;
  textColor?: string;
  buttonColor?: string;
  className?: string;
  variant?: "cta" | "premium";
  showBadge?: boolean;
  badgeText?: string;
}) {
  return (
    <section className={`relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r ${gradient} z-20 overflow-hidden ${className}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32" />
      
      <div className="relative max-w-5xl mx-auto text-center">
        {/* Badge */}
        {showBadge && (
          <div className="flex justify-center mb-6">
            <Badge 
              variant="secondary" 
              className="bg-white/20 text-white border-white/30 px-6 py-2 text-sm font-medium backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {badgeText}
            </Badge>
          </div>
        )}

        {/* Title with better typography */}
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          {title}
        </h2>
        
        {/* Description with better spacing */}
        <p className={`text-xl md:text-2xl ${textColor} mb-12 max-w-3xl mx-auto leading-relaxed`}>
          {description}
        </p>

        {/* Newsletter form */}
        <div className="max-w-2xl mx-auto">
          <NewsletterSignup
            title={title}
            description={description}
            variant={variant}
            placeholder="Enter your email address"
            buttonText="Subscribe Now"
            showIcon={true}
            showBadge={false}
            inputClassName={`flex-1 bg-white/10 border-white/20 text-white placeholder:${textColor} focus:bg-white/20 focus:border-white/40 transition-all duration-200 backdrop-blur-sm`}
            buttonClassName={`bg-white ${buttonColor} hover:bg-gray-100 px-8 shadow-xl hover:shadow-2xl transition-all duration-200 font-semibold`}
          />
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-white/80">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span>No spam, ever</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span>Unsubscribe anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span>Weekly updates</span>
          </div>
        </div>
      </div>
    </section>
  );
}
