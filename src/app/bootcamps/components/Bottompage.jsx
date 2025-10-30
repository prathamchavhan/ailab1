

'use client';

import Head from 'next/head';

export default function WhyChooseUs() {
  return (
    <>
      <Head>
        <title>Why Choose Us</title>
        {/* This CDN link is for demonstration. 
            In a real Next.js app, you'd install Tailwind via npm. */}
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
       <div className="text-center">
            <p className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose <span style={{ color: '#09407F' }}>DV Learningz Bootcamps?</span>
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Item 1: Job Placement */}
              <div className="flex flex-col items-center text-center p-6">
                <div className="flex-shrink-0 mb-4">
                  <div
                    className="h-10 w-10  rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#6CEDFF' }}
                  >
                    {/* SVG replaced with a span and emoji */}
                    <span className="text-[17px]" role="img" aria-label="Briefcase">
                      🎯
                    </span>
                  </div>
                </div>
                <h3 className="!text-[15px] !font-bold  text-gray-900">
                  100% Job Placement Guarantee
                </h3>
                <p className="mt-2 text-[10px] text-gray-700">
                  We guarantee job placement within 6 months of course completion
                  or get 100% refund. Our placement rate speaks for itself!
                </p>
              </div>

              {/* Item 2: Expert Mentors */}
              <div className="flex flex-col items-center text-center p-6">
                <div className="flex-shrink-0 mb-4">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#6CEDFF' }}
                  >
                    {/* SVG replaced with a span and emoji */}
                    <span className="text-[17px]" role="img" aria-label="Graduation Cap">
                      👨‍🔬
                    </span>
                  </div>
                </div>
                <h3 className=" !text-[15px] !font-bold text-gray-900">
                  Industry Expert Mentors
                </h3>
                <p className="mt-2 text-[10px] text-gray-700">
                  Learn from professionals with 10+ years of experience at
                  Microsoft, Amazon, Google, and other top companies.
                </p>
              </div>

              {/* Item 3: Real-World Projects */}
              <div className="flex flex-col items-center text-center p-6">
                <div className="flex-shrink-0 mb-4">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#6CEDFF' }}
                  >
                    {/* SVG replaced with a span and emoji */}
                    <span className="text-[17px]" role="img" aria-label="Light Bulb">
                      💡
                    </span>
                  </div>
                </div>
                <h3 className="!text-[15px] font-medium text-gray-900">
                  Real-World Projects
                </h3>
                <p className="mt-2  text-[10px] text-gray-700">
                  Work on live projects with real companies. Build a portfolio
                  that showcases your skills to potential employers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}