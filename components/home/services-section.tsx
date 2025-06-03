"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "@/components/ui/animated-section"
import { Users, Heart, Shield, Activity, Stethoscope, Baby } from "lucide-react"
import Link from "next/link"

const services = [
  {
    icon: Users,
    title: "Medycyna Rodzinna",
    description: "Kompleksowa opieka nad całą rodziną - od niemowląt po seniorów",
    color: "bg-blue-500",
  },
  {
    icon: Heart,
    title: "Kardiologia",
    description: "Diagnostyka i leczenie chorób serca oraz układu krążenia",
    color: "bg-red-500",
  },
  {
    icon: Shield,
    title: "Medycyna Pracy",
    description: "Badania profilaktyczne i orzecznictwo lekarskie dla pracowników",
    color: "bg-green-500",
  },
  {
    icon: Activity,
    title: "Rehabilitacja",
    description: "Fizjoterapia i rehabilitacja po urazach oraz zabiegach",
    color: "bg-purple-500",
  },
  {
    icon: Stethoscope,
    title: "Diagnostyka",
    description: "Nowoczesne badania laboratoryjne i obrazowe",
    color: "bg-orange-500",
  },
  {
    icon: Baby,
    title: "Pediatria",
    description: "Specjalistyczna opieka nad dziećmi i młodzieżą",
    color: "bg-pink-500",
  },
]

export function ServicesSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection animation="fadeInUp">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-4">
              <span className="text-blue-600 text-sm font-medium">NASZE SPECJALIZACJE</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Kompleksowa opieka{" "}
              <span className="text-blue-600 relative">
                medyczna
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Oferujemy szeroki zakres usług medycznych w nowoczesnych warunkach. Nasz zespół doświadczonych
              specjalistów zapewnia najwyższą jakość opieki zdrowotnej.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <AnimatedSection key={service.title} animation="fadeInUp" delay={index * 100}>
              <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div
                      className={`${service.color} p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <service.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection animation="fadeInUp" delay={600}>
          <div className="text-center">
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Link href="/uslugi">Zobacz wszystkie usługi</Link>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
