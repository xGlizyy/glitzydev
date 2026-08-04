import { getGamePool } from "@/lib/games/pool";
import DefinicionApp from "@/app/components/games/DefinicionApp";

export default async function DefinicionPage() {
  const pool = await getGamePool();
  return <DefinicionApp pool={pool} />;
}
