import { getDailyChallenge } from "@/lib/challenge/daily";
import RetoApp from "@/app/components/RetoApp";

export default async function RetoPage() {
  const challenge = await getDailyChallenge();
  return <RetoApp challenge={challenge} />;
}
