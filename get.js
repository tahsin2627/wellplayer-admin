export default async function handler(request, response) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    const { tmdb_id, imdb_id, query } = request.query;

    if (!tmdb_id && !imdb_id && !query) {
        return response.status(400).json({ error: 'An ID or query is required.' });
    }

    let query_param = '';
    if (tmdb_id) {
        query_param = `tmdb_id=eq.${tmdb_id}`;
    } else if (imdb_id) {
        query_param = `imdb_id=eq.${imdb_id}`;
    } else if (query) {
        // Use 'ilike' for case-insensitive search
        query_param = `title=ilike.%${query}%`;
    }

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/links?${query_param}&select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch data from Supabase.');
        }

        const data = await res.json();
        return response.status(200).json({ results: data });

    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
}
