import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import twilio from "npm:twilio"; // ✅ NEW

interface Student {
  gpa?: number;
  attendance?: number;
  assignments_completed?: number;
  name?: string;
  email?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { students } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ✅ TWILIO SETUP
    const client = twilio(
      Deno.env.get("TWILIO_ACCOUNT_SID")!,
      Deno.env.get("TWILIO_AUTH_TOKEN")!
    );

    const scoredStudents = students.map((s: Student) => {
      let score = 0;
      const factors: Record<string, string> = {};

      // GPA
      if (s.gpa < 1.5) { score += 30; factors.gpa = "critically low"; }
      else if (s.gpa < 2.0) { score += 25; factors.gpa = "very low"; }
      else if (s.gpa < 2.5) { score += 18; factors.gpa = "below average"; }
      else if (s.gpa < 3.0) { score += 10; factors.gpa = "average"; }
      else { factors.gpa = "good"; }

      // Attendance
      if (s.attendance < 50) { score += 35; factors.attendance = "critical"; }
      else if (s.attendance < 65) { score += 28; factors.attendance = "very low"; }
      else if (s.attendance < 75) { score += 18; factors.attendance = "low"; }
      else if (s.attendance < 85) { score += 8; factors.attendance = "moderate"; }
      else { factors.attendance = "good"; }

      // Assignments
      const assignments = s.assignments_completed || 50;
      if (assignments < 40) { score += 20; factors.assignments = "critical"; }
      else if (assignments < 60) { score += 14; factors.assignments = "low"; }
      else if (assignments < 75) { score += 7; factors.assignments = "moderate"; }
      else { factors.assignments = "good"; }

      if (s.attendance < 60 && s.gpa < 2.0) {
        score += 15;
        factors.combined = "dual risk";
      }

      const riskLevel =
        score >= 65 ? "high" :
        score >= 35 ? "medium" : "low";

      return {
        ...s,
        risk_score: Math.min(score, 100),
        risk_level: riskLevel,
        factors,
      };
    });

    const results = [];
    const alerts = [];

    for (const student of scoredStudents) {

      const { data: upserted } = await supabase
        .from("students")
        .upsert({
          name: student.name,
          email: student.email,
          grade: student.grade,
          gpa: student.gpa,
          attendance: student.attendance,
          assignments_completed: student.assignments_completed,
          risk_level: student.risk_level,
          risk_score: student.risk_score,
          phone: student.phone,
          parent_name: student.parent_name,
          parent_email: student.parent_email,
          parent_phone: student.parent_phone,
        }, { onConflict: "email" })
        .select()
        .single();

      const studentId = upserted?.id;

      if (studentId) {

        await supabase.from("predictions").insert({
          student_id: studentId,
          risk_level: student.risk_level,
          risk_score: student.risk_score,
          factors: student.factors,
        });

        // ✅ ALERT CONDITION
        const shouldSendAlert =
          student.risk_level === "high" ||
          (student.risk_level === "medium" && student.attendance < 70);

        if (shouldSendAlert) {

          const percentage = student.attendance;

          const smsMessage = `📊 Student Alert

Name: ${student.name}
Attendance: ${percentage}%
Risk: ${student.risk_level.toUpperCase()}

Please take action.`;

          // ✅ SEND SMS
          try {
            await client.messages.create({
              body: smsMessage,
              from: Deno.env.get("TWILIO_PHONE")!,
              to: student.parent_phone,
            });
          } catch (err) {
            console.error("SMS error:", err);
          }

          alerts.push({
            name: student.name,
            risk: student.risk_level,
          });
        }
      }

      results.push({
        name: student.name,
        risk_level: student.risk_level,
        risk_score: student.risk_score,
      });
    }

    return new Response(
      JSON.stringify({ results, alerts }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error" }),
      { status: 500 }
    );
  }
});