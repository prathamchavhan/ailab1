// Server API route to return the latest ad from the `ads` table
import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabaseServer'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('id, content, image_url, url')
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Error fetching ad (server):', error)
      return NextResponse.json({ error: 'Failed to fetch ad' }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ ad: null }, { status: 200 })
    }

    return NextResponse.json(data, { status: 200 })

  } catch (err) {
    console.error('Ads API error:', err)
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}