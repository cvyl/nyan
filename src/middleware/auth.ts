import { IRequestStrict } from 'itty-router';
import { Env } from '../types';

export const auth = async (request: IRequestStrict, env: Env) => {
    const url = new URL(request.url);
    const authHeader = request.headers.get('x-auth-key');
    const authQueryParam = url.searchParams.get('authkey');

    if (authHeader) {
        // Check x-auth-key in the database
        try {
            const stmt = env.DB.prepare('SELECT * FROM AccessKeys WHERE authkey = ?');
            const keyResult = await stmt.bind(authHeader).first();

            if (keyResult) {
                return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
            }
        } catch (error) {
            console.error('Database error:', error);
            return new Response(
                JSON.stringify({ success: false, error: 'Internal Server Error' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }
    } else if (authQueryParam) {
        // Check authkey query parameter in the database
        try {
            const stmt = env.DB.prepare('SELECT * FROM AccessKeys WHERE keystring = ?');
            const keyResult = await stmt.bind(authQueryParam).first();

            if (keyResult) {
                return; // Authenticated
            }
        } catch (error) {
            console.error('Database error:', error);
            return new Response(
                JSON.stringify({ success: false, error: 'Internal Server Error' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
};
