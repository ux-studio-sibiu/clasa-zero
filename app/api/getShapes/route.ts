import fs from "fs";
import path from "path";

export function GET() {
  const dir = path.join(process.cwd(), "public/images/shapes");
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".png"));

  return Response.json(
    files.map(f => `/images/shapes/${f}`)
  );
}