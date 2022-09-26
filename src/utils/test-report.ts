import { Workbook, Worksheet } from "exceljs-enhance"
import {getTextValue} from './common'
import { CmdData, ReportItemData } from "./types"

/**
 * 生成业务流程清单
 * @param wb 工作簿
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
    target.getColumn(2).alignment = target.getColumn(4).alignment = target.getColumn(1).alignment
    
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
                const titleCell = ws.getCell(rowNum - 1, 6)
                const title = titleCell.value
                let resultRowInc = 1
                let resultCell = ws.getCell(rowNum + resultRowInc, 6)
                while (resultCell && !resultCell.isMerged && resultCell.value?.toString() !== 'Result') {
                    resultCell = ws.getCell(rowNum + ++resultRowInc, 6)
                }
                
                const newRow = (target as Worksheet).addRow([, No, {
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
                    location: `'${ws.name}'!A1`
                }, {
                    text: `■${getTextValue(title)}`,
                    location: `'${ws.name}'!${titleCell.address}`
                } , {
                    formula : `'${ws.name}'!${resultCell.address}`,
                    result: resultCell.value,
                }]);
                const t = newRow.getCell(3)
                // debugger
                titleCell.value = {
                    text: getTextValue(title),
                    location: `'${target.name}'!${t.address}`
                }
                
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

/**
 * 测试准备
 * 清空Result和Log
 * @param wb 工作簿
 */
const testPrepare = (wb: Workbook)=>{

    const ignoreList = ['标题', '测试信息', 'Stream Function List', '业务流程清单', 'test']
    for(let ws of wb.worksheets){
        if(ignoreList.includes(ws.name.trim()))continue
        if(ws.state !== 'visible')continue

        const resultColumn = ws.getColumn('F')
        
        resultColumn.eachCell((cell, rowNum)=>{
            
            if(cell.value === 'Result'){
                let resultRowInc = 1
                let logCell = ws.getCell(rowNum + resultRowInc, 7)
                let resultCell = ws.getCell(rowNum + resultRowInc, cell.col)
                while (resultCell && !resultCell.isMerged && resultCell.value?.toString() !== 'Result') {
                    resultCell = ws.getCell(rowNum + ++resultRowInc, 6)
                }
                resultRowInc = 1
                while (logCell && !logCell.isMerged && resultRowInc < 5) {
                    logCell = ws.getCell(rowNum + ++resultRowInc, 7)
                }

                if(resultCell.value !== 'NA'){
                    resultCell.value = ''
                    // 右侧LOG处理
                    for (let i = parseInt(logCell.col); i <= ws.columnCount; i++) {
                        let rowInc = 1
                        let cell_t = ws.getCell(logCell.row, i);
                        if(!cell_t.isMerged)break;
                        do{
                            // console.log(ws.name, cell.$col$row)
                            cell_t.value = ''
                            cell_t.style.fill = {
                                fgColor: {
                                    argb: 'FFFFFFFF'
                                },
                                bgColor:{
                                    argb:'FFFFFFFF'
                                },
                                pattern: "solid",
                                type: "pattern",
                            }
                            
                            cell_t.style.border = {
                                bottom: {style: 'thin'},
                                left: {style: 'thin'},
                                right: {style: 'thin'},
                                top: {style: 'thin'}
                            }
                            cell_t = ws.getCell(parseInt(logCell.row) + rowInc++, i);
                        }while(cell_t.isMerged && parseInt(logCell.row) + rowInc < ws.rowCount)
                    }
                }
            }
        })
    }
    
    return true
}

// 字符串是否为StreamFunction
const isSXFY = (ele: any)=>{
    // console.log('isSXFY:', ele)
    if(!ele)return false
    return ele.includes('S') && ele.includes('F') && ele.length < 15
}

// 字符串转StreamFunction
const parseSXFY = (sf: string) => {
    const s = sf.match(/S(\d+)/)
    const f = sf.match(/F(\d+)/)
    if(s && f)
    return [s[1], f[1]]
    return null
}

// 解析指定工作表的日志
const parseLogItems = (ws: Worksheet)=>{
    // if(ws.name.includes('设备控制模式切换'))debugger

    const logData:any = []
    const resultColumn = ws.getColumn('F')
    const rowCount = ws.rowCount;
    
    const resultRow: number[] = []
    resultColumn.eachCell((cell, rowNum)=>{
        if(cell.value === 'Result'){
            resultRow.push(rowNum)
        }
    })

    for (let rowCnt = 0; rowCnt < resultRow.length; rowCnt++) {
        const curRow = resultRow[rowCnt];
        const nextRow = rowCnt + 1 < resultRow.length ? resultRow[rowCnt + 1] : rowCount

        const cell = ws.getCell(curRow, 6)
        const logItem:ReportItemData = {
            title: "",
            comment: "",
            result: '',
            cmdList: [],
            log: "",
            analyze: "",
            eventIdList: [],
            rcmdList: [],
            reason: ''
        }

        logItem.title = getTextValue(ws.getCell(curRow - 1, 6).value)
        logItem.comment = getTextValue(ws.getCell(curRow + 1, 2).value)
        logItem.result = getTextValue(ws.getCell(curRow + 1, cell.col).value)
        logItem.cmdList = []
        let rowInc = 1
        
        // sxfy
        rowInc = 1
        let row
        do {
            const ele: CmdData = {
                s: "",
                f: "",
                direct: "NONE",
                comment: ""
            }
            row = ws.getRow(curRow + rowInc)
            ele.comment = getTextValue((row.values as Array<any>)[2] || (row.values as Array<any>)[5])

            const sf3 = row.getCell(3)
            const sf4 = row.getCell(4)
            // 取纯文字
            const xy3 = getTextValue(sf3.value)
            const xy4 = getTextValue(sf4.value)
            if(isSXFY(xy3)){
                ele.direct = 'H2E'
                if(!sf3.isMerged || (sf3.isMerged && sf3.master === sf3)){
                    // host 2 eqp
                    const sf = parseSXFY(xy3)
                    if(sf){
                        ele.s = sf[0] || ''
                        ele.f = sf[1] || ''
                    }
                }
            }else if(isSXFY(xy4)){
                ele.direct = 'E2H'
                if(!sf4.isMerged || (sf4.isMerged && sf4.master === sf4)){
                    // eqp 2 host
                    const sf = parseSXFY(xy4)
                    if(sf){
                        ele.s = sf[0] || ''
                        ele.f = sf[1] || ''
                    }
                }
            }
            // debugger
            rowInc++
            if(ele.s.length + ele.f.length + ele.comment.length > 0)
            logItem.cmdList.push(ele)
        } while (row.values.length && row.values.length > 0 && curRow + rowInc <= nextRow);

        // log data
        if(logItem.result != 'NA'){
            logItem.log = '';
            rowInc = 1;
            let ok = false
            while(!ok && rowInc < 5){
                const logCell = ws.getCell(curRow + rowInc, cell.col + 1)
                const logText = getTextValue(logCell.value)
                if(logText && logText.length > 0){
                    logItem.log += logText;
                }
                const logCell2 = ws.getCell(curRow + rowInc++, cell.col + 2)
                const logText2 = getTextValue(logCell2.value)
                if(logText2 && logText2.length > 0){
                    logItem.log += logText2;
                }
                if(logItem.log.length > 0)
                    ok = true
            }
            if(logItem.log.length == 0){
                console.warn('log not found:', logItem)
            }
        }
        logData.push(logItem)

    }
    return logData
}

/**
 * 解析测试项目
 * @param wb 工作簿
 */
const parseReport = (wb: Workbook)=>{
    const ignoreList = ['标题', '测试信息', 'Stream Function List', '业务流程清单', 'test']
    const allLogData:{
        [key: string]: ReportItemData[]
    } = {}
    for(let ws of wb.worksheets){
        if(ws.state !== 'visible')continue
        if(ignoreList.includes(ws.name.replaceAll(' ', '')))continue
        // console.log(ws.getSheetValues())

        allLogData[ws.name] = parseLogItems(ws)
    }
    // console.log(allLogData)
    return allLogData
}

// 导出指定工作表的日志
const exportLogItems = (ws: Worksheet, logResultList: any[])=>{
    // if(ws.name.includes('设备控制模式切换'))debugger

    const logData:any = []
    const resultColumn = ws.getColumn('F')
    const rowCount = ws.rowCount;
    
    const resultRow: number[] = []
    resultColumn.eachCell((cell, rowNum)=>{
        if(cell.value === 'Result'){
            resultRow.push(rowNum)
        }
    })

    for (let rowCnt = 0; rowCnt < resultRow.length; rowCnt++) {
        const curRow = resultRow[rowCnt];
        const nextRow = rowCnt + 1 < resultRow.length ? resultRow[rowCnt + 1] : rowCount

        const cell = ws.getCell(curRow, 6)

        // 标题
        const itemTitle = getTextValue(ws.getCell(curRow - 1, 6).value)
        const ret = logResultList.filter(e=>e.title == itemTitle)
        if(!ret || ret.length === 0){
            console.warn('未找到测试项目的结果:', itemTitle)
            return
        }
        const retData = ret[0]
        // 结果
        const resultCell = ws.getCell(curRow + 1, cell.col)
        const itemResult = getTextValue(resultCell.value)

        // log data
        if(itemResult != 'NA'){
            resultCell.value = retData.result.substr(0, 2)
            const logCell = ws.getCell(curRow + 1, cell.col + 1)
            // 清空附近日志
            for(let i=curRow + 1; i< nextRow; i++){
                for(let j=1; j < 3; j++){
                    ws.getCell(i, cell.col + j).value = ''
                }
            }
            logCell.value = retData.log
        }
    }
}

/**
 * 导出报告
 * @param wb 
 */
const exportReport = (wb: Workbook, logData: any)=>{
    
    const ignoreList = ['标题', '测试信息', 'Stream Function List', '业务流程清单', 'test']
    const allLogData:any = {}
    console.log('logData:', logData)
    for(let ws of wb.worksheets){
        if(ws.state !== 'visible')continue
        if(ignoreList.includes(ws.name.trim()))continue
        // console.log(ws.getSheetValues())

        const resultList = logData[ws.name]
        if(!resultList){
            console.warn('没有找到报告结果:', ws.name)
            continue
        }
        allLogData[ws.name] = exportLogItems(ws, resultList)
    }
}

export {
    genProcedureList,
    testPrepare,
    parseReport,
    exportReport
}