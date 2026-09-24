import { Braces, Check, Lightbulb, MousePointer2 } from "lucide-react";
import { Container } from "@/components/ui";
import { AppPreview } from "./AppPreview";

const promptLines = [
  "Nonvoyxona uchun mobil buyurtma ilovasi yarat.",
  "Menyu, savat va Telegram buyurtmasi bo'lsin.",
  "To'lov va yetkazishni aniq qadamlarga ajrat.",
] as const;

export function BuildStory() {
  return (
    <section id="goya-prompt-ilova" className="story-section bg-bg" aria-labelledby="story-title">
      <div className="story-track">
        <div className="story-pin">
          <Container className="relative flex h-full flex-col justify-center">
            <div className="story-kicker"><span /><span>G'oyadan amaliyotgacha</span><span /></div>
            <h2 id="story-title" className="sr-only">G'oya, prompt va ishlaydigan ilova</h2>

            <article className="story-layer story-idea" data-reveal>
              <div className="story-idea-mark"><Lightbulb className="size-7" aria-hidden="true" /></div>
              <p className="font-mono text-sm text-brand">01 / G'OYA</p>
              <h3>“Kechqurun non buyurtma qilish oson bo'lsin.”</h3>
              <p>Avval natija va muammo aniq. Texnologiya — keyin.</p>
            </article>

            <article className="story-layer story-prompt" data-reveal>
              <div className="story-window">
                <div className="story-window-bar"><span className="size-2 rounded-full bg-danger" /><span className="size-2 rounded-full bg-gold" /><span className="size-2 rounded-full bg-accent" /><span className="ml-auto font-mono text-[10px] text-ink-subtle">claude · build</span></div>
                <div className="space-y-3 font-mono text-xs sm:text-sm">
                  <p className="flex gap-2 text-accent"><Braces className="mt-0.5 size-4 shrink-0" aria-hidden="true" />Prompt</p>
                  {promptLines.map((line, index) => <p key={line} className={`story-build-line story-build-${index + 1}`}><span>{index + 1}</span>{line}</p>)}
                  <p className="story-build-check"><Check className="size-4" aria-hidden="true" />3 ta foydali bosqich aniqlandi</p>
                </div>
              </div>
            </article>

            <article className="story-layer story-app" data-reveal>
              <div className="story-app-caption"><MousePointer2 className="size-4 text-accent" aria-hidden="true" /><span>Ishlaydigan demo qurildi</span></div>
              <AppPreview />
              <p className="text-center font-mono text-xs text-ink-subtle">Prompt → tarkib → tekshiruv → ilova</p>
            </article>

            <ol className="story-rail" aria-label="Asosiy uch qadam">
              <li><span />G'oya</li><li><span />Prompt</li><li><span />Ilova</li>
            </ol>
          </Container>
        </div>
      </div>
    </section>
  );
}
