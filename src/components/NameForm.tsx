
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { Dictionary } from '@/lib/getDictionary';
import type { Locale } from '@/i18n-config';
import { User } from 'lucide-react'; // Changed from Mail to User

interface NameFormProps { // Changed from EmailFormProps
  dictionary: Dictionary['LandingPage'];
  locale: Locale;
}

export default function NameForm({ dictionary, locale }: NameFormProps) { // Changed component name
  const [name, setName] = useState(''); // Changed from email to name
  const [error, setError] = useState('');
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { // Changed validation for name
      setError(dictionary.nameRequired || "Name is required"); // Updated error message key
      return;
    }
    setError('');
    if (isMounted) {
      localStorage.setItem('userName', name.trim()); // Changed localStorage key and value
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
        <Label htmlFor="name" className="text-lg font-medium">{dictionary.namePrompt}</Label> {/* Changed htmlFor and text key */}
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-muted-foreground" /> {/* Changed icon */}
          <Input
            id="name" // Changed id
            type="text" // Changed type
            placeholder={dictionary.namePlaceholder} // Changed placeholder key
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-base"
            aria-describedby={error ? "name-error" : undefined} // Changed aria-describedby
            autoComplete="name"
          />
        </div>
        {error && <p id="name-error" className="text-sm text-destructive">{error}</p>} {/* Changed id */}
      </div>
      <Button type="submit" className="w-full text-lg py-6">
        {dictionary.startAssessment}
      </Button>
    </form>
  );
}
