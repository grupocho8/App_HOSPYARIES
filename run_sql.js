import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres.fnmtbalodhcyjqmhfuho:hospyaries8@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function run() {
  try {
    await client.connect();
    
    // Buscar a Heidy en auth.users
    const res = await client.query("SELECT id, email FROM auth.users WHERE email ILIKE '%heidy%';");
    
    if (res.rows.length === 0) {
      console.log("No se encontró ningún usuario con 'heidy' en el correo.");
      return;
    }
    
    for (let user of res.rows) {
      console.log(`Usuario encontrado: ${user.email} (ID: ${user.id})`);
      // Insertar o actualizar el rol en perfiles
      await client.query(`
        INSERT INTO public.perfiles (id, rol) 
        VALUES ($1, 'empleado') 
        ON CONFLICT (id) DO UPDATE SET rol = 'empleado';
      `, [user.id]);
      console.log(`✅ Rol de empleado asignado exitosamente a ${user.email}`);
    }
    
  } catch (err) {
    console.error("Error al ejecutar el script:", err);
  } finally {
    await client.end();
  }
}

run();
