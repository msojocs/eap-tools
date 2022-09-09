var odbc = require("odbc");
const fs = require('fs')

//这里换成你的数据库相关信息
var dbInfo = "DSN=MS Access Database;DBQ=D:\\Work\\EAP&MES\\SL01-EAP\\Config\\Data\\data.mdb;UID=sa;PWD=123;"
async function connectToDatabase() {
    try {
            
        const connection = await odbc.connect(dbInfo);
        let result
        // let result = await connection.tables(null, null, null, null);
        // console.log(result)
        // fs.writeFileSync('./test/tables.json', JSON.stringify(result, null, 4))
        // for(let table of result){
        //     const name = table.TABLE_NAME
        //     try {
                    
        //         const r = await connection.query('SELECT * FROM ' + name)
        //         // console.log(r)
        //         fs.writeFileSync(`./test/${name}.json`, JSON.stringify(r, null, 4))
        //     } catch (error) {
        //         console.error(error)
        //     }
        // }
        result = await connection.query(`select * from D_EQUIPMENT;`)
        // const result = await cursor.fetch()
        console.log(result)
        connection.close()
    } catch (error) {
        console.error(error)
    }
    // connection1 is now an open Connection

    // // or using a configuration object
    // const connectionConfig = {
    //     connectionString: dbInfo,
    //     connectionTimeout: 10,
    //     loginTimeout: 10,
    // }
    // const connection2 = await odbc.connect(connectionConfig);
    // // connection2 is now an open Connection
}

connectToDatabase();