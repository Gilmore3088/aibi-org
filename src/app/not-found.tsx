import { ArrowGlyph, Button, SiteHeader } from '@/components/mockup';
import { AxHero } from '@/components/ax';

export default function NotFound() {
  return (
    <div className="mockup-scope ax-page">
      <SiteHeader />
      <main>
        <AxHero
          cmd="open page --status 404"
          title="That page is not in our archive."
          lede="It may have moved, or it may not exist yet. While you are here, the free AI readiness assessment takes about three minutes."
          actions={
            <>
              <Button variant="gold" size="lg" href="/assessment/take">
                Take the free assessment <ArrowGlyph />
              </Button>
              <Button variant="ghost-dark" size="lg" href="/">
                Back to home
              </Button>
            </>
          }
        />
      </main>
    </div>
  );
}
