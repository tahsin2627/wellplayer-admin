export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // These secret keys will be stored in Vercel, not in the code.
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return response.status(500).json({ error: 'Server configuration error.' });
    }

    try {
        const { tmdb_id, title, embed_url } = request.body;

        if (!tmdb_id || !title || !embed_url) {
            return response.status(400).json({ error: 'Missing required fields.' });
        }

        const res = await fetch(`${SUPABASE_URL}/rest/v1/links`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
                tmdb_id: parseInt(tmdb_id, 10),
                title: title,
                embed_url: embed_url
            })
        });

        if (res.status !== 201) {
            // Try to get a more specific error message from Supabase
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to insert data into Supabase.');
        }

        return response.status(200).json({ message: 'Success!' });

    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
}
