import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useStatus,
  useWell,
  useForecast,
  useIrrigation,
  useEnso,
  useCrops,
  useCommunities,
  useAlerts,
  useAllTimeseries,
  useRainHistory,
} from "@/hooks/use-cropguard";
import { generateReportPdf } from "@/lib/report-pdf";

export function ReportDownloadButton() {
  const { data: status } = useStatus();
  const { data: well } = useWell();
  const { data: forecast } = useForecast();
  const { data: rainHistory } = useRainHistory();
  const { data: irrigation } = useIrrigation();
  const { data: enso } = useEnso();
  const { data: crops } = useCrops();
  const { data: communities } = useCommunities();
  const { data: alerts } = useAlerts();
  const { data: timeseries } = useAllTimeseries();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDownload = async () => {
    setBusy(true);
    setError(null);
    try {
      await generateReportPdf({
        status,
        well,
        forecast,
        rainHistory,
        irrigation,
        enso,
        crops,
        communities,
        alerts,
        timeseries,
      });
    } catch (e) {
      console.error(e);
      setError("No se pudo generar el PDF. Intente de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
      <div>
        <h2 className="text-lg font-bold text-foreground">📄 Reporte completo en PDF</h2>
        <p className="text-xs text-muted-foreground">
          Descargue un informe con el estado actual de pozos, clima, comunidades y cultivos.
        </p>
      </div>
      <Button
        onClick={onDownload}
        disabled={busy}
        className="w-full bg-primary text-primary-foreground"
      >
        {busy ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generando PDF…
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Descargar reporte PDF
          </>
        )}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
