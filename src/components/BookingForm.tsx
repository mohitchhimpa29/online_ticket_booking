import { useState } from 'react';
import { Train, User, Calendar, CreditCard, ArrowLeft } from 'lucide-react';
import { supabase, Train as TrainType } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type BookingFormProps = {
  train: TrainType;
  onBack: () => void;
  onSuccess: (pnrNumber: string) => void;
};

export default function BookingForm({ train, onBack, onSuccess }: BookingFormProps) {
  const { user } = useAuth();
  const [passengerName, setPassengerName] = useState('');
  const [passengerAge, setPassengerAge] = useState('');
  const [passengerGender, setPassengerGender] = useState('male');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!user) throw new Error('User not authenticated');

      const age = parseInt(passengerAge);
      if (age < 1 || age > 120) {
        throw new Error('Please enter a valid age');
      }

      const { data: pnrData } = await supabase.rpc('generate_pnr');
      const pnrNumber = pnrData || `PNR${Date.now()}`;

      const seatNumber = `S${Math.floor(Math.random() * train.total_seats) + 1}`;

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: user.id,
            train_id: train.id,
            passenger_name: passengerName,
            passenger_age: age,
            passenger_gender: passengerGender,
            seat_number: seatNumber,
            fare: train.fare,
            payment_status: 'completed',
            booking_status: 'confirmed',
            pnr_number: pnrNumber,
          },
        ]);

      if (bookingError) throw bookingError;

      onSuccess(pnrNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Search
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-sky-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Train className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">{train.train_name}</h2>
              <p className="text-blue-100">Train #{train.train_number}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-100">From</p>
              <p className="font-semibold text-lg">{train.source_station}</p>
              <p>{train.departure_time}</p>
            </div>
            <div>
              <p className="text-blue-100">To</p>
              <p className="font-semibold text-lg">{train.destination_station}</p>
              <p>{train.arrival_time}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(train.journey_date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <CreditCard className="w-4 h-4" />
              ₹{train.fare}
            </span>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            Passenger Details
          </h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passenger Name
              </label>
              <input
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={passengerAge}
                  onChange={(e) => setPassengerAge(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter age"
                  min="1"
                  max="120"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={passengerGender}
                  onChange={(e) => setPassengerGender(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Fare:</span>
                  <span className="font-semibold">₹{train.fare}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Fee:</span>
                  <span className="font-semibold">₹0</span>
                </div>
                <div className="border-t border-blue-300 my-2 pt-2 flex justify-between text-base">
                  <span className="font-bold text-gray-800">Total Amount:</span>
                  <span className="font-bold text-blue-600">₹{train.fare}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Confirm Booking & Pay'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
