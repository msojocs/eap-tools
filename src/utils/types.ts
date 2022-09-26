/************************SECS数据类型**************************/
export interface SecsData {
    eid2rid: SecsEventIdData,
    rid2vid: SecsReportIdData,
    vidData: SecsVarIdData,
    rcmd2cpid: RCMDData,
    rcpData: RCPData,
    alarmData: AlarmData,
    traceData: TraceData,
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

/**
 * 远程指令
 */
export interface RCMDData{

    [ket: string]: {
        command: string
        rcmd: string
        description: string
        cpIds: string[]
    }
}

/**
 * 远程指令参数
 */
export interface RCPData{

    [ket: string]: {
        id: string
        name: string
        description: string
        type: string
    }
}

/**
 * 警报数据
 */
export interface AlarmData{

    [ket: string]: {
        id: string
        type: string
        chinese: string
        english: string
    }
}

/**
 * 警报数据
 */
export interface TraceData{

    [ket: string]: {
        id: string
        type: string
        comment: string
        desc: string
    }
}

/************************测试报告相关数据类型************************* */
/* StreamFunction指令类型*/
export interface CmdData {
    s: string,
    f: string,
    direct: 'H2E' | 'E2H' | 'NONE',
    comment: string,
}

/**测试项数据类型*/
export interface ReportItemData {
    title: string,
    comment: string,
    result: string,
    cmdList: CmdData[],
    log: string,
    analyze: string,
    eventIdList?: string[],
    rcmdList: string[],
    reason: string
}


/************************日志相关数据类型************************* */
export interface LogTypeData {
    type: string
    value: any
}

/**
 * 发送的数据类型
 */
export interface LogSendData {
    s: string
    f: string
    direct: string
    action: 'Send'
    deviceId: number
    sbyte: string
    Wbit: boolean
    reply: LogReplyData | null
    data: LogTypeData | null
}

/**
 * 接收的数据类型
 */
export interface LogReplyData {
    s: string
    f: string
    direct: string
    action: 'Receive'
    deviceId: number
    sbyte: string
    Wbit: boolean
    data: LogTypeData | null
}

export interface CheckResult {
    ok: boolean,
    reason?: string
}