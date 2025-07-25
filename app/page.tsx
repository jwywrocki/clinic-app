import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { SkipLink } from '@/components/ui/skip-link';
import { HeroSection } from '@/components/home/hero-section';
import { ServicesSection } from '@/components/home/services-section';
import { NewsSection } from '@/components/home/news-section';
import { CtaSection } from '@/components/home/cta-section';

export default function HomePage() {
    return (
        <LayoutWrapper>
            <SkipLink href="#main-content">Przejdź do głównej treści</SkipLink>
            <div id="main-content" className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
                <HeroSection />
                <NewsSection />
                <ServicesSection />
                <CtaSection />
            </div>
        </LayoutWrapper>
    );
}
