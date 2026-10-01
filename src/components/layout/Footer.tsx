import Container from './Container';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-12">
      <Container>
        <div className="py-6 text-center">
          <p className="text-sm">
            &copy; {currentYear} Pumpkin Contest. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
