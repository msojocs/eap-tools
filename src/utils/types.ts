/************************SECS数据类型**************************/
export interface SecsData {
    eid2rid: SecsEventIdData,
    rid2vid: SecsReportIdData,
    vidData: SecsVarIdData,
}

/**
 * SECS事件ID数据类型
 */
export interface SecsEventIdData {
    [ket: string]: {
        description: string
        comment: string
        rptIds: string[]
    }
}

/**
 * SECS报告ID数据类型
 */
export interface SecsReportIdData {
    [ket: string]: string[]
    
}

/**
 * SECS变量ID数据类型
 */
export interface SecsVarIdData {
    [ket: string]: {
        id: string
        desc: string
        type: string
        comment: string
    }
    
}

/************************测试报告相关数据类型************************* */
/* StreamFunction指令类型*/
export interface CmdData {
    s: string,
    f: string,
    direct: string,
    comment: string,
}

/**测试项数据类型*/
export interface LogData {
    title: string,
    comment: string,
    result: string,
    cmdList: CmdData[],
    log: string,
    analyze: string,
    eventId: string[],
}