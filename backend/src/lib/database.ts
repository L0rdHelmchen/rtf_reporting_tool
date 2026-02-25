// RTF Reporting Tool - Database Connection
import { Pool, PoolClient, QueryResult } from 'pg';
import { dbConfig } from '../config';
import { logger } from './logger';

class Database {
  private pool: Pool;
  private isConnected = false;

  constructor() {
    this.pool = new Pool({
      connectionString: dbConfig.connectionString,
      ...dbConfig.pool,
      ssl: dbConfig.ssl
    });

    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', err);
    });

    this.pool.on('connect', () => {
      logger.debug('New client connected to PostgreSQL');
    });

    this.pool.on('remove', () => {
      logger.debug('Client removed from PostgreSQL pool');
    });
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      this.isConnected = true;
      logger.info('✅ Connected to PostgreSQL database');
    } catch (error) {
      logger.error('❌ Failed to connect to PostgreSQL:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.pool.end();
      this.isConnected = false;
      logger.info('📤 Disconnected from PostgreSQL database');
    } catch (error) {
      logger.error('❌ Error disconnecting from PostgreSQL:', error);
      throw error;
    }
  }

  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;

      logger.debug('Database query executed', {
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        duration: `${duration}ms`,
        rows: result.rowCount
      });

      return result;
    } catch (error) {
      logger.error('Database query failed', {
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        error: error instanceof Error ? error.message : 'Unknown error',
        params: params ? params.slice(0, 5) : undefined // Log first 5 params only for security
      });
      throw error;
    }
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      logger.debug('Database transaction started');

      const result = await callback(client);

      await client.query('COMMIT');
      logger.debug('Database transaction committed');

      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.debug('Database transaction rolled back');
      throw error;
    } finally {
      client.release();
    }
  }

  // Utility method for setting user context (for Row Level Security)
  async setUserContext(client: PoolClient, userId: string): Promise<void> {
    await client.query('SELECT set_config($1, $2, true)', ['app.current_user_id', userId]);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const result = await this.query('SELECT version(), NOW() as current_time');
      return {
        status: 'healthy',
        details: {
          connected: this.isConnected,
          version: result.rows[0].version,
          currentTime: result.rows[0].current_time,
          poolSize: this.pool.totalCount,
          idleConnections: this.pool.idleCount,
          waitingRequests: this.pool.waitingCount
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  get isHealthy(): boolean {
    return this.isConnected;
  }

  get poolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount
    };
  }
}

// Export singleton instance
export const db = new Database();

// Repository base class for consistent data access patterns
export abstract class BaseRepository {
  protected async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    return db.query<T>(text, params);
  }

  protected async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    return db.transaction(callback);
  }

  protected mapRowToEntity<T>(row: any, mapper: (row: any) => T): T {
    if (!row) {
      throw new Error('Row is null or undefined');
    }
    return mapper(row);
  }

  protected mapRowsToEntities<T>(rows: any[], mapper: (row: any) => T): T[] {
    return rows.map(row => this.mapRowToEntity(row, mapper));
  }

  // Utility for building dynamic WHERE clauses
  protected buildWhereClause(
    conditions: Record<string, any>,
    startIndex = 1
  ): { whereClause: string; values: any[]; nextIndex: number } {
    const validConditions = Object.entries(conditions).filter(([_, value]) =>
      value !== undefined && value !== null
    );

    if (validConditions.length === 0) {
      return { whereClause: '', values: [], nextIndex: startIndex };
    }

    const conditions_clauses: string[] = [];
    const values: any[] = [];
    let paramIndex = startIndex;

    validConditions.forEach(([key, value]) => {
      if (Array.isArray(value)) {
        const placeholders = value.map(() => `$${paramIndex++}`).join(', ');
        conditions_clauses.push(`${key} = ANY(ARRAY[${placeholders}])`);
        values.push(...value);
      } else {
        conditions_clauses.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    });

    return {
      whereClause: `WHERE ${conditions_clauses.join(' AND ')}`,
      values,
      nextIndex: paramIndex
    };
  }

  // Utility for building ORDER BY clauses
  protected buildOrderClause(
    orderBy?: string,
    orderDirection: 'ASC' | 'DESC' = 'ASC'
  ): string {
    if (!orderBy) return '';
    return `ORDER BY ${orderBy} ${orderDirection}`;
  }

  // Utility for building LIMIT/OFFSET clauses
  protected buildPaginationClause(
    limit?: number,
    offset?: number
  ): { clause: string; values: any[]; nextIndex: number } {
    const values: any[] = [];
    let clause = '';
    let paramIndex = 1;

    if (limit !== undefined) {
      clause += ` LIMIT $${paramIndex++}`;
      values.push(limit);
    }

    if (offset !== undefined) {
      clause += ` OFFSET $${paramIndex++}`;
      values.push(offset);
    }

    return { clause, values, nextIndex: paramIndex };
  }
}