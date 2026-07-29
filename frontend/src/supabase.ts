// Lightweight client for our Express API. It intentionally mirrors the small
// Supabase query-builder surface used by the existing UI during the migration.
type Filter = { column: string; op: string; value: unknown };
type ApiError = (Error & { code?: string }) | null;
type QueryResult = { data: any; error: ApiError; count: number | null };

const apiError = (message: string, code?: string): Error & { code?: string } => Object.assign(new Error(message), { code });

class QueryBuilder {
  private action = 'select';
  private filters: Filter[] = [];
  private orFilters: Filter[] = [];
  private payload: unknown;
  private selection = '*';
  private ordering?: { column: string; ascending: boolean };
  private max?: number;
  private wantsCount = false;
  private singleRow = false;

  private table: string;
  constructor(table: string) { this.table = table; }
  select(columns = '*', options?: { count?: 'exact'; head?: boolean }) { this.selection = columns; this.wantsCount = options?.count === 'exact'; return this; }
  insert(data: unknown) { this.action = 'insert'; this.payload = data; return this; }
  update(data: unknown) { this.action = 'update'; this.payload = data; return this; }
  delete() { this.action = 'delete'; return this; }
  upsert(data: unknown, options?: { onConflict?: string }) { this.action = 'upsert'; this.payload = { data, onConflict: options?.onConflict }; return this; }
  eq(column: string, value: unknown) { this.filters.push({ column, op: 'eq', value }); return this; }
  gt(column: string, value: unknown) { this.filters.push({ column, op: 'gt', value }); return this; }
  gte(column: string, value: unknown) { this.filters.push({ column, op: 'gte', value }); return this; }
  lte(column: string, value: unknown) { this.filters.push({ column, op: 'lte', value }); return this; }
  in(column: string, value: unknown[]) { this.filters.push({ column, op: 'in', value }); return this; }
  or(expression: string) {
    this.orFilters.push(...expression.split(',').map((part) => {
      const [column, op, ...value] = part.split('.');
      return { column, op, value: value.join('.').replace(/^%|%$/g, '') };
    }));
    return this;
  }
  order(column: string, options?: { ascending?: boolean }) { this.ordering = { column, ascending: options?.ascending !== false }; return this; }
  limit(value: number) { this.max = value; return this; }
  single() { this.singleRow = true; return this; }
  async execute(): Promise<QueryResult> {
    try {
      const response = await fetch(`/api/data/${this.table}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: this.action, data: this.payload, filters: this.filters, orFilters: this.orFilters, select: this.selection, order: this.ordering, limit: this.max, countOnly: this.wantsCount }) });
      const body = await response.json();
      if (!response.ok) return { data: null, error: apiError(body.error || 'Error de API', body.code), count: null };
      const rows = body.data || [];
      if (this.singleRow) {
        if (rows.length !== 1) return { data: null, error: apiError('No se encontró un registro', 'PGRST116'), count: body.count ?? null };
        return { data: rows[0], error: null, count: body.count ?? null };
      }
      return { data: this.wantsCount && this.action === 'select' ? null : rows, error: null, count: body.count ?? null };
    } catch (error) { return { data: null, error: apiError(error instanceof Error ? error.message : 'Error de red'), count: null }; }
  }
  then<TResult1 = QueryResult, TResult2 = never>(onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null) { return this.execute().then(onfulfilled, onrejected); }
}

export const supabase = {
  from: (table: string) => new QueryBuilder(table),
  channel: (_name: string) => ({ on: (_event: string, _filter: unknown, _callback: (payload: unknown) => void) => ({ subscribe: () => ({}) }) }),
  removeChannel: (_channel: unknown) => undefined,
};
