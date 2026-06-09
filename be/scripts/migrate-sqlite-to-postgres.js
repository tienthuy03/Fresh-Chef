/**
 * Copy data từ SQLite local sang PostgreSQL.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... node scripts/migrate-sqlite-to-postgres.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const path = require('path');
const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('Thiếu DATABASE_URL. Ví dụ: DATABASE_URL=postgresql://user:pass@host:5432/db');
  process.exit(1);
}

const sqlite = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false,
});

const postgres = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions:
    process.env.DB_SSL === 'true'
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
});

// Thứ tự copy theo foreign key
const TABLE_ORDER = [
  'Users',
  'Recipes',
  'Badges',
  'Challenges',
  'Reviews',
  'Comments',
  'Favorites',
  'Follows',
  'ReviewLikes',
  'ShoppingItems',
  'SavedShoppingLists',
  'MealPlans',
  'UserNutritions',
  'ChefProfiles',
  'UserBadges',
  'UserChallenges',
];

async function copyTable(tableName) {
  const [rows] = await sqlite.query(`SELECT * FROM "${tableName}"`);
  if (!rows.length) {
    console.log(`  ${tableName}: 0 rows (skip)`);
    return;
  }

  const columns = Object.keys(rows[0]);
  const colList = columns.map((c) => `"${c}"`).join(', ');

  for (const row of rows) {
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const values = columns.map((col) => row[col]);
    await postgres.query(
      `INSERT INTO "${tableName}" (${colList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
      { bind: values },
    );
  }

  console.log(`  ${tableName}: ${rows.length} rows`);
}

async function main() {
  const sqlitePath = path.join(__dirname, '../database.sqlite');
  const fs = require('fs');
  if (!fs.existsSync(sqlitePath)) {
    console.error(`Không tìm thấy ${sqlitePath}`);
    process.exit(1);
  }

  console.log('Đồng bộ schema Postgres từ models...');
  process.env.DATABASE_URL = databaseUrl;
  const { sequelize } = require('../src/models');
  await sequelize.sync();

  console.log('Copy dữ liệu SQLite → Postgres...');
  for (const table of TABLE_ORDER) {
    try {
      await copyTable(table);
    } catch (err) {
      if (err.message?.includes('no such table')) {
        console.log(`  ${table}: table không tồn tại (skip)`);
      } else {
        throw err;
      }
    }
  }

  await sqlite.close();
  await postgres.close();
  console.log('Migration hoàn tất.');
}

main().catch((err) => {
  console.error('Migration thất bại:', err);
  process.exit(1);
});
