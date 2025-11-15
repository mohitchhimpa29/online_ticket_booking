import { CheckCircle, Ticket } from 'lucide-react';

type BookingSuccessProps = {
  pnrNumber: string;
  onViewBookings: () => void;
};

export default function BookingSuccess({ pnrNumber, onViewBookings }: BookingSuccessProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Booking Confirmed!
        </h2>
        <p className="text-gray-600 mb-8">
          Your train ticket has been successfully booked
        </p>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Ticket className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Your PNR Number</span>
          </div>
          <p className="text-4xl font-bold text-blue-600 tracking-wider">
            {pnrNumber}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Save this number for future reference
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            A confirmation has been sent to your email. You can view and manage your booking from your dashboard.
          </p>

          <button
            onClick={onViewBookings}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            View My Bookings
          </button>
        </div>
      </div>
    </div>
  );
}
