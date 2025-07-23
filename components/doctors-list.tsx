'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stethoscope } from 'lucide-react';
import { createSupabaseClient } from '@/lib/supabase';

interface Doctor {
    id: string;
    first_name: string;
    last_name: string;
    specialization: string;
    bio?: string;
    schedule?: string;
    menu_category?: string;
    is_active: boolean;
    order_position?: number;
}

interface DoctorsListProps {
    category?: string;
    className?: string;
}

export function DoctorsList({ category, className = '' }: DoctorsListProps) {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);

    if (category === 'none') {
        return null;
    }

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const supabase = createSupabaseClient();
                if (!supabase) {
                    console.warn('Supabase not configured');
                    return;
                }

                const { data: doctorsData, error: doctorsError } = await supabase.from('doctors').select('*').eq('is_active', true).order('order_position', { ascending: true });

                if (doctorsError) {
                    console.error('Error fetching doctors list:', doctorsError);
                } else {
                    let filteredDoctors = doctorsData || [];

                    if (category && category !== 'all') {
                        filteredDoctors = filteredDoctors.filter((doctor) => doctor.menu_category === category);
                    }

                    setDoctors(filteredDoctors);
                }
            } catch (error) {
                console.error('Error in fetchDoctors:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, [category]);

    if (loading) {
        return (
            <div className={`text-center py-10 ${className}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Ładowanie informacji o lekarzach...</p>
            </div>
        );
    }

    if (doctors.length === 0) {
        return (
            <div className={`text-center py-10 ${className}`}>
                <Stethoscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-500">
                    {category ? `Obecnie nie ma dostępnych informacji o kategории "${category}".` : 'Obecnie nie ma dostępnych informacji o lekarzach.'} Prosimy spróbować później.
                </p>
            </div>
        );
    }

    return (
        <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`}>
            {doctors.map((doctor) => (
                <Card key={doctor.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center">
                            Dr. {doctor.first_name} {doctor.last_name}
                            <Badge variant="secondary" className="m-2 mt-2 bg-blue-100 text-blue-700 text-center">
                                {doctor.specialization}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 line-clamp-3">{doctor.bio || 'Doświadczony specjalista w swojej dziedzinie.'}</p>
                        {doctor.schedule && <div className="text-sm text-gray-500 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: doctor.schedule }} />}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
