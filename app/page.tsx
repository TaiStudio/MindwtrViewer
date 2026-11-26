import { connection } from "next/server";

import Viewer from "@components/Viewer";
import { loadDataSet } from "@lib/data";

/**
 * Blocking (non-prerendered) render: the page reads data/tasks.json and
 * data/config.ts on every request so the first paint is already up to date.
 * Afterwards the client polls /api/data on its own.
 */
export const instant = false;
export default async function Home() {
  await connection();
  const initialData = await loadDataSet();
  return <Viewer initialData={initialData} />;
}
