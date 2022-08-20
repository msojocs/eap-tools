import { Workbook, Worksheet } from 'exceljs';

const Excel = require('exceljs') as typeof import('exceljs')

const FUNC = {
    parseEventList: (eventListSheet: Worksheet)=>{

        // Event - Link Report Id
        const eventListData = eventListSheet.getSheetValues();
        let title = eventListData[1] as string[]
        if(title === null || title === undefined || !title.includes("CEID List")){
            throw new Error("CEID List ERROR");
        }
        const eidIndex = (eventListData[2] as string[]).indexOf("Event ID")
        let ridIndex = (eventListData[2] as string[]).indexOf("Link Report ID")
        // console.log('event list:',  eidIndex, ridIndex)

        const eid2rid:any = {}
        let tData = eventListData.slice(3, eventListData.length)
        for(let data of tData as Array<string>[]){
            // console.log('data:', data)
            if(data === null || data === undefined)continue

            if(typeof data.length !== "number")continue
            const rptIds = []
            const ridstr = data[ridIndex]
            if(typeof ridstr === 'string'){
                const ridsM = ridstr.match(/\d+/g)
                if(ridsM !== null)
                    rptIds.push(...ridsM)
            }else if(typeof ridstr === 'number'){
                rptIds.push(ridstr)
            }else{
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
    parseReportList: (reportListSheet: Worksheet)=>{

        // Report - Link Var Id
        const reportListData = reportListSheet.getSheetValues()
        const title = reportListData[1] as string[]
        if(title === null || title === undefined || !title.includes("ReportID List")){
            throw new Error("ReportID List ERROR");
        }
        const ridIndex = (reportListData[2] as string[]).indexOf("Report ID")
        let vidIndex = (reportListData[2] as string[]).indexOf("Link VID")
        // console.log('Report ID list:',  ridIndex, vidIndex)

        const rpt2vidMap:any = {}
        let rData = reportListData.slice(3, reportListData.length)
        for(let data of rData as Array<string>[]){
            // console.log('data:', data)
            if(data === null || data === undefined)continue

            if(typeof data.length !== "number")continue
            const vIds = []
            const vidstr = data[vidIndex]
            if(typeof vidstr === 'string'){
                const ridsM = vidstr.match(/\d+/g)
                if(ridsM !== null)
                    vIds.push(...ridsM)
            }else if(typeof vidstr === 'number'){
                vIds.push(vidstr)
            }else{
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
const parse = async (filePath: string) =>{
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
const testPrepare = (wb: Workbook)=>{
    const eventWorkSheet = wb.getWorksheet('Event List')
    if(!eventWorkSheet)throw new Error("Event List工作表获取失败！");
    const reportWorkSheet = wb.getWorksheet('Report List')
    if(!reportWorkSheet)throw new Error("Report List工作表获取失败！");
    const varWorkSheet = wb.getWorksheet('Variables List')
    if(!varWorkSheet)throw new Error("Variables List工作表获取失败！");
    
    // 删除Event List无用列
    const needs: (string | undefined)[] = ["Event ID", "Description", "Comment", "Link Report ID"]
    for (let i = 0; i < 7; i++) {
        const col = eventWorkSheet.columns[i];
        if(!col.values)continue
        const type = col.values[2]?.toString()
        if(type)
            if(!needs.includes(type)){
                // console.log(i, type)
                eventWorkSheet.spliceColumns(i + 1, 1)
                i--
            }else if (col.width && col.width > 30){
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
        fgColor:{
            argb:'FFD9D9D9'
        },
        bgColor:{
            argb:'FF0000FF'
        },
        pattern: 'solid',
        type: 'pattern'
    }
    eventWorkSheet.getCell('E2').border = {
        top: {style:'thin'},
        left: {style:'thin'},
        bottom: {style:'thin'},
        right: {style:'thin'},
    }
    eventWorkSheet.getCell('F2').value = 'VID详情'
    eventWorkSheet.getCell('F2').font = eventWorkSheet.getCell('E2').font
    eventWorkSheet.getCell('F2').alignment = eventWorkSheet.getCell('E2').alignment
    eventWorkSheet.getCell('F2').fill = eventWorkSheet.getCell('E2').fill
    eventWorkSheet.getCell('F2').border = eventWorkSheet.getCell('E2').border
    eventWorkSheet.views = [
        {state: 'frozen', ySplit: 2, activeCell: 'A1'}
      ];

    const eventRows = eventWorkSheet.getRows(3, eventWorkSheet.rowCount - 2);
    if(!eventRows)throw new Error("Event List 数据行获取失败！");
    const reportRows = reportWorkSheet.getRows(3, reportWorkSheet.rowCount - 2);
    if(!reportRows)throw new Error("Report List 数据行获取失败！");
    const varRows = varWorkSheet.getRows(3, varWorkSheet.rowCount - 2);
    if(!varRows)throw new Error("Variables List 数据行获取失败！");

    // 遍历var List
    const varMap = {} as {
        [key:string]:any
    }
    for(let row of varRows){
        const vidCell = row.getCell(1)
        const descCell = row.getCell(2)
        const typeCell = row.getCell(3)
        const commentCell = row.getCell(8)
        if(!vidCell.value)continue

        const vid = vidCell.value as string
        varMap[vid] = []
        varMap[vid].push({
            'font': {
                'color': {'argb': 'FFFF3300'}
            },
            'text': `vid${vid}`
        })
        varMap[vid].push({
            'font': {
                'color': {'argb': 'FF660000'}
            },
            'text': `, ${descCell.value}`
        })
        varMap[vid].push({
            'font': {
                'color': {'argb': 'FF116600'}
            },
            'text': `, 类型${typeCell.value}`
        })
        if(commentCell.value){
            if((commentCell.value as string).includes('\n'))
            varMap[vid].push({
                'font': {
                    'color': {'argb': 'FF0000FF'}
                },
                'text': `, 取值:\r\n${commentCell.value}\r\n`
            })
            else
            varMap[vid].push({
                'font': {
                    'color': {'argb': 'FF0000FF'}
                },
                'text': `, 取值-${commentCell.value}`
            })
        }
        varMap[vid].push({
            'font': {
                'color': {'argb': 'FF0000FF'}
            },
            'text': `\r\n`
        })
    }
    // 遍历Report List
    const rptMap = {
        
    } as {
        [key:string]:any
    }
    for(let row of reportRows){
        const rptCell = row.getCell(1)
        const vidCell = row.getCell(4)
        if(!rptCell.value)continue

        const rid = rptCell.value as string
        rptMap[rid] = vidCell.value
    }
    // console.log('rptMap', rptMap)

    // 遍历Event List
    for(let eventRow of eventRows){
        const reportIDCell = eventRow.getCell(4)
        if(!reportIDCell.value){
            continue
        }
        
        // console.log('search for:', reportIDCell.value)
        // 从Report List找vid
        let vid = rptMap[reportIDCell.value as string] as string
        if(!vid || vid.length === 0){
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
            top: {style:'thin'},
            left: {style:'thin'},
            bottom: {style:'thin'},
            right: {style:'thin'},
        }
        const vids = vid.match(/(\d+)/g)
        if(!vids){
            console.warn(`vid${vid}解析失败！`);
            continue
        }
        // console.log(vids)

        let comment = []
        for (const vid of vids) {
            comment.push( ...varMap[vid])
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

export {
    parse,
    testPrepare,
}