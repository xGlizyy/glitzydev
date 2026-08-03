import ManageCookiesLink from "@/app/components/ManageCookiesLink";

export const metadata = {
  title: "Política de cookies ・ Wordexa",
  description: "Qué cookies usa Wordexa y cómo puedes gestionarlas.",
};

const cookieTable = [
  {
    category: "Necesarias",
    names: "sb-*-auth-token, cookie_consent",
    purpose: "Mantener tu sesión iniciada y recordar tus preferencias de cookies.",
    duration: "Sesión / hasta 180 días",
  },
  {
    category: "Preferencias",
    names: "(actualmente no se usan)",
    purpose: "Reservada para recordar ajustes de interfaz en el futuro.",
    duration: "—",
  },
  {
    category: "Analítica",
    names: "(actualmente no se usan)",
    purpose: "Reservada para medir el uso de la web y mejorar el servicio.",
    duration: "—",
  },
];

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 pb-16 pt-32">
      <h1 className="text-2xl font-semibold text-zinc-50">Política de cookies</h1>
      <p className="mt-3 text-sm text-zinc-400">
        Una cookie es un pequeño archivo que se guarda en tu navegador cuando visitas
        una web. En Wordexa las usamos para que la sesión funcione correctamente y,
        con tu permiso, para recordar preferencias y entender cómo se usa la web.
      </p>

      <h2 className="mt-8 text-lg font-medium text-zinc-100">Categorías de cookies</h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Cookies</th>
              <th className="px-4 py-3 font-medium">Finalidad</th>
              <th className="px-4 py-3 font-medium">Duración</th>
            </tr>
          </thead>
          <tbody>
            {cookieTable.map((row) => (
              <tr key={row.category} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3 align-top text-zinc-200">{row.category}</td>
                <td className="px-4 py-3 align-top text-zinc-400">{row.names}</td>
                <td className="px-4 py-3 align-top text-zinc-400">{row.purpose}</td>
                <td className="px-4 py-3 align-top text-zinc-400">{row.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 text-lg font-medium text-zinc-100">Cookies necesarias</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Estas cookies las gestiona Supabase para mantener tu sesión iniciada de forma
        segura. Sin ellas no podrías acceder a tu cuenta, favoritos ni historial. No
        requieren consentimiento porque son imprescindibles para el funcionamiento del
        sitio.
      </p>

      <h2 className="mt-8 text-lg font-medium text-zinc-100">
        Cookies de preferencias y analítica
      </h2>
      <p className="mt-2 text-sm text-zinc-400">
        Solo se instalan si las aceptas. Actualmente Wordexa no utiliza cookies de
        analítica ni de preferencias, pero mantenemos estas categorías disponibles
        para cuando se activen en el futuro; en ese caso solo se cargarán si has dado
        tu consentimiento.
      </p>

      <h2 className="mt-8 text-lg font-medium text-zinc-100">Gestionar tu consentimiento</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Puedes cambiar tu elección en cualquier momento desde este mismo sitio.
      </p>
      <div className="mt-4">
        <span className="inline-flex rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-1.5 text-sm font-medium text-orange-300 transition hover:bg-orange-400/20">
          <ManageCookiesLink />
        </span>
      </div>
    </div>
  );
}
