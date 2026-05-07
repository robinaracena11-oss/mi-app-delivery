import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Obtenemos los pedidos (ordenados del más nuevo al más viejo)
    const pedidos = await sql`
      SELECT * FROM pedidos 
      ORDER BY id DESC 
      LIMIT 50;
    `;

    // Por cada pedido, buscamos sus productos
    for (let pedido of pedidos) {
      const items = await sql`
        SELECT nombre_producto as name, cantidad as qty, precio_unitario as price 
        FROM pedidos_items 
        WHERE pedido_id = ${pedido.id};
      `;
      
      // Adaptamos el formato para que el HTML lo entienda
      pedido.client = { 
        name: pedido.nombre_cliente, 
        phone: pedido.telefono_cliente, 
        address: pedido.direccion_cliente,
        zone: "Zona Registrada"
      };
      pedido.items = items;
      pedido.total = parseFloat(pedido.total);
    }

    return res.status(200).json({ success: true, pedidos });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
