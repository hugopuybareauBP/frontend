// frontend/src/components/BookDetails/BookDetails.tsx

import OverviewTab from './OverviewTab';
import AnalysisTab from './AnalysisTab';
import MarketingTab from './MarketingTab';
import ChatTab from './ChatTab';
import DashboardTab from './DashboardTab';
import CoverAnalysisTab from './CoverAnalysisTab';

import { useState, useEffect } from 'react';
import {
    ArrowLeft,
    BookOpen,
    BarChart2,
    Share2,
    MessageSquare,
    ImageIcon,
} from 'lucide-react';

import { authenticatedFetch } from '../../utils/api';
interface BookDetailsProps {
    book: {
        id: string;
        title: string;
        cover: string;
        author: string;
        uploadDate: string;
        synopsis: string;
    };
    onBack: () => void;
}

const tabs = [
    { id: 'overview', label: 'Content Overview', icon: BookOpen },
    { id: 'analysis', label: 'Detailed Analysis', icon: BarChart2 },
    { id: 'marketing', label: 'Marketing', icon: Share2 },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'cover', label: 'Cover Analysis', icon: ImageIcon }
];

const BookDetails = ({ book, onBack }: BookDetailsProps) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                await authenticatedFetch<any>(`${import.meta.env.VITE_API_URL}/books/${book.id}/details`);
            } catch (err) {
                console.error("Error generating book details", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [book.id]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview': return <OverviewTab bookId={book.id} />;
            case 'analysis': return <AnalysisTab bookId={book.id} />;
            case 'marketing': return <MarketingTab bookId={book.id} />;
            case 'cover': return <CoverAnalysisTab bookId={book.id} cover={book.cover} />;
            case 'chat': return <ChatTab bookId={book.id} />;
            case 'dashboard': return <DashboardTab bookId={book.id} />;
            default:
                return null;
        }
    };

    return (
        <div
            className="bg-white rounded-lg p-6 shadow"
            style={{ fontFamily: '"bw gradual", sans-serif' }}
        >
            {/* Back Button */}
            <button
                onClick={onBack}
                className="flex items-center text-[#BB0003] mb-6 hover:underline transition-colors"
            >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Books
            </button>

            {/* Book Header */}
            <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="w-full md:w-1/3 lg:w-1/4">
                    <img
                        src={`${import.meta.env.VITE_API_URL}${book.cover}?${Date.now()}`}
                        alt={book.title}
                        className="w-full rounded-lg shadow-md"
                    />
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-black mb-2">{book.title}</h1>
                    <p className="text-gray-600 text-lg mb-4">by {book.author}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <div className="flex space-x-4 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                                    isActive
                                        ? 'border-[#FF1A1E] text-[#BB0003]'
                                        : 'border-transparent text-gray-500 hover:text-[#BB0003]'
                                }`}
                            >
                                <Icon className="h-4 w-4 mr-2" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500 animate-pulseSlow">
                        <p>Generating book details...</p>
                        <p>This may take a few seconds.</p>
                    </div>
                ) : (
                    <div className="text-black">{renderTabContent()}</div>
                )}
            </div>
        </div>
    );
};

export default BookDetails;
