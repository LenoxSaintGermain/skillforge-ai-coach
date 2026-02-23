import admin from 'firebase-admin';

// Initialize Firebase Admin SDK (uses Application Default Credentials in GCP)
if (!admin.apps.length) {
    admin.initializeApp();
}

/**
 * Verify Firebase ID token from Authorization header
 * @param {import('express').Request} req
 * @returns {Promise<import('firebase-admin').auth.DecodedIdToken>}
 */
export async function verifyAuth(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const error = new Error('Authentication required');
        error.statusCode = 401;
        throw error;
    }

    const token = authHeader.replace('Bearer ', '');
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken;
    } catch (err) {
        const error = new Error('Invalid authentication token');
        error.statusCode = 401;
        throw error;
    }
}

/**
 * Maps internal error messages to safe client-facing messages.
 * NEVER expose stack traces, internal paths, or API keys.
 * @param {unknown} error
 * @returns {string}
 */
export function getSafeErrorMessage(error) {
    const message = error instanceof Error ? error.message.toLowerCase() : '';

    if (message.includes('authentication') || message.includes('unauthorized') || message.includes('invalid')) {
        return 'Authentication failed. Please sign in and try again.';
    }

    if (message.includes('rate limit') || message.includes('429') || message.includes('quota')) {
        return 'Too many requests. Please wait a moment and try again.';
    }

    if (message.includes('api key') || message.includes('not configured') || message.includes('credentials')) {
        return 'Service temporarily unavailable. Please try again later.';
    }

    if (message.includes('safety') || message.includes('blocked')) {
        return 'Content was blocked by safety filters. Please rephrase your request.';
    }

    if (message.includes('max_tokens') || message.includes('truncated')) {
        return 'Response was too long. Please try a more specific request.';
    }

    return 'An error occurred processing your request. Please try again.';
}

/**
 * Standard CORS headers for all functions.
 * In production, replace '*' with the actual frontend domain.
 */
export const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
