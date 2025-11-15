import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  created_at: string;
};

export type Train = {
  id: string;
  train_number: string;
  train_name: string;
  source_station: string;
  destination_station: string;
  departure_time: string;
  arrival_time: string;
  total_seats: number;
  available_seats: number;
  fare: number;
  journey_date: string;
  status: string;
  created_at: string;
};

export type Booking = {
  id: string;
  user_id: string;
  train_id: string;
  booking_date: string;
  passenger_name: string;
  passenger_age: number;
  passenger_gender: string;
  seat_number: string;
  fare: number;
  payment_status: string;
  booking_status: string;
  pnr_number: string;
  created_at: string;
  trains?: Train;
};
