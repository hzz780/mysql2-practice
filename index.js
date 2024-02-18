const mysql = require('mysql2/promise');

const CURRENT_HEIGHT = 203136350;
const DAYS = 90;
const INTERVAL = 172800;
async function main() {
  // 创建一个数据库连接
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: 'aelf_main_chain',
    connectionLimit: 100
  });

// 简单查询
//   try {
//     const sql = 'select distinct(address_from) from transactions_0 where block_height between 203126350 and 203136350;'
//     const [results, fields] = await connection.query(sql);
//
//     console.log(results.length); // 结果集
//     console.log(fields); // 额外的元数据（如果有的话）
//   } catch (err) {
//     console.log(err);
//   }
  try {
    await get24hourActivityAccounts(connection,CURRENT_HEIGHT, DAYS, INTERVAL);
  } catch (e) {
    console.log('get24hourActivityAccounts failed', e);
  }

  try {
    await get24hourTransactions(connection,CURRENT_HEIGHT, DAYS, INTERVAL);
  } catch (e) {
    console.log('get24hourActivityAccounts failed', e);
  }
}

async function get24hourActivityAccounts (connection, currentHeight, days = 90, interval = 172800) {
  const activityAccountsList = [];
  for (let index = 0; index < days; index++) {
    const end = currentHeight - index * interval;
    const start = currentHeight - (index + 1) * interval;
    const sql = `select distinct(address_from) from transactions_0 where block_height between ${start} and ${end};`
    const [results] = await connection.query(sql);
    activityAccountsList.push(results.length)
    console.log('get24hourActivityAccounts index: ', index);
  }
  console.log(activityAccountsList);
  console.log(activityAccountsList.reduce((a, b) => a + b, 0) / activityAccountsList.length);
}

async function get24hourTransactions (connection, currentHeight, days = 90, interval = 172800) {
  const ids = [];
  for (let index = 0; index < days; index++) {
    const sql = `select id from transactions_0 where block_height=${currentHeight - index * interval};`
    const [results] = await connection.query(sql);
    if (results[0]) {
      console.log('get24hourTransactions results | index: ', results[0].id, index);
      ids.push(results[0].id)
    }
  }
  console.log('ids: ', ids);
  const transactionsList = [];
  ids.forEach((id, index) => {
    // console.log('ids[index + 1]', ids[index + 1], ids[index + 1], id);
    if (ids[index + 1] >= 0) {
      transactionsList.push(ids[index + 1] - id || 0);
    }
  });
  console.log('transactionsList.length: ', transactionsList.length);
  console.log(transactionsList.reduce((a, b) => a + b, 0) / transactionsList.length);

}

main();
