export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");
    
    if (request.method === "PUT" && key) {
      // Direct upload via Worker Binding
      await env.MY_BUCKET.put(key, request.body);
      return new Response(JSON.stringify({ success: true, key }), { 
         headers: { "Access-Control-Allow-Origin": "*" } 
      });
    }
    
    // Handle CORS for Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }
      });
    }
    
    return new Response("Method not allowed", { status: 405 });
  }
};
