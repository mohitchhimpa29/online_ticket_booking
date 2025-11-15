import { useState, useEffect } from 'react';
import { Search, Calendar, MapPin } from 'lucide-react';
import { supabase, Train } from '../lib/supabase';

type TrainSearchProps = {
  onSelectTrain: (train: Train) => void;
};

export default function TrainSearch({ onSelectTrain }: TrainSearchProps) {
  const [trains, setTrains] = useState<Train[]>([]);
  const [filteredTrains, setFilteredTrains] = useState<Train[]>([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const fetchTrains = async () => {
    setLoading(true);
    setSearched(true);

    try {
      let query = supabase
        .from('trains')
        .select('*')
        .eq('status', 'active')
        .gte('journey_date', date)
        .order('departure_time', { ascending: true });

      if (source) {
        query = query.ilike('source_station', `%${source}%`);
      }

      if (destination) {
        query = query.ilike('destination_station', `%${destination}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTrains(data || []);
      setFilteredTrains(data || []);
    } catch (error) {
      console.error('Error fetching trains:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrains();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Source station"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Destination station"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Journey Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              {loading ? 'Searching...' : 'Search Trains'}
            </button>
          </div>
        </div>
      </form>

      {searched && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800">
            Available Trains ({filteredTrains.length})
          </h3>

          {filteredTrains.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <p className="text-gray-600">No trains found for the selected route and date.</p>
            </div>
          ) : (
            filteredTrains.map((train) => (
              <div
                key={train.id}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-bold text-gray-800">
                        {train.train_name}
                      </h4>
                      <span className="text-sm text-gray-600">#{train.train_number}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">From</p>
                        <p className="font-semibold text-gray-800">{train.source_station}</p>
                        <p className="text-gray-600">{train.departure_time}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">To</p>
                        <p className="font-semibold text-gray-800">{train.destination_station}</p>
                        <p className="text-gray-600">{train.arrival_time}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-4 text-sm">
                      <span className="text-gray-600">
                        Journey Date: <span className="font-semibold">{new Date(train.journey_date).toLocaleDateString()}</span>
                      </span>
                      <span className={`font-semibold ${train.available_seats > 20 ? 'text-green-600' : train.available_seats > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                        {train.available_seats} seats available
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        ₹{train.fare}
                      </p>
                      <p className="text-sm text-gray-600">per person</p>
                    </div>
                    <button
                      onClick={() => onSelectTrain(train)}
                      disabled={train.available_seats === 0}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {train.available_seats === 0 ? 'Sold Out' : 'Book Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
