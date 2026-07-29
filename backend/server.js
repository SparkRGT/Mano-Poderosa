import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import pg from 'pg';

const { Pool } = pg;
const app = express();
const PORT = Number(process.env.PORT || 3000);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Only application tables/views can be queried through this endpoint.  Values are
// always sent as query parameters; table and column names are validated below.
const resources = new Set([
  'users', 'categories', 'products', 'sales', 'sale_items', 'invoices',
  'debts', 'payment_requests', 'settings', 'customer_debt_summary',
  'low_stock_products', 'sales_with_customer',
]);
const ident = (value) => {
  if (!/^[a-z_][a-z0-9_]*$/i.test(value)) throw new Error('Identificador inválido');
  return `"${value}"`;
};

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true }));
app.use(express.json({ limit: '1mb' }));

function whereClause(filters = [], orFilters = []) {
  const values = [];
  const build = (filter) => {
    const operators = { eq: '=', gt: '>', gte: '>=', lt: '<', lte: '<=', ilike: 'ILIKE', in: '= ANY' };
    if (!operators[filter.op]) throw new Error('Operador no permitido');
    values.push(filter.value);
    return `${ident(filter.column)} ${operators[filter.op]} $${values.length}`;
  };
  const clauses = filters.map(build);
  if (orFilters.length) clauses.push(`(${orFilters.map(build).join(' OR ')})`);
  return { sql: clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '', values };
}

async function attachRelations(table, rows, select) {
  if (!rows.length || !select || select === '*') return rows;
  const add = async (key, foreignTable, foreignColumn, localColumn, many = false, fields = '*') => {
    if (!select.includes(`${key}:`) && !select.includes(`${key}(`)) return;
    const ids = [...new Set(rows.map((row) => row[localColumn]).filter(Boolean))];
    if (!ids.length) return;
    const { rows: related } = await pool.query(`SELECT ${fields} FROM ${ident(foreignTable)} WHERE ${ident(foreignColumn)} = ANY($1)`, [ids]);
    for (const row of rows) {
      const matches = related.filter((item) => item[foreignColumn] === row[localColumn]);
      row[key] = many ? matches : (matches[0] || null);
    }
  };
  if (table === 'products') await add('category', 'categories', 'id', 'category_id');
  if (table === 'sales') {
    await add('customer', 'users', 'id', 'customer_id');
    await add('items', 'sale_items', 'sale_id', 'id', true);
    await add('invoice', 'invoices', 'sale_id', 'id', true, 'invoice_number, sale_id');
  }
  if (['debts', 'payment_requests', 'customer_debt_summary'].includes(table)) await add('customer', 'users', 'id', 'customer_id');
  return rows;
}

app.post('/api/data/:table', async (req, res) => {
  const { table } = req.params;
  const { action = 'select', filters = [], orFilters = [], order, limit, data, select = '*', countOnly = false } = req.body;
  if (!resources.has(table)) return res.status(404).json({ error: 'Recurso no permitido' });
  try {
    const where = whereClause(filters, orFilters);
    let result;
    if (action === 'select') {
      const countResult = countOnly ? await pool.query(`SELECT COUNT(*)::int AS count FROM ${ident(table)}${where.sql}`, where.values) : null;
      const orderSql = order ? ` ORDER BY ${ident(order.column)} ${order.ascending === false ? 'DESC' : 'ASC'}` : '';
      const limitSql = Number.isInteger(limit) ? ` LIMIT ${Math.max(0, limit)}` : '';
      result = await pool.query(`SELECT * FROM ${ident(table)}${where.sql}${orderSql}${limitSql}`, where.values);
      result.rows = await attachRelations(table, result.rows, select);
      return res.json({ data: result.rows, count: countResult?.rows[0].count ?? null });
    }
    if (action === 'insert') {
      const records = Array.isArray(data) ? data : [data];
      if (!records.length) return res.json({ data: [] });
      const columns = Object.keys(records[0]);
      const params = [];
      const tuples = records.map((record) => `(${columns.map((column) => { params.push(record[column]); return `$${params.length}`; }).join(', ')})`);
      result = await pool.query(`INSERT INTO ${ident(table)} (${columns.map(ident).join(', ')}) VALUES ${tuples.join(', ')} RETURNING *`, params);
    } else if (action === 'update') {
      const columns = Object.keys(data || {});
      if (!columns.length) throw new Error('No hay datos para actualizar');
      const params = columns.map((column) => data[column]);
      const updateWhere = whereClause(filters, orFilters);
      // Rebuild the WHERE placeholders after the SET values.
      const whereSql = updateWhere.sql.replace(/\$(\d+)/g, (_, n) => `$${Number(n) + params.length}`);
      result = await pool.query(`UPDATE ${ident(table)} SET ${columns.map((column, i) => `${ident(column)} = $${i + 1}`).join(', ')}${whereSql} RETURNING *`, [...params, ...updateWhere.values]);
    } else if (action === 'upsert') {
      const record = data?.data;
      const conflict = data?.onConflict;
      if (!record || !conflict) throw new Error('Upsert inválido');
      const columns = Object.keys(record);
      const updates = columns.filter((column) => column !== conflict);
      result = await pool.query(`INSERT INTO ${ident(table)} (${columns.map(ident).join(', ')}) VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')}) ON CONFLICT (${ident(conflict)}) DO UPDATE SET ${updates.map((column) => `${ident(column)} = EXCLUDED.${ident(column)}`).join(', ')} RETURNING *`, columns.map((column) => record[column]));
    } else if (action === 'delete') {
      result = await pool.query(`DELETE FROM ${ident(table)}${where.sql} RETURNING *`, where.values);
    } else {
      return res.status(400).json({ error: 'Acción no permitida' });
    }
    return res.json({ data: result.rows, count: null });
  } catch (error) {
    console.error('Database request failed:', error);
    return res.status(400).json({ error: error.message, code: error.code });
  }
});

app.get('/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok' }); }
  catch { res.status(503).json({ status: 'database_unavailable' }); }
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
