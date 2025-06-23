'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { FadeIn } from '@/components/ui/animation-helpers';
import {
    FileText,
    Stethoscope,
    Newspaper,
    Activity,
    TrendingUp,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    BarChart3,
    Server,
    Database,
    Shield,
    AlertTriangle,
    Info,
    Globe,
    Settings,
    RefreshCw,
    HardDrive,
    Wifi,
    Zap,
} from 'lucide-react';
import { Page } from '@/lib/types/pages';
import { Service } from '@/lib/types/services';
import { NewsItem } from '@/lib/types/news';
import { Doctor } from '@/lib/types/doctors';

interface DashboardProps {
    pages: Page[];
    services: Service[];
    news: NewsItem[];
    doctors: Doctor[];
}

interface SystemStatus {
    scheduler_status: string;
    backup_enabled: boolean;
    backup_frequency: string;
    retention_days: number;
    last_backup?: {
        created_at: string;
        status: string;
    };
    next_backup: string;
    total_backups_count: number;
    completed_backups_count: number;
    failed_backups_count: number;
    in_progress_backups_count: number;
    physical_backups_count: number;
    old_backups_count: number;
}

interface SurveyStats {
    total_surveys: number;
    published_surveys: number;
    draft_surveys: number;
    total_responses: number;
    recent_responses: number;
    most_active_survey: {
        title: string;
        responses: number;
    } | null;
}

export function Dashboard({ pages, services, news, doctors }: DashboardProps) {
    const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
    const [surveyStats, setSurveyStats] = useState<SurveyStats | null>(null);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [loadingSurveyStats, setLoadingSurveyStats] = useState(false);

    const publishedPages = pages.filter((page) => page.is_published).length;
    const draftPages = pages.length - publishedPages;
    const publishedNews = news.filter((item) => item.is_published).length;
    const draftNews = news.length - publishedNews;
    const activeDoctors = doctors.filter((doctor) => doctor.is_active).length;
    const inactiveDoctors = doctors.length - activeDoctors;

    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 7);
    const recentPages = pages.filter((page) => new Date(page.updated_at) > recentDate);
    const recentNews = news.filter((item) => new Date(item.updated_at) > recentDate);
    const recentDoctors = doctors.filter((doctor) => new Date(doctor.updated_at || doctor.created_at) > recentDate);

    const fetchSystemStatus = async () => {
        setLoadingStatus(true);
        try {
            const response = await fetch('/api/admin/scheduler');
            if (response.ok) {
                const data = await response.json();
                setSystemStatus(data);
            }
        } catch (error) {
            console.error('Error fetching system status:', error);
        } finally {
            setLoadingStatus(false);
        }
    };

    const fetchSurveyStats = async () => {
        setLoadingSurveyStats(true);
        try {
            const response = await fetch('/api/admin/surveys/stats');
            if (response.ok) {
                const data = await response.json();
                setSurveyStats(data);
            }
        } catch (error) {
            console.error('Error fetching survey stats:', error);
        } finally {
            setLoadingSurveyStats(false);
        }
    };

    useEffect(() => {
        fetchSystemStatus();
        fetchSurveyStats();
    }, []);

    const getNextBackupTime = () => {
        if (!systemStatus?.next_backup) return 'Nieznana';
        const nextBackup = new Date(systemStatus.next_backup);
        const now = new Date();
        const diffInHours = Math.ceil((nextBackup.getTime() - now.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Wkrótce';
        if (diffInHours < 24) return `Za ${diffInHours}h`;
        return nextBackup.toLocaleDateString('pl-PL');
    };

    const getLastBackupStatus = () => {
        if (!systemStatus?.last_backup) return { text: 'Brak danych', variant: 'secondary' as const };

        const lastBackup = new Date(systemStatus.last_backup.created_at);
        const now = new Date();
        const diffInHours = (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60);

        if (systemStatus.last_backup.status === 'completed') {
            // Calculate expected backup interval based on frequency
            let expectedIntervalHours = 24; // default daily
            if (systemStatus.backup_frequency === 'weekly') {
                expectedIntervalHours = 24 * 7;
            } else if (systemStatus.backup_frequency === 'monthly') {
                expectedIntervalHours = 24 * 30;
            }

            // Allow some buffer time (1.5x the expected interval before warning)
            const warningThreshold = expectedIntervalHours * 1.5;
            const errorThreshold = expectedIntervalHours * 2;

            if (diffInHours < warningThreshold) return { text: 'Aktualny', variant: 'default' as const };
            if (diffInHours < errorThreshold) return { text: 'Ostrzeżenie', variant: 'secondary' as const };
            return { text: 'Przestarzały', variant: 'destructive' as const };
        } else {
            return { text: 'Błąd', variant: 'destructive' as const };
        }
    };

    const lastBackupStatus = getLastBackupStatus();

    return (
        <div className="space-y-8">
            {/* Header with Welcome Message */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Panel Administracyjny</h1>
                        <p className="text-blue-100 mt-1">Witaj w systemie zarządzania stroną kliniki</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-blue-100">Dziś</p>
                        <p className="text-lg font-semibold">
                            {new Date().toLocaleDateString('pl-PL', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* System Status Cards */}
            <AnimatedGroup animation="scaleIn" staggerDelay={50} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Server className="h-4 w-4 text-green-600" />
                                    <p className="text-xs font-medium text-gray-600">Status systemu</p>
                                </div>
                                <p className="text-lg font-bold text-green-600">Online</p>
                            </div>
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Database className="h-4 w-4 text-blue-600" />
                                    <p className="text-xs font-medium text-gray-600">Backup</p>
                                </div>
                                <p className="text-lg font-bold text-gray-900">{lastBackupStatus.text}</p>
                            </div>
                            <Badge variant={lastBackupStatus.variant} className="text-xs">
                                {systemStatus?.backup_enabled ? 'Aktywny' : 'Wyłączony'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Zap className="h-4 w-4 text-yellow-600" />
                                    <p className="text-xs font-medium text-gray-600">Scheduler</p>
                                </div>
                                <p className="text-lg font-bold text-gray-900">{systemStatus?.scheduler_status === 'active' ? 'Aktywny' : 'Nieaktywny'}</p>
                            </div>
                            {systemStatus?.scheduler_status === 'active' ? <CheckCircle className="h-6 w-6 text-green-600" /> : <XCircle className="h-6 w-6 text-red-600" />}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Globe className="h-4 w-4 text-purple-600" />
                                    <p className="text-xs font-medium text-gray-600">Witryna</p>
                                </div>
                                <p className="text-lg font-bold text-green-600">Dostępna</p>
                            </div>
                            <Wifi className="h-6 w-6 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
            </AnimatedGroup>

            {/* Main Content Statistics */}
            <AnimatedGroup animation="scaleIn" staggerDelay={100} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-5 gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700">Strony</p>
                                <p className="text-3xl font-bold text-blue-900">{pages.length}</p>
                                <p className="text-xs text-blue-600 mt-1">
                                    {publishedPages} opublikowanych • {draftPages} szkiców
                                </p>
                            </div>
                            <div className="bg-blue-600 p-3 rounded-full">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700">Aktualności</p>
                                <p className="text-3xl font-bold text-green-900">{news.length}</p>
                                <p className="text-xs text-green-600 mt-1">
                                    {publishedNews} opublikowanych • {recentNews.length} nowych
                                </p>
                            </div>
                            <div className="bg-green-600 p-3 rounded-full">
                                <Newspaper className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-700">Usługi</p>
                                <p className="text-3xl font-bold text-purple-900">{services.length}</p>
                                <p className="text-xs text-purple-600 mt-1">Wszystkie dostępne usługi</p>
                            </div>
                            <div className="bg-purple-600 p-3 rounded-full">
                                <Stethoscope className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-700">Lekarze</p>
                                <p className="text-3xl font-bold text-orange-900">{doctors.length}</p>
                                <p className="text-xs text-orange-600 mt-1">
                                    {activeDoctors} aktywnych • {inactiveDoctors} nieaktywnych
                                </p>
                            </div>
                            <div className="bg-orange-600 p-3 rounded-full">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-teal-700">Ankiety</p>
                                <p className="text-3xl font-bold text-teal-900">{surveyStats?.total_surveys || 0}</p>
                                <p className="text-xs text-teal-600 mt-1">
                                    {surveyStats?.published_surveys || 0} aktywnych • {surveyStats?.total_responses || 0} odpowiedzi
                                </p>
                            </div>
                            <div className="bg-teal-600 p-3 rounded-full">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </AnimatedGroup>

            {/* System Management & Backup Information */}
            <AnimatedGroup animation="fadeInUp" staggerDelay={150} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <HardDrive className="h-5 w-5 text-blue-600" />
                            System Backup
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Status</span>
                            <Badge variant={lastBackupStatus.variant} className="text-xs">
                                {lastBackupStatus.text}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Częstotliwość</span>
                            <span className="text-sm font-medium">{systemStatus?.backup_frequency || 'Nieznana'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Następny backup</span>
                            <span className="text-sm font-medium">{getNextBackupTime()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Udane kopie</span>
                            <span className="text-sm font-medium text-green-600">{systemStatus?.completed_backups_count || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Nieudane kopie</span>
                            <span className="text-sm font-medium text-red-600">{systemStatus?.failed_backups_count || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Pliki fizyczne</span>
                            <span className="text-sm font-medium">{systemStatus?.physical_backups_count || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Do usunięcia</span>
                            <span className="text-sm font-medium text-red-600">{systemStatus?.old_backups_count || 0}</span>
                        </div>
                        <Button size="sm" className="w-full mt-3" onClick={fetchSystemStatus} disabled={loadingStatus}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${loadingStatus ? 'animate-spin' : ''}`} />
                            Odśwież status
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <BarChart3 className="h-5 w-5 text-green-600" />
                            Aktywność (7 dni)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm">Zaktualizowane strony</span>
                            </div>
                            <span className="text-sm font-bold text-blue-600">{recentPages.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm">Nowe aktualności</span>
                            </div>
                            <span className="text-sm font-bold text-green-600">{recentNews.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <span className="text-sm">Zaktualizowani lekarze</span>
                            </div>
                            <span className="text-sm font-bold text-orange-600">{recentDoctors.length}</span>
                        </div>
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span className="text-xs text-gray-600">Łączna aktywność: {recentPages.length + recentNews.length + recentDoctors.length} zmian</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Shield className="h-5 w-5 text-purple-600" />
                            Powiadomienia systemu
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {systemStatus && systemStatus.completed_backups_count !== systemStatus.physical_backups_count && (
                            <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-medium text-yellow-800">Niezgodność backupów</p>
                                    <p className="text-xs text-yellow-700">
                                        Liczba plików ({systemStatus.physical_backups_count}) różni się od udanych kopii w bazie ({systemStatus.completed_backups_count})
                                    </p>
                                </div>
                            </div>
                        )}

                        {(systemStatus?.old_backups_count ?? 0) > 0 && (
                            <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                <Info className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-medium text-red-800">Stare backupy</p>
                                    <p className="text-xs text-red-700">{systemStatus?.old_backups_count ?? 0} starych kopii do usunięcia</p>
                                </div>
                            </div>
                        )}

                        {!systemStatus?.backup_enabled && (
                            <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-medium text-yellow-800">Backup wyłączony</p>
                                    <p className="text-xs text-yellow-700">Włącz automatyczne kopie zapasowe</p>
                                </div>
                            </div>
                        )}

                        {draftPages > 0 && (
                            <div className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-medium text-blue-800">Szkice stron</p>
                                    <p className="text-xs text-blue-700">{draftPages} stron oczekuje na publikację</p>
                                </div>
                            </div>
                        )}

                        {draftNews > 0 && (
                            <div className="flex items-start gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                                <Info className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-medium text-green-800">Szkice aktualności</p>
                                    <p className="text-xs text-green-700">{draftNews} aktualności do opublikowania</p>
                                </div>
                            </div>
                        )}

                        {inactiveDoctors > 0 && (
                            <div className="flex items-start gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                                <Info className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-medium text-orange-800">Nieaktywni lekarze</p>
                                    <p className="text-xs text-orange-700">{inactiveDoctors} lekarzy jest nieaktywnych</p>
                                </div>
                            </div>
                        )}

                        {systemStatus?.backup_enabled && draftPages === 0 && draftNews === 0 && inactiveDoctors === 0 && (
                            <div className="flex items-start gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-medium text-green-800">Wszystko w porządku</p>
                                    <p className="text-xs text-green-700">System działa bez problemów</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <BarChart3 className="h-5 w-5 text-teal-600" />
                            Statystyki ankiet
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Wszystkie ankiety</span>
                            <span className="text-sm font-medium">{surveyStats?.total_surveys || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Opublikowane</span>
                            <span className="text-sm font-medium text-green-600">{surveyStats?.published_surveys || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Szkice</span>
                            <span className="text-sm font-medium text-gray-600">{surveyStats?.draft_surveys || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Łączne odpowiedzi</span>
                            <span className="text-sm font-medium text-blue-600">{surveyStats?.total_responses || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Ostatnie 7 dni</span>
                            <span className="text-sm font-medium text-purple-600">{surveyStats?.recent_responses || 0}</span>
                        </div>
                        {surveyStats?.most_active_survey && (
                            <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="h-4 w-4 text-teal-600" />
                                    <span className="text-xs font-medium text-teal-800">Najpopularniejsza ankieta</span>
                                </div>
                                <p className="text-xs text-teal-700 font-medium truncate">{surveyStats.most_active_survey.title}</p>
                                <p className="text-xs text-teal-600">{surveyStats.most_active_survey.responses} odpowiedzi</p>
                            </div>
                        )}
                        <Button size="sm" className="w-full mt-3" onClick={fetchSurveyStats} disabled={loadingSurveyStats}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${loadingSurveyStats ? 'animate-spin' : ''}`} />
                            Odśwież statystyki
                        </Button>
                    </CardContent>
                </Card>
            </AnimatedGroup>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FadeIn direction="left" delay={0} threshold={0.3}>
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Activity className="h-5 w-5 text-blue-600" />
                                Ostatnie strony
                                {recentPages.length > 0 && (
                                    <Badge variant="secondary" className="ml-auto text-xs">
                                        {recentPages.length} nowych
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pages.length > 0 ? (
                                <div className="space-y-3">
                                    {pages.slice(0, 5).map((page) => (
                                        <div key={page.id} className="group flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">{page.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock className="h-3 w-3 text-gray-400" />
                                                    <p className="text-xs text-gray-500">{new Date(page.updated_at).toLocaleDateString('pl-PL')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-3">
                                                <Badge
                                                    variant={page.is_published ? 'default' : 'secondary'}
                                                    className={`text-xs ${page.is_published ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                                                >
                                                    {page.is_published ? 'Opublikowana' : 'Szkic'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">Brak stron do wyświetlenia</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </FadeIn>

                <FadeIn direction="right" delay={200} threshold={0.3}>
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Newspaper className="h-5 w-5 text-purple-600" />
                                Ostatnie aktualności
                                {recentNews.length > 0 && (
                                    <Badge variant="secondary" className="ml-auto text-xs">
                                        {recentNews.length} nowych
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {news.length > 0 ? (
                                <div className="space-y-3">
                                    {news.slice(0, 5).map((item) => (
                                        <div key={item.id} className="group flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate group-hover:text-purple-600 transition-colors">{item.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock className="h-3 w-3 text-gray-400" />
                                                    <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString('pl-PL')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-3">
                                                <Badge
                                                    variant={item.is_published ? 'default' : 'secondary'}
                                                    className={`text-xs ${item.is_published ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                                                >
                                                    {item.is_published ? 'Opublikowana' : 'Szkic'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Newspaper className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">Brak aktualności do wyświetlenia</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </FadeIn>
            </div>

            {/* Quick Actions & Doctors Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <FadeIn direction="up" delay={0} threshold={0.3}>
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Settings className="h-5 w-5 text-gray-600" />
                                Szybkie akcje
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-start" size="sm">
                                <FileText className="h-4 w-4 mr-2" />
                                Dodaj nową stronę
                            </Button>
                            <Button variant="outline" className="w-full justify-start" size="sm">
                                <Newspaper className="h-4 w-4 mr-2" />
                                Dodaj aktualność
                            </Button>
                            <Button variant="outline" className="w-full justify-start" size="sm">
                                <Users className="h-4 w-4 mr-2" />
                                Zarządzaj lekarzami
                            </Button>
                            <Button variant="outline" className="w-full justify-start" size="sm">
                                <Database className="h-4 w-4 mr-2" />
                                Backup systemu
                            </Button>
                            <Button variant="outline" className="w-full justify-start" size="sm">
                                <Globe className="h-4 w-4 mr-2" />
                                Ustawienia SEO
                            </Button>
                        </CardContent>
                    </Card>
                </FadeIn>

                {/* Doctors Overview */}
                <div className="lg:col-span-2">
                    <FadeIn direction="up" delay={100} threshold={0.3}>
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Users className="h-5 w-5 text-orange-600" />
                                    Zespół lekarski
                                    <Badge variant="secondary" className="ml-auto text-xs">
                                        {activeDoctors}/{doctors.length} aktywnych
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {doctors.length > 0 ? (
                                    <AnimatedGroup animation="scaleIn" staggerDelay={50} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {doctors.slice(0, 6).map((doctor) => (
                                            <div
                                                key={doctor.id}
                                                className="group flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-purple-50 rounded-lg transition-all duration-200 hover:shadow-md"
                                            >
                                                <div className="relative">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                                                        {doctor.first_name.charAt(0)}
                                                        {doctor.last_name.charAt(0)}
                                                    </div>
                                                    <div
                                                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${doctor.is_active ? 'bg-green-500' : 'bg-gray-400'}`}
                                                    ></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                                        Dr. {doctor.first_name} {doctor.last_name}
                                                    </p>
                                                    <p className="text-sm text-gray-500 truncate">{doctor.specialization}</p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <div className={`w-2 h-2 rounded-full ${doctor.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                                        <span className={`text-xs ${doctor.is_active ? 'text-green-600' : 'text-gray-500'}`}>{doctor.is_active ? 'Aktywny' : 'Nieaktywny'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </AnimatedGroup>
                                ) : (
                                    <div className="text-center py-8">
                                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">Brak lekarzy do wyświetlenia</p>
                                    </div>
                                )}
                                {doctors.length > 6 && (
                                    <div className="mt-4 text-center">
                                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                            Pokaż wszystkich ({doctors.length}) →
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </FadeIn>
                </div>
            </div>
        </div>
    );
}
