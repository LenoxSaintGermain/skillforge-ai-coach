const { Pool } = require('pg');

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("Error: Please provide the DATABASE_URL environment variable.");
  console.error("Example usage:");
  console.error("DATABASE_URL=\"postgresql://postgres:YOUR_PASSWORD@db.gxggzyqsojtvnxcrcspm.supabase.co:5432/postgres\" node set-admin-with-db-url.js");
  process.exit(1);
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  const email = 'lenox.paris@outlook.com';

  try {
    console.log(`Connecting to remote database and querying user: ${email}...`);
    
    // 1. Get the user ID from auth.users
    const userRes = await client.query("SELECT id FROM auth.users WHERE email = $1", [email]);
    
    if (userRes.rows.length === 0) {
      console.error(`Error: User with email '${email}' not found in auth.users.`);
      console.error("Please make sure the user has signed up/registered on the platform first.");
      return;
    }
    
    const userId = userRes.rows[0].id;
    console.log(`Found auth user ID: ${userId}`);

    await client.query('BEGIN');

    // 2. Ensure the user profile exists
    console.log("Ensuring user profile exists in profiles table...");
    await client.query(`
      INSERT INTO public.profiles (user_id, name, email, ai_knowledge_level)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id) DO NOTHING
    `, [userId, 'Lenox Paris', email, 'Beginner']);

    // 3. Assign the admin role
    console.log(`Assigning 'admin' role in public.user_roles...`);
    await client.query(`
      INSERT INTO public.user_roles (user_id, role)
      VALUES ($1, 'admin'::public.app_role)
      ON CONFLICT (user_id, role) DO NOTHING
    `, [userId]);

    await client.query('COMMIT');
    console.log(`\nSUCCESS! User ${email} is now set as a system admin.`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Database operation failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
