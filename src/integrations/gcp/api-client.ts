/**
 * GCP API Client — Replaces Supabase PostgREST calls
 * 
 * When VITE_AUTH_PROVIDER=firebase, this client routes data queries
 * through Cloud Run Functions instead of Supabase's PostgREST API.
 * 
 * Required env vars:
 *   VITE_API_BASE_URL — Base URL of the Cloud Run Functions
 */

import { getFirebaseAuth } from '../firebase/client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Get the current user's Firebase ID token for API calls
 */
async function getAuthToken(): Promise<string | null> {
    try {
        const auth = getFirebaseAuth();
        const user = auth.currentUser;
        if (!user) return null;
        return await user.getIdToken();
    } catch {
        return null;
    }
}

/**
 * Make an authenticated API call to a Cloud Run Function
 */
export async function apiCall<T = any>(
    functionName: string,
    body: Record<string, any>,
    options?: { requireAuth?: boolean }
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (options?.requireAuth !== false) {
        const token = await getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${API_BASE_URL}/${functionName}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return response.json();
}

/**
 * Supabase-compatible query builder for gradual migration.
 * Provides a similar API to supabase.from('table').select()
 * but routes through Cloud Run Functions.
 * 
 * Usage:
 *   const { data, error } = await gcpQuery('profiles').select('*').eq('user_id', uid).single();
 */
export function gcpQuery(table: string) {
    let queryParams: Record<string, any> = { table };
    let filters: Array<{ column: string; op: string; value: any }> = [];
    let selectColumns = '*';
    let orderByCol = '';
    let orderAsc = true;
    let limitCount: number | null = null;
    let singleRow = false;

    const builder = {
        select(columns: string = '*') {
            selectColumns = columns;
            return builder;
        },
        eq(column: string, value: any) {
            filters.push({ column, op: 'eq', value });
            return builder;
        },
        neq(column: string, value: any) {
            filters.push({ column, op: 'neq', value });
            return builder;
        },
        in(column: string, values: any[]) {
            filters.push({ column, op: 'in', value: values });
            return builder;
        },
        order(column: string, options?: { ascending?: boolean }) {
            orderByCol = column;
            orderAsc = options?.ascending !== false;
            return builder;
        },
        limit(count: number) {
            limitCount = count;
            return builder;
        },
        single() {
            singleRow = true;
            return builder.execute();
        },
        insert(data: any) {
            queryParams = { ...queryParams, action: 'insert', data };
            return { select: () => ({ single: () => builder.execute(), execute: () => builder.execute() }), execute: () => builder.execute() };
        },
        update(data: any) {
            queryParams = { ...queryParams, action: 'update', data };
            return builder;
        },
        delete() {
            queryParams = { ...queryParams, action: 'delete' };
            return builder;
        },
        async execute(): Promise<{ data: any; error: any }> {
            try {
                const result = await apiCall('data-query', {
                    ...queryParams,
                    select: selectColumns,
                    filters,
                    orderBy: orderByCol ? { column: orderByCol, ascending: orderAsc } : undefined,
                    limit: limitCount,
                    single: singleRow,
                });
                return { data: result.data, error: null };
            } catch (error) {
                return { data: null, error };
            }
        },
        // Allow await on the builder directly
        then(resolve: (value: { data: any; error: any }) => void, reject?: (reason: any) => void) {
            return builder.execute().then(resolve, reject);
        },
    };

    return builder;
}
