'use client';

import { AnimatedSection } from '@/components/ui/animated-section';
import { Users, Calendar, Award, Clock } from 'lucide-react';

const stats = [
    {
        icon: Users,
        number: '15,000+',
        label: 'Zadowolonych pacjentów',
        color: 'text-blue-600',
    },
    {
        icon: Calendar,
        number: '20+',
        label: 'Lat doświadczenia',
        color: 'text-green-600',
    },
    {
        icon: Award,
        number: '12+',
        label: 'Specjalistów',
        color: 'text-purple-600',
    },
];

export function StatsSection() {
    return (
        <section className="py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                ></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <AnimatedSection animation="fadeInUp">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Zaufanie zbudowane na{' '}
                            <span className="text-blue-200 relative">
                                doświadczeniu
                                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-300 to-blue-100 rounded-full"></div>
                            </span>
                        </h2>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">Przez lata budowaliśmy zaufanie naszych pacjentów, zapewniając najwyższą jakość opieki medycznej</p>
                    </div>
                </AnimatedSection>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {stats.map((stat, index) => (
                        <AnimatedSection key={stat.label} animation="fadeInUp" delay={index * 150}>
                            <div className="text-center group">
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                    <div className={`${stat.color} bg-white p-4 rounded-2xl inline-flex mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <stat.icon className="h-8 w-8" />
                                    </div>
                                    <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">{stat.number}</div>
                                    <div className="text-blue-100 font-medium text-lg">{stat.label}</div>
                                </div>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    );
}
