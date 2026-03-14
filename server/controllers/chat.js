const Groq = require('groq-sdk');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const chat = async (req, res) => {
  try {
    const { message } = req.body;

    const [products, receipts, deliveries, transfers, adjustments] = await Promise.all([
      prisma.product.findMany({
        include: { category: true, stocks: { include: { location: true } } }
      }),
      prisma.receipt.findMany({ include: { supplier: true, location: true }, orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.delivery.findMany({ include: { location: true }, orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.transfer.findMany({ include: { fromLocation: true, toLocation: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.adjustment.findMany({ include: { location: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
    ]);

    const inventorySummary = products.map(p => ({
      name: p.name,
      sku: p.sku,
      category: p.category.name,
      reorderLevel: p.reorderLevel,
      stock: p.stocks.map(s => ({ location: s.location.name, quantity: s.quantity }))
    }));

    const lowStock = products.filter(p =>
      p.stocks.some(s => s.quantity <= p.reorderLevel)
    ).map(p => p.name);

    const outOfStock = products.filter(p =>
      p.stocks.every(s => s.quantity === 0)
    ).map(p => p.name);

    const systemPrompt = `You are an AI inventory assistant for CoreInventory, an Inventory Management System.
You have access to real-time inventory data. Answer questions clearly and concisely.

CURRENT INVENTORY DATA:
${JSON.stringify(inventorySummary, null, 2)}

LOW STOCK ITEMS: ${lowStock.join(', ') || 'None'}
OUT OF STOCK ITEMS: ${outOfStock.join(', ') || 'None'}

RECENT RECEIPTS: ${receipts.map(r => `${r.reference} - ${r.supplier.name} - ${r.status}`).join('\n')}
RECENT DELIVERIES: ${deliveries.map(d => `${d.reference} - ${d.customerName} - ${d.status}`).join('\n')}
RECENT TRANSFERS: ${transfers.map(t => `${t.reference} - ${t.fromLocation.name} → ${t.toLocation.name} - ${t.status}`).join('\n')}
RECENT ADJUSTMENTS: ${adjustments.map(a => `${a.reference} - ${a.location.name} - ${a.reason} - ${a.status}`).join('\n')}

Answer questions about stock levels, pending operations, low stock alerts, and inventory movements.
Keep answers short and helpful. Use bullet points where needed.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ error: 'Failed to get response', detail: error.message });
  }
};

module.exports = { chat };