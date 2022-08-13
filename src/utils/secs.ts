const Excel = require('exceljs')

const parse = async (filePath) =>{
    console.log('path: ', filePath)
    const wb = new Excel.Workbook()
    await wb.xlsx.readFile(filePath)
    console.log(wb)
    const eventListSheet = wb.getWorksheet("Event List")
    const reportListSheet = wb.getWorksheet("Report List")
    const varListSheet = wb.getWorksheet("Variables List")
    const eventListData = eventListSheet.getSheetValues();
    let title = eventListData[1]
    if(title === null || title === undefined || !title.includes("CEID List")){
        throw new Error("CEID List ERROR");
    }
    const eidIndex = (eventListData[2]).indexOf("Event ID")
    const ridIndex = (eventListData[2]).indexOf("Link Report ID")
    console.log('event list:',  eidIndex, ridIndex)

    const eid2rid = {}
    let tData = eventListData.slice(3, eventListData.length)
    for(let data of tData){
        console.log('data:', data)
        if(data === null || data === undefined)continue

        if(typeof data.length !== "number")continue
        if(data.length > 0){
            // testtttt
            data[0]
        }
    }
    console.log('test:', eventListSheet.getRow(3).values)
};

export default {
    parse
}