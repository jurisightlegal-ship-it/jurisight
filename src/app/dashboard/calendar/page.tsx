'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Edit3,
  Eye,
  Plus,
  ArrowLeft
} from 'lucide-react';

interface CalendarArticle {
  id: number;
  title: string;
  slug: string;
  dek: string;
  status: string;
  scheduledAt: string;
  publishedAt: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
  section: {
    id: number;
    name: string;
    color: string;
  };
}

interface CalendarData {
  [date: string]: CalendarArticle[];
}

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [totalArticles, setTotalArticles] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchCalendarData();
    }
  }, [session, currentMonth, currentYear]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/calendar?month=${currentMonth}&year=${currentYear}`);
      
      if (response.ok) {
        const data = await response.json();
        setCalendarData(data.calendarData);
        setTotalArticles(data.totalArticles);
      } else if (response.status === 403) {
        router.push('/dashboard');
      } else {
        console.error('Failed to fetch calendar data');
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', icon: Edit3 },
      IN_REVIEW: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      NEEDS_REVISIONS: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
      APPROVED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      PUBLISHED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border-0 text-xs`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleDateClick = (day: number) => {
    const dateString = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    setSelectedDate(dateString);
  };

  const getSelectedDateEvents = () => {
    return calendarData[selectedDate] || [];
  };

  const formatSelectedDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return 'Today\'s Events';
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }) + ' Events';
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-16 sm:h-24"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayArticles = calendarData[dateString] || [];
      const isToday = new Date().toDateString() === new Date(currentYear, currentMonth - 1, day).toDateString();
      const isSelected = selectedDate === dateString;

      days.push(
        <div 
          key={day} 
          className={`h-16 sm:h-24 border border-gray-200 dark:border-gray-700 p-1 sm:p-2 cursor-pointer transition-colors ${
            isToday ? 'bg-jurisight-lime/20 dark:bg-jurisight-lime/10' : 
            isSelected ? 'bg-jurisight-royal/20 dark:bg-jurisight-royal/10' : 
            'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          onClick={() => handleDateClick(day)}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={`text-xs sm:text-sm font-medium ${
              isToday ? 'text-jurisight-navy dark:text-white' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {day}
            </span>
            {dayArticles.length > 0 && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                {dayArticles.length}
              </Badge>
            )}
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            {dayArticles.slice(0, 1).map((article) => (
              <div
                key={article.id}
                className="text-xs p-1 rounded bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => router.push(`/articles/${article.slug}`)}
                title={article.title}
              >
                <div className="font-medium text-gray-800 dark:text-gray-200 text-xs leading-tight break-words">
                  {article.title}
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {formatTime(article.scheduledAt)}
                  </span>
                  <div className="scale-75">
                    {getStatusBadge(article.status)}
                  </div>
                </div>
              </div>
            ))}
            {dayArticles.length > 1 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                +{dayArticles.length - 1} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const renderMobileCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayArticles = calendarData[dateString] || [];
      const isToday = new Date().toDateString() === new Date(currentYear, currentMonth - 1, day).toDateString();
      const isSelected = selectedDate === dateString;

      days.push(
        <div 
          key={day} 
          className={`h-12 border border-gray-200 dark:border-gray-700 p-1 cursor-pointer transition-colors ${
            isToday ? 'bg-jurisight-lime/20 dark:bg-jurisight-lime/10' : 
            isSelected ? 'bg-jurisight-royal/20 dark:bg-jurisight-royal/10' : 
            'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          onClick={() => handleDateClick(day)}
        >
          <div className="flex justify-between items-center h-full">
            <span className={`text-sm font-medium ${
              isToday ? 'text-jurisight-navy dark:text-white' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {day}
            </span>
            {dayArticles.length > 0 && (
              <Badge variant="outline" className="text-xs px-1 py-0 h-5">
                {dayArticles.length}
              </Badge>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-jurisight-royal"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 py-4 sm:py-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 mb-2 sm:mb-0"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-jurisight-navy dark:text-white">Content Calendar</h1>
            </div>
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Calendar Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
            <div className="w-full sm:w-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-jurisight-navy dark:text-white">
                {getMonthName(currentMonth)} {currentYear}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                {totalArticles} scheduled article{totalArticles !== 1 ? 's' : ''} this month
              </p>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 flex-1 sm:flex-none"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-1 sm:hidden">Prev</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  setCurrentMonth(now.getMonth() + 1);
                  setCurrentYear(now.getFullYear());
                }}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 flex-1 sm:flex-none"
              >
                <span className="text-xs sm:text-sm">Today</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 flex-1 sm:flex-none"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="ml-1 sm:hidden">Next</span>
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center dark:text-white">
                <CalendarIcon className="h-5 w-5 mr-2 text-jurisight-royal dark:text-blue-400" />
                Scheduled Articles
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                {session.user?.role === 'CONTRIBUTOR' 
                  ? 'Your scheduled articles for publication' 
                  : 'All scheduled articles from contributors'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Desktop Calendar */}
              <div className="hidden sm:block">
                {/* Calendar Header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendarGrid()}
                </div>
              </div>

              {/* Mobile Calendar */}
              <div className="block sm:hidden">
                {/* Calendar Header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={`mobile-day-${index}`} className="p-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {renderMobileCalendarGrid()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Event List */}
          <div className="block sm:hidden mt-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg dark:text-white">{formatSelectedDate(selectedDate)}</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Tap on an event to view details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getSelectedDateEvents().map((article) => (
                    <div
                      key={article.id}
                      className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => router.push(`/articles/${article.slug}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-tight break-words">
                            {article.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatTime(article.scheduledAt)}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          {getStatusBadge(article.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {getSelectedDateEvents().length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No events scheduled for this date</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Button
              onClick={() => router.push('/dashboard/articles/new')}
              className="bg-jurisight-lime text-jurisight-navy hover:bg-jurisight-lime-dark w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="text-sm sm:text-base">Schedule New Article</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/articles')}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              <span className="text-sm sm:text-base">View All Articles</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const now = new Date();
                setCurrentMonth(now.getMonth() + 1);
                setCurrentYear(now.getFullYear());
              }}
              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 w-full"
            >
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm sm:text-base">Go to Current Month</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
