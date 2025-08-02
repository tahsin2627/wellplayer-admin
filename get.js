export default async function handler(request, response) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    // We get the TMDB ID from the query, e.g., /api/get?tmdb_id=157336
    const { tmdb_id } = request.query;

    if (!tmdb_id) {
        return response.status(400).json({ error: 'tmdb_id is required.' });
    }

    try {
        // This securely fetches the links for a specific movie from your database
        const res = await fetch(`${SUPABASE_URL}/rest/v1/links?tmdb_id=eq.${tmdb_id}&select=embed_url,title`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch data from Supabase.');
        }

        const data = await res.json();
        
        // Format the data for the WellPlayer backend
        const formattedLinks = data.map(item => ({
            url: item.embed_url,
            source: 'My Manual Server',
            lang: 'Manual'
        }));

        return response.status(200).json({ links: formattedLinks });

    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
}
