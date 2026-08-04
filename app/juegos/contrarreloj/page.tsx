import { getGamePool } from "@/lib/games/pool";
import ContrarrelojApp from "@/app/components/games/ContrarrelojApp";

export default async function ContrarrelojPage() {
  const pool = await getGamePool();
  return <ContrarrelojApp pool={pool} />;
}
