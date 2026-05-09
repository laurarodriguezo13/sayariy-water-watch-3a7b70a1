import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { COMMUNITIES } from "@/lib/communities";

export const Route = createFileRoute("/comunidades")({
  head: () => ({
    meta: [
      { title: "Comunidades monitoreadas — Sayariy CropGuard" },
      {
        name: "description",
        content:
          "Comunidades de la provincia de Chiclayo, Lambayeque, monitoreadas por CropGuard: Cayaltí, Nueva Libertad, Víctor Raúl, Reque y Monsefú.",
      },
    ],
  }),
  component: ComunidadesPage,
});

function ComunidadesPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Comunidades</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground">
          Comunidades monitoreadas
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Cinco comunidades de la provincia de Chiclayo, en Lambayeque, son el primer ámbito de
          despliegue de CropGuard.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {COMMUNITIES.map((c) => (
            <Link
              key={c.id}
              to="/dashboard/comunidad/$id"
              params={{ id: c.id }}
              className="group rounded-xl border border-border/60 bg-card p-6 transition hover:border-primary/50 hover:shadow-[var(--shadow-brand)]"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
                  {c.name}
                </h3>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                  {c.province}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
              <p className="mt-4 text-xs font-medium text-primary">Ver detalle →</p>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
