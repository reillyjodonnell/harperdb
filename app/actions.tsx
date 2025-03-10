'use server';

import('harperdb');

export async function getUser() {
  const user = await tables.User.get('9cf6450a-68b5-4afd-a31b-bfdb7f9e2c74');
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    location: user.location,
  };
}

export async function getMessages(limit = 10) {
  // Doesn't support the full sql syntax it looks like
  const testQuery = `
    SELECT id, content, senderId, timestamp, sender
    FROM data.Message
    LEFT JOIN data.User ON data.Message.senderId = data.User.id
    ORDER BY timestamp DESC
    LIMIT 1
  `;

  const results = await tables.Message.search({
    // This took a long time to figure out
    operation: 'sql',
    sql: testQuery,
  });

  return [...results];
}

export async function getCities() {
  const cities = await tables.City.search({
    operation: 'sql',
    sql: 'SELECT * FROM data.City ORDER BY name ASC',
  });

  return [...cities];
}
