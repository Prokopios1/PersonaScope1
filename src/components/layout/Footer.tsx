import type { Dictionary } from '@/lib/getDictionary';

interface FooterProps {
  dictionary: Dictionary['PersonaScope'];
}
export default function Footer({ dictionary }: FooterProps) {
  return (
    <footer className="bg-card border-t border-border py-6 text-center text-muted-foreground">
      <div className="container mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} {dictionary.appName}. All rights reserved.</p>
      </div>
    </footer>
  );
}
