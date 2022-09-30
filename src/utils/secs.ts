import { Row, Workbook, Worksheet } from 'exceljs-enhance';
import { getTextValue } from './common';
import { AlarmData, MeasureData, RCMDData, RCPData, RecipeData, SecsData, SecsEventIdData, SecsReportIdData, SecsVarIdData, TraceData } from './types';

var Chinese = require('chinese-s2t')
const Excel = require('exceljs-enhance') as typeof import('exceljs-enhance')

const getCellValueByRowIndex = (row: Row, index: number | undefined)=>{
    if(!index)return ''
    const cell = row.getCell(index)
    return getTextValue(cell.value)
}
const ParseFunc = {
    parseEventList: (eventListSheet: Worksheet): SecsEventIdData => {

        // Event - Link Report Id
        const eventListData = eventListSheet.getSheetValues();
        let title = eventListData[1] as string[]
        if (title === null || title === undefined || !title.includes("CEID List")) {
            throw new Error("CEID List ERROR");
        }
        const varRows = eventListSheet.getRows(3, eventListSheet.rowCount - 2);
        if (!varRows) throw new Error("Event List 数据行获取失败！");

        const eventHead = eventListSheet.getRow(2)
        const eventIndexMap = {} as any;
        eventHead.eachCell((cell, colNum)=>{
            if(cell.value)
            eventIndexMap[getTextValue(cell.value).toLocaleLowerCase().trim()] = colNum
        })

        // 遍历Event List
        const eid2rid: SecsEventIdData = {}

        for (let row of varRows) {
            const eventId = getCellValueByRowIndex(row, eventIndexMap['event id'])
            if (!eventId) continue
    
            eid2rid[eventId] = {
                description: Chinese.t2s(getCellValueByRowIndex(row, eventIndexMap['description'])),
                comment: Chinese.t2s(getCellValueByRowIndex(row, eventIndexMap['comment'])),
                rptIds: getCellValueByRowIndex(row, eventIndexMap['link report id']).match(/\d+/g) || [],
            }

        }
        return eid2rid
    },
    parseReportList: (reportWorkSheet: Worksheet): SecsReportIdData=>{
    
        const reportRows = reportWorkSheet.getRows(3, reportWorkSheet.rowCount - 2);
        if (!reportRows) throw new Error("Report List 数据行获取失败！");
    
        const rptHead = reportWorkSheet.getRow(2)
        const rptIndexMap = {} as any;
        rptHead.eachCell((cell, colNum)=>{
            if(cell.value)
            rptIndexMap[getTextValue(cell.value).toLocaleLowerCase()] = colNum
        })

        // 遍历Report List
        const rptMap: SecsReportIdData = {}
        for (let row of reportRows) {
            const rptCell = row.getCell(1)
            const rptId = getTextValue(rptCell.value)
            if (!rptId) continue
            const vidValue = getCellValueByRowIndex(row, rptIndexMap['link vid'])
    
            rptMap[rptId] = vidValue.match(/\d+/g) || []
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

        if(!varIndexMap['vid']) return {}
        for (let row of varRows) {
            const vidCell = row.getCell(varIndexMap['vid'])
            if (!vidCell.value) continue
    
            const vid = vidCell.value as string
            varMap[vid] = {
                id: vid,
                desc: Chinese.t2s(getCellValueByRowIndex(row, varIndexMap['description'])),
                type: getCellValueByRowIndex(row, varIndexMap['type']),
                comment: Chinese.t2s(getCellValueByRowIndex(row, varIndexMap['comment'])),
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
            let command = '';
            if(cmdIndexMap['command']){
                const cmdCell = row.getCell(cmdIndexMap['command'])
                if (!cmdCell.value) continue
                command = getTextValue(cmdCell.value)
            }

            let description = '';
            if(cmdIndexMap['description']){
                const descCell = row.getCell(cmdIndexMap['description'])
                description = Chinese.t2s(getTextValue(descCell.value))
            }

            let cpIds: string[] = [];
            if(cmdIndexMap['link cpid']){
                const linkCell = row.getCell(cmdIndexMap['link cpid'])
                cpIds = getTextValue(linkCell.value).match(/\d+/) || []
            }

            let rcmd = '';
            if(cmdIndexMap['rcmd(ascii)']){
                const rcmdCell = row.getCell(cmdIndexMap['rcmd(ascii)'])
                rcmd = getTextValue(rcmdCell.value)
            }

            cmdMap[command] = {
                command,
                description,
                rcmd,
                cpIds,
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
            
            let id = ''
            if(rcpIndexMap['cpid']){
                const idCell = row.getCell(rcpIndexMap['cpid'])
                if (!idCell.value) continue
                id = getTextValue(idCell.value)
            }

            let name = ''
            if(rcpIndexMap['cpname']){
                const nameCell = row.getCell(rcpIndexMap['cpname'])
                name = getTextValue(nameCell.value)
            }

            let description = ''
            if(rcpIndexMap['description']){
                const descCell = row.getCell(rcpIndexMap['description'])
                description = Chinese.t2s(getTextValue(descCell.value))
            }

            let type = ''
            if(rcpIndexMap['cptype']){
                const typeCell = row.getCell(rcpIndexMap['cptype'])
                type = getTextValue(typeCell.value)
            }
    
            rcpMap[id] = {
                id,
                name,
                description,
                type,
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
            let id = ''
            let type = ''
            let chinese = ''
            let english = ''
            if(alarmIndexMap['alarm id'] || alarmIndexMap['sequence']){
                const idCell = row.getCell(alarmIndexMap['alarm id'] || alarmIndexMap['sequence'])
                if (!idCell.value) continue
                id = getTextValue(idCell.value)
            }

            if(alarmIndexMap['alarm text chinese']){
                const chsCell = row.getCell(alarmIndexMap['alarm text chinese'])
                chinese = Chinese.t2s(getTextValue(chsCell.value))
            }

            if(alarmIndexMap['alarm text english']){
                const engCell = row.getCell(alarmIndexMap['alarm text english'])
                english = getTextValue(engCell.value)
            }

            if(alarmIndexMap['alarm type']){
                const typeCell = row.getCell(alarmIndexMap['alarm type'])
                type = getTextValue(typeCell.value)
            }
    
            // TODO: id为0时，似乎会丢失
            alarmMap['' + id] = {
                id,
                type,
                chinese,
                english,
            }

        }

        return alarmMap
    },
    parseTraceDataList: (traceWorkSheet: Worksheet): TraceData=>{
    
        const traceRows = traceWorkSheet.getRows(3, traceWorkSheet.rowCount - 2);
        if (!traceRows) throw new Error("Trace Data List 数据行获取失败！");
    
        const traceHead = traceWorkSheet.getRow(2)
        const traceIndexMap = {} as any;
        traceHead.eachCell((cell, colNum)=>{
            if(cell.value)
            traceIndexMap[getTextValue(cell.value).toLocaleLowerCase().trim()] = colNum
        })

        // 遍历rcp List
        const traceMap: TraceData = {}

        // console.log('alarmIndexMap:', alarmIndexMap)
        for (let row of traceRows) {
            const idCell = row.getCell(traceIndexMap['svid'] || traceIndexMap['sequence'])
            if (!idCell.value) continue

            let comment = ''
            if(traceIndexMap['comment']){
                const commentCell = row.getCell(traceIndexMap['comment'])
                comment = getTextValue(commentCell.value)
            }

            let desc = ''
            if(traceIndexMap['description']){
                const descCell = row.getCell(traceIndexMap['description'])
                desc = getTextValue(descCell.value)
            }

            let type = ''
            if(traceIndexMap['type']){
                const typeCell = row.getCell(traceIndexMap['type'])
                type = getTextValue(typeCell.value)
            }
    
            const id = getTextValue(idCell.value)
            traceMap[id] = {
                id,
                type,
                comment,
                desc,
            }

        }

        return traceMap
    },
    parseMeasureDataList: (measureWorkSheet: Worksheet): MeasureData=>{
    
        const measureRows = measureWorkSheet.getRows(3, measureWorkSheet.rowCount - 2);
        if (!measureRows) throw new Error("Process Measure Data List 数据行获取失败！");
    
        const measureHead = measureWorkSheet.getRow(2)
        const measureIndexMap = {} as any;
        measureHead.eachCell((cell, colNum)=>{
            if(cell.value)
            measureIndexMap[getTextValue(cell.value).toLocaleLowerCase().trim()] = colNum
        })

        // 遍历rcp List
        const measureMap: MeasureData = {}

        // console.log('alarmIndexMap:', alarmIndexMap)
        for (let row of measureRows) {
            let name = ''
            if(measureIndexMap['dvname']){
                const nameCell = row.getCell(measureIndexMap['dvname'])
                if (!nameCell.value) continue
                name = getTextValue(nameCell.value)
            }

            let desc = ''
            if(measureIndexMap['description']){
                const descCell = row.getCell(measureIndexMap['description'])
                desc = getTextValue(descCell.value)
            }

            let type = ''
            if(measureIndexMap['type']){
                const typeCell = row.getCell(measureIndexMap['type'])
                type = getTextValue(typeCell.value)
            }

            let comment = ''
            if(measureIndexMap['comment']){
                const commentCell = row.getCell(measureIndexMap['comment'])
                comment = getTextValue(commentCell.value)
            }
    
            measureMap[name] = {
                name,
                desc,
                type,
                comment,
            }

        }

        return measureMap
    },
    parseRecipeDataList: (recipeWorkSheet: Worksheet): RecipeData=>{
    
        const recipeRows = recipeWorkSheet.getRows(3, recipeWorkSheet.rowCount - 2);
        if (!recipeRows) throw new Error("Recipe Parameter List 数据行获取失败！");
    
        const recipeHead = recipeWorkSheet.getRow(2)
        const recipeIndexMap = {} as any;
        recipeHead.eachCell((cell, colNum)=>{
            if(cell.value)
            recipeIndexMap[getTextValue(cell.value).toLocaleLowerCase().trim()] = colNum
        })

        // 遍历rcp List
        const recipeMap: RecipeData = {}

        // console.log('alarmIndexMap:', alarmIndexMap)
        for (let row of recipeRows) {
            let pparm = ''
            if(recipeIndexMap['pparm']){
                const pparmCell = row.getCell(recipeIndexMap['pparm'])
                if (!pparmCell.value) continue
                pparm = getTextValue(pparmCell.value)
            }

            let name = ''
            if(recipeIndexMap['name']){
                const nameCell = row.getCell(recipeIndexMap['name'])
                name = getTextValue(nameCell.value)
            }

            let desc = ''
            if(recipeIndexMap['description']){
                const descCell = row.getCell(recipeIndexMap['description'])
                desc = getTextValue(descCell.value)
            }

            let type = ''
            if(recipeIndexMap['type']){
                const typeCell = row.getCell(recipeIndexMap['type'])
                type = getTextValue(typeCell.value);
            }
    
            recipeMap[pparm] = {
                pparm,
                name,
                desc,
                type,
            }

        }

        return recipeMap
    },

}
const parse = (wb: Workbook): SecsData => {
    const eventListSheet = wb.getWorksheet("Event List")
    const reportListSheet = wb.getWorksheet("Report List")
    const varListSheet = wb.getWorksheet("Variables List")
    const rcmdSheet = wb.getWorksheet("Remote Command List")
    const rcpSheet = wb.getWorksheet("Remote Command Parameter List")
    const alarmSheet = wb.getWorksheet("Alarm List")
    const traceSheet = wb.getWorksheet("Trace Data List")
    const recipeSheet = wb.getWorksheet("Recipe Parameter List")

    const eid2rid = ParseFunc.parseEventList(eventListSheet);
    const rid2vid = ParseFunc.parseReportList(reportListSheet);
    const vidData = ParseFunc.parseVariableList(varListSheet);
    const rcmd2cpid = ParseFunc.parseRCMDList(rcmdSheet)
    const rcpData = ParseFunc.parseRCPList(rcpSheet)
    const alarmData = ParseFunc.parseAlarmList(alarmSheet)
    const traceData = ParseFunc.parseTraceDataList(traceSheet)
    const recipeData = ParseFunc.parseRecipeDataList(recipeSheet)
    return {
        eid2rid,
        rid2vid,
        vidData,
        rcmd2cpid,
        rcpData,
        alarmData,
        traceData,
        recipeData
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

const XMLParseFunc = {
    alarmcollection: (data: any): AlarmData=>{
        // console.log('alarmcollection:', data)
        interface DataType {
            '@_alarmtextchinese': string,
            '@_alarmtextenglish': string,
            '@_alarmtype': string,
            '@_enable': string,
            '@_id': string
        }
        const data_ = data.alarm as DataType[]
        const result: AlarmData = {}
        for(let _d of data_){
            result[_d['@_id']] = {
                id: _d['@_id'],
                type: _d['@_alarmtype'],
                chinese: _d['@_alarmtextchinese'],
                english: _d['@_alarmtextenglish']
            }
        }
        return result
    },
    commandcollection: (data: any): RCMDData=>{
        // console.log('commandcollection:', data)
        interface DataType {
            '@_alias': string
            '@_defaultlength': string
            '@_enable': string
            '@_id': string
            '@_link': string
            '@_name': string
        }
        const data_ = data.command as DataType[]
        const result: RCMDData = {}
        for(let _d of data_){
            result[_d['@_name']] = {
                command: _d['@_name'],
                rcmd: _d['@_name'],
                description: '',
                cpIds: _d['@_link'].match(/\d+/g) || [],
            }
        }
        return result

    },
    commandparametercollection: (data: any): RCPData=>{
        // console.log('commandparametercollection:', data)
        interface DataType {
            '@_alias': string
            '@_defaultlength': string
            '@_defaultunit': string
            '@_defaultvalue': string
            '@_enable': string
            '@_id': string
            '@_name': string
            '@_rule': string
        }
        const data_ = data.cpname as DataType[]
        const result: RCPData = {}
        for(let _d of data_){
            result[_d['@_id']] = {
                id: _d['@_id'],
                name: _d['@_name'],
                description: '',
                type: _d['@_defaultunit'],
            }
        }
        return result

    },
    // constantdatacollection: (alarmData: any)=>{

    // },
    // discretedatacollection: (alarmData: any)=>{

    // },
    eventcollection: (data: any): SecsEventIdData=>{
        // console.log('eventcollection:', data)
        interface DataType {
            '@_alias': string
            '@_enable': string
            '@_id': string
            '@_link': string
            '@_name': string
        }
        const events = data.event as DataType[]
        const result: SecsEventIdData = {}
        for(let event of events){
            result[event['@_id']] = {
                description: event['@_name'],
                comment: '',
                rptIds: event['@_link'].match(/\d+/g) || []
            }
        }
        return result

    },
    recipebodycollection: (data: any): RecipeData=>{
        // console.log('recipebodycollection:', data)
        interface DataType {
            '@_alias': string
            '@_defaultlength': string
            '@_defaultunit': string
            '@_defaultvalue': string
            '@_enable': string
            '@_group': string
            '@_groupname': string
            '@_id': string // pparm
            '@_maxvalue': string
            '@_minvalue': string
            '@_name': string
            '@_seqno': string
        }
        const data_ = data.recipedata as DataType[]
        const result: RecipeData = {}
        for(let _d of data_){
            result[_d['@_id']] = {
                pparm: _d['@_id'],
                name: _d['@_name'],
                desc: '',
                type: _d['@_defaultunit']
            }
        }
        return result

    },
    reportcollection: (data: any): SecsReportIdData=>{
        // console.log('reportcollection:', data)
        interface DataType {
            '@_alias': string
            '@_enable': string
            '@_id': string
            '@_link': string
            '@_name': string
        }
        const data_ = data.report as DataType[]
        const result: SecsReportIdData = {}
        for(let _d of data_){
            result[_d['@_id']] = _d['@_link'].match(/\d+/g) || []
        }
        return result
    },
    tracedatacollection: (data: any): TraceData=>{
        // console.log('tracedatacollection:', data)
        interface DataType {
            '@_alias': string
            '@_defaultlength': string
            '@_defaultunit': string
            '@_defaultvalue': string
            '@_enable': string
            '@_group': string
            '@_groupname': string
            '@_id': string
            '@_maxvalue': string
            '@_minvalue': string
            '@_name': string
            '@_seqno': string
        }
        const data_ = data.tracedata as DataType[]
        const result: TraceData = {}
        for(let _d of data_){
            let id = _d['@_id']
            if(id.length == 0)
            id = _d['@_seqno']
            result[id] = {
                id,
                type: _d['@_defaultunit'],
                comment: '',
                desc: _d['@_name'],
            }
        }
        return result
    },
    variablecollection: (data: any): SecsVarIdData=>{
        // console.log('variablecollection:', data)
        interface DataType {
            '@_alias': string
            '@_defaultlength': string
            '@_defaultunit': string
            '@_defaultvalue': string
            '@_enable': string
            '@_id': string
            '@_maxvalue': string
            '@_minvalue': string
            '@_name': string
            '@_rule': string
        }
        const data_ = data.variable as DataType[]
        const result: SecsVarIdData = {}
        for(let _d of data_){
            result[_d['@_id']] = {
                id: _d['@_id'],
                type: _d['@_defaultunit'],
                comment: '',
                desc: _d['@_name'],
            }
        }
        return result

    }
}
export const parseXML = (xml: string): SecsData => {
    const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
    const options = {
        ignoreAttributes : false
    };
    const parser = new XMLParser(options);
    let jObj = parser.parse(xml);
    console.log(jObj)
    const library = jObj.library
    console.log('library:', library)
    const secsData: SecsData = {
        eid2rid: XMLParseFunc.eventcollection(library.eventcollection),
        rid2vid: XMLParseFunc.reportcollection(library.reportcollection),
        vidData: XMLParseFunc.variablecollection(library.variablecollection),
        rcmd2cpid: XMLParseFunc.commandcollection(library.commandcollection),
        rcpData: XMLParseFunc.commandparametercollection(library.commandparametercollection),
        alarmData: XMLParseFunc.alarmcollection(library.alarmcollection),
        traceData: XMLParseFunc.tracedatacollection(library.tracedatacollection),
        recipeData: XMLParseFunc.recipebodycollection(library.recipebodycollection)
    }
    return secsData
}
export {
    parse,
    testPrepare,
    testPrepareV2,
    fixDataForXML,
}