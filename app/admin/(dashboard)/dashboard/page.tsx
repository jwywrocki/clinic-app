import { getDB } from '@/lib/db';
import { Dashboard } from '../../components/Dashboard';

export default async function AdminDashboardPage() {
    const db = getDB();

    // Fetch data for the dashboard summary
    const pages = await db.findWhere('pages', {});
    const services = await db.findWhere('services', {});
    const news = await db.findWhere('news', {});
    const doctors = await db.findWhere('doctors', {});
    const specializations = await db.findWhere('specializations', {});

    const enrichedDoctors = doctors.map((doc: any) => {
        const spec = specializations.find((s: any) => s.id === doc.specialization);
        return {
            ...doc,
            specialization_name: spec ? spec.name : doc.specialization
        };
    });

    return (
        <Dashboard 
            pages={pages} 
            services={services} 
            news={news} 
            doctors={enrichedDoctors} 
        />
    );
}
