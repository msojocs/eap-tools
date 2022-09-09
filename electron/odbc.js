const odbc = require("odbc")
const {ipcMain} = require('electron');

let connection
let cursor
// 打开数据库
ipcMain.on('open-database-req', async (event, dbPath) => { // arg为接受到的消息
    console.log('open-database-req', dbPath)
    try {
        connection = await odbc.connect(`DSN=MS Access Database;DBQ=${dbPath};`)
        event.sender.send('open-database-reply', {
            code: 0
        }); // 返回一个'pong'
    } catch (error) {
        connection = null
        event.sender.send('open-database-reply', {
            code: 1,
            msg: '数据库打开失败！',
            data: error
        }); // 返回一个'pong'
    }
})

// 获取所有表格
ipcMain.on('get-all-tables-req', async (event, arg) => { // arg为接受到的消息
    console.log('get-all-tables-req', arg)
    try {
        const result = await connection.tables(null, null, null, null);
        const userTable = result.filter(e=>e.TABLE_TYPE === 'TABLE')
        event.sender.send('get-all-tables-reply', {
            code: 0,
            data: userTable
        }); // 返回一个'pong'
    } catch (error) {
        connection = null
        event.sender.send('get-all-tables-reply', {
            code: 1,
            msg: '数据库打开失败！',
            data: error
        }); // 返回一个'pong'
    }
})

// 获取表格信息
ipcMain.on('get-table-data-req', async (event, arg) => { // arg为接受到的消息
    try {
        const total = await connection.query(`SELECT COUNT(0) as total FROM ${arg.tableName}`)
        console.log(arg)
        const totalCount = total[0].total
        let result = []
        if(totalCount > 0){
            if(arg.pageSize < totalCount){
                cursor = await connection.query(`SELECT * FROM ${arg.tableName}`, { cursor: true, fetchSize: arg.pageSize })
                result = await cursor.fetch();
            }else{
                result = await connection.query(`SELECT * FROM ${arg.tableName}`)
            }
        }
        event.sender.send('get-table-data-reply', {
            code: 0,
            data: {
                result,
                totalCount
            }
        }); // 返回一个'pong'
    } catch (error) {
        connection = null
        event.sender.send('get-table-data-reply', {
            code: 1,
            msg: '数据库打开失败！',
            data: error
        }); // 返回一个'pong'
    }
})

// 获取接下来的表格信息
ipcMain.on('get-table-data-next-req', async (event, arg) => { // arg为接受到的消息
    console.log('get-table-data-next-req', arg)
    try {
        const result = await cursor.fetch();
        event.sender.send('get-table-data-next-reply', {
            code: 0,
            data: {
                result,
                cursor
            }
        }); // 返回一个'pong'
    } catch (error) {
        connection = null
        event.sender.send('get-table-data-next-reply', {
            code: 1,
            msg: '数据库打开失败！',
            data: error
        }); // 返回一个'pong'
    }
})

// 获取表格全部记录
ipcMain.on('get-all-table-data-req', async (event, arg) => { // arg为接受到的消息
    try {
        const total = await connection.query(`SELECT COUNT(0) as total FROM ${arg.tableName}`)
        console.log(arg)
        const totalCount = total[0].total
        let result = []
        if(totalCount > 0){
            result = await connection.query(`SELECT * FROM ${arg.tableName}`)
        }
        event.sender.send('get-all-table-data-reply', {
            code: 0,
            data: {
                result,
                totalCount
            }
        }); // 返回一个'pong'
    } catch (error) {
        connection = null
        event.sender.send('get-all-table-data-reply', {
            code: 1,
            msg: '数据库打开失败！',
            data: error
        }); // 返回一个'pong'
    }
})