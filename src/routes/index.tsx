import { createFileRoute, Link } from "@tanstack/react-router";
import { Satellite, LineChart, Bell, Leaf, Droplets, Sun } from "lucide-react";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sayariy CropGuard — Inteligencia satelital para Lambayeque" },
      {
        name: "description",
        content:
          "Sistema predictivo de gestión hídrica y vulnerabilidad agrícola para comunidades de Lambayeque, Perú. Detecta el estrés hídrico semanas antes con imágenes Sentinel-2.",
      },
      { property: "og:title", content: "Sayariy CropGuard" },
      {
        property: "og:description",
        content:
          "Monitoreo satelital + IA para anticipar crisis hídricas en comunidades del norte de Perú.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-90"
          style={{ background: "var(--gradient-soft)" }}
        />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Satellite className="h-3.5 w-3.5" /> Sentinel-2 · IA · Sayariy Perú
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
              Anticipamos el estrés hídrico{" "}
              <span className="text-primary">antes de que sea visible</span>.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              CropGuard combina imágenes satelitales gratuitas, modelos de aprendizaje
              automático y conocimiento local para proteger cultivos y comunidades en
              Lambayeque, Perú.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-brand)] transition hover:opacity-95"
              >
                Ver el panel
              </Link>
              <Link
                to="/proyecto"
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary"
              >
                Conocer el proyecto
              </Link>
            </div>
          </div>
          <div className="relative">
            <div
              className="aspect-[4/3] w-full rounded-2xl border border-border/60 p-1"
              style={{ background: "var(--gradient-brand)" }}
            >
              <div className="grid h-full w-full grid-cols-2 gap-3 rounded-xl bg-background p-5">
                <StatCard icon={<Leaf className="h-5 w-5" />} label="NDVI promedio" value="0.62" tone="success" />
                <StatCard icon={<Droplets className="h-5 w-5" />} label="NDWI" value="0.18" tone="primary" />
                <StatCard icon={<Sun className="h-5 w-5" />} label="EVI" value="0.41" tone="accent" />
                <StatCard icon={<Bell className="h-5 w-5" />} label="Alertas activas" value="2" tone="primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Cómo funciona</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Un flujo continuo desde la órbita hasta la decisión en campo.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<Satellite className="h-6 w-6" />}
            title="Observación satelital"
            text="Imágenes Sentinel-2 cada 5 días a 10 m de resolución. NDVI, NDWI y EVI por comunidad."
          />
          <FeatureCard
            icon={<LineChart className="h-6 w-6" />}
            title="Modelo predictivo"
            text="Random Forest entrena con históricos de campaña para estimar la probabilidad de estrés a 2–4 semanas."
          />
          <FeatureCard
            icon={<Bell className="h-6 w-6" />}
            title="Alertas en español"
            text="Resúmenes generados con IA, claros para equipos de Sayariy y líderes comunitarios."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div
          className="overflow-hidden rounded-2xl p-10 text-primary-foreground"
          style={{ background: "var(--gradient-brand)" }}
        >
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h3 className="text-2xl font-bold">5 comunidades monitoreadas hoy</h3>
              <p className="mt-1 text-primary-foreground/85">
                Cayaltí, Nueva Libertad, Víctor Raúl, Reque y Monsefú.
              </p>
            </div>
            <Link
              to="/comunidades"
              className="inline-flex items-center justify-center rounded-md bg-background px-5 py-3 text-sm font-semibold text-primary transition hover:bg-background/90"
            >
              Ver comunidades
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "primary" | "accent" | "success";
}) {
  const toneClass =
    tone === "primary"
      ? "text-primary bg-primary/10"
      : tone === "accent"
      ? "text-accent-foreground bg-accent/30"
      : "text-success bg-success/10";
  return (
    <div className="flex flex-col justify-between rounded-lg border border-border/60 bg-card p-4">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-md ${toneClass}`}>
        {icon}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-xl border border-border/60 bg-card p-6 transition hover:shadow-[var(--shadow-brand)]">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </article>
  );
}
