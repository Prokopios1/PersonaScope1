'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { Dictionary } from '@/lib/getDictionary';
import type { Locale } from '@/i18n-config';
import { Mail } from 'lucide-react';

interface EmailFormProps {
  dictionary: Dictionary['LandingPage'];
  locale: Locale;
}

export default function EmailForm({ dictionary, locale }: EmailFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(dictionary.emailRequired);
      return;
    }
    // Basic email validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.'); // This should be translated too if we had more complex validation messages
      return;
    }
    setError('');
    if (isMounted) {
      localStorage.setItem('userEmail', email);
    }
    router.push(`/${locale}/instructions`);
  };

  if (!isMounted) {
    return (
      <div className="space-y-2 text-center">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted"></div>
        <div className="h-10 w-1/2 mx-auto animate-pulse rounded-md bg-primary/50"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-lg font-medium">{dictionary.emailPrompt}</Label>
        <div className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder={dictionary.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-base"
            aria-describedby={error ? "email-error" : undefined}
          />
        </div>
        {error && <p id="email-error" className="text-sm text-destructive">{error}</p>}
      </div>
      <Button type="submit" className="w-full text-lg py-6">
        {dictionary.startAssessment}
      </Button>
    </form>
  );
}
