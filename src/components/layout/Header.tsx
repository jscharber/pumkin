import Link from 'next/link';
import Container from './Container';

export default function Header() {
  return (
    <header className="bg-primary text-white shadow-lg">
      <Container>
        <nav className="py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold hover:text-accent transition-colors">
              🎃 Pumpkin Contest
            </Link>
            <div className="flex gap-6">
              <Link href="/" className="hover:text-accent transition-colors">
                Gallery
              </Link>
              <Link href="/inspiration" className="hover:text-accent transition-colors">
                Inspiration
              </Link>
              <Link href="/submit" className="hover:text-accent transition-colors">
                Submit Entry
              </Link>
              <Link href="/results" className="hover:text-accent transition-colors">
                Results
              </Link>
              <Link href="/admin" className="hover:text-accent transition-colors">
                Admin
              </Link>
            </div>
          </div>
        </nav>
      </Container>
    </header>
  );
}
