import { handlePOST } from "./routes/post.js";
import { handleGET } from "./routes/get.js";
import { handlePATCH } from "./routes/patch.js";
import { handleDELETE } from "./routes/delete.js";

async function handler(request) {
  const url = new URL(request.url);
  const database = Deno.readTextFileSync("backend/database.json");
  const data = JSON.parse(database);
  const headersCORS = new Headers();

  headersCORS.set("Access-Control-Allow-Origin", "*");
  headersCORS.set(
    "Access-Control-Allow-Methods",
    "GET, POST, DELETE, OPTIONS, PATCH"
  );
  headersCORS.set("Access-Control-Allow-Headers", "Content-Type");
  headersCORS.set("Content-Type", "application/json");

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: headersCORS });
  }

  if (request.method === "GET") {
    return await handleGET(request, url, data, headersCORS);
  }

  if (request.method === "POST") {
    return await handlePOST(request, url, data, headersCORS);
  }

  if (request.method === "PATCH") {
    return await handlePATCH(request, url, data, headersCORS);
  }

  if (request.method === "DELETE") {
    return await handleDELETE(request, url, data, headersCORS);
  }

  return new Response(JSON.stringify(JSON.stringify("Bad Request")), {
    status: 400,
    headers: headersCORS,
  });
}
Deno.serve(handler);
