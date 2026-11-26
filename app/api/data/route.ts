import { connection } from "next/server";

import { loadDataSet } from "@lib/data";
import { DEFAULT_CONFIG } from "@lib/defaults";

/**
 * Reads data/tasks.json + data/config.ts on every request.
 * `connection()` opts this route out of the build-time cache, so the data
 * files can be edited at any time and the browser picks the changes up on its
 * next poll.
 */
export async function GET() {
  await connection();

  try {
    const data = await loadDataSet();
    return Response.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    return Response.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        tasks: [],
        config: DEFAULT_CONFIG,
        sources: { tasks: null, config: null },
        generatedAt: new Date().toISOString(),
      },
      { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
