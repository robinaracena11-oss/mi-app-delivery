import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Solo permitimos peticiones POST (que envían datos)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  try {
    // Vercel lee la contraseña secreta de las variables de entorno de forma segura
    const sql = neon(process.env.DATABASE_URL);
    
    // Obtenemos los datos que nos envió el carrito en index.html
    const { client, items, total } = req.body;

    // 1. Insertamos el pedido y pedimos que nos devuelva el ID (RETURNING id)
    const pedidosInsertados = await sql`
      INSERT INTO pedidos (nombre_cliente, telefono_cliente, direccion_cliente, total)
      VALUES (${client.name}, ${client.phone}, ${client.address}, ${total})
      RETURNING id;
    `;
    
    const idDelPedido = pedidosInsertados[0].id;

    // 2. Por cada producto en el carrito, insertamos su detalle
    for (const item of items) {
      await sql`
        INSERT INTO pedidos_items (pedido_id, nombre_producto, cantidad, precio_unitario)
        VALUES (${idDelPedido}, ${item.name}, ${item.qty}, ${item.price});
      `;
    }

    // Le decimos a tu index.html que todo fue un éxito
    return res.status(200).json({ 
        success: true, 
        pedidoId: idDelPedido 
    });

  } catch (error) {
    console.error('Error al guardar en la base de datos:', error);
    return res.status(500).json({ 
        success: false, 
        error: error.message
    });
  }
}
