import fs from "fs";
import path from "path";

export function GET() {
  const dir = path.join(process.cwd(), "public/images/backgrounds");
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".jpg"));

  return Response.json(
    files.map(img => path.parse(img).name)
  );
}