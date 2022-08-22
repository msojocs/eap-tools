import { Workbook, Worksheet } from 'exceljs';
import { getTextValue } from './common';

const Excel = require('exceljs') as typeof import('exceljs')

const FUNC = {
    parseEventList: (eventListSheet: Worksheet) => {

        // Event - Link Report Id
        const eventListData = eventListSheet.getSheetValues();
        let title = eventListData[1] as string[]
        if (title === null || title === undefined || !title.includes("CEID List")) {
            throw new Error("CEID List ERROR");
        }
        const eidIndex = (eventListData[2] as string[]).indexOf("Event ID")
        let ridIndex = (eventListData[2] as string[]).indexOf("Link Report ID")
        // console.log('event list:',  eidIndex, ridIndex)

        const eid2rid: any = {}
        let tData = eventListData.slice(3, eventListData.length)
        for (let data of tData as Array<string>[]) {
            // console.log('data:', data)
            if (data === null || data === undefined) continue

            if (typeof data.length !== "number") continue
            const rptIds = []
            const ridstr = data[ridIndex]
            if (typeof ridstr === 'string') {
                const ridsM = ridstr.match(/\d+/g)
                if (ridsM !== null)
                    rptIds.push(...ridsM)
            } else if (typeof ridstr === 'number') {
                rptIds.push(ridstr)
            } else {
                console.error('无法识别的rpt id类型')
            }
            // console.warn('rids:', rids)
            eid2rid[data[`${eidIndex}`]] = {
                rptIds
            }
        }
        // console.log('eid2rid:', eid2rid)
        return eid2rid
    },
    parseReportList: (reportListSheet: Worksheet) => {

        // Report - Link Var Id
        const reportListData = reportListSheet.getSheetValues()
        const title = reportListData[1] as string[]
        if (title === null || title === undefined || !title.includes("ReportID List")) {
            throw new Error("ReportID List ERROR");
        }
        const ridIndex = (reportListData[2] as string[]).indexOf("Report ID")
        let vidIndex = (reportListData[2] as string[]).indexOf("Link VID")
        // console.log('Report ID list:',  ridIndex, vidIndex)

        const rpt2vidMap: any = {}
        let rData = reportListData.slice(3, reportListData.length)
        for (let data of rData as Array<string>[]) {
            // console.log('data:', data)
            if (data === null || data === undefined) continue

            if (typeof data.length !== "number") continue
            const vIds = []
            const vidstr = data[vidIndex]
            if (typeof vidstr === 'string') {
                const ridsM = vidstr.match(/\d+/g)
                if (ridsM !== null)
                    vIds.push(...ridsM)
            } else if (typeof vidstr === 'number') {
                vIds.push(vidstr)
            } else {
                console.error('无法识别的var id类型')
            }
            // console.warn('rids:', rids)
            rpt2vidMap[data[`${ridIndex}`]] = {
                vIds
            }
        }
        // console.log('rpt2vidMap:', rpt2vidMap)
        return rpt2vidMap
    }
}
const parse = async (filePath: string) => {
    console.log('path: ', filePath)
    const wb = new Excel.Workbook()
    await wb.xlsx.readFile(filePath)
    console.log(wb)
    const eventListSheet = wb.getWorksheet("Event List")
    const reportListSheet = wb.getWorksheet("Report List")
    const varListSheet = wb.getWorksheet("Variables List")

    const eid2rid = FUNC.parseEventList(eventListSheet);
    const rid2vid = FUNC.parseReportList(reportListSheet);
    return {
        eid2rid,
        rid2vid
    }
};

/**
 * 单机测试准备
 * 
 */
const testPrepare = (wb: Workbook) => {
    const eventWorkSheet = wb.getWorksheet('Event List')
    if (!eventWorkSheet) throw new Error("Event List工作表获取失败！");
    const reportWorkSheet = wb.getWorksheet('Report List')
    if (!reportWorkSheet) throw new Error("Report List工作表获取失败！");
    const varWorkSheet = wb.getWorksheet('Variables List')
    if (!varWorkSheet) throw new Error("Variables List工作表获取失败！");

    // 删除Event List无用列
    const needs: (string | undefined)[] = ["Event ID", "Description", "Comment", "Link Report ID"]
    for (let i = 0; i < 7; i++) {
        const col = eventWorkSheet.columns[i];
        if (!col.values) continue
        const type = col.values[2]?.toString()
        if (type)
            if (!needs.includes(type)) {
                // console.log(i, type)
                eventWorkSheet.spliceColumns(i + 1, 1)
                i--
            } else if (col.width && col.width > 30) {
                col.width = 30
            }

    }
    eventWorkSheet.getColumn(5).width = 20
    eventWorkSheet.getColumn(6).width = 50
    eventWorkSheet.getCell('E2').value = 'VID'
    eventWorkSheet.getCell('E2').font = {
        bold: true,
        underline: true
    }
    eventWorkSheet.getCell('E2').alignment = {
        vertical: 'middle',
        horizontal: 'center',
    }
    eventWorkSheet.getCell('E2').fill = {
        fgColor: {
            argb: 'FFD9D9D9'
        },
        bgColor: {
            argb: 'FF0000FF'
        },
        pattern: 'solid',
        type: 'pattern'
    }
    eventWorkSheet.getCell('E2').border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
    }
    eventWorkSheet.getCell('F2').value = 'VID详情'
    eventWorkSheet.getCell('F2').font = eventWorkSheet.getCell('E2').font
    eventWorkSheet.getCell('F2').alignment = eventWorkSheet.getCell('E2').alignment
    eventWorkSheet.getCell('F2').fill = eventWorkSheet.getCell('E2').fill
    eventWorkSheet.getCell('F2').border = eventWorkSheet.getCell('E2').border
    eventWorkSheet.views = [
        { state: 'frozen', ySplit: 2, activeCell: 'A1' }
    ];

    const eventRows = eventWorkSheet.getRows(3, eventWorkSheet.rowCount - 2);
    if (!eventRows) throw new Error("Event List 数据行获取失败！");
    const reportRows = reportWorkSheet.getRows(3, reportWorkSheet.rowCount - 2);
    if (!reportRows) throw new Error("Report List 数据行获取失败！");
    const varRows = varWorkSheet.getRows(3, varWorkSheet.rowCount - 2);
    if (!varRows) throw new Error("Variables List 数据行获取失败！");

    const varHead = varWorkSheet.getRow(2)
    const varIndexMap = {} as any;
    varHead.eachCell((cell, colNum)=>{
        if(cell.value)
        varIndexMap[(cell.value as string).toLocaleLowerCase()] = colNum
    })
    // 遍历var List
    const varMap = {} as {
        [key: string]: any
    }
    for (let row of varRows) {
        const vidCell = row.getCell(varIndexMap['vid'])
        const descCell = row.getCell(varIndexMap['description'])
        const typeCell = row.getCell(varIndexMap['type'])
        const commentCell = row.getCell(varIndexMap['comment'])
        if (!vidCell.value) continue

        const vid = vidCell.value as string
        varMap[vid] = []
        varMap[vid].push({
            'font': {
                'color': { 'argb': 'FFFF3300' }
            },
            'text': `vid${vid}`
        })
        varMap[vid].push({
            'font': {
                'color': { 'argb': 'FF660000' }
            },
            'text': `, ${descCell.value}`
        })
        varMap[vid].push({
            'font': {
                'color': { 'argb': 'FF116600' }
            },
            'text': `, 类型${typeCell.value}`
        })
        if (commentCell.value) {
            const commentStr = getTextValue(commentCell.value)
            if (commentStr.includes('\n'))
                varMap[vid].push({
                    'font': {
                        'color': { 'argb': 'FF0000FF' }
                    },
                    'text': `, 取值:\r\n${commentStr}\r\n`
                })
            else
                varMap[vid].push({
                    'font': {
                        'color': { 'argb': 'FF0000FF' }
                    },
                    'text': `, 取值:\r\n${commentStr}`
                })
        }
        varMap[vid].push({
            'font': {
                'color': { 'argb': 'FF0000FF' }
            },
            'text': `\r\n`
        })
    }
    // 遍历Report List
    const rptMap = {

    } as {
        [key: string]: any
    }
    let vidIndex = 4
    reportWorkSheet.getRow(2).eachCell((cell, colNum)=>{
        if(getTextValue(cell.value).includes('VID')){
            vidIndex = colNum
        }
    })
    for (let row of reportRows) {
        const rptCell = row.getCell(1)
        const vidCell = row.getCell(vidIndex)
        if (!rptCell.value) continue

        const rid = rptCell.value as string
        rptMap[rid] = getTextValue(vidCell.value)
    }
    // console.log('rptMap', rptMap)

    // 遍历Event List
    for (let eventRow of eventRows) {
        const reportIDCell = eventRow.getCell(4)
        if (!reportIDCell.value) {
            continue
        }

        // console.log('search for:', reportIDCell.value)
        // 从Report List找vid
        let vid = rptMap[getTextValue(reportIDCell.value)] as string
        if (!vid || vid.length === 0) {
            console.warn(`未找到Report ID${reportIDCell.value}对应的VID！`);
            continue
        }
        vid = `${vid}`
        const vidCell = eventRow.getCell(5)
        vidCell.value = vid.replaceAll(',', '\r\n')
        vidCell.alignment = {
            vertical: 'middle',
            horizontal: 'left',
            wrapText: true
        }
        vidCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        }
        const vids = vid.match(/(\d+)/g)
        if (!vids) {
            console.warn(`vid${vid}解析失败！`);
            continue
        }
        // console.log(vids)

        let comment = []
        for (const vid of vids) {
            comment.push(...varMap[vid])
        }
        const commentCell = eventRow.getCell(6)
        commentCell.alignment = {
            vertical: 'middle',
            horizontal: 'left',
            wrapText: true
        }
        // console.log(comment)
        commentCell.value = {
            richText: comment
        }
        commentCell.border = vidCell.border
    }
}

const fixDataForXMLFUNC = {

    fixDataType: (type: string) => {
        const dataTypeList = ['L', 'A', 'B', 'BIN', 'I1', 'I2', 'I4', 'I8', 'U1', 'U2', 'U4', 'U8', 'F4', 'F8', 'JIS']
        // ANY

        type = type.toLocaleUpperCase()
        if (dataTypeList.includes(type)) return type

        const mark = type.charAt(0)
        const num = type.match(/\d/)
        switch (mark) {
            case 'B':
                const mark2 = type.charAt(1)
                return mark2 === 'O' ? 'B' : 'BIN';
                break;

            default:
                console.warn('unknown type:', type)
                break;
        }
        return `${mark}${num || ''}`
    },
    fixUsedColumn: (ws: Worksheet) => {
        let str = ''
        // 定位Used所在列，可能找不到
        const namesRow = ws.getRow(2)
        if (namesRow.hasValues && namesRow.values) {
            let usedIndex = (namesRow.values as string[]).indexOf('Used(O/X)')
            if (usedIndex >= 0) {
                const usedCol = ws.getColumn(usedIndex)
                usedCol.eachCell((cell, rowNum) => {
                    if(rowNum > 2)
                        if (cell.value) {
                            // TODO: 可能为富文本的情况
                            if (cell.value !== 'O' && cell.value !== 'X') {
                                cell.value = ''
                            }
                        }
                })
            } else {
                str += `未找到Used(O/X)列`
                console.warn(str)
            }
        }
        return str
    },
    fixTypeColumn: (ws: Worksheet, typeName: string) => {
        let str = ''
        // 定位Type所在列，可能找不到
        const namesRow = ws.getRow(2)
        if (namesRow.hasValues && namesRow.values) {
            let typeIndex = (namesRow.values as string[]).indexOf(typeName)
            if (typeIndex >= 0) {
                const typeCol = ws.getColumn(typeIndex)
                typeCol.eachCell((cell, rowNum) => {
                    if (rowNum > 2)
                        if (ws.getCell(rowNum, 1).value){
                            if(cell.value)
                            cell.value = fixDataForXMLFUNC.fixDataType(getTextValue(cell.value))
                            else{
                                str += `${ws.name}:${rowNum} 使用默认类型：U2\r\n`
                                cell.value = 'U2'
                            }
                        }
                        
                })
            } else {
                str += `${ws.name}-未找到${typeName}列\r\n`
                console.warn(str)
            }
        }
        return str
    }
}
/**
 * 转XML预处理矫正
 * 
 */
const fixDataForXML = (wb: Workbook) => {
    // Event List
    const fixConfig = {
        'Event List': {
            used: true,
        },
        'Variables List': {
            used: true,
            type: 'Type',
        },
        'Remote Command List': {
            used: true
        },
        'Remote Command Parameter List': {
            used: true,
            type: 'CPTYPE',
        },
        'Trace Data List': {
            used: true,
            type: 'Type',
        },
        'Recipe Parameter List': {
            used: true,
            type: 'Type',
        },
        'Equipment Constant List':{
            used: true,
            type: 'Type',
        },
        'Alarm List':{
            used: true,
        },
    } as {
        [key: string]: {
            used?: boolean,
            type?: 'Type' | 'CPTYPE',
        }
    }
    let ret = ''
    for (let ws of wb.worksheets) {
        const config = fixConfig[ws.name]
        // 跳过未配置项目
        if (!config) continue

        if (config.used) ret += fixDataForXMLFUNC.fixUsedColumn(ws)
        if (config.type) ret += fixDataForXMLFUNC.fixTypeColumn(ws, config.type)
    }
    return ret
}
export {
    parse,
    testPrepare,
    fixDataForXML,
}