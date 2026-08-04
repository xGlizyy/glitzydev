import { getGamePool } from "@/lib/games/pool";
import ParejasApp from "@/app/components/games/ParejasApp";

export default async function ParejasPage() {
  const pool = await getGamePool();
  return <ParejasApp pool={pool} />;
}
