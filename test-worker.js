// Simple test worker to verify deployment works
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ 
        status: 'ok', 
        timestamp: new Date().toISOString() 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Test Worker - Path: ' + url.pathname, {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};