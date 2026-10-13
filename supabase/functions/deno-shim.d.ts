// Type stubs so the Edge Function sources can be type-checked with plain tsc (npm run typecheck).
// The real Deno runtime provides these.
declare namespace Deno {
  function serve(handler: (req: Request) => Response | Promise<Response>): void
  function resolveDns(name: string, type: 'A' | 'AAAA'): Promise<string[]>
  const env: { get(name: string): string | undefined }
}
