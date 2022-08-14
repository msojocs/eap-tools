import { Workbook } from "exceljs"

/**
 * 生成业务流程清单
 * @param wb 
 */
const genProcedureList = (wb: Workbook)=>{
    let target = wb.getWorksheet('业务流程清单')
    if(!target){
        target = wb.addWorksheet('业务流程清单')
    }
    // console.log(target)

    target.getCell(1,1).value = '业务流程清单'
    target.mergeCells(1, 1, 1, 5)
    target.addRow([, 'No', '业务流程', '说明', '测试结果', '备注'])

    const ignoreList = ['标题', '测试信息', 'Stream Function List', '业务流程清单', 'test']
    let No = 1;
    let startRow = 3
    for(let ws of wb.worksheets){
        if(ignoreList.includes(ws.name.trim()))continue
        if(ws.state !== 'visible')continue

        console.log(ws.name)
        const resultColumn = ws.getColumn('F')
        let itemLength = 0
        resultColumn.eachCell((cell, rowNum)=>{
            // console.log(rowNum)
            
            if(cell.value === 'Result'){
                const title = ws.getCell(rowNum - 1, 6).value
                let resultRowInc = 1
                let resultCell = ws.getCell(rowNum + resultRowInc, 6)
                while (resultCell && !resultCell.isMerged && resultCell.value?.toString() !== 'Result') {
                    resultCell = ws.getCell(rowNum + ++resultRowInc, 6)
                }
                target.addRow([, No, ws.name, title, resultCell.value])
                itemLength++
            }
        })
        // target.unMergeCells(startRow, 1, startRow + itemLength-1, 1)
        if(itemLength > 0){
            target.mergeCells(startRow, 1, startRow + itemLength - 1, 1)
            target.mergeCells(startRow, 2, startRow + itemLength - 1, 2)
        }
        startRow += itemLength
        No++
    }
}
const isSXFY = (ele: any)=>{
    console.log('isSXFY:', ele)
    if(!ele)return false
    switch (typeof ele) {
        case 'string':
            return ele.includes('S') && ele.includes('F') && ele.length < 10
        case 'object':
            for(let str of ele.richText){
                if(/S\d+.*?F\d+/.test(str.text as string))return true
            }
            break
        default:
            console.error(`无法识别的类型: ${typeof ele}`)
            break;
    }
    return false;
}
const parseLogData = (wb: Workbook)=>{
    const ignoreList = ['标题', '测试信息', 'Stream Function List', '业务流程清单', 'test']
    const allLogData:any = {}
    for(let ws of wb.worksheets){
        if(ws.state !== 'visible')continue
        if(ignoreList.includes(ws.name))continue
        // console.log(ws.getSheetValues())

        const logData:any = []
        const resultColumn = ws.getColumn('F')
        
        resultColumn.eachCell((cell, rowNum)=>{
            // console.log(rowNum)
            
            if(cell.value === 'Result'){
                const logItem:any = {}
                logItem.title = ws.getCell(rowNum - 1, 6).value
                logItem.comment = ws.getCell(rowNum + 1, 2).value
                logItem.sxfy = {
                    data: []
                }
                let rowInc = 1
                let resultCell = ws.getCell(rowNum + rowInc, 6)
                while (resultCell && !resultCell.isMerged && resultCell.value?.toString() !== 'Result') {
                    resultCell = ws.getCell(rowNum + ++rowInc, 6)
                }
                
                // sxfy
                rowInc = 2
                let row
                do {
                    const ele:any = {}
                    row = ws.getRow(rowNum + rowInc)
                    ele.comment = (row.values as Array<any>)[2] || (row.values as Array<any>)[5]
                    if(isSXFY((row.values as Array<any>)[3])){
                        // host 2 eqp
                        ele.type = 'h2e'
                        ele.sf = (row.values as Array<any>)[3]
                    }else if(isSXFY((row.values as Array<any>)[4])){
                        // eqp 2 host
                        ele.type = 'e2h'
                        ele.sf = (row.values as Array<any>)[4]
                    }else{
                        ele.type = 'none'
                    }
                    rowInc++
                    logItem.sxfy.data.push(ele)
                } while (row.values.length && row.values.length > 0);
                logData.push(logItem)
            }
        })
        allLogData[ws.name] = logData
    }
    console.log(allLogData)
}

export {
    genProcedureList,
    parseLogData
}