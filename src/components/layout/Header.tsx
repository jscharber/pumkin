import Link from 'next/link';
import Container from './Container';
import NavLinks from './NavLinks';

export default function Header() {
  return (
    <header className="bg-primary text-white shadow-lg">
      <Container>
        <nav className="py-4">
          {/* Stack the title above the links on phones so the links get the full width */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <Link
              href="/"
              className="text-xl sm:text-2xl font-bold whitespace-nowrap hover:text-accent transition-colors"
            >
              🎃 Pumpkin Contest
            </Link>
            <NavLinks />
          </div>
        </nav>
      </Container>
    </header>
  );
}
