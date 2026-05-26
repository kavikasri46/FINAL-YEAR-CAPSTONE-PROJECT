import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file || !file.name.endsWith('.xlsx')) {
      return new Response('Invalid file. Please upload a .xlsx file.', { status: 400 });
    }

    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return new Response('No data found in the Excel file.', { status: 400 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return new Response('Supabase configuration missing.', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_FROM_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      console.warn('Twilio credentials not configured. SMS will not be sent.');
    }

    for (const row of data) {
      const { student_name, parent_name, parent_mobile, marks, risk_level } = row as any;

      if (!student_name || !parent_mobile || marks == null || !risk_level) {
        console.error('Missing required fields in row:', row);
        continue;
      }

      // Get student_id by name
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('name', student_name)
        .single();

      if (studentError || !student) {
        console.error('Student not found:', student_name);
        continue;
      }

      const student_id = student.id;

      const message = `Your child ${student_name} scored ${marks}. Risk Level: ${risk_level}. Please take necessary action.`;

      // Insert into parent_alerts
      const { error: insertError } = await supabase
        .from('parent_alerts')
        .insert({
          student_id,
          parent_phone: parent_mobile,
          message,
          risk_level,
          alert_type: 'risk'
        });

      if (insertError) {
        console.error('Failed to insert alert:', insertError);
        continue;
      }

      // Send SMS if configured
      if (accountSid && authToken && fromNumber) {
        const smsMessage = `Alert: ${student_name} scored ${marks}. Risk Level: ${risk_level}. Check dashboard.`;

        try {
          const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              To: parent_mobile,
              From: fromNumber,
              Body: smsMessage
            })
          });

          if (!response.ok) {
            console.error('SMS failed for', parent_mobile, await response.text());
          }
        } catch (smsError) {
          console.error('SMS error:', smsError);
        }
      }
    }

    return new Response('Excel processed successfully. Alerts created and SMS sent where configured.', { status: 200 });
  } catch (error) {
    console.error('Error processing Excel:', error);
    return new Response('Internal server error.', { status: 500 });
  }
});

      results.push({ student: studentData.student_name, status: 'processed' });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing Excel:', error);
    return new Response('Internal server error', { status: 500 });
  }
});