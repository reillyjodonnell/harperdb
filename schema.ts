// POC for e2e type safety with an ORM (drizle in this case)

// npm i drizzle-orm
import { drizzle } from 'drizzle-orm/pg-proxy';
import { pgSchema, integer, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

const dev = pgSchema('data');

export const users = dev.table('users', {
  id: integer('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  age: integer('age'),
});

const db = drizzle(() => {}, { schema: { users } });

const selectQuery = db
  .select({
    id: users.id,
    name: users.name,
  })
  .from(users)
  .where(sql`${users.name} = 'Alice'`);

async function demo() {
  try {
    const sql = transformSqlQuery(selectQuery.toSQL().sql);
    console.log('Generated SQL:', sql);
    const res = await execute<Awaited<ReturnType<typeof selectQuery.execute>>>(
      sql
    );
    console.log('Result:', res);
  } catch (err) {
    console.log(err);
  }
}

demo();

/*
POSSIBLE API


const dev = hdbSchema('data');

export const users = dev.table('users', {
  id: number('id').primaryKey(),
  name: string('name'),
  age: number('age'),
});

export type User = typeof users.$inferSelect;

const harperdb = new HarperDBClient({
  url: 'http://localhost:9925',
  username: 'HDB_ADMIN',
  password: 'password',
});

const db = drizzle({ client: harperdb, schema: { users } });

// SELECT one row
const oneRow = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.name, 'Alice')).get();
console.log('One row:', oneRow);
*/

function transformSqlQuery(query: string): string {
  // Replace all \"...\" with just the content inside
  let str = query.replace(/\\"(.*?)\\"/g, '$1');

  // Remove all double quotes
  str = str.replace(/"/g, '');

  // Replace qualified column names in WHERE clause with just the column name
  // This regex looks for patterns like "table"."column" or "schema"."table"."column"
  str = str.replace(
    /(\bwhere\b.*?)(\w+\.)+(\w+)(\s*=)/gi,
    (match, whereClause, _, columnName, equals) => {
      return whereClause + columnName + equals;
    }
  );

  return str;
}

async function execute<T>(sql: string): Promise<T> {
  const url = 'http://localhost:9925';
  const username = 'HDB_ADMIN';
  const password = 'password';
  const authHeader =
    'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

  const body = {
    operation: 'sql',
    sql,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader, // Add authentication
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json(); // Return parsed JSON
  } catch (error) {
    console.error('Error sending SQL query to HarperDB:', error);
    throw error;
  }
}
