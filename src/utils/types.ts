export interface CmdData {
    s: string,
    f: string,
    direct: string,
    comment: string,
}
export interface LogData {
    title: string,
    comment: string,
    result: string,
    cmdList: CmdData[],
    log: string

}