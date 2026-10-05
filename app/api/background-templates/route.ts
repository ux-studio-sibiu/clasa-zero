// Writes background templates to Sanity for the ?background-tools panel - in production too.
//
// The write token can write any document in the dataset (questions included), so this route is the
// guard: it only ever touches `backgroundTemplate` documents with a `bg-template-` id, and every field
// goes through the same validator the Studio uses. Reads do not come through here - the game reads
// templates with the public client.
//
// Needs SANITY_WRITE_TOKEN (an Editor token from sanity.io/manage) in the environment.

import { randomUUID } from "crypto";
import client from "@/sanity/sanity.client";
import { cleanSnapshot, validateMeta, validateTemplate, type SanityTemplateDoc } from "@/app/components/pattern-background/templates";

export const dynamic = "force-dynamic";

// No dot in the id: Sanity treats a dotted id ("a.b") as private, and the game reads templates without a token.
const ID_PREFIX = "bg-template-";

/* ---- rate limit: 30 writes an hour ----
   In memory, so it resets when the server restarts and is per server instance - a guard against an
   accidental burst, not against abuse. Swap for a shared store when the tools get a login. */
const LIMIT = 30, WINDOW = 60 * 60 * 1000;
const writes: number[] = [];
function takeWrite() {
  const now = Date.now();
  while (writes.length && writes[0] <= now - WINDOW) writes.shift();
  if (writes.length >= LIMIT) return { ok: false as const, resetAt: writes[0] + WINDOW };
  writes.push(now);
  return { ok: true as const, remaining: LIMIT - writes.length };
}
const quota = () => { const now = Date.now(); return LIMIT - writes.filter((t) => t > now - WINDOW).length; };

const fail = (status: number, error: string, extra: object = {}) => Response.json({ error, remaining: quota(), ...extra }, { status });

function writer() {
  const token = process.env.SANITY_WRITE_TOKEN;
  return token ? client.withConfig({ token, useCdn: false }) : null;
}

const toResponse = (d: SanityTemplateDoc, remaining: number) => Response.json({ doc: d, remaining });
const PROJECTION = "{ _id, _rev, name, puzzleTypes, weight, enabled, template, snapshot }";

// How many writes are left this hour - the panel shows it next to Save.
export function GET() {
  return Response.json({ remaining: quota() });
}

// Create: { name, puzzleTypes, weight, enabled, template, snapshot }
export async function POST(req: Request) {
  const sanity = writer();
  if (!sanity) return fail(500, "SANITY_WRITE_TOKEN is not set on the server");
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return fail(400, "expected a JSON body");
  const meta = validateMeta(body);
  if (!meta.ok) return fail(400, meta.error);
  const template = validateTemplate(body.template);
  if (!template.ok) return fail(400, template.error);
  const slot = takeWrite();
  if (!slot.ok) return fail(429, "30 saves an hour - try again later", { resetAt: slot.resetAt });

  try {
    const doc = await sanity.create({
      _id: `${ID_PREFIX}${randomUUID()}`, _type: "backgroundTemplate", ...meta.value,
      template: JSON.stringify(template.value), snapshot: JSON.stringify(cleanSnapshot(body.snapshot)),
    });
    return toResponse(doc as unknown as SanityTemplateDoc, slot.remaining);
  } catch {
    writes.pop();   // nothing was written, so it does not count
    return fail(502, "Sanity refused the write");
  }
}

// Delete: { id }. Permanent - the panel confirms first. Counts against the hourly limit like a save.
export async function DELETE(req: Request) {
  const sanity = writer();
  if (!sanity) return fail(500, "SANITY_WRITE_TOKEN is not set on the server");
  const body = await req.json().catch(() => null);
  if (!body || typeof body.id !== "string" || !body.id.startsWith(ID_PREFIX)) return fail(400, "expected the id of a background template");
  const slot = takeWrite();
  if (!slot.ok) return fail(429, "30 saves an hour - try again later", { resetAt: slot.resetAt });
  try {
    await sanity.delete(body.id);
  } catch {
    writes.pop();   // nothing was deleted, so it does not count
    return fail(502, "Sanity refused the delete");
  }
  return Response.json({ id: body.id, remaining: slot.remaining });
}

// Update: { id, rev, ...any of the create fields }. `rev` is the revision the panel loaded; if the
// document changed since (an edit in the Studio), the save is refused rather than overwriting it.
export async function PATCH(req: Request) {
  const sanity = writer();
  if (!sanity) return fail(500, "SANITY_WRITE_TOKEN is not set on the server");
  const body = await req.json().catch(() => null);
  if (!body || typeof body.id !== "string" || !body.id.startsWith(ID_PREFIX)) return fail(400, "expected the id of a background template");
  if (typeof body.rev !== "string") return fail(400, "expected the revision that was loaded");
  const meta = validateMeta(body, true);
  if (!meta.ok) return fail(400, meta.error);
  const fields: Record<string, unknown> = { ...meta.value };
  if (body.template !== undefined) {
    const template = validateTemplate(body.template);
    if (!template.ok) return fail(400, template.error);
    fields.template = JSON.stringify(template.value);
  }
  if (body.snapshot !== undefined) fields.snapshot = JSON.stringify(cleanSnapshot(body.snapshot));
  const slot = takeWrite();
  if (!slot.ok) return fail(429, "30 saves an hour - try again later", { resetAt: slot.resetAt });

  try {
    await sanity.patch(body.id).ifRevisionId(body.rev).set(fields).commit();
  } catch (e) {
    writes.pop();   // nothing was written, so it does not count
    const status = (e as { statusCode?: number }).statusCode;
    if (status === 409) return fail(409, "this template changed elsewhere since it was loaded - reload it first");
    if (status === 404) return fail(404, "no such template");
    return fail(502, "Sanity refused the write");
  }
  const doc = await sanity.fetch<SanityTemplateDoc>(`*[_id == $id][0]${PROJECTION}`, { id: body.id });
  return toResponse(doc, slot.remaining);
}
