import { Workbook, Worksheet } from 'exceljs-enhance';
import { getTextValue } from './common';
import { AlarmData, RCMDData, RCPData, SecsData, SecsEventIdData, SecsReportIdData, SecsVarIdData } from './types';

var Chinese = require('chinese-s2t')
const Excel = require('exceljs-enhance') as typeof import('exceljs-enhance')

const ParseFunc = {
    parseEventList: (eventListSheet: Worksheet): SecsEventIdData => {

        // Event - Link Report Id
        const eventListData = eventListSheet.getSheetValues();
        let title = eventListData[1] as string[]
        if (title === null || title === undefined || !title.includes("CEID List")) {
            throw new Error("CEID List ERROR");
        }
        const eventHead = eventListSheet.getRow(2)
        const eventIndexMap = {} as any;
        eventHead.eachCell((cell, colNum)=>{
            if(cell.value)
            eventIndexMap[getTextValue(cell.value).toLocaleLowerCase().trim()] = colNum
        })
        const eidIndex = eventIndexMap["event id"]
        const descIndex = eventIndexMap["description"]
        const cmtIndex = eventIndexMap["comment"]
        const ridIndex = eventIndexMap["link report id"]
        // console.log('event list:',  eidIndex, ridIndex)

        const eid2rid: SecsEventIdData = {}
        let tData = eventListData.slice(3, eventListData.length)
        for (let data of tData as Array<string>[]) {
            // console.log('data:', data)
            if (!data) continue

            if (typeof data.length !== "number") continue
            const ridStr = '' + data[ridIndex]
            // console.warn('rids:', rids)
            eid2rid[data[eidIndex]] = {
                description: Chinese.t2s(data[descIndex]),
                comment: Chinese.t2s(data[cmtIndex]),
                rptIds: ridStr.match(/\d+/g) || []
            }
        }
        // console.log('eid2rid:', eid2rid)
        return eid2rid
    },
    parseReportList: (reportWorkSheet: Worksheet): SecsReportIdData=>{
    
        const reportRows = reportWorkSheet.getRows(3, reportWorkSheet.rowCount - 2);
        if (!reportRows) throw new Error("Report List 数据行获取失败！");
    
        // 遍历Report List
        const rptMap: SecsReportIdData = {}
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
            rptMap[rid] = getTextValue(vidCell.value).match(/\d+/g) || []
        }
        return rptMap

    },
    parseVariableList: (varWorkSheet: Worksheet): SecsVarIdData=>{
    
        const varRows = varWorkSheet.getRows(3, varWorkSheet.rowCount - 2);
        if (!varRows) throw new Error("Variables List 数据行获取失败！");
    
        const varHead = varWorkSheet.getRow(2)
        const varIndexMap = {} as any;
        varHead.eachCell((cell, colNum)=>{
            if(cell.value)
            varIndexMap[getTextValue(cell.value).toLocaleLowerCase()] = colNum
        })

        // 遍历var List
        const varMap: SecsVarIdData = {}

        for (let row of varRows) {
            const vidCell = row.getCell(varIndexMap['vid'])
            const descCell = row.getCell(varIndexMap['description'])
            const typeCell = row.getCell(varIndexMap['type'])
            const commentCell = row.getCell(varIndexMap['comment'])
            if (!vidCell.value) continue
    
            const vid = vidCell.value as string
            varMap[vid] = {
                id: vid,
                desc: Chinese.t2s(getTextValue(descCell.value)),
                type: getTextValue(typeCell.value),
                comment: Chinese.t2s(getTextValue(commentCell.value)),
            }

        }

        return varMap
    },
    parseRCMDList: (cmdWorkSheet: Worksheet): RCMDData=>{
    
        const cmdRows = cmdWorkSheet.getRows(3, cmdWorkSheet.rowCount - 2);
        if (!cmdRows) throw new Error("Remote Command List 数据行获取失败！");
    
        const cmdHead = cmdWorkSheet.getRow(2)
        const cmdIndexMap = {} as any;
        cmdHead.eachCell((cell, colNum)=>{
            if(cell.value)
            cmdIndexMap[getTextValue(cell.value).toLocaleLowerCase().trim()] = colNum
        })

        // 遍历cmd List
        const cmdMap: RCMDData = {}

        for (let row of cmdRows) {
            const cmdCell = row.getCell(cmdIndexMap['command'])
            const descCell = row.getCell(cmdIndexMap['description'])
            const linkCell = row.getCell(cmdIndexMap['link cpid'])
            const rcmdCell = row.getCell(cmdIndexMap['rcmd(ascii)'])
            if (!cmdCell.value) continue
    
            const cmd = getTextValue(cmdCell.value)
            cmdMap[cmd] = {
                command: cmd,
                description: Chinese.t2s(getTextValue(descCell.value)),
                rcmd: getTextValue(rcmdCell.value),
                cpIds: getTextValue(linkCell.value).match(/\d+/) || [],
            }

        }

        return cmdMap
    },
    parseRCPList: (rcpWorkSheet: Worksheet): RCPData=>{
    
        const rcpRows = rcpWorkSheet.getRows(3, rcpWorkSheet.rowCount - 2);
        if (!rcpRows) throw new Error("Remote Command Parameter List 数据行获取失败！");
    
        const rcpHead = rcpWorkSheet.getRow(2)
        const rcpIndexMap = {} as any;
        rcpHead.eachCell((cell, colNum)=>{
            if(cell.value)
            rcpIndexMap[getTextValue(cell.value).toLocaleLowerCase().trim()] = colNum
        })

        // 遍历rcp List
        const rcpMap: RCPData = {}

        for (let row of rcpRows) {
            const idCell = row.getCell(rcpIndexMap['cpid'])
            const nameCell = row.getCell(rcpIndexMap['cpname'])
            const descCell = row.getCell(rcpIndexMap['description'])
            const typeCell = row.getCell(rcpIndexMap['cptype'])
            if (!idCell.value) continue
    
            const id = getTextValue(idCell.value)
            rcpMap[id] = {
                id,
                name: getTextValue(nameCell.value),
                description: Chinese.t2s(getTextValue(descCell.value)),
                type: getTextValue(typeCell.value),
            }

        }

        return rcpMap
    },
    parseAlarmList: (alarmWorkSheet: Worksheet): AlarmData=>{
    
        const alarmRows = alarmWorkSheet.getRows(3, alarmWorkSheet.rowCount - 2);
        if (!alarmRows) throw new Error("Alarm List 数据行获取失败！");
    
        const alarmHead = alarmWorkSheet.getRow(2)
        const alarmIndexMap = {} as any;
        alarmHead.eachCell((cell, colNum)=>{
            if(cell.value)
            alarmIndexMap[getTextValue(cell.value).toLocaleLowerCase().trim()] = colNum
        })

        // 遍历rcp List
        const alarmMap: AlarmData = {}

        // console.log('alarmIndexMap:', alarmIndexMap)
        for (let row of alarmRows) {
            const idCell = row.getCell(alarmIndexMap['alarm id'])
            const chsCell = row.getCell(alarmIndexMap['alarm text chinese'])
            const engCell = row.getCell(alarmIndexMap['alarm text english'])
            const typeCell = row.getCell(alarmIndexMap['alarm type'])
            if (!idCell.value) continue
    
            const id = getTextValue(idCell.value)
            alarmMap[id] = {
                id,
                type: getTextValue(typeCell.value),
                chinese: getTextValue(chsCell.value),
                english: Chinese.t2s(getTextValue(engCell.value)),
            }

        }

        return alarmMap
    },
}
const parse = (wb: Workbook): SecsData => {
    const eventListSheet = wb.getWorksheet("Event List")
    const reportListSheet = wb.getWorksheet("Report List")
    const varListSheet = wb.getWorksheet("Variables List")
    const rcmdSheet = wb.getWorksheet("Remote Command List")
    const rcpSheet = wb.getWorksheet("Remote Command Parameter List")
    const alarmSheet = wb.getWorksheet("Alarm List")

    const eid2rid = ParseFunc.parseEventList(eventListSheet);
    const rid2vid = ParseFunc.parseReportList(reportListSheet);
    const vidData = ParseFunc.parseVariableList(varListSheet);
    const rcmd2cpid = ParseFunc.parseRCMDList(rcmdSheet)
    const rcpData = ParseFunc.parseRCPList(rcpSheet)
    const alarmData = ParseFunc.parseAlarmList(alarmSheet)
    return {
        eid2rid,
        rid2vid,
        vidData,
        rcmd2cpid,
        rcpData,
        alarmData,
    }
};

/**
 * 单机测试准备
 * 
 */
const testPrepare = (wb: Workbook) => {
    const resultWorkSheet = wb.getWorksheet('ERV Merge List(整合表)')
    if (!resultWorkSheet) throw new Error("ERV Merge List(整合表)工作表获取失败！");
    const reportWorkSheet = wb.getWorksheet('Report List')
    if (!reportWorkSheet) throw new Error("Report List工作表获取失败！");
    const varWorkSheet = wb.getWorksheet('Variables List')
    if (!varWorkSheet) throw new Error("Variables List工作表获取失败！");

    // 删除Event List无用列
    const needs: (string | undefined)[] = ["Event ID", "Description", "Comment", "Link Report ID"]
    for (let i = 0; i < resultWorkSheet.actualColumnCount; i++) {
        const col = resultWorkSheet.columns[i];
        if (!col.values) continue
        const type = col.values[2]?.toString()
        if (type)
            if (!needs.includes(type)) {
                // console.log(i + 1, type)
                resultWorkSheet.spliceColumns(i + 1, 1)
                i--
            } else if (col.width && col.width > 30) {
                col.width = 30
            }

    }
    resultWorkSheet.getColumn(5).width = 20
    resultWorkSheet.getColumn(6).width = 50
    resultWorkSheet.getCell('E2').value = 'VID'
    resultWorkSheet.getCell('E2').font = {
        bold: true,
        underline: true
    }
    resultWorkSheet.getCell('E2').alignment = {
        vertical: 'middle',
        horizontal: 'center',
    }
    resultWorkSheet.getCell('E2').fill = {
        fgColor: {
            argb: 'FFD9D9D9'
        },
        bgColor: {
            argb: 'FF0000FF'
        },
        pattern: 'solid',
        type: 'pattern'
    }
    resultWorkSheet.getCell('E2').border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
    }
    resultWorkSheet.getCell('F2').value = 'VID详情'
    resultWorkSheet.getCell('F2').font = resultWorkSheet.getCell('E2').font
    resultWorkSheet.getCell('F2').alignment = resultWorkSheet.getCell('E2').alignment
    resultWorkSheet.getCell('F2').fill = resultWorkSheet.getCell('E2').fill
    resultWorkSheet.getCell('F2').border = resultWorkSheet.getCell('E2').border
    resultWorkSheet.views = [
        { state: 'frozen', ySplit: 2, activeCell: 'A1' }
    ];

    const eventRows = resultWorkSheet.getRows(3, resultWorkSheet.rowCount - 2);
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

    // 遍历Event List, 开始写入数据
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

        // vid详情
        let comment = []
        for (const vid of vids) {
            if(varMap[vid])
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
const testPrepareV2 = (wb: Workbook) => {
    const resultWorkSheet = wb.getWorksheet('ERV Merge List(整合表)')
    if (!resultWorkSheet) throw new Error("ERV Merge List(整合表)工作表获取失败！");
    const reportWorkSheet = wb.getWorksheet('Report List')
    if (!reportWorkSheet) throw new Error("Report List工作表获取失败！");
    const varWorkSheet = wb.getWorksheet('Variables List')
    if (!varWorkSheet) throw new Error("Variables List工作表获取失败！");

    const rptMap = ParseFunc.parseReportList(reportWorkSheet)
    const varMap = ParseFunc.parseVariableList(varWorkSheet)
    // 删除Event List无用列
    const needs: (string | undefined)[] = ["Event ID", "Description", "Comment", "Link Report ID"]
    for (let i = 0; i < resultWorkSheet.actualColumnCount; i++) {
        const col = resultWorkSheet.columns[i];
        if (!col.values) continue
        const type = col.values[2]?.toString()
        if (type)
            if (!needs.includes(type)) {
                // console.log(i + 1, type)
                resultWorkSheet.spliceColumns(i + 1, 1)
                i--
            } else if (col.width && col.width > 30) {
                col.width = 30
            }

    }
    resultWorkSheet.getColumn(5).width = 20
    resultWorkSheet.getColumn(6).width = 50
    resultWorkSheet.getCell('E2').value = 'VID'
    resultWorkSheet.getCell('E2').font = {
        bold: true,
        underline: true
    }
    resultWorkSheet.getCell('E2').alignment = {
        vertical: 'middle',
        horizontal: 'center',
    }
    resultWorkSheet.getCell('E2').fill = {
        fgColor: {
            argb: 'FFD9D9D9'
        },
        bgColor: {
            argb: 'FF0000FF'
        },
        pattern: 'solid',
        type: 'pattern'
    }
    resultWorkSheet.getCell('E2').border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
    }
    resultWorkSheet.getCell('F2').value = 'VID详情'
    resultWorkSheet.getCell('F2').font = resultWorkSheet.getCell('E2').font
    resultWorkSheet.getCell('F2').alignment = resultWorkSheet.getCell('E2').alignment
    resultWorkSheet.getCell('F2').fill = resultWorkSheet.getCell('E2').fill
    resultWorkSheet.getCell('F2').border = resultWorkSheet.getCell('E2').border
    resultWorkSheet.views = [
        { state: 'frozen', ySplit: 2, activeCell: 'A1' }
    ];

    const eventRows = resultWorkSheet.getRows(3, resultWorkSheet.rowCount - 2);
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
    // 遍历Event List, 开始写入数据
    for (let eventRow of eventRows) {
        const reportIDCell = eventRow.getCell(4)
        if (!reportIDCell.value) {
            continue
        }

        // 从Report List找vid
        let vid = rptMap[getTextValue(reportIDCell.value)].join('\r\n')
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

        // vid详情
        let comment = []
        for (const vid of vids) {
            const varData = varMap[vid]
            if(varData){
                const data = [
                    {
                        'font': {
                            'color': { 'argb': 'FFFF3300' }
                        },
                        'text': `vid${vid}`
                    },
                    {
                        'font': {
                            'color': { 'argb': 'FF660000' }
                        },
                        'text': `, ${varData.desc}`
                    },
                    {
                        'font': {
                            'color': { 'argb': 'FF116600' }
                        },
                        'text': `, 类型${varData.type}`
                    },
                    {
                        'font': {
                            'color': { 'argb': 'FF0000FF' }
                        },
                        'text': `, 取值:\r\n${varData.comment}`
                    },
                    {
                        'font': {
                            'color': { 'argb': 'FF0000FF' }
                        },
                        'text': `\r\n`
                    },
                ]
                comment.push(...data)
            }
        }
        comment.pop()
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
    fixColumn: (ws: Worksheet, colList: Array<String>) => {
        const row = ws.getRow(2);
        const {values} = row
        if(row.getCell(1).isMerged){
            return '在第二行检测到非预期的合并单元格！';
        }
        // console.log(values, row)
        if(!values || !values.includes)return 'values 获取失败';

        const upValues = (values as any[]).map(e=>getTextValue(e).toUpperCase().trim())
        // 缺失的项目
        const lostList: any[] = colList.filter(e=> !upValues.includes(e.toUpperCase()))
        const colData = lostList.map(v=>[, v])
        // console.log(lostList)
        if(colData.length > 0)
            ws.spliceColumns(ws.actualColumnCount < 10 ? ws.actualColumnCount : 10, 0, ...colData)
        else
            return 'ok'
        return lostList.join(', ')
    },
    fixUsedColumn: (ws: Worksheet) => {
        let str = ''
        // 定位Used所在列，可能找不到
        const namesRow = ws.getRow(2)
        if (namesRow.hasValues && namesRow.values) {
            let usedIndex = (namesRow.values as string[]).indexOf('Used(O/X)')
            if(usedIndex < 0){
                // used不存在
                let i;
                for (i = 1; i < (namesRow.values as string[]).length; i++) {
                    const v = ((namesRow.values as string[])[i])
                    if(!v || v.length === 0){
                        break;
                    }
                }
                str += `${ws.name}: Used(O/X) 列不存在，自动插入<br>`
                ws.spliceColumns(i, 0, [, 'Used(O/X)'])
            }else if (usedIndex >= 0) {
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
            }
        }
        return str
    },
    fixAliasColumn: (ws: Worksheet) => {
        let str = ''
        // 定位Alias所在列，可能找不到
        const namesRow = ws.getRow(2)
        if (namesRow.hasValues && namesRow.values) {
            let aliasIndex = (namesRow.values as string[]).indexOf('Alias')
            if(aliasIndex < 0){
                // used不存在
                let i;
                for (i = 1; i < (namesRow.values as string[]).length; i++) {
                    const v = ((namesRow.values as string[])[i])
                    if(!v || v.length === 0){
                        break;
                    }
                }
                str += `${ws.name}: Alias 列不存在，自动插入<br>`
                ws.spliceColumns(i, 0, [, 'Alias'])
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
            if(typeIndex < 0){
                // ${typeName}列不存在，插入
                let i;
                for (i = 1; i < (namesRow.values as string[]).length; i++) {
                    const v = ((namesRow.values as string[])[i])
                    if(!v || v.length === 0){
                        break;
                    }
                }
                ws.spliceColumns(i, 0, [, typeName])
            }else if (typeIndex >= 0) {
                const typeCol = ws.getColumn(typeIndex)
                typeCol.eachCell((cell, rowNum) => {
                    if (rowNum > 2)
                        if (ws.getCell(rowNum, 1).value){
                            if(cell.value)
                            cell.value = fixDataForXMLFUNC.fixDataType(getTextValue(cell.value))
                            else{
                                // TODO: 默认类型
                                str += `${ws.name}:${rowNum}行 使用默认类型：U2<br>`
                                cell.value = 'U2'
                            }
                        }
                        
                })
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
    // const fixConfig = {
    //     'Event List': ['Event ID', 'Description', 'Comment', 'Link Report ID', 'Alias', 'Used(O/X)'],
    //     'Report List': ['Report ID', 'Description', 'Comment', 'Link VID', 'Alias', 'Used(O/X)'],
    //     'Variables List': ['VID', 'Description', 'Type', 'Default', 'Max', 'Min', 'Length', 'Comment', 'Alias', 'Rule', 'Used(O/X)'],
    //     'Remote Command List': ['ID', 'Command', 'RCMD(ASCII)', 'Link CPID', 'Length', 'Description', 'Alias', 'Used(O/X)'],
    //     'Remote Command Parameter List': ['CPID', 'CPNAME', 'CPTYPE', 'CPAL', 'Length', 'Description', 'Alias', 'Rule', 'Used(O/X)'],
    //     'Trace Data List': ['Sequence', 'SVID', 'Description', 'Type', 'Default', 'Max', 'Min', 'Length', 'Group', 'GroupName', 'Comment', 'Alias', 'Used(O/X)'],
    //     'Recipe Parameter List': ['Sequence', 'PPARM', 'Description', 'Type', 'Default', 'Max', 'Min', 'Length', 'Comment', 'Alias', 'Used(O/X)', 'Group', 'GroupName'],
    //     'Equipment Constant List': ['Sequence', 'ECID', 'Description', 'Type', 'Default', 'Max', 'Min', 'Length', 'Comment', 'Alias', 'Rule', 'Used(O/X)'],
    //     'Alarm List': ['Sequence', 'Alarm ID', 'Alarm Type', 'Alarm Text Chinese', 'Alarm Text English', 'Used(O/X)'],
    //     'Process Measure Data List': ['Sequence', 'DVName', 'Description', 'Type', 'Default', 'Max', 'Min', 'Length', 'Comment', 'Used(O/X)'],
    //     } as {
    //     [key: string]: Array<String>
    // }
    // let ret = ''
    // for (let ws of wb.worksheets) {
    //     const config = fixConfig[ws.name]
    //     // 跳过未配置项目
    //     if (!config) continue

    //     ret += `${ws.name}处理：`
    //     ret += fixDataForXMLFUNC.fixColumn(ws, config)
    //     ret += '<br />\r\n'
    // }
    const fixConfig = {
        'Event List': {
            used: true,
            alias: true,
            columns: ['Event ID', 'Description', 'Comment', 'Link Report ID', 'Alias', 'Used(O/X)'],
        },
        'Report List': {
            used: true,
            alias: true,
            columns: ['Report ID', 'Description', 'Comment', 'Link VID', 'Alias', 'Used(O/X)'],
        },
        'Variables List': {
            used: true,
            alias: true,
            type: 'Type',
            columns: ['VID', 'Description', 'Type', 'Default', 'Max', 'Min', 'Length', 'Comment', 'Alias', 'Rule', 'Used(O/X)'],
        },
        'Remote Command List': {
            used: true,
            alias: true,
            columns: ['ID', 'Command', 'RCMD(ASCII)', 'Link CPID', 'Length', 'Description', 'Alias', 'Used(O/X)'],
        },
        'Remote Command Parameter List': {
            used: true,
            type: 'CPTYPE',
            columns: ['CPID', 'CPNAME', 'CPTYPE', 'CPAL', 'Length', 'Description', 'Alias', 'Rule', 'Used(O/X)'],
        },
        'Trace Data List': {
            used: true,
            type: 'Type',
            columns: ['Sequence', 'SVID', 'Description', 'Type', 'Default', 'Max', 'Min', 'Length', 'Group', 'GroupName', 'Comment', 'Alias', 'Used(O/X)'],
        },
        'Recipe Parameter List': {
            used: true,
            type: 'Type',
            columns: ['Sequence', 'PPARM', 'Description', 'Type', 'Default', 'Max', 'Min', 'Length', 'Comment', 'Alias', 'Used(O/X)', 'Group', 'GroupName'],
        },
        'Equipment Constant List': {
            used: true,
            type: 'Type',
            columns: ['Sequence', 'ECID', 'Description', 'Type', 'Default', 'Max', 'Min', 'Length', 'Comment', 'Alias', 'Rule', 'Used(O/X)'],
        },
        'Alarm List': {
            used: true,
            columns: ['Sequence', 'Alarm ID', 'Alarm Type', 'Alarm Text Chinese', 'Alarm Text English', 'Used(O/X)'],
        },
        'Process Measure Data List': {
            columns: ['Sequence', 'DVName', 'Description', 'Type', 'Default', 'Max', 'Min', 'Length', 'Comment', 'Used(O/X)'],
        }
    } as {
        [key: string]: {
            used?: boolean,
            alias?: boolean,
            type?: 'Type' | 'CPTYPE',
            columns: string[]
        }
    }
    let ret = ''
    for (let ws of wb.worksheets) {
        const config = fixConfig[ws.name]
        // 跳过未配置项目
        if (!config) continue

        ret += `${ws.name}处理：`
        ret += fixDataForXMLFUNC.fixColumn(ws, config.columns)
        // if (config.used) ret += fixDataForXMLFUNC.fixUsedColumn(ws)
        // if (config.alias) ret += fixDataForXMLFUNC.fixAliasColumn(ws)
        // if (config.type) ret += fixDataForXMLFUNC.fixTypeColumn(ws, config.type)
        ret += '<br />\r\n'
    }
    return ret
}
export {
    parse,
    testPrepare,
    testPrepareV2,
    fixDataForXML,
}