import { Metadata } from 'next';
import Home from '../page';

// Define a more precise type for the language parameter
type LangParam = 'en' | 'fr';

export async function generateMetadata({ params }: { params: { lang: LangParam } }): Promise<Metadata> {
  return {
    title: params.lang === 'en' ? 'Welcome' : 'Bienvenue',
  };
}

export default function Page({ params }: { params: { lang: LangParam } }) {
  // Use type assertion or provide a default value to ensure type compatibility
  const lang = params.lang || 'en';
  
  return (
    <Home lang={lang} />
  );
}