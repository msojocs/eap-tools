import { Workbook, Worksheet } from "exceljs"
import {getTextValue} from './excel'

/**
 * 生成业务流程清单
 * @param wb 
 */
const genProcedureList = (wb: Workbook)=>{
    let target: any = null
    for(let ws of wb.worksheets){
        if(/业务流程清单/.test(ws.name)){
            target = ws
            break
        }
    }
    if(!target)return false
    console.log('业务流程清单:', target)
    const orderNo = (target as any).orderNo;
    wb.removeWorksheet(target.name)
    target = wb.addWorksheet(target.name);
    (target as any).orderNo = orderNo;
    
    const titleCell = target.getCell(1,1)
    titleCell.value = '业务流程清单'
    titleCell.alignment = {
        vertical: 'middle',
        horizontal: 'center'
    }
    titleCell.border = {
        bottom: {style: 'thin'},
        left: {style: 'thin'},
        right: {style: 'thin'},
        top: {style: 'thin'}
    }
    titleCell.font = {
        charset: 134,
        name: 'Arial',
        size: 16,
        bold: true
    }
    titleCell.style.fill = {
        fgColor:{
            argb:'FFD9D9D9'
        },
        bgColor:{
            argb:'FF0000FF'
        },
        pattern: "solid",
        type: "pattern",
    }
    if(!target.getCell(1, 1).isMerged)
        target.mergeCells(1, 1, 1, 5)
    target.addRow([, 'No', '业务流程', '说明', '测试结果', '备注'], )
    target.getCell(2,1).style = {
        fill: {
            fgColor:{
                argb:'FFD9D9D9'
            },
            bgColor:{
                argb:'FF0000FF'
            },
            pattern: "solid",
            type: "pattern",
        }
    }
    target.getCell(2,1).font = {
        bold: true,
        charset: 134,
        name: "Arial",
        size: 10
    }
    for(let i=1; i<6; i++){
        target.getCell(2,i).style = target.getCell(2,1).style
    }
    target.getColumn(2).width = 20
    target.getColumn(3).width = 60
    target.getColumn(5).width = 40
    target.getColumn(1).alignment = {
        horizontal: 'center',
        vertical: 'middle'
    }
    target.getColumn(2).alignment = {
        horizontal: 'center',
        vertical: 'middle'
    }
    target.getColumn(4).numFmt = '_-* "-"??_-'

    const ignoreList = ['标题', '测试信息', 'Stream Function List', '业务流程清单', 'test']
    let No = 1;
    let startRow = 3
    for(let ws of wb.worksheets){
        if(ignoreList.includes(ws.name.trim()))continue
        if(ws.state !== 'visible')continue

        // console.log(ws.name)
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
                
                (target as Worksheet).addRow([, No, {
                    richText: [{
                        text: ws.name,
                        font: {
                            underline: true,
                            color: {
                                argb: 'FF0000FF'
                            }
                        }
                    }],
                    // text: ws.name,
                    location: `${ws.name}!A1`
                }, `■${getTextValue(title)}` , {
                    formula : `'${ws.name}'!${resultCell.$col$row}`,
                    result: resultCell.value
                }])
                
                itemLength++
            }
        })
        // target.unMergeCells(startRow, 1, startRow + itemLength-1, 1)
        if(itemLength > 0){
            if(!target.getCell(startRow, 1).isMerged)
                target.mergeCells(startRow, 1, startRow + itemLength - 1, 1)
            if(!target.getCell(startRow, 2).isMerged)
                target.mergeCells(startRow, 2, startRow + itemLength - 1, 2)
            No++
        }
        startRow += itemLength
    }
    // target.getRows(1, target.lastRow?.number as number)
    for (let r = 1; r <= (target.lastRow?.number ?? 0); r++) {
        for (let c = 1; c <= target.lastColumn.number; c++) {
            target.getCell(r, c).border = {
                bottom: {style: 'thin'},
                left: {style: 'thin'},
                right: {style: 'thin'},
                top: {style: 'thin'}
            }
        }
        
    }
    return true
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