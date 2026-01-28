/**
 * Safe error response utility for edge functions
 * Prevents information leakage by mapping internal errors to user-friendly messages
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Maps internal error messages to safe client-facing messages
 */
function getSafeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  
  // Authentication errors
  if (message.includes('authentication') || message.includes('unauthorized') || message.includes('invalid token')) {
    return 'Authentication failed. Please sign in and try again.';
  }
  
  // Authorization errors
  if (message.includes('forbidden') || message.includes('permission') || message.includes('not allowed')) {
    return 'You do not have permission to perform this action.';
  }
  
  // Rate limiting
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  // API configuration errors (don't expose which API)
  if (message.includes('api key') || message.includes('not configured')) {
    return 'Service temporarily unavailable. Please try again later.';
  }
  
  // Network/timeout errors
  if (message.includes('timeout') || message.includes('network')) {
    return 'Request timed out. Please try again.';
  }
  
  // Validation errors - these are safe to show
  if (message.includes('required') || message.includes('missing') || message.includes('invalid')) {
    // Only show if it's about user input, not internal state
    if (!message.includes('key') && !message.includes('config')) {
      return 'Invalid request. Please check your input and try again.';
    }
  }
  
  // Default: generic error that doesn't reveal internals
  return 'An error occurred processing your request. Please try again.';
}

/**
 * Create a safe error response that doesn't leak internal details
 */
export function createSafeErrorResponse(
  error: unknown, 
  statusCode: number = 500,
  additionalHeaders?: Record<string, string>
): Response {
  // Always log the full error server-side for debugging
  console.error('Edge function error:', error);
  
  const safeMessage = getSafeErrorMessage(error);
  
  return new Response(
    JSON.stringify({ error: safeMessage }),
    {
      status: statusCode,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        ...additionalHeaders 
      },
    }
  );
}

/**
 * Create a safe response with proper CORS headers
 */
export function createJsonResponse(
  data: unknown, 
  statusCode: number = 200,
  additionalHeaders?: Record<string, string>
): Response {
  return new Response(
    JSON.stringify(data),
    {
      status: statusCode,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        ...additionalHeaders 
      },
    }
  );
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPrelight(): Response {
  return new Response(null, { headers: corsHeaders });
}

export { corsHeaders };
