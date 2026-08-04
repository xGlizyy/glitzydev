import { getGamePool } from "@/lib/games/pool";
import IntrusoApp from "@/app/components/games/IntrusoApp";

export default async function IntrusoPage() {
  const pool = await getGamePool();
  return <IntrusoApp pool={pool} />;
}
