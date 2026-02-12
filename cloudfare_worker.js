export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    if (!key) {
      return new Response("Missing key", { status: 400 });
    }

    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405 });
    }

    // CORS headers
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    // Generate Presigned URL
    // implementing a simple PUT signature using AWS SDK v3 is common, 
    // but for R2 in a worker, we can use the R2 bucket binding if we want to stream (not presign).
    // HOWEVER, for client-side uploads, we NEED a presigned URL.
    // Since AWS SDK is heavy, we might use a lighter alternative or just user the AWS SDK if the worker env supports it.
    // For this artifact, I will write the detailed logic for aws-sdk v3 which is compatible with R2.
    
    // NOTE: User must install @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner in their worker project.
    
    /* 
    import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
    import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

    const S3 = new S3Client({
      region: "auto",
      endpoint: \`https://\${env.ACCOUNT_ID}.r2.cloudflarestorage.com\`,
      credentials: {
        accessKeyId: env.ACCESS_KEY_ID,
        secretAccessKey: env.SECRET_ACCESS_KEY,
      },
    });

    const signedUrl = await getSignedUrl(
      S3,
      new PutObjectCommand({ Bucket: env.BUCKET_NAME, Key: key }),
      { expiresIn: 3600 }
    );

    return new Response(JSON.stringify({ url: signedUrl }), { 
      headers: { ...headers, "Content-Type": "application/json" } 
    });
    */

    return new Response(JSON.stringify({ error: "Please implement AWS S3 Presigning with @aws-sdk/client-s3" }), { headers });
  },
};

