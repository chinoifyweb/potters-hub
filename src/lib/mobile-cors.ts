import { NextResponse } from "next/server";

export function mobileCors(res: NextResponse): NextResponse {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept");
  res.headers.set("Access-Control-Max-Age", "86400");
  return res;
}
