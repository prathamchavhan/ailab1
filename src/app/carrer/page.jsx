
import Hero from '@/components/Hero'; 
import FiveStepProcess from '@/components/FiveStepProcess';
import ServiceCards from '@/components/ServiceCards';
import Header from "../../components/Header";
// ... rest of the code

const CareerCounsellingPage = () => {
  return (
    <>
      {/* ... Head content */}
      <main className="min-h-screen  mt-4">
        {/* This line is now correct */}
        <Header/>
        <Hero /> 
        <FiveStepProcess />
        <ServiceCards />
      </main>
    </>
  );
};

export default CareerCounsellingPage;