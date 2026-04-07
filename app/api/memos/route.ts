
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

export async function GET() {
  if (!APPS_SCRIPT_URL) {
    return Response.json({ error: "APPS_SCRIPT_URL is not set" }, { status: 500 });
  }

  try {
    const res = await fetch(APPS_SCRIPT_URL);
    const data = await res.json();
    return Response.json(data);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!APPS_SCRIPT_URL) {
    return Response.json({ error: "APPS_SCRIPT_URL is not set" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "create", ...body }),
      headers: { "Content-Type": "application/json" },
    });
    const result = await res.json();
    return Response.json(result);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
