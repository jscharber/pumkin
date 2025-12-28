import Container from '@/components/layout/Container';

export default function Home() {
  return (
    <Container>
      <div className="py-12">
        <h1 className="text-center mb-8">Pumpkin Carving Contest</h1>
        <p className="text-center text-gray-600">
          Welcome to the annual pumpkin carving contest!
        </p>
      </div>
    </Container>
  );
}
