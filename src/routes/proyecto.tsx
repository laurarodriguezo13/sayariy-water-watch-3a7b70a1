import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import pozoImg from "@/assets/proyecto-pozo-construccion.jpg";
import zanjaImg from "@/assets/proyecto-zanja-tendido.jpg";
import tuberiaImg from "@/assets/proyecto-tubería-comunidad.jpg";
import geofisicaImg from "@/assets/proyecto-geofisica.jpg";

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
      { property: "og:image", content: tuberiaImg },
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

        <figure className="mt-10 overflow-hidden rounded-lg border border-border">
          <img
            src={tuberiaImg}
            alt="Vecinos de la comunidad caminan junto a la tubería principal recién instalada en Cayaltí, Lambayeque."
            className="aspect-[16/9] w-full object-cover"
            loading="lazy"
          />
          <figcaption className="bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            Tendido de la red principal de distribución desde el pozo Sayariy hacia las viviendas
            de la comunidad — Cayaltí, Lambayeque.
          </figcaption>
        </figure>

        <h2 className="mt-12 text-2xl font-semibold text-foreground">La iniciativa Sayariy Resurgiendo</h2>
        <p className="mt-3 text-muted-foreground">
          La <strong>Asociación Sayariy — Resurgiendo</strong> es una organización sin fines de lucro
          que trabaja con familias rurales del distrito de Cayaltí (provincia de Chiclayo,
          departamento de Lambayeque) para garantizar el acceso a agua segura mediante un sistema
          autónomo de captación subterránea y distribución con energía solar.
        </p>
        <p className="mt-3 text-muted-foreground">
          El proyecto base —<em>Abastecimiento de Agua Subterránea</em>— se sustenta en el informe
          geofísico “Exploración geofísica de aguas subterráneas para ubicación de pozo tubular en
          terrenos de la Asociación Sayariy — Resurgiendo” (Ing. Víctor Hugo Alarcón Cervantes,
          C.I.P. 196624, octubre 2021), que mediante <strong>Sondajes Eléctricos Verticales (SEV)</strong>
          identificó dos puntos óptimos de perforación sobre un acuífero somero de la cuenca del
          río Zaña.
        </p>

        <h2 className="mt-12 text-2xl font-semibold text-foreground">Evidencia visual del proyecto</h2>
        <p className="mt-3 text-muted-foreground">
          Imágenes de campo que documentan las distintas fases de la intervención: prospección
          geofísica, construcción del pozo y tendido de la red de distribución hacia los hogares.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <figure className="overflow-hidden rounded-lg border border-border">
            <img
              src={geofisicaImg}
              alt="Ingeniero realizando un Sondaje Eléctrico Vertical (SEV) en el terreno de la asociación."
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
            />
            <figcaption className="bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
              <strong>Fase 1 — Prospección.</strong> Estudio geofísico (SEV) para localizar el
              acuífero. Cayaltí, 2021.
            </figcaption>
          </figure>

          <figure className="overflow-hidden rounded-lg border border-border">
            <img
              src={pozoImg}
              alt="Trabajador profundizando con pala el pozo de captación de ladrillo."
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
            />
            <figcaption className="bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
              <strong>Fase 2 — Construcción.</strong> Excavación y refuerzo de la cámara del pozo
              tubular junto a la zona protegida.
            </figcaption>
          </figure>

          <figure className="overflow-hidden rounded-lg border border-border sm:col-span-2">
            <img
              src={zanjaImg}
              alt="Familias de la comunidad colaborando en la apertura de zanjas para enterrar la tubería."
              className="aspect-[16/7] w-full object-cover"
              loading="lazy"
            />
            <figcaption className="bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
              <strong>Fase 3 — Distribución.</strong> Vecinos y vecinas abren las zanjas y entierran
              la red secundaria que lleva el agua a cada vivienda. Trabajo comunitario, mayo de 2026.
            </figcaption>
          </figure>
        </div>

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
          Lambayeque (Peru)</em>, ISPRS Archives, XLVIII-3-2024. La capa hidrogeológica se apoya
          en el informe SEV de Alarcón Cervantes (2021) elaborado para la Asociación Sayariy —
          Resurgiendo.
        </p>
      </article>
    </SiteShell>
  );
}
