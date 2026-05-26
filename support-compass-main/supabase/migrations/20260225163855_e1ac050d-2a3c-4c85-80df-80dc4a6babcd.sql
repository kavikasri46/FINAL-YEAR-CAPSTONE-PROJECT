
-- Students table for uploaded data
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  grade TEXT,
  gpa NUMERIC(3,2) DEFAULT 0,
  attendance NUMERIC(5,2) DEFAULT 0,
  assignments_completed NUMERIC(5,2) DEFAULT 0,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  risk_score INTEGER DEFAULT 0,
  phone TEXT,
  parent_name TEXT,
  parent_email TEXT,
  parent_phone TEXT,
  mentor_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Parent alerts table
CREATE TABLE public.parent_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  parent_phone TEXT,
  parent_email TEXT,
  alert_type TEXT NOT NULL DEFAULT 'risk', -- 'risk', 'attendance', 'gpa'
  message TEXT NOT NULL,
  risk_level TEXT,
  sent_via TEXT DEFAULT 'in_app', -- 'in_app', 'sms', 'email'
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Upload history
CREATE TABLE public.data_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  records_count INTEGER DEFAULT 0,
  uploaded_by TEXT,
  status TEXT DEFAULT 'processing', -- 'processing', 'completed', 'failed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prediction results
CREATE TABLE public.predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  risk_level TEXT NOT NULL,
  risk_score INTEGER NOT NULL,
  factors JSONB DEFAULT '{}',
  ai_analysis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- For now, allow all access (demo mode - no auth yet)
CREATE POLICY "Allow all access to students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to parent_alerts" ON public.parent_alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to data_uploads" ON public.data_uploads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to predictions" ON public.predictions FOR ALL USING (true) WITH CHECK (true);
