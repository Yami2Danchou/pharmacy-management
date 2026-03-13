import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request) {
  const session = await getSession()
  if (!session || session.role === 'Cashier') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'daily'
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  try {
    let dateFrom, dateTo
    const today = new Date()

    if (from && to) {
      dateFrom = from
      dateTo = to
    } else if (type === 'daily') {
      dateFrom = dateTo = today.toISOString().split('T')[0]
    } else if (type === 'weekly') {
      const day = today.getDay()
      const diff = today.getDate() - day + (day === 0 ? -6 : 1)
      const monday = new Date(today.setDate(diff))
      dateFrom = monday.toISOString().split('T')[0]
      dateTo = new Date().toISOString().split('T')[0]
    } else {
      // monthly
      dateFrom = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
      dateTo = today.toISOString().split('T')[0]
    }

    const [salesSummary, topProducts, salesByDay, inventorySummary, stockOuts] = await Promise.all([
      sql`
        SELECT
          COUNT(*) as transaction_count,
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COALESCE(AVG(total_amount), 0) as avg_transaction
        FROM sale
        WHERE sale_date BETWEEN ${dateFrom} AND ${dateTo}
      `,
      sql`
        SELECT p.product_name, SUM(sd.quantity) as qty_sold,
          SUM(sd.subtotal) as revenue
        FROM sales_details sd
        JOIN product p ON sd.product_id = p.product_id
        JOIN sale s ON sd.sale_id = s.sale_id
        WHERE s.sale_date BETWEEN ${dateFrom} AND ${dateTo}
        GROUP BY p.product_id, p.product_name
        ORDER BY qty_sold DESC
        LIMIT 10
      `,
      sql`
        SELECT sale_date, COUNT(*) as count, SUM(total_amount) as total
        FROM sale
        WHERE sale_date BETWEEN ${dateFrom} AND ${dateTo}
        GROUP BY sale_date
        ORDER BY sale_date
      `,
      sql`
        SELECT COUNT(*) as total_products,
          COUNT(*) FILTER (WHERE current_stock = 0) as out_of_stock,
          COUNT(*) FILTER (WHERE current_stock > 0 AND current_stock <= reorder_level) as low_stock,
          COUNT(*) FILTER (WHERE current_stock > reorder_level) as in_stock
        FROM inventory_view
      `,
      sql`
        SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total_loss
        FROM stock_out
        WHERE stock_out_date BETWEEN ${dateFrom} AND ${dateTo}
      `,
    ])

    return NextResponse.json({
      period: { from: dateFrom, to: dateTo, type },
      sales: salesSummary[0],
      topProducts,
      salesByDay,
      inventory: inventorySummary[0],
      stockOuts: stockOuts[0],
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
