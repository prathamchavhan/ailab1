// File: app/api/get-score-data/route.js
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
    }

    // Get the most recent mixed test result
    const { data: latestScoreData, error: latestError } = await supabase
      .from('aptitude')
      .select('type, level, score, created_at')
      .eq('user_id', user.id)
      .eq('type', 'Mixed')
      .order('created_at', { ascending: false })
      .limit(1);

    if (latestError) throw latestError;

    const latestScore = latestScoreData[0];
    if (!latestScore) {
      return NextResponse.json({ error: 'No mixed test scores found for this user.' }, { status: 404 });
    }

    // Get all previous scores to calculate category averages
    const { data: allScores, error: allScoresError } = await supabase
      .from('aptitude')
      .select('type, score');

    if (allScoresError) throw allScoresError;

    const totalQuestions = 30; // Assuming 10 questions per category
    const categoryPerformance = {};
    const categoryCounts = {};

    allScores.forEach(test => {
      if (test.type !== 'Mixed') {
        if (!categoryPerformance[test.type]) {
          categoryPerformance[test.type] = 0;
          categoryCounts[test.type] = 0;
        }
        categoryPerformance[test.type] += test.score;
        categoryCounts[test.type] += 1;
      }
    });

    const categories = ['Quantitative', 'Logical', 'Verbal'];
    const finalPerformance = {};
    categories.forEach(cat => {
      const avgScore = categoryCounts[cat] > 0
        ? (categoryPerformance[cat] / categoryCounts[cat])
        : 0;
      finalPerformance[cat] = (avgScore / 10) * 100; // Assuming 10 questions per category test
    });

    return NextResponse.json({
      latestScore: latestScore.score,
      totalQuestions,
      latestLevel: latestScore.level,
      categoryPerformance: finalPerformance,
    });

  } catch (error) {
    console.error('Get Score Data API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch score data.' },
      { status: 500 }
    );
  }
}