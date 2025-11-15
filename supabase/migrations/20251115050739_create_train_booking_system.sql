/*
  # Train Ticket Booking System Database Schema

  ## Overview
  Complete database schema for a train ticket booking system with user authentication,
  train management, bookings, and payment tracking.

  ## New Tables

  ### 1. `profiles`
  User profile information extending Supabase auth.users
  - `id` (uuid, primary key) - References auth.users
  - `full_name` (text) - User's full name
  - `phone` (text) - Contact number
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. `trains`
  Train information and schedules
  - `id` (uuid, primary key) - Unique train identifier
  - `train_number` (text, unique) - Official train number
  - `train_name` (text) - Train name
  - `source_station` (text) - Starting station
  - `destination_station` (text) - End station
  - `departure_time` (time) - Scheduled departure time
  - `arrival_time` (time) - Scheduled arrival time
  - `total_seats` (integer) - Total available seats
  - `available_seats` (integer) - Currently available seats
  - `fare` (numeric) - Ticket price
  - `journey_date` (date) - Date of journey
  - `status` (text) - Train status (active/cancelled/delayed)
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. `bookings`
  Ticket booking records
  - `id` (uuid, primary key) - Unique booking identifier
  - `user_id` (uuid) - References profiles(id)
  - `train_id` (uuid) - References trains(id)
  - `booking_date` (timestamptz) - When booking was made
  - `passenger_name` (text) - Passenger name
  - `passenger_age` (integer) - Passenger age
  - `passenger_gender` (text) - Passenger gender
  - `seat_number` (text) - Assigned seat number
  - `fare` (numeric) - Ticket fare
  - `payment_status` (text) - Payment status (pending/completed/failed)
  - `booking_status` (text) - Booking status (confirmed/cancelled/waiting)
  - `pnr_number` (text, unique) - Passenger Name Record number
  - `created_at` (timestamptz) - Booking creation timestamp

  ## Security
  - Enable RLS on all tables
  - Users can only view and manage their own bookings
  - Authenticated users can view train information
  - Users can update their own profiles
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create trains table
CREATE TABLE IF NOT EXISTS trains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  train_number text UNIQUE NOT NULL,
  train_name text NOT NULL,
  source_station text NOT NULL,
  destination_station text NOT NULL,
  departure_time time NOT NULL,
  arrival_time time NOT NULL,
  total_seats integer NOT NULL DEFAULT 100,
  available_seats integer NOT NULL DEFAULT 100,
  fare numeric(10, 2) NOT NULL,
  journey_date date NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active trains"
  ON trains FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  train_id uuid NOT NULL REFERENCES trains(id) ON DELETE CASCADE,
  booking_date timestamptz DEFAULT now(),
  passenger_name text NOT NULL,
  passenger_age integer NOT NULL,
  passenger_gender text NOT NULL,
  seat_number text NOT NULL,
  fare numeric(10, 2) NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  booking_status text NOT NULL DEFAULT 'confirmed',
  pnr_number text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to generate PNR number
CREATE OR REPLACE FUNCTION generate_pnr()
RETURNS text AS $$
BEGIN
  RETURN 'PNR' || LPAD(floor(random() * 10000000)::text, 10, '0');
END;
$$ LANGUAGE plpgsql;

-- Create function to update train seat availability
CREATE OR REPLACE FUNCTION update_train_seats()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.booking_status = 'confirmed' THEN
    UPDATE trains
    SET available_seats = available_seats - 1
    WHERE id = NEW.train_id AND available_seats > 0;
  ELSIF TG_OP = 'UPDATE' AND OLD.booking_status = 'confirmed' AND NEW.booking_status = 'cancelled' THEN
    UPDATE trains
    SET available_seats = available_seats + 1
    WHERE id = NEW.train_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for seat availability
DROP TRIGGER IF EXISTS update_seats_on_booking ON bookings;
CREATE TRIGGER update_seats_on_booking
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_train_seats();

-- Insert sample train data
INSERT INTO trains (train_number, train_name, source_station, destination_station, departure_time, arrival_time, fare, journey_date, total_seats, available_seats)
VALUES
  ('12301', 'Rajdhani Express', 'New Delhi', 'Mumbai Central', '17:00:00', '08:35:00', 1500.00, CURRENT_DATE + INTERVAL '1 day', 100, 100),
  ('12951', 'Mumbai Rajdhani', 'Mumbai Central', 'New Delhi', '16:55:00', '08:35:00', 1500.00, CURRENT_DATE + INTERVAL '1 day', 100, 100),
  ('12302', 'Kolkata Rajdhani', 'New Delhi', 'Kolkata', '16:55:00', '10:05:00', 1800.00, CURRENT_DATE + INTERVAL '2 days', 100, 100),
  ('12423', 'Dibrugarh Rajdhani', 'New Delhi', 'Dibrugarh', '11:00:00', '10:30:00', 2500.00, CURRENT_DATE + INTERVAL '2 days', 100, 100),
  ('12952', 'New Delhi Rajdhani', 'Mumbai Central', 'New Delhi', '17:00:00', '08:35:00', 1500.00, CURRENT_DATE + INTERVAL '3 days', 100, 100),
  ('12650', 'Karnataka Sampark Kranti', 'Yesvantpur', 'Hazrat Nizamuddin', '20:15:00', '04:45:00', 1200.00, CURRENT_DATE + INTERVAL '1 day', 120, 120),
  ('22691', 'Bangalore Rajdhani', 'Bangalore', 'New Delhi', '20:00:00', '05:55:00', 2000.00, CURRENT_DATE + INTERVAL '2 days', 100, 100),
  ('12626', 'Kerala Express', 'New Delhi', 'Trivandrum', '11:00:00', '23:30:00', 1800.00, CURRENT_DATE + INTERVAL '1 day', 150, 150)
ON CONFLICT (train_number) DO NOTHING;