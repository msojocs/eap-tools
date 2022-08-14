import { Worksheet } from 'exceljs';

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

export default {
    parse
}