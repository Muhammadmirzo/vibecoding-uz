import { MapPin, MessageCircle, Minus, Plus, ShoppingBag } from "lucide-react";

interface AppPreviewProps {
  compact?: boolean;
  detailed?: boolean;
}

export function AppPreview({ compact = false, detailed = false }: AppPreviewProps) {
  if (detailed) {
    return <DetailedAppPreview />;
  }

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
        <div className="app-preview-layer app-layer-menu"><span className="block h-1.5 w-1/2 rounded bg-border-strong" /><div className="space-y-2"><span className="block h-8 rounded-md bg-bg-sunken" /><span className="block h-8 rounded-md bg-gold-soft" /></div></div>
        <div className="app-preview-layer app-layer-order"><MapPin className="size-4 shrink-0 text-accent" aria-hidden="true" /><div className="flex-1"><span className="block text-xs font-semibold text-ink">Yangi buyurtma</span><span className="block text-[10px] text-ink-muted">Yetkazib berish</span></div></div>
        <div className="app-preview-layer app-layer-chat"><MessageCircle className="size-4 shrink-0 text-telegram" aria-hidden="true" /><span className="text-xs font-semibold text-ink">Buyurtmangiz tayyor</span></div>
      </div>
      <p className="app-preview-note">Demo interfeys · real buyurtma emas</p>
    </div>
  );
}

function DetailedAppPreview() {
  return (
    <div className="app-preview app-preview-detailed" aria-label="Nonvoyxona demo interfeysi">
      <div className="app-preview-bar">
        <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-gold-soft text-brand"><ShoppingBag className="size-4" aria-hidden="true" /></span><strong>Nonvoyxona</strong></div>
        <span className="app-demo-badge">DEMO</span>
      </div>
      <div className="app-preview-body app-detail-body">
        <div className="app-preview-layer app-layer-menu app-detail-menu">
          <div className="app-detail-menu-head"><strong>Menyu</strong><small>Bugungi nonlar</small></div>
          {(["Non", "Sovuq", "Salat"] as const).map((item, index) => <div className="app-menu-item" key={item}><span>{item}</span><small>{index === 0 ? "20 000 so'm" : index === 1 ? "8 000 so'm" : "12 000 so'm"}</small></div>)}
        </div>
        <div className="app-preview-layer app-layer-order app-detail-cart">
          <div className="app-detail-menu-head"><strong>Savat</strong><small>1 ta non</small></div>
          <div className="app-cart-line"><span>Non</span><span className="app-quantity"><Minus aria-hidden="true" /> 1 <Plus aria-hidden="true" /></span></div>
          <button type="button" tabIndex={-1}><MessageCircle className="size-4" aria-hidden="true" />Telegram orqali buyurtma</button>
        </div>
      </div>
      <p className="app-preview-note">Demo interfeys · real buyurtma emas</p>
    </div>
  );
}
