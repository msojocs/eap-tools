const ipcRenderer = require('electron').ipcRenderer

const openDatabase = (dbPath: string)=>{
    return new Promise((resolve, reject)=>{
            
        ipcRenderer.once('open-database-reply', (event, arg)=>{
            console.log('open-database-reply', arg)
            resolve(arg)
        })
        ipcRenderer.send('open-database-req', dbPath);
    })

}
const getTables = ()=>{
    return new Promise((resolve, reject)=>{
            
        ipcRenderer.once('get-all-tables-reply', (event, arg)=>{
            console.log('get-all-tables-reply', arg)
            resolve(arg)
        })
        ipcRenderer.send('get-all-tables-req');
    })
}
const getTableData = (data: any)=>{
    return new Promise((resolve, reject)=>{
            
        ipcRenderer.once('get-table-data-reply', (event, arg)=>{
            console.log('get-table-data-reply', arg)
            resolve(arg)
        })
        ipcRenderer.send('get-table-data-req', data);
    })
}
const getTableDataNext = ()=>{
    return new Promise((resolve, reject)=>{
            
        ipcRenderer.once('get-table-data-next-reply', (event, arg)=>{
            console.log('get-table-data-next-reply', arg)
            resolve(arg)
        })
        ipcRenderer.send('get-table-data-next-req');
    })
}
const getAllTableData = (data: any)=>{
    return new Promise((resolve, reject)=>{
            
        ipcRenderer.once('get-all-table-data-reply', (event, arg)=>{
            console.log('get-all-table-data-reply', arg)
            resolve(arg)
        })
        ipcRenderer.send('get-all-table-data-req', data);
    })
}
export {
    openDatabase,
    getTables,
    getTableData,
    getTableDataNext,
    getAllTableData,
}