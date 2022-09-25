import { FSWatcher } from 'chokidar';
import { CheckResult, LogReplyData, LogSendData, LogTypeData, ReportItemData, SecsData } from './types';
const chokidar = require('chokidar') as typeof import('chokidar');
const fs = require('fs') as typeof import('fs')
const path = require('path') as typeof import('path')

const genEle:{
    [key: string]: Function;
} = {
	L: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		const len = parseInt(ele[1])
		const ret = []
		for(let i=0; i<len; i++){
			const e = data.shift()
            if(e && e[0]){
                let type = e[0]
                ret[i] = genEle[type](data, e)
            }
		}
		return {
			type: 'LIST',
			value: ret
		}
	},
	LIST: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return genEle.L(data, ele)
	},
	A: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'A',
			value: ele[2]
		}
	},
	ASCII: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'A',
			value: ele[2]
		}
	},
	// Bool
	B: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'B',
			value: ele[2]
		}
	},
	// Binary
	BIN: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'BIN',
			value: ele[2]
		}
	},
	I1: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'I1',
			value: parseInt(ele[2])
		}
	},
	I2: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'I2',
			value: parseInt(ele[2])
		}
	},
	I4: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'I4',
			value: parseInt(ele[2])
		}
	},
	I8: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'I8',
			value: parseInt(ele[2])
		}
	},
	U1: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'U1',
			value: parseInt(ele[2])
		}
	},
	UINT1: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return genEle.U1(data, ele)
	},
	U2: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'U2',
			value: parseInt(ele[2])
		}
	},
	UINT2: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return genEle.U2(data, ele)
	},
	U4: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'U4',
			value: parseInt(ele[2])
		}
	},
	UINT4: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'U4',
			value: parseInt(ele[2])
		}
	},
	U8: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'U8',
			value: parseInt(ele[2])
		}
	},
	F4: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'F4',
			value: parseFloat(ele[2])
		}
	},
	F8: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'F8',
			value: parseFloat(ele[2])
		}
	},
	JIS: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'JIS',
			value: ele[2]
		}
	},
	ANY: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'ANY',
			value: ele[2]
		}
	},
}

// 解析日志SF内容
function parseSF(str: string): LogTypeData | null{
	let match
	if(/<([A-Z]+\d?) \[(\d+)][ ]?([^>\n]*)/.test(str))
		match = str.matchAll(/<([A-Z]+\d?) \[(\d+)][ ]?([^>\n]*)/gm)
	else if(/([A-Z]+\d?),[ ]*(\d+),?[ ]?<?([^>\n]*)>?/.test(str))
		match = str.matchAll(/([A-Z]+\d?),[ ]*(\d+),?[ ]?<?([^>\n]*)>?/gm)
    if(!match){
		console.warn('parse failed, original data:', str);
		return null;
	}
	// console.log(str)

	const data = []
	for(let m of match){
		// console.log(m)
		data.push([m[1], m[2], m[3]])
	}
	// console.log(data)
	let root
	let ele = data.shift()
    if(ele)
	root = genEle[ele[0]](data, ele)
	return root
}

// 日志字符串解析为对象
const parseLog = (logStr: string)=>{
        
    let logArr = logStr.split(/(\d{4}-\d{2}-\d{2})/)

    // 移除第一个空格
    logArr.shift();

    let temp: any[] = []
    // console.log(JSON.stringify(logArr, null, 4))

    logArr.forEach((v, i)=>{
        if(i % 2 === 1){
            temp.push(`${logArr[i - 1]}${logArr[i]}`)
        }
    })
    logArr = temp

    // console.log(JSON.stringify(logArr, null, 4))

	const send: LogSendData[] = []
	const reply: LogReplyData[] = []
	const other: any[] = []
	// log结构解析
    for(let log of logArr){
        // S1F17 H2E Wbit(True) DeviceID(1) Systembytes(3)
        const data = log.split(/S(\d+)F(\d+) (H2E|E2H) Wbit\((True|False)\) DeviceID\((\d+)\) Systembytes\((\d+)\)/)
		const actionM = data[0].match(/\[[A-Z]+\](Receive|Send|T\d timeout) (\[S\d+F\d+_(E|H)\])?/)
		
		// f为奇数，send
		// TODO: timeout
		if(data[2]){
			const f = parseInt(data[2])
			if(f % 2 === 1){
				send.push({
					s: data[1],
					f: data[2],
					direct: data[3],
					action: 'Send',
					Wbit: data[4] === 'True',
					deviceId: parseInt(data[5]),
					sbyte: data[6],
					data: parseSF(data[7]),
					reply: null
				})
			}else{
				reply.push({
					s: data[1],
					f: data[2],
					direct: data[3],
					action: 'Receive',
					Wbit: data[4] === 'True',
					deviceId: parseInt(data[5]),
					sbyte: data[6],
					data: parseSF(data[7])
				})
			}
		}else{
			other.push({
				s: data[1],
				f: data[2],
				direct: data[3],
				action: actionM ? actionM[1] : 'Unknown',
				Wbit: data[4] === 'True',
				deviceId: parseInt(data[5]),
				sbyte: data[6],
				data: parseSF(data[7]),
				original: log
			})
		}
		
        // console.log(parse(data[7]))
    }

	if(other.length > 0)
		console.warn('other:', other)

	// reply配对
	for(let s of send){
		if(s.Wbit){
			// 抽取reply, 方向不一致，s一致，sbyte一致
			const r = reply.filter(e=>e.s === s.s && e.direct !== s.direct && e.sbyte === s.sbyte)
			if(r[0]){
				s.reply = r[0];
				continue
			}
			const o = other.filter(e=>e.s === s.s && e.sbyte === s.sbyte)
			if(o[0]){
				s.reply = o[0];
			}
		}
	}

	return send;
}

// 日志监控器
class LogWatcher {
	private watch = false;
	private watcher:FSWatcher|null = null;
	private logLength: any;

	constructor(){

	}

	start(logDir: string, callback: Function){
		if(this.watch)return;
		
		this.logLength = {}
		this.watcher = chokidar.watch(logDir)
		this.watcher.on('add', (filename) => {
			if(!filename.endsWith('.log'))return;
			if(!filename.includes('Trace'))return;
			if(filename.includes('Service'))return;
			console.log('add', filename)
			const logName = path.basename(filename)

			if(!this.logLength[logName]){
				// 新加文件
				const filepath = path.resolve(logDir, filename)
				const logStr = fs.readFileSync(filepath).toString()
				this.logLength[logName] = logStr.length;

				if(this.watch){
					// 监控中，调用回调
					callback(logStr, filename)
				}
				return
			}
		});
		this.watcher.on('change', (filename) => {
			if(!filename.endsWith('.log'))return;
			if(!filename.includes('Trace'))return;
			if(filename.includes('Service'))return;
			console.log('change', filename)
			const logName = path.basename(filename)

			setTimeout(()=>{
				const logStr = fs.readFileSync(filename).toString()
				let ret = ''
				if(logStr.length > (this.logLength[logName] || 0)){
					ret = logStr.substring(this.logLength[logName])
				}else if(logStr.length < this.logLength[logName]){
					ret = logStr
				}

				this.logLength[logName] = logStr.length
				callback(ret, filename)
			}, 100)
		});
		this.watcher.on('ready', ()=>{
			console.log('========ready=================')
			this.watch = true;
		})
	}

	stop(){
		this.watch = false;
		if(this.watcher){
			this.watcher.close();
		}
	}

	get isWatching(){
		return this.watch;
	}
}

export const AnalyzeFunc = {
	getAnalyzeStr611: (secsData: any, eId: string): string=>{
		const {
			eid2rid,
			rid2vid,
			vidData,
		} = secsData

		const eData = eid2rid[eId]
		if(!eData)return 'eId未找到'

		let result = `Event ID: ${eId} ${eData.comment}<br />`
		if(eData.rptIds){
			for(let rId of eData.rptIds){
				const vIds = rid2vid[rId]
				result += `Report ID: ${rId}<br />`
				for(let vId of vIds){
					const data = vidData[vId]
					result += `<span style="color:red;">Variables ID: ${vId} </span> - <span style="color:green;"> ${data.desc} </span> - <span style="color:blue;"> 类型：${data.type} </span> - <span style="color: #b7107c;"> 取值：${data.comment}</span><br />`
				}
			}
		}else{
			result += `<span style="color:red">没有Report ID</span>`
		}
		return result
	}
}
const analyze = (testItem: any, secsData: any): {
	eList: string[],
	analyzeStr: string
}=>{
	let result = {
		eList: [] as string[],
		analyzeStr: ''
	}
	if(testItem.result === 'NA')return result;

	// console.log('item:', testItem)
	const logData = parseLog(testItem.log)
	// console.log('secsData:', secsData)
	const s6f11 = logData.filter(e=>e.s == '6' && e.f == '11')
	if(s6f11.length > 0){
		for(let sf of s6f11){
			const sfData = sf.data
			if(!sfData)continue
			
			// console.log('sf:', sfData)
			const eData = sfData.value;
			const eId = '' + eData[1].value
			if(!result.eList.includes(eId)){
				result.eList.push(eId)
				result.analyzeStr += AnalyzeFunc.getAnalyzeStr611(secsData, eId)
			}
			// console.log('eId:', eId)
			// const rDataList = eData[2].value
			// for(let rDataItem of rDataList){
			// 	console.log('rDataItem:', rDataItem)
			// 	const rData = rDataItem.value
			// 	console.log('rData:', rData)
			// 	const rId = rData[0].value
			// 	console.log('rId:', rId)
			// 	const vValueList = rData[1].value
			// 	console.log('vValueList:', vValueList)
			// }
		}
	}
	return result
}

const CheckFunc: {
	[key: string]: Function
} = {
	/**
	 * S6F11检查
	 * @param needLog 要检查的日志
	 * @param reportData 报告的数据
	 * @param secsData SECS数据
	 * @returns 
	 */
	611: (needLog: LogSendData[], reportData: ReportItemData, secsData: SecsData): CheckResult=>{
		const eventIdList = reportData.eventId
		for(let eventId of eventIdList){
			// 查日志
			const eventLog = needLog.filter(e=>{
				const {data} = e
				const eData = data?.value[1]
				if(eData){
					const eId = eData.value
					if(eId == eventId)return true
				}
				return false
			})
			console.log('eventId:', eventId, ' - log:', eventLog)
			// 无日志，不通过
			if(eventLog.length == 0){
				return {
					ok: false,
					reason: `未找到Event Id${eventId}的相关日志\r\n`
				}
			}
			// 有日志，检查正确性
			else{
				for(let log of eventLog){
					const sf611 = log.data
					const eIdData = sf611?.value[1]
					const {rptIds} = secsData.eid2rid[eIdData.value]
					const rptIdListData = sf611?.value[2]

					console.log('rptIdListData:', rptIdListData)
					if(rptIdListData.value.length !== rptIds.length){
						return {
							ok: false,
							reason: `Report Id数量与SECS定义不一致\r\n`
						}
					}

					for(let i=0; i < rptIdListData.value.length; i++){
						const rptIdItemData = rptIdListData.value[i]
						const rptIdData = rptIdItemData.value[0]
						// console.log(rptIdItemData, rptIds)
						if(rptIdData.value != rptIds[i]){
							
							return {
								ok: false,
								reason: `绑定的Report Id与SECS定义不匹配\r\n`
							}
						}
						const secsVIds = secsData.rid2vid[rptIdData.value]
						const vIdListData = rptIdItemData.value[1]
						const logVids = vIdListData.value
						// console.log(vIdListData, logVids, secsVIds)
						if(logVids.length !== secsVIds.length){
							return {
								ok: false,
								reason: `Variable Id数量与SECS定义不一致\r\n`
							}
						}
						for (let j = 0; j < logVids.length; j++) {
							const logVidData = logVids[j];
							const secsVid = secsData.vidData[secsVIds[j]]
							// console.log(logVids, logVidData, secsVIds, secsVid)
							if(logVidData.type !== secsVid.type){
								
								return {
									ok: false,
									reason: `Variable Id类型与SECS定义不一致\r\n`
								}
							}
						}
						
					}
				}
			}
		}
		return {
			ok: true
		}
	}
}
/**
 * 检查日志是否与测试项目匹配
 * 
 * @param reportData 测试项目数据
 * @param logData 日志数据
 * 
 */
export const checkLog = (reportData: ReportItemData, logData: LogSendData[], secsData: SecsData): CheckResult=>{
	let {cmdList, eventId} = reportData
	cmdList = JSON.parse(JSON.stringify(cmdList))
	eventId = JSON.parse(JSON.stringify(eventId))
	let ok = true
	let reason = ''
	for(let cmd of cmdList){
		if(!cmd.s || !cmd.f)continue;

		// console.log('要检查的指令数据:', cmd)
		const needLog = logData.filter(e=>e.s == cmd.s && e.f == cmd.f)
		if(CheckFunc[`${cmd.s}${cmd.f}`]){
			const ret = CheckFunc[`${cmd.s}${cmd.f}`](needLog, reportData, secsData)
			ok &&= ret.ok
			reason += ret.reason
		}else{
			ok = false
			console.warn('无法找到处理方案:', `S${cmd.s}F${cmd.f}`)
		}
	}
	return {
		ok,
		reason
	}
}

export {
	parseLog,
	analyze,
	LogWatcher,
}