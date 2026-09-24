import { MapPin, MessageCircle, ShoppingBag } from "lucide-react";

export function AppPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`app-preview ${compact ? "app-preview-compact" : ""}`} aria-label="Nonvoyxona demo ilovasi">
      <div className="app-preview-bar">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-gold-soft text-brand"><ShoppingBag className="size-4" aria-hidden="true" /></span>
          <span className="text-xs font-bold text-ink">Nonvoyxona</span>
        </div>
        <span className="rounded-full bg-success-soft px-2 py-1 font-mono text-[9px] font-bold text-success">DEMO</span>
      </div>
      <div className="app-preview-body">
        <div className="app-preview-layer app-layer-menu">
          <span className="block h-1.5 w-1/2 rounded bg-border-strong" />
          <div className="space-y-2"><span className="block h-8 rounded-md bg-bg-sunken" /><span className="block h-8 rounded-md bg-gold-soft" /></div>
        </div>
        <div className="app-preview-layer app-layer-order">
          <MapPin className="size-4 shrink-0 text-accent" aria-hidden="true" />
          <div className="flex-1"><span className="block text-xs font-semibold text-ink">Yangi buyurtma</span><span className="block text-[10px] text-ink-muted">Yetkazib berish</span></div>
        </div>
        <div className="app-preview-layer app-layer-chat">
          <MessageCircle className="size-4 shrink-0 text-telegram" aria-hidden="true" />
          <span className="text-xs font-semibold text-ink">Buyurtmangiz tayyor</span>
        </div>
      </div>
      <p className="app-preview-note">Demo interfeys · real buyurtma emas</p>
    </div>
  );
}
