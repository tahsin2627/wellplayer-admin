export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return response.status(500).json({ error: 'Server configuration error.' });
    }

    try {
        const { tmdb_id, imdb_id, title, embed_url } = request.body;

        if ((!tmdb_id && !imdb_id) || !title || !embed_url) {
            return response.status(400).json({ error: 'Missing required fields. Ensure title, URL, and at least one ID are provided.' });
        }

        // Prepare the data to be sent to Supabase
        const dataToInsert = {
            title: title,
            embed_url: embed_url
        };
        
        // Add IDs only if they exist
        if (tmdb_id) dataToInsert.tmdb_id = parseInt(tmdb_id, 10);
        if (imdb_id) dataToInsert.imdb_id = imdb_id;


        const res = await fetch(`${SUPABASE_URL}/rest/v1/links`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal',
            },
            body: JSON.stringify(dataToInsert)
        });

        if (res.status !== 201) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to insert data into Supabase.');
        }

        return response.status(200).json({ message: 'Success!' });

    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
}
