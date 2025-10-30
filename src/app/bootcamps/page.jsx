
import Bootcamphero from '@/app/bootcamps/components/Bootcamphero'; 
import Card1 from '@/app/bootcamps/components/Card1';
import Card2 from '@/app/bootcamps/components/Card2';
import Card3 from '@/app/bootcamps/components/Card3';
import Bottompage from '@/app/bootcamps/components/Bottompage'; 
import Overall_header from '@/components/Header/Overall_header';
// ... rest of the code

const CareerCounsellingPage = () => {
  return (
    <>
      {/* ... Head content */}
      <main className="min-h-screen  mt-4">
        {/* This line is now correct */}
        <Overall_header />
      <div className="flex flex-col gap-11">
  <Bootcamphero /> 
  <Card1 />
  <Card2 />
  <Card3 />



        <Bottompage />
        </div>
      </main>
    </>
  );
};

export default CareerCounsellingPage;