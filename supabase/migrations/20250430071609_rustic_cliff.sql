/*
  # Create tables for property connector

  1. New Tables
    - `property_requests`
      - `id` (uuid, primary key)
      - `wishlist` (text)
      - `name` (text)
      - `gender` (text)
      - `email` (text)
      - `budget` (text)
      - `location` (text)
      - `created_at` (timestamp)
    
    - `contact_messages`
      - `id` (uuid, primary key)
      - `email` (text)
      - `message` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for inserting data
*/

-- Create property_requests table
CREATE TABLE IF NOT EXISTS property_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist text NOT NULL,
  name text NOT NULL,
  gender text NOT NULL,
  email text NOT NULL,
  budget text NOT NULL,
  location text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS and create policy for property_requests
ALTER TABLE property_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert to property_requests"
  ON property_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS and create policy for contact_messages
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert to contact_messages"
  ON contact_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);