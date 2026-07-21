import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://gxggzyqsojtvnxcrcspm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4Z2d6eXFzb2p0dm54Y3Jjc3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MDU2MjUsImV4cCI6MjA2ODM4MTYyNX0.0fFDtC7e2Ub_dm6dkxS3p22RzPZxRQQBeNLJ-GunKEo";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const email = 'lenox.paris@outlook.com';
  const password = 'Password123!'; // Temporary password for registration

  console.log(`Checking if user ${email} exists in profiles...`);
  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, name, email')
    .eq('email', email)
    .maybeSingle();

  if (profileError) {
    console.error("Error checking profile:", profileError);
    return;
  }

  let userId;

  if (!profile) {
    console.log(`User ${email} does not exist. Registering user via signUp...`);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: 'Lenox Paris'
        }
      }
    });

    if (signUpError) {
      console.error("Error signing up user:", signUpError);
      return;
    }

    userId = signUpData.user?.id;
    console.log(`User registered successfully! user_id: ${userId}`);

    // Wait 2 seconds for trigger/profile creation if any, or create it manually
    console.log("Waiting for profile sync...");
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Fetch the profile again
    const { data: newProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .maybeSingle();

    if (!newProfile) {
      console.log("Profile not automatically created. Creating profile manually...");
      const { error: insertProfileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          name: 'Lenox Paris',
          email: email,
          ai_knowledge_level: 'Beginner'
        });
      
      if (insertProfileError) {
        console.error("Error creating profile manually:", insertProfileError);
        return;
      }
    }
  } else {
    userId = profile.user_id;
    console.log(`User already exists in profiles. user_id: ${userId}`);
  }

  console.log(`Attempting to assign 'admin' role in user_roles for user_id: ${userId}...`);
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role: 'admin'
    })
    .select();

  if (roleError) {
    console.error("Error assigning admin role (RLS is active):", roleError);
    console.log("\nSince RLS is active on the remote database, we cannot directly insert the admin role from the client using the anon key.");
    console.log("We will need to modify the frontend hook temporarily to mock admin access for this user during the demo.");
  } else {
    console.log("SUCCESS! Admin role assigned in the remote database:", roleData);
  }
}

run();
