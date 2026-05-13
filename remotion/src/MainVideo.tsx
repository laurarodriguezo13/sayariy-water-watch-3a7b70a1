import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { SceneIntro } from "./scenes/SceneIntro";
import { SceneAppTour } from "./scenes/SceneAppTour";
import { ScenePdf } from "./scenes/ScenePdf";
import { SceneOutro } from "./scenes/SceneOutro";
import { COLORS } from "./theme";

export const FPS = 30;

const D_INTRO = 130;
const D_CAMPO = 150;
const D_POZOS = 130;
const D_CULTIVOS = 130;
const D_RECS = 140;
const D_PDF = 170;
const D_OUTRO = 130;
const T = 16;
const N_TRANS = 6;

export const DURATION =
  D_INTRO + D_CAMPO + D_POZOS + D_CULTIVOS + D_RECS + D_PDF + D_OUTRO - N_TRANS * T;

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={D_INTRO}>
          <SceneIntro />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={D_CAMPO}>
          <SceneAppTour
            eyebrow="01 · VISTA SIMPLE"
            title="Empieza el día con un"
            titleAccent="semáforo claro."
            subtitle="Para el agricultor que llega al campo: estado del día en lenguaje claro, sin jerga ni gráficos técnicos."
            url="cropguard.sayariy.pe/campo"
            src="images/app-campo-top.png"
            callouts={[
              "Semáforo verde / amarillo / rojo",
              "Estado de El Niño Costero (ICEN)",
              "Nivel de agua del pozo, en %",
            ]}
            accentColor={COLORS.magenta}
            panFrom={0}
            panTo={-200}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={D_POZOS}>
          <SceneAppTour
            eyebrow="02 · POZOS"
            title="¿Hay agua para"
            titleAccent="regar hoy?"
            subtitle="Una mirada al pozo y al consejo de riego del día. Sin tablas. Sin cálculos. Solo respuestas."
            url="cropguard.sayariy.pe/pozos"
            src="images/app-pozos.png"
            callouts={[
              "Profundidad y % de agua disponible",
              "Recomendación clara de riego",
              "Cómo afecta el clima al pozo",
            ]}
            accentColor="#3682dc"
            panFrom={0}
            panTo={-150}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={D_CULTIVOS}>
          <SceneAppTour
            eyebrow="03 · CULTIVOS"
            title="El campo, visto"
            titleAccent="desde el espacio."
            subtitle="Sentinel-2 y modelos de IA que detectan estrés hídrico antes de que sea visible al ojo."
            url="cropguard.sayariy.pe/cultivos"
            src="images/app-cultivos.png"
            callouts={[
              "Mapa NDVI · NDWI · Estrés %",
              "Capa satelital actualizada cada 5 días",
              "Zoom hasta cada parcela",
            ]}
            accentColor={COLORS.green}
            panFrom={0}
            panTo={-300}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={D_RECS}>
          <SceneAppTour
            eyebrow="04 · RECOMENDACIONES"
            title="Qué sembrar y"
            titleAccent="cómo cuidarlo."
            subtitle="Guía técnica por cultivo según ENSO, salud satelital y estado del pozo. Decisiones agronómicas, hoy."
            url="cropguard.sayariy.pe/recomendaciones"
            src="images/app-recomendaciones.png"
            callouts={[
              "Ficha por cultivo: maracuyá, frijol, maíz",
              "Atención / favorable / crítico",
              "Acciones concretas para esta semana",
            ]}
            accentColor={COLORS.orange}
            panFrom={0}
            panTo={-200}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={D_PDF}>
          <ScenePdf />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={D_OUTRO}>
          <SceneOutro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
