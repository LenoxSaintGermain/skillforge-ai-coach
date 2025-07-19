import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, model = 'claude-3-5-sonnet@20241022', temperature = 0.7, maxTokens = 1000, systemPrompt } = await req.json();
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const projectId = Deno.env.get('GOOGLE_CLOUD_PROJECT_ID');
    const serviceAccountKey = Deno.env.get('GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY');
    
    if (!projectId || !serviceAccountKey) {
      throw new Error('Google Cloud credentials not configured');
    }

    // Parse the service account key
    const credentials = JSON.parse(serviceAccountKey);
    
    // Generate JWT for Google Cloud authentication
    const jwt = await generateJWT(credentials);
    
    // Get access token
    const accessToken = await getAccessToken(jwt);

    // Prepare request body based on model type
    let requestBody;
    let endpoint;

    if (model.includes('claude')) {
      // Claude via Vertex AI
      endpoint = `https://us-east5-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-east5/publishers/anthropic/models/${model}:predict`;
      
      requestBody = {
        instances: [
          {
            messages: [
              ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
              { role: 'user', content: prompt }
            ],
            anthropic_version: "vertex-2023-10-16",
            max_tokens: maxTokens,
            temperature: temperature
          }
        ]
      };
    } else {
      // Default to Gemini via Vertex AI
      endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/gemini-2.0-flash-exp:predict`;
      
      requestBody = {
        instances: [
          {
            contents: [
              {
                parts: [
                  {
                    text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
                  }
                ]
              }
            ]
          }
        ],
        parameters: {
          temperature: temperature,
          maxOutputTokens: maxTokens,
          topP: 0.8,
          topK: 40
        }
      };
    }

    console.log(`Calling Vertex AI ${model} with prompt:`, prompt.substring(0, 100) + '...');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vertex AI error:', errorText);
      throw new Error(`Vertex AI error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Vertex AI response structure:', JSON.stringify(data, null, 2));

    let generatedText = '';
    
    if (model.includes('claude')) {
      // Extract Claude response
      if (data.predictions && data.predictions[0] && data.predictions[0].content) {
        generatedText = data.predictions[0].content[0].text;
      }
    } else {
      // Extract Gemini response
      if (data.predictions && data.predictions[0] && data.predictions[0].candidates) {
        generatedText = data.predictions[0].candidates[0].content.parts[0].text;
      }
    }

    if (!generatedText) {
      console.error('Unexpected Vertex AI response structure:', data);
      throw new Error('Unable to extract generated text from response');
    }

    console.log('Vertex AI response received successfully');

    return new Response(
      JSON.stringify({ 
        generatedText,
        model,
        usage: data.usage || {}
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in vertex-ai function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper function to generate JWT for Google Cloud
async function generateJWT(credentials: any): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: credentials.private_key_id
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/[+/=]/g, (m) => ({ '+': '-', '/': '_', '=': '' })[m]!);
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/[+/=]/g, (m) => ({ '+': '-', '/': '_', '=': '' })[m]!);
  
  const unsignedToken = `${headerB64}.${payloadB64}`;
  
  // Import the private key
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    new Uint8Array(atob(credentials.private_key.replace(/-----BEGIN PRIVATE KEY-----\n|-----END PRIVATE KEY-----\n/g, '').replace(/\n/g, '')).split('').map(c => c.charCodeAt(0))),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  );

  // Sign the token
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    encoder.encode(unsignedToken)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/[+/=]/g, (m) => ({ '+': '-', '/': '_', '=': '' })[m]!);
  
  return `${unsignedToken}.${signatureB64}`;
}

// Helper function to get access token
async function getAccessToken(jwt: string): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}