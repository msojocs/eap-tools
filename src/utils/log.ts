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

export {
    genProcedureList
}