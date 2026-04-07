
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!APPS_SCRIPT_URL) return Response.json({ error: "APPS_SCRIPT_URL is not set" }, { status: 500 });
  try {
    const { id } = await params;
    const body = await req.json();
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "update", timestamp: id, ...body }),
      headers: { "Content-Type": "application/json" },
    });
    const result = await res.json();
    return Response.json(result);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!APPS_SCRIPT_URL) return Response.json({ error: "APPS_SCRIPT_URL is not set" }, { status: 500 });
  try {
    const { id } = await params;
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "delete", timestamp: id }),
      headers: { "Content-Type": "application/json" },
    });
    const result = await res.json();
    return Response.json(result);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
