
import Hero from '@/components/Hero'; 
import FiveStepProcess from '@/components/FiveStepProcess';
import ServiceCards from '@/components/ServiceCards';
import Overall_header from '@/components/Header/Overall_header';
// ... rest of the code

const CareerCounsellingPage = () => {
  return (
    <>
      {/* ... Head content */}
      <main className="min-h-screen  mt-4">
        {/* This line is now correct */}
        <Overall_header/>
        <Hero /> 
        <FiveStepProcess />
        <ServiceCards />
      </main>
    </>
  );
};

export default CareerCounsellingPage;