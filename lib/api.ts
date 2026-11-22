import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function notFound(what: string) {
  return NextResponse.json({ error: `${what} not found`, code: "NOT_FOUND" }, { status: 404 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message, code: "BAD_REQUEST" }, { status: 400 });
}

export function handleError(e: unknown) {
  if (e instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid query parameters", code: "VALIDATION_ERROR", details: e.issues },
      { status: 400 }
    );
  }
  console.error(e);
  return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
}

export const csv = (v?: string) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);