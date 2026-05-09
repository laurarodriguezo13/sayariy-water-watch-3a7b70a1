import { Link } from "@tanstack/react-router";
import logo from "@/assets/sayariy-logo.png";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-3">
          <img src={logo} alt="Sayariy Resurgiendo" className="h-12 w-auto" />
          <p className="text-sm text-muted-foreground">
            Inteligencia satelital para anticipar el estrés hídrico en comunidades de Lambayeque, Perú.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Navegación</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/proyecto" className="hover:text-primary">El proyecto</Link></li>
            <li><Link to="/comunidades" className="hover:text-primary">Comunidades</Link></li>
            <li><Link to="/dashboard" className="hover:text-primary">Panel</Link></li>
            <li><Link to="/contacto" className="hover:text-primary">Contacto</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">ODS</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>ODS 2 — Hambre cero</li>
            <li>ODS 1 — Fin de la pobreza</li>
            <li>ODS 13 — Acción por el clima</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Datos</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Sentinel-2 (ESA Copernicus)</li>
            <li>Modelo Random Forest</li>
            <li>Alertas IA en español</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Sayariy Resurgiendo · CropGuard</p>
          <p>ESADE BAIB · Perspectives on AI, Business and Sustainability</p>
        </div>
      </div>
    </footer>
  );
}
