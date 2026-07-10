-- 1. Create the leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 3. Create a policy that allows anyone (anon) to insert leads
DROP POLICY IF EXISTS "Enable insert for anon" ON public.leads;
CREATE POLICY "Enable insert for anon" ON public.leads
  FOR INSERT
  TO anon
  WITH CHECK (true);
