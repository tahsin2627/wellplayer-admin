export default async function handler(request, response) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    // It can now accept tmdb_id OR imdb_id from the query
    const { tmdb_id, imdb_id } = request.query;

    if (!tmdb_id && !imdb_id) {
        return response.status(400).json({ error: 'tmdb_id or imdb_id is required.' });
    }

    // Build the query based on which ID is provided
    let query_param = tmdb_id ? `tmdb_id=eq.${tmdb_id}` : `imdb_id=eq.${imdb_id}`;

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/links?${query_param}&select=embed_url,title`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch data from Supabase.');
        }

        const data = await res.json();
        
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
