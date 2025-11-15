import { useState } from 'react';
import { Train, Ticket, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TrainSearch from './TrainSearch';
import BookingForm from './BookingForm';
import BookingSuccess from './BookingSuccess';
import MyBookings from './MyBookings';
import { Train as TrainType } from '../lib/supabase';

type View = 'search' | 'booking' | 'success' | 'myBookings';

export default function Dashboard() {
  const { signOut } = useAuth();
  const [currentView, setCurrentView] = useState<View>('search');
  const [selectedTrain, setSelectedTrain] = useState<TrainType | null>(null);
  const [pnrNumber, setPnrNumber] = useState('');

  const handleSelectTrain = (train: TrainType) => {
    setSelectedTrain(train);
    setCurrentView('booking');
  };

  const handleBookingSuccess = (pnr: string) => {
    setPnrNumber(pnr);
    setCurrentView('success');
  };

  const handleBackToSearch = () => {
    setCurrentView('search');
    setSelectedTrain(null);
  };

  const handleViewBookings = () => {
    setCurrentView('myBookings');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Train className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">RailBook</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('search')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  currentView === 'search'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Train className="w-5 h-5" />
                <span className="hidden sm:inline">Search Trains</span>
              </button>

              <button
                onClick={handleViewBookings}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  currentView === 'myBookings'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Ticket className="w-5 h-5" />
                <span className="hidden sm:inline">My Bookings</span>
              </button>

              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'search' && (
          <div>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Book Your Train Tickets
              </h1>
              <p className="text-gray-600">
                Search for trains and book your journey in seconds
              </p>
            </div>
            <TrainSearch onSelectTrain={handleSelectTrain} />
          </div>
        )}

        {currentView === 'booking' && selectedTrain && (
          <BookingForm
            train={selectedTrain}
            onBack={handleBackToSearch}
            onSuccess={handleBookingSuccess}
          />
        )}

        {currentView === 'success' && (
          <BookingSuccess
            pnrNumber={pnrNumber}
            onViewBookings={handleViewBookings}
          />
        )}

        {currentView === 'myBookings' && (
          <MyBookings onBack={handleBackToSearch} />
        )}
      </main>

      <footer className="bg-white mt-16 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 text-sm">
            <p>RailBook - Online Train Ticket Booking System</p>
            <p className="mt-1">Fast, Reliable, and Available 24/7</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
