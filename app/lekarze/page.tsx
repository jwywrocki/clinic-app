import { PagesService } from '@/lib/services/pages';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import Link from 'next/link';
import { DoctorsList } from '@/components/doctors-list';

export default async function DoctorsPage() {
  const pageContent = await PagesService.getPublishedBySlug('lekarze');

  return (
    <LayoutWrapper>
      <div id="main-content" className="bg-gradient-to-br from-blue-50 to-white">
        <AnimatedSection animation="fadeInUp">
          <section className="py-20">
            <div className="container mx-auto px-4 text-center">
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 mb-4">
                Nasz Zespół
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                {pageContent?.title || 'Poznaj Naszych Lekarzy'}
              </h1>
              <div
                className="text-xl text-gray-600 max-w-3xl mx-auto prose prose-xl max-w-none text-center"
                dangerouslySetInnerHTML={{
                  __html:
                    pageContent?.content ||
                    'W SPZOZ GOZ Łopuszno pracuje zespół wykwalifikowanych i doświadczonych lekarzy różnych specjalizacji, gotowych nieść pomoc i zapewnić najlepszą opiekę medyczną.',
                }}
              />
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp" delay={200}>
          <section className="py-10 bg-white">
            <div className="container mx-auto px-4">
              <DoctorsList specializationIds={pageContent?.specialization_ids || []} />
            </div>
          </section>
        </AnimatedSection>

        <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Chcesz umówić wizytę?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Nasi specjaliści są do Twojej dyspozycji. Skontaktuj się z rejestracją, aby ustalić
              dogodny termin.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100"
              asChild
            >
              <Link href="/kontakt#formularz">
                <Calendar className="h-5 w-5 mr-2" />
                Umów się na wizytę
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </LayoutWrapper>
  );
}
