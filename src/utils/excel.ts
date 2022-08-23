import { Workbook, Worksheet } from "exceljs"

const ExcelHelper = {
    insertWorkSheet: (wb: Workbook, ws: Worksheet, pos: number)=>{
        const wsNum = wb.worksheets.length
        if(pos > wsNum){
            pos = wsNum
        }else if(pos < 0){
            pos = 0
        }
        for (let i = 0; i < wb.worksheets.length; i++) {
            if(i >= pos){
                (wb.worksheets[i] as any).orderNo++
            }
            
        }
        wb.worksheets.push(ws);
        (ws as any).orderNo = pos
    },
}
export {
    ExcelHelper
}