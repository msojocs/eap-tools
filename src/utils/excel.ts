import { Workbook, Worksheet } from "exceljs-enhance"

const ExcelHelper = {
    insertWorkSheet: (wb: Workbook, ws: Worksheet, pos: number) => {
        const wsNum = wb.worksheets.length
        if (pos > wsNum) {
            pos = wsNum
        } else if (pos < 0) {
            pos = 0
        }
        for (let i = 0; i < wb.worksheets.length; i++) {
            if (i >= pos) {
                (wb.worksheets[i] as any).orderNo++
            }

        }
        wb.worksheets.push(ws);
        (ws as any).orderNo = pos
    },
}
const changeWorkSheetPosition = (wb: Workbook, from: number, to: number) => {
    let inc = 1;
    const wss = wb.worksheets;
    // console.log(wss);
    // console.log('from:', from, ' to:', to);
    (wss[from] as any).orderNo = to;
    if (from < to)
        inc = -1;
    else {
        from += to;
        to = from - to;
        from = from - to;
    }
    if (to > wss.length) to = wss.length;
    for (let i = from; i < to; i++) {
        (wss[i] as any).orderNo += inc;
    }
}
const copyWorksheet = (source: Worksheet, target: Worksheet)=>{
    for(let j=1; j <= source.actualColumnCount; j++){
        target.getColumn(j).style = source.getColumn(j).style;
        target.getColumn(j).width = source.getColumn(j).width;
        for(let i=1; i <= source.rowCount; i++){
            target.getCell(i, j).model = source.getCell(i, j).model;
            (target.getCell(i, j) as any)._master = (source.getCell(i, j) as any)._master;
        }
    }
}
export {
    ExcelHelper,
    changeWorkSheetPosition,
    copyWorksheet
}