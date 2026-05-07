import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Solo POST');

  try {
    const sql = neon(process.env.DATABASE_URL);
    const { id, status } = req.body; // Recibimos el ID y el nuevo estado (Preparando, Listo, etc.)

    await sql`
      UPDATE pedidos 
      SET estatus = ${status} 
      WHERE id = ${id};
    `;

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
