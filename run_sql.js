import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres.fnmtbalodhcyjqmhfuho:hospyaries8@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function run() {
  try {
    await client.connect();
    
    console.log("Confirmando correos electrónicos pendientes en auth.users...");
    const result = await client.query(`
      UPDATE auth.users 
      SET email_confirmed_at = NOW() 
      WHERE email_confirmed_at IS NULL;
    `);
    
    console.log(`✅ Se confirmaron ${result.rowCount} usuarios.`);
    
  } catch (err) {
    console.error("Error al ejecutar el script:", err);
  } finally {
    await client.end();
  }
}

run();
