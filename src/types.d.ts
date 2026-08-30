declare module "lucide-react";
declare module "ethers";
declare module "@0gfoundation/0g-storage-ts-sdk";

declare module "next" {
  export type NextConfig = {
    serverExternalPackages?: string[];
    [key: string]: any;
  };
  export interface Metadata {
    title?: string;
    description?: string;
    [key: string]: any;
  }
}

declare module "next/server" {
  export class NextRequest extends Request {
    nextUrl: URL;
  }
  export class NextResponse extends Response {
    static json(body: any, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, status?: number): NextResponse;
    static next(): NextResponse;
  }
}
