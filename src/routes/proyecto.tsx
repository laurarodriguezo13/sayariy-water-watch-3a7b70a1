import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/proyecto")({
  head: () => ({
    meta: [
      { title: "El proyecto — Sayariy CropGuard" },
      {
        name: "description",
        content:
          "CropGuard nace de la alianza entre Sayariy Resurgiendo y ESADE para integrar inteligencia satelital con el sistema hídrico solar de las comunidades del norte de Perú.",
      },
      { property: "og:title", content: "El proyecto · Sayariy CropGuard" },
    ],
  }),
  component: ProyectoPage,
});

function ProyectoPage() {
  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">El proyecto</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground">
          Inteligencia satelital al servicio del agua
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Sayariy Perú extrae agua de un acuífero somero y la distribuye con bombas solares en
          comunidades de Lambayeque. CropGuard suma una capa predictiva: imágenes Sentinel-2
          procesadas con modelos de aprendizaje automático para anticipar el estrés hídrico
          de los cultivos 3 a 4 semanas antes de que sea visible a simple vista.
        </p>

        <h2 className="mt-12 text-2xl font-semibold text-foreground">Objetivo</h2>
        <p className="mt-3 text-muted-foreground">
          Construir un sistema de soporte a la decisión escalable, basado en datos abiertos,
          que pueda extenderse a todas las comunidades atendidas por Sayariy.
        </p>

        <h2 className="mt-12 text-2xl font-semibold text-foreground">Datos y modelos</h2>
        <ul className="mt-3 space-y-2 text-muted-foreground">
          <li>• Sentinel-2 L2A (NDVI, NDWI, EVI) — ESA Copernicus, 10 m, cada 5 días.</li>
          <li>• Random Forest para estimar probabilidad de estrés por comunidad.</li>
          <li>• Resúmenes en español generados con LLM para equipos de campo.</li>
        </ul>

        <h2 className="mt-12 text-2xl font-semibold text-foreground">Fundamento académico</h2>
        <p className="mt-3 text-muted-foreground">
          El proyecto replica y extiende Quintanilla et al. (2024), <em>Multiseasonal analysis
          of rice crop yield prediction with Sentinel-2 time series and UAV imagery in
          Lambayeque (Peru)</em>, ISPRS Archives, XLVIII-3-2024.
        </p>
      </article>
    </SiteShell>
  );
}
