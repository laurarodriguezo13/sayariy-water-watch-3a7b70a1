import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Globe } from "lucide-react";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto — Sayariy CropGuard" },
      {
        name: "description",
        content: "Contacta al equipo de Sayariy Resurgiendo y al equipo de CropGuard.",
      },
    ],
  }),
  component: ContactoPage,
});

function ContactoPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Contacto</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground">Hablemos</h1>
        <p className="mt-3 text-muted-foreground">
          Si tu organización trabaja con comunidades rurales o quieres apoyar a Sayariy,
          escríbenos.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <a
            href="https://sayariyperu.org"
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-5 hover:border-primary/50"
          >
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-semibold text-foreground">Sitio oficial</div>
              <div className="text-sm text-muted-foreground">sayariyperu.org</div>
            </div>
          </a>
          <a
            href="mailto:contacto@sayariyperu.org"
            className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-5 hover:border-primary/50"
          >
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-semibold text-foreground">Correo</div>
              <div className="text-sm text-muted-foreground">contacto@sayariyperu.org</div>
            </div>
          </a>
          <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-5 sm:col-span-2">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-semibold text-foreground">Operaciones</div>
              <div className="text-sm text-muted-foreground">Lambayeque, Perú</div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
