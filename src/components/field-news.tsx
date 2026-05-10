import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getFieldNewsFn } from "@/lib/news.functions";
import type { FieldNewsItem, NewsCategory, NewsSeverity } from "@/lib/news.server";

const SEVERITY_STYLES: Record<NewsSeverity, string> = {
  alta: "bg-red-50 border-red-200 text-red-800",
  media: "bg-amber-50 border-amber-200 text-amber-800",
  baja: "bg-green-50 border-green-200 text-green-800",
};

const SEVERITY_DOT: Record<NewsSeverity, string> = {
  alta: "bg-red-500",
  media: "bg-amber-400",
  baja: "bg-green-500",
};

const CATEGORY_EMOJI: Record<NewsCategory, string> = {
  clima: "🌧️",
  sismo: "🌍",
  agua: "💧",
  plaga: "🐛",
  social: "👥",
  otros: "📰",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-PE", { day: "numeric", month: "short" });
}

function NewsCard({ item }: { item: FieldNewsItem }) {
  return (
    <a
      href={item.source_url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block rounded-xl border p-4 transition hover:shadow-md ${SEVERITY_STYLES[item.severity]}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none">{CATEGORY_EMOJI[item.category]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${SEVERITY_DOT[item.severity]}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
              {item.severity} · {item.category}
            </span>
          </div>
          <h3 className="mt-1 text-sm font-bold leading-tight">{item.title_es}</h3>
          <p className="mt-1 text-sm leading-snug opacity-90">{item.summary_es}</p>
          {item.action_es && (
            <p className="mt-2 text-sm font-semibold">→ {item.action_es}</p>
          )}
          <div className="mt-2 flex items-center justify-between text-[11px] opacity-70">
            <span>{item.source}</span>
            <span>{formatDate(item.published_at)}</span>
          </div>
        </div>
      </div>
    </a>
  );
}

export function FieldNews() {
  const fetchNews = useServerFn(getFieldNewsFn);
  const { data, isLoading, error } = useQuery({
    queryKey: ["field-news"],
    queryFn: () => fetchNews(),
    staleTime: 25 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-foreground">
        📡 Noticias y alertas del Perú
      </h2>
      {isLoading ? (
        <div className="animate-pulse rounded-xl bg-secondary/60 h-24" />
      ) : error || data?.error ? (
        <div className="rounded-xl border border-border/60 bg-card p-4 text-sm text-muted-foreground">
          No se pudieron cargar las noticias en este momento.
        </div>
      ) : !data?.items?.length ? (
        <div className="rounded-xl border border-border/60 bg-card p-4 text-sm text-muted-foreground">
          Sin alertas relevantes en este momento. ✅
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
      <p className="text-[10px] text-center text-muted-foreground">
        Fuentes: ReliefWeb (ONU), USGS, GDACS · Resumido por IA · Actualizado cada 30 min
      </p>
    </div>
  );
}
