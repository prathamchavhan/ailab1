
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#8884d8', '#82ca9d', '#ff7300'];


export default function ScoreAnalytics({
    interviewDomains,
    interviewFilters,
    interviewChartData,
    aptitudeTypes,
    aptitudeFilters,
    aptitudeChartData,
    overallPieData,
    totalAverage,
    expandedChart,
    handleChartClick,
    handleFilterChange
}) {
    // Local wrapper to keep recharts logic isolated to client
    const ChartWrapper = ({ children }) => (
        <ResponsiveContainer width="100%" height={300}>{children}</ResponsiveContainer>
    );

  return (
    // FIX: Using md:grid-cols-2 (768px+) ensures better fit on 13-inch screens before hitting 3 columns at lg (1024px)
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {/* 1. Interview Scores Chart */}
      <div className={`transition-all duration-300 ${expandedChart === 'interview' ? 'col-span-1 md:col-span-2 lg:col-span-3' : expandedChart ? 'hidden' : 'col-span-1 md:col-span-1'}`}>
        <Card className="cursor-pointer h-full">
          <CardHeader onClick={() => handleChartClick('interview')}>
       
          </CardHeader>
          <CardContent className="p-4 pt-0 pb-0">
            
                <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 text-sm">
                  {interviewDomains.map(domain => (
                    <label key={domain} className="flex items-center cursor-pointer">
                      <input type="checkbox" checked={!!interviewFilters[domain]} onChange={() => handleFilterChange('interview', domain)} className="mr-2" />
                      {domain}
                    </label>
                  ))}
                </div>
                <ChartWrapper>
                  <LineChart data={interviewChartData.length > 0 ? interviewChartData : [{ attempt: 1, Placeholder: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="attempt" />
                    <YAxis domain={[0, 100]}/>
                    <Tooltip />
                    <Legend />
                    {interviewDomains.map((domain, i) => (
                      interviewFilters[domain] && <Line key={domain} type="monotone" dataKey={domain} stroke={COLORS[i % COLORS.length]} activeDot={{ r: 8 }} />
                    ))}
                    {interviewDomains.length === 0 && <Line type="monotone" dataKey="Placeholder" stroke="#e5e7eb" dot={false} />}
                  </LineChart>
                </ChartWrapper>
          </CardContent>
        </Card>
      </div>

      {/* 2. Aptitude Score Chart */}
      <div className={`transition-all duration-300 ${expandedChart === 'aptitude' ? 'col-span-1 md:col-span-2 lg:col-span-3' : expandedChart ? 'hidden' : 'col-span-1 md:col-span-1'}`}>
        <Card className="cursor-pointer h-full">
          <CardHeader onClick={() => handleChartClick('aptitude')}>
           
          </CardHeader>
          <CardContent>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 text-sm">
                  {aptitudeTypes.map(type => (
                    <label key={type} className="flex items-center cursor-pointer">
                      <input type="checkbox" checked={!!aptitudeFilters[type]} onChange={() => handleFilterChange('aptitude', type)} className="mr-2" />
                      {type}
                    </label>
                  ))}
                </div>
                <ChartWrapper>
                  <LineChart data={aptitudeChartData.length > 0 ? aptitudeChartData : [{ attempt: 1, Placeholder: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="attempt" />
                    <YAxis domain={[0, 100]}/>
                    <Tooltip />
                    <Legend />
                    {aptitudeTypes.map((type, i) => (
                      aptitudeFilters[type] && <Line key={type} type="monotone" dataKey={type} stroke={COLORS[i % COLORS.length]} activeDot={{ r: 8 }} />
                    ))}
                    {aptitudeTypes.length === 0 && <Line type="monotone" dataKey="Placeholder" stroke="#e5e7eb" dot={false} />}
                  </LineChart>
                </ChartWrapper>
          </CardContent>
        </Card>
      </div>

      {/* 3. Overall Score Chart */}
      {/* This spans the remaining space */}
      <div className={`transition-all duration-300 ${expandedChart === 'overall' ? 'col-span-1 md:col-span-2 lg:col-span-3' : expandedChart ? 'hidden' : 'col-span-1 md:col-span-2 lg:col-span-1'}`}>
        <Card className="h-full">
          <CardHeader onClick={() => handleChartClick('overall')}>
           
          </CardHeader>
          <CardContent className="relative flex justify-center items-center h-[90%]">
              <>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
    
          
     <div className="flex flex-col"> 
  <p className="text-sm text-gray-500 m-0 p-0 leading-none">Average</p>
  <p className="text-3xl font-bold m-0 p-0 leading-none">{totalAverage}%</p>
</div>
       </div>
                <ChartWrapper>
                  <PieChart>
                    <Pie 
                      data={overallPieData.length > 0 ? overallPieData : [{ name: 'Placeholder', value: 100 }]} 
                      cx="50%" 
                      cy="50%" 
                      labelLine={false} 
                      innerRadius={60} 
                      outerRadius={100} 
                      fill="#8884d8" 
                      paddingAngle={5} 
                      dataKey="value"
                    >
                      {overallPieData.length > 0 ? 
                       overallPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))
                       : <Cell key={`cell-placeholder`} fill="#e5e7eb" />
                      }
                    </Pie>
                    {overallPieData.length > 0 && <Tooltip />}
                    {overallPieData.length > 0 && <Legend />}
                  </PieChart>
                </ChartWrapper>
              </>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}