import { FSWatcher } from 'chokidar';
import { CheckResult, CmdData, LogReplyData, LogSendData, LogTypeData, ReportItemData, SecsData } from './types';
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
			type: 'L',
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
			value: ele[2].match(/\d+/g)
		}
	},
	I2: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'I2',
			value: ele[2].match(/\d+/g)
		}
	},
	I4: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'I4',
			value: ele[2].match(/\d+/g)
		}
	},
	I8: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'I8',
			value: ele[2].match(/\d+/g)
		}
	},
	U1: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'U1',
			value: ele[2].match(/\d+/g)
		}
	},
	UINT1: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return genEle.U1(data, ele)
	},
	U2: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'U2',
			value: ele[2].match(/\d+/g)
		}
	},
	UINT2: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return genEle.U2(data, ele)
	},
	U4: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'U4',
			value: ele[2].match(/\d+/g)
		}
	},
	UINT4: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'U4',
			value: ele[2].match(/\d+/g)
		}
	},
	U8: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'U8',
			value: ele[2].match(/\d+/g)
		}
	},
	F4: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'F4',
			value: ele[2].match(/\d+/g)
		}
	},
	F8: (data: Array<Array<string>>, ele: Array<string>): LogTypeData=>{
		return {
			type: 'F8',
			value: ele[2].match(/\d+/g)
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
	// TODO: 配方管理的日志格式存在差异，还有S9F9
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
		// 1-s 2-f 3-direct 4-wbit 5-deviceId 6-sbyte 7-content
        let data = log.split(/S(\d+)F(\d+) (H2E|E2H) Wbit\((True|False)\) DeviceID\((\d+)\) Systembytes\((\d+)\)/)
		if(log.includes('Header=')){
			console.log('模拟器')
			// 模拟器
			const _d = log.split(/\[[A-Z]+\](RECV|SEND)-S(\d+)F(\d+) Wbit=\[(True|False)\] Systembytes=\[(\d+)\]/)
			console.log(_d)
			data = [log, _d[2], _d[3], _d[1] === 'RECV' ? 'E2H' : 'H2E', /* wbit */_d[4], '0', /*sbyte*/_d[5], log]
		}
		let actionM = data[0].match(/\[[A-Z]+\](Receive|Send) (\[S\d+F\d+_(E|H)\])/)
		if(!actionM){
			// EAP收到超时
			actionM = data[0].match(/\[[A-Z]+\](T\d timeout) (\[S\d+F\d+_(E|H)\])?/)
		}
		if(!actionM){
			// 模拟器收到的信息
			actionM = data[0].match(/\[[A-Z]+\](RECV|SEND)-(S\d+F\d+)/)
		}
		
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
				// TODO: 可能没找到
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

const analyze = (reportItem: ReportItemData, secsData: SecsData): {
	eventIdList: string[],
	analyzeStr: string,
	rcmdList: string[],
}=>{
	let result = {
		eventIdList: [] as string[],
		rcmdList: [] as string[],
		analyzeStr: '',
	}
	if(reportItem.result === 'NA')return result;

	const logData = parseLog(reportItem.log)
	// console.log('item:', testItem)
	if(reportItem.cmdList.find(e=>e.s == '6' && e.f == '11')){
		// 611解析
		const s6f11 = logData.filter(e=>e.s == '6' && e.f == '11')
		if(s6f11.length > 0){
			for(let sf of s6f11){
				const sfData = sf.data
				if(!sfData)continue
				
				// console.log('sf:', sfData)
				const eData = sfData.value;
				const eId = '' + eData[1].value
				if(!result.eventIdList.includes(eId)){
					result.eventIdList.push(eId)
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
	}
	if(reportItem.cmdList.find(e=>e.s == '2' && e.f == '41')){

		const s2f41 = logData.filter(e=>e.s == '2' && e.f == '41')
		if(s2f41.length > 0){
			for(let sf of s2f41){
				const sfData = sf.data
				if(!sfData)continue
				
				const rcmdData = sfData.value;
				const rcmdId = rcmdData[0].value
				if(!result.rcmdList.includes(rcmdId)){
					result.rcmdList.push(rcmdId)
				}
			}
		}
	}
	return result
}

const CheckFunc: {
	[key: string]: Function
} = {
	/**
	 * S1F3 检查 单向 H2E
	 * 
	 * 
	 * @param targetLog 要检查的日志
	 * @param reportData 报告的数据
	 * @param secsData SECS数据
	 * @returns 
	 */
	13: (targetLog: LogSendData[], secsData: SecsData, reportData: ReportItemData, cmd: CmdData): CheckResult=>{
		// 区分是搜集指定的还是全部的
		let reason = ''
		for(let log of targetLog){
			const len = log.data?.value.length
			const replyLen = log.reply?.data?.value.length
			const secsTraceLen = Object.keys(secsData.traceData).length
			const secsVarLen = Object.keys(secsData.vidData).length
			if(len > 0){
				// 特定SVID，检查响应数量
				reason += 'S1F3: 检查模式 - 指定SVID\r\n'
				reason += 'S1F3: 指定SVID响应数量与请求的是否一致：'
				if(replyLen != len){
					reason += 'failed\r\n'
					return {
						ok: false,
						reason
					}
				}
				reason += 'success\r\n'

			}else{
				// 搜索SVID，检查数量
				reason += 'S1F3: 检查模式 - 所有SVID\r\n'
				reason += 'S1F3: 检查所有SVID响应数量与SECS定义数量是否一致: '
				if(!(replyLen == secsTraceLen || replyLen == secsVarLen || replyLen == (secsTraceLen + secsVarLen))){
					reason += 'failed\r\n'
					return {
						ok: false,
						reason
					}

				}
				reason += 'success\r\n'

			}
		}
		return {
			ok: true,
			reason
		}
	},

	/**
	 * S1F13检查 双向
	 * 
	 * TODO: 验证匹配方向
	 * 
	 * @param targetLog 要检查的日志
	 * @param reportData 报告的数据
	 * @param secsData SECS数据
	 * @returns 
	 */
	113: (targetLog: LogSendData[], secsData: SecsData, reportData: ReportItemData, cmd: CmdData): CheckResult=>{
		const {cmdList} = reportData
		const log113 = targetLog.filter(e=>e.direct == cmd.direct)
		console.log('log113:', log113)
		let reason = ''
		reason += '寻到S1F13的相关日志:'
		if(log113.length == 0){
			reason += 'failed\r\n'
			return {
				ok: false,
				reason
			}
		}
		reason += 'success\r\n'

		const reply = log113[0].reply
		reason += '设备对S1F13做出响应:'
		if(!reply){
			reason += 'failed\r\n'
			return {
				ok: false,
				reason
			}
		}
		reason += 'success\r\n'

		const replyData = reply.data
		console.log('log113 data:', replyData)
		reason += '设备的S1F14的响应有数据:'
		if(!replyData){
			reason += 'failed\r\n'
			return {
				ok: false,
				reason
			}
		}
		reason += 'success\r\n'
		const commack = replyData.value[0].value

		reason += '设备的S1F14响应COMMACK值为0: '
		if(commack != '0'){
			reason += 'failed\r\n'
			return {
				ok: false,
				reason
			}

		}
		reason += 'success\r\n'

		return {
			ok: true,
			reason,
		}
	},

	/**
	 * S1F15检查 单向 H2E
	 * EAP控制设备切换offline
	 * 
	 * @param targetLog 要检查的日志
	 * @param reportData 报告的数据
	 * @param secsData SECS数据
	 * @returns 
	 */
	115: (targetLog: LogSendData[], secsData: SecsData, reportData: ReportItemData, cmd: CmdData): CheckResult=>{
		/*
		0 = OK, Accepted.
		1 = NG, Already Off-Line, Not Accepted.
		2~63 = Error, Not Accepted
		*/
		let reason = ''
		reason += '检查有log:'
		if(targetLog.length === 0){
			reason += 'failed\r\n'
			return {
				ok: false,
				reason
			}
		}
		reason += 'success\r\n';

		for(let log of targetLog){
			reason += `[sbyte ${log.sbyte}] 有响应: `
			if(log.reply){
				reason += 'success\r\n'
				const {data} = log.reply
				if(data){
					reason += '检测响应0或1:'
					if(data.value == '0' || data.value == '1'){
						reason += 'success\r\n'
						return {
							ok: true,
							reason,
						}
					}
					reason += 'failed\r\n'
				}
			}else{
				reason += 'failed\r\n'
			}
		}
		return {
			ok: false,
			reason: 'S1F15 设备没有一个是回复0或1的'
		}
	},

	/**
	 * S1F17 online检查 单向 H2E
	 * 
	 * @param targetLog 要检查的日志
	 * @param reportData 报告的数据
	 * @param secsData SECS数据
	 * @returns 
	 */
	117: (targetLog: LogSendData[], secsData: SecsData, reportData: ReportItemData): CheckResult=>{
		/**
		 * 0 = OK, Accepted.
			1 = NG, Not Permit.
			2 = NG, Already On-Line, Not Accepted.
			3~63 = Error, Not Accepted.
			*/
		let reason = '存在一个回复0或2的:'
		for(let log of targetLog){
			if(log.reply){
				const {data} = log.reply
				if(data){
					if(data.value == '0' || data.value == '2'){
						reason += 'success\r\n'
						return {
							ok: true,
						}
					}
				}
			}
		}
		reason += 'failed\r\n'
		return {
			ok: false,
			reason
		}
	},
  
	/**
	 * S2F17 时间同步 - 获取设备/EAP的时间 双向 H2E
	 * 
	 * @param targetLog 要检查的日志
	 * @param secsData SECS数据
	 * @param reportData 报告的数据
	 * @param cmd 当前指令数据
	 * @returns 
	 */
	217: (targetLog: LogSendData[], secsData: SecsData, reportData: ReportItemData, cmd: CmdData): CheckResult=>{
		const timeLog = targetLog.filter(e=>e.direct == cmd.direct)
		let reason = `寻找 S2F17 ${cmd.direct}的日志:`
		if(timeLog.length === 0){
			reason += 'failed\r\n'
			return {
				ok: false,
				reason
			}
		}
		reason += 'success\r\n'

		// 向EAP询问直接OK
		if(cmd.direct === 'E2H'){
			reason += '设备向EAP询问，直接OK\r\n'
			return {
				ok: true,
			}
		}
		reason += 'EAP向设备询问，检测响应：\r\n'

		for(let log of timeLog){
			if(log.reply){
				const {data} = log.reply;
				const timeM = (data?.value as string).match(/\d+/)
				reason += '时间长度大于5: '
				if(timeM && timeM[0].length > 5){
					reason += 'success\r\n'
					return {
						ok: true,
						reason
					}
				}
				reason += 'failed\r\n'
			}
		}
		return {
			ok: false,
			reason
		}
	},
	  
	/**
	 * S2F23 Trace Data 检查
	 * S6F1 也在这里检查
	 * 
	 * @param targetLog 要检查的日志
	 * @param secsData SECS数据
	 * @param reportData 报告的数据
	 * @param cmd 当前指令数据
	 * @returns 
	 */
	223: (targetLog: LogSendData[], secsData: SecsData, reportData: ReportItemData, cmd: CmdData, logData: LogSendData[]): CheckResult=>{
		
		// 有一组ok即可

		// 非启动TD，返回
		if(!cmd.comment.includes('TOTSMP > 0'))
		return {ok: true};

		// 过滤出启动Trace Data的log
		const startTD = targetLog.filter(e=>parseInt(e.data?.value[2].value[0]) != 0)
		const stopTD = targetLog.filter(e=>parseInt(e.data?.value[2].value[0]) == 0)
		// console.log('startTD:', startTD)
		let reason = ''

		for(let start of startTD){
			const {data} = start
			const replyData = start.reply?.data
			if(!replyData){
				// 响应为空
				reason += '启动S2F23 响应为空'
				continue
			}
			if(replyData.value != '0'){
				// 响应非0
				reason += '启动S2F23 响应非0'
				continue
			}

			// 取TRID
			const trid = data?.value[0].value[0]
			// console.log('trid:', trid)
			// 取DSPER
			const dsper = data?.value[1].value
			// console.log('dsper:', dsper)
			// 取REPGSZ
			const groupSize = data?.value[3].value[0]
			// console.log('groupSize:', groupSize)
			// 取SVID列表
			const svidList = data?.value[4].value
			// console.log('svidList:', svidList)

			// 过滤出匹配的S6F1
			const sf61LogList = logData.filter(e=>e.s == '6' && e.f == '1' && e.data?.value[0].value == trid)
			if(sf61LogList.length === 0){
				// console.warn('S6F1 缺少日志')
				reason += 'S6F1 缺少日志'
				continue
			}
			let reason_t = ''
			for(let sf61 of sf61LogList){
				// TODO: 检查时间间隔是否正确
				// 检测数量
				if(sf61.data?.value[3].value.length != svidList.length){
					// console.warn('数量不一致')
					reason_t += 'S6F1 上报的数量不一致'
					break;
				}
			}
			if(reason_t.length > 0){
				reason += reason_t;
				continue
			}

			// 检测stop
			const sf61stopList = stopTD.filter(e=>e.data?.value[0].value == trid)
			if(sf61stopList.length == 0){
				reason += '缺少 S2F23 停止指令'
				continue;
			}
			const stopCmd = sf61stopList[0]
			if(!stopCmd.reply){
				reason += '停止S2F24 缺少数据'
				continue;
			}
			if(stopCmd.reply?.data?.value != '0'){
				reason += '停止S2F24 响应非0'
				continue;
			}

			// 有一组通过
			return {
				ok: true
			}
		}
		return {
			ok: false,
			reason
		}
	},
  
	/**
	 * S2F31 时间同步 - 设置设备的时间 单向 H2E
	 * 
	 * @param targetLog 要检查的日志
	 * @param secsData SECS数据
	 * @param reportData 报告的数据
	 * @param cmd 当前指令数据
	 * @returns 
	 */
	231: (targetLog: LogSendData[], secsData: SecsData, reportData: ReportItemData, cmd: CmdData): CheckResult=>{
		for(let log of targetLog){
			if(log.reply){
				const {data} = log.reply;
				if(data?.value == '0'){
					return {
						ok: true,
					}
				}
			}
		}
		return {
			ok: false,
			reason: 'S2F31 没有找到一个是回复0的'
		}
	},

	/**
	 * S2F33 Define/Delete Report检查 单向 H2E
	 * 
	 * @param targetLog 要检查的日志
	 * @param secsData SECS数据
	 * @param reportData 报告的数据
	 * @param cmd 当前指令数据
	 * @returns 
	 */
	233: (targetLog: LogSendData[], secsData: SecsData, reportData: ReportItemData, cmd: CmdData): CheckResult=>{
		// 要区别检查两个模式，Enable/Disable
		let mode = ''
		if(cmd.comment.toLowerCase().includes('delete')){
			mode = 'delete'
		}else if(cmd.comment.toLowerCase().includes('define')){
			mode = 'define'
		}else{
			return {
				ok: false,
				reason: 'S2F33无法识别指令是Define还是Delete'
			}
		}

		// 过滤指定模式的日志
		const checkLog = targetLog.filter(e=>{
			const {data} = e
			console.log(e.data)
			if(data){
				let dataLen = data.value[1].value.length
				return mode === 'delete' ? dataLen === 0 : dataLen !== 0
			}
			return false
		})

		// 没有指定模式的日志
		if(checkLog.length === 0){
			
			return {
				ok: false,
				reason: `S2F33缺少${mode}模式的日志`
			}
		}

		for(let log of checkLog){
			if(log.reply){
				const {data} = log.reply
				if(data){
					// 有一个通过即可
					if(data.value == '0'){
						return {
							ok: true,
						}
					}
				}
			}
		}
		return {
			ok: false,
			reason: `S2F33 ${mode}没有一个是回复0的`
		}
	},

	/**
	 * S2F35 Define/Delete Report Link检查 单向 H2E
	 * 
	 * @param targetLog 要检查的日志
	 * @param secsData SECS数据
	 * @param reportData 报告的数据
	 * @param cmd 当前指令数据
	 * @returns 
	 */
	235: (targetLog: LogSendData[], secsData: SecsData, reportData: ReportItemData, cmd: CmdData): CheckResult=>{
		// 要区别检查两个模式，Enable/Disable
		let mode = ''
		if(cmd.comment.toLowerCase().includes('delete')){
			mode = 'delete'
		}else if(cmd.comment.toLowerCase().includes('define')){
			mode = 'define'
		}else{
			return {
				ok: false,
				reason: 'S2F35无法识别指令是Define还是Delete'
			}
		}

		// 过滤指定模式的日志
		const checkLog = targetLog.filter(e=>{
			const {data} = e
			console.log(e.data)
			if(data){
				let dataLen = data.value[1].value.length
				return mode === 'delete' ? dataLen === 0 : dataLen !== 0
			}
			return false
		})

		// 没有指定模式的日志
		if(checkLog.length === 0){
			
			return {
				ok: false,
				reason: `S2F35缺少${mode}模式的日志`
			}
		}

		for(let log of checkLog){
			if(log.reply){
				const {data} = log.reply
				if(data){
					// 有一个通过即可
					if(data.value == '0'){
						return {
							ok: true,
						}
					}
				}
			}
		}
		return {
			ok: false,
			reason: `S2F35 ${mode}没有一个是回复0的`
		}
	},

	/**
	 * S2F37 Enable/Disable Event检查 单向 H2E
	 * 
	 * @param targetLog 要检查的日志
	 * @param secsData SECS数据
	 * @param reportData 报告的数据
	 * @param cmd 当前指令数据
	 * @returns 
	 */
	237: (targetLog: LogSendData[], secsData: SecsData, reportData: ReportItemData, cmd: CmdData): CheckResult=>{
		// 要区别检查两个模式，Enable/Disable
		let mode = ''
		if(cmd.comment.toLowerCase().includes('disable')){
			mode = 'disable'
		}else if(cmd.comment.toLowerCase().includes('enable')){
			mode = 'enable'
		}else{
			return {
				ok: false,
				reason: 'S2F37无法识别指令是Enable还是Disable'
			}
		}

		// 过滤指定模式的日志
		const checkLog = targetLog.filter(e=>{
			const {data} = e
			// console.log(e.data)
			if(data){
				let dataLen = data.value[1].value.length
				return mode === 'disable' ? dataLen === 0 : dataLen !== 0
			}
			return false
		})

		// 没有指定模式的日志
		if(checkLog.length === 0){
			
			return {
				ok: false,
				reason: `S2F37缺少${mode}模式的日志`
			}
		}

		for(let log of checkLog){
			if(log.reply){
				const {data} = log.reply
				if(data){
					// 有一个通过即可
					if(data.value == '0'){
						return {
							ok: true,
						}
					}
				}
			}
		}
		return {
			ok: false,
			reason: `S2F37 ${mode}没有一个是回复0的`
		}
	},

	/**
	 * S2F41 EAP下发远程指令 单向 H2E
	 * 
	 * TODO:
	 * 
	 * @param targetLog 要检查的日志
	 * @param secsData SECS数据
	 * @param reportData 报告的数据
	 * @param cmd 当前指令数据
	 * @returns 
	 */
	241: (targetLog: LogSendData[], secsData: SecsData, reportData: ReportItemData, cmd: CmdData): CheckResult=>{
		const {rcmdList} = reportData
		if(rcmdList?.length == 0){
			return {
				ok: false,
				reason: '未指定 S2F41 的指令'
			}
		}
		let reason = ''
		for(let rcmd of rcmdList){
			const rcmdLog = targetLog.filter(e=>e.data?.value[0].value == rcmd)
			if(rcmdLog.length === 0){
				reason += `S2F41 没有找到匹配${rcmd}的日志`
				continue;
			}
			const okLog = rcmdLog.filter(e=>e.reply?.data?.value[0].value == '0')
			if(okLog.length === 0){
				reason += 'S2F41 回复非0'
				continue;
			}
			return {
				ok: true
			}
		}
		return {
			ok: false,
			reason
		}
	},
	
	/**
	 * S5F1 设备发出报警信息 单向 E2H
	 * 
	 * @param targetLog 要检查的日志
	 * @param secsData SECS数据
	 * @param reportData 报告的数据
	 * @param cmd 当前指令数据
	 * @returns 
	 */
	51: (targetLog: LogSendData[], secsData: SecsData, reportData: ReportItemData, cmd: CmdData): CheckResult=>{
		let mode = ''
		if(reportData.title.includes('发生')){
			mode = 'alarm'
		}else if(reportData.title.includes('解除')){
			mode = 'release'
		}else{
			return {
				ok: false,
				reason: 'S5F1 无法识别是解除警报还是发生警报'
			}
		}

		const alarmLog = targetLog.filter(e=>{
			const {data} = e
			const alcdData = data?.value[0]
			const alcd = parseInt(alcdData.value)
			
			return mode == 'alarm' ? alcd >= 128 : alcd < 128
		})
		if(alarmLog.length === 0){
			
			return {
				ok: false,
				reason: `S5F1 没有找到报警的${mode == 'alarm' ? '发生' : '解除'}日志`
			}
		}

		for(let log of alarmLog){
			const {data} = log
			const alidData = data?.value[1]
			const textData = data?.value[2]
			const alid = parseInt(alidData.value)
			const text = textData.value
			const alarm = secsData.alarmData[alid]
			// console.log(log, alarm, text)
			if(alarm.english != text){
				return {
					ok: false,
					reason: 'S5F1 警报文本与SECS资料不符'
				}
			}
			
		}
		return {
			ok: true,
		}
	},

	/**
	 * S5F3 启用或关闭所有报警检查 单向 H2E
	 * 
	 * @param targetLog 要检查的日志
	 * @param secsData SECS数据
	 * @param reportData 报告的数据
	 * @param cmd 当前指令数据
	 * @returns 
	 */
	53: (targetLog: LogSendData[], secsData: SecsData, reportData: ReportItemData, cmd: CmdData): CheckResult=>{
		for(let log of targetLog){
			if(log.reply){
				const {data} = log.reply
				if(data?.value == '0'){
					
					return {
						ok: true
					}
				}
			}
		}
		return {
			ok: false,
			reason: `S5F3 没有一个是回复0的`
		}
	},

	/**
	 * S5F5 设备警报收集-查詢 单向 H2E
	 * 
	 * 
	 * @param targetLog 要检查的日志
	 * @param secsData SECS数据
	 * @param reportData 报告的数据
	 * @param cmd 当前指令数据
	 * @returns 
	 */
	55: (targetLog: LogSendData[], secsData: SecsData, reportData: ReportItemData, cmd: CmdData): CheckResult=>{
		// 是否有查询所有 [有没有, 是否有ok的]
		let queryAll = {
			has: false,
			hasOk: false,
			reason: ''
		};
		// 是否有查询指定
		let querySpecify = {
			has: false,
			hasOk: false,
			reason: ''
		};

		for(let log of targetLog){
			const {data} = log
			const replyData = log?.reply?.data
			if(!replyData){
				continue
			}
			let mode = ''
			const checkIds = []
			console.log(data, replyData)
			if(data?.value?.length > 0){
				querySpecify.has = true
				mode = 'specify'
				// 查询指定Alarm ID
				// 1. 比对，响应数量是否与请求的一致
				if(data?.value.length !== replyData.value.length){
					querySpecify.reason += 'S5F5 查询指定ID 响应数量与查询的数量不一致\r\n'
					continue
				}
				checkIds.push(...data?.value)

				// 2. 比对，是否响应指定ID的数据


			}else{
				queryAll.has = true
				mode = 'all'
				// 查询所有Alarm ID
				// 1. 比对，响应数量是否与SECS定义一致
				if(Object.keys(secsData.alarmData).length !== replyData.value.length){
					
					queryAll.reason += 'S5F5 查询所有 响应数量与SECS定义的不一致\r\n'
					continue
				}
				
				checkIds.push(...Object.keys(secsData.alarmData))

			}

			// 2. 比对，ID的文本是否与SECS定义一致
			let matchOk = true
			for(let id of checkIds){
				const replyIdData = replyData.value.filter((e: { value: { value: any; }[]; })=>e.value[1].value == id)
				console.log('检测id:', id, replyIdData)
				if(replyIdData.length == 0){
					matchOk = false
					querySpecify.reason += `S5F5 缺少ID ${id} 的响应数据\r\n`
					continue
				}

				const secsIdData = secsData.alarmData[id]
				console.log(secsIdData, replyIdData)
				if(secsIdData.english != replyIdData[0].value[2].value){
					
					matchOk = false
					querySpecify.reason += `S5F5 ${id} 的响应文本与SECS定义不一致\r\n`
					continue
				}
			}
			if(!matchOk){
				continue
			}
			if(mode == 'specify'){
				querySpecify.hasOk ||= true
			}else if(mode == 'all'){
				queryAll.hasOk ||= true
			}
		}

		let result = {
			ok: true,
			reason: ''
		}
		console.log(queryAll, querySpecify)
		if(queryAll.has){
			result.ok = queryAll.hasOk
			if(!queryAll.hasOk){
				result.reason = queryAll.reason
			}
		}
		if(querySpecify.has){
			if(result.ok)
				result.ok = querySpecify.hasOk
			if(!querySpecify.hasOk){
				result.reason += querySpecify.reason
			}
		}
		return result
	},

	/**
	 * S6F1 检查
	 * Trace Data上报数据，由S2F23检查，此处直接返回OK
	 * 
	 * @param needLog 要检查的日志
	 * @param reportData 报告的数据
	 * @param secsData SECS数据
	 * @returns 
	 */
	61: (needLog: LogSendData[], secsData: SecsData, reportData: ReportItemData): CheckResult=>{
		return {
			ok: true
		}
	},

	/**
	 * S6F11检查
	 * @param needLog 要检查的日志
	 * @param reportData 报告的数据
	 * @param secsData SECS数据
	 * @returns 
	 */
	611: (needLog: LogSendData[], secsData: SecsData, reportData: ReportItemData): CheckResult=>{
		const eventIdList = reportData.eventIdList
		let reason = '检查是否绑定Event ID: '
		if(!eventIdList){
			reason += 'failed\r\n'
			return {
				ok: false,
				reason,
			}
		}
		reason += 'success\r\n'

		for(let eventId of eventIdList){
			// 查日志
			reason += `[Event ID ${eventId}] 查找日志: `
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
				reason += 'failed\r\n'
				return {
					ok: false,
					reason
				}
			}
			// 有日志，检查正确性
			else{
				reason += 'success\r\n'
				for(let log of eventLog){
					const sf611 = log.data
					const eIdData = sf611?.value[1]
					const {rptIds} = secsData.eid2rid[eIdData.value[0]]
					const rptIdListData = sf611?.value[2]

					// console.log('rptIdListData:', rptIdListData)
					reason += `[Event ID ${eventId}] 检查Report Id数量与SECS定义是否一致: `
					if(rptIdListData.value.length !== rptIds.length){
						reason += 'failed\r\n'
						return {
							ok: false,
							reason
						}
					}
					reason += 'success\r\n'

					for(let i=0; i < rptIdListData.value.length; i++){
						const rptIdItemData = rptIdListData.value[i]
						const rptIdData = rptIdItemData.value[0]
						// console.log(rptIdItemData, rptIds)
						reason += `[Event ID ${eventId}] 检查绑定的Report Id [${rptIdData.value}] 与SECS定义是否匹配: `
						if(rptIdData.value != rptIds[i]){
							reason += 'failed\r\n'
							return {
								ok: false,
								reason
							}
						}
						reason += 'success\r\n'

						const secsVIds = secsData.rid2vid[rptIdData.value]
						const vIdListData = rptIdItemData.value[1]
						const logVids = vIdListData.value
						// console.log(vIdListData, logVids, secsVIds)

						reason += `[Event ID ${eventId}] [Report ID ${rptIdData.value}] 检查Variable Id数量与SECS定义是否一致: `
						if(logVids.length !== secsVIds.length){
							reason += 'failed\r\n'
							return {
								ok: false,
								reason
							}
						}
						reason += 'success\r\n'

						for (let j = 0; j < logVids.length; j++) {
							const logVidData = logVids[j];
							const secsVid = secsData.vidData[secsVIds[j]]
							// console.log(logVids, logVidData, secsVIds, secsVid)
							reason += `[Event ID ${eventId}] [Report ID ${rptIdData.value}] 检查Variable Id类型与SECS定义是否一致: `
							if(logVidData.type !== secsVid.type){
								reason += 'failed\r\n'
								return {
									ok: false,
									reason: `Variable Id类型与SECS定义不一致 ${logVidData.type} - ${secsVid.type}`
								}
							}
							// TODO: 检测内容是否空或者NA
							reason += 'success\r\n'
						}
						
					}
				}
			}
		}
		return {
			ok: true,
			reason
		}
	},

	/**
	 * S7F25 检查
	 * @param needLog 要检查的日志
	 * @param reportData 报告的数据
	 * @param secsData SECS数据
	 * @returns 
	 */
	725: (needLog: LogSendData[], secsData: SecsData, reportData: ReportItemData): CheckResult=>{
		let reason = ''
		for(let log of needLog){
			const ppid = log.data?.value
			console.log('ppid:', ppid)
			const replyData = log.reply?.data
			if(!replyData){
				reason += 'S7F25 响应为空'
				continue
			}
			// 1. 检查响应的PPID是否与请求的一致
			const replyPPID = replyData.value[0].value
			console.log('replyPPID:', replyPPID)
			if(ppid != replyPPID){
				reason += 'S7F25 响应的PPID与请求的不一致'
				continue
			}
			// 2. 检查配方参数的数量是否与SECS一致
			const replyParmList = replyData.value[3].value[0].value[1].value
			console.log('replyParmList:', replyParmList)
			const secsParmData = secsData.recipeData
			const secsParmLen = Object.keys(secsParmData).length
			if(secsParmLen !== replyParmList.length){
				
				reason += 'S7F25 响应的配方参数数量与SECS定义的不一致'
				continue
			}
			return {
				ok: true,
				reason
			}

		}
		return {
			ok: false,
			reason
		}
	},

	/**
	 * S7F25 检查
	 * @param targetLog 要检查的日志
	 * @param reportData 报告的数据
	 * @param secsData SECS数据
	 * @returns 
	 */
	99: (targetLog: LogSendData[], secsData: SecsData, reportData: ReportItemData): CheckResult=>{
		let reason = 'S9F9识别: '
		if(targetLog.length == 0){
			reason += 'failed\r\n'
			return {
				ok: false,
				reason
			}
		}
		reason += 'success\r\n'
		return {
			ok: true,
			reason
		}
	},

	/**
	 * S7F25 配方检查
	 * @param needLog 要检查的日志
	 * @param reportData 报告的数据
	 * @param secsData SECS数据
	 * @returns 
	 */
	103: (needLog: LogSendData[], secsData: SecsData, reportData: ReportItemData): CheckResult=>{
		let reason = ''
		for(let log of needLog){
			const ppid = log.data?.value
			console.log('ppid:', ppid)
			const replyData = log.reply?.data
			if(!replyData){
				reason += 'S10F3 响应为空'
				continue
			}
			if(replyData.value != '0'){
				reason += 'S10F3 响应非0'
				continue
			}
			return {
				ok: true,
				reason
			}

		}
		return {
			ok: false,
			reason
		}
	},
}

/**
 * 检查日志是否与测试项目匹配
 * 
 * @param reportData 测试项目数据
 * @param logData 日志数据
 * @param secsData SECS数据
 * 
 */
export const checkLog = (reportData: ReportItemData, logData: LogSendData[], secsData: SecsData): CheckResult=>{
	let {cmdList, eventIdList: eventId} = reportData
	cmdList = JSON.parse(JSON.stringify(cmdList))
	eventId = JSON.parse(JSON.stringify(eventId))
	let ok = true
	let reason = ''
	for(let cmd of cmdList){
		if(!cmd.s || !cmd.f)continue;
		// 奇数指令才进行处理
		if(parseInt(cmd.f) % 2 === 0)continue;
		
		reason += `检查S${cmd.s}F${cmd.f}:\r\n`

		// console.log('要检查的指令数据:', cmd)
		const targetLog = logData.filter(e=>e.s == cmd.s && e.f == cmd.f)
		if(targetLog.length === 0){
			ok = false
			reason += `缺少日志: S${cmd.s}F${cmd.f}\r\n`
		}else if(CheckFunc[`${cmd.s}${cmd.f}`]){
			const ret = CheckFunc[`${cmd.s}${cmd.f}`](targetLog, secsData, reportData, cmd, logData)
			ok &&= ret.ok
			if(ret.reason)
				reason += `${ret.reason}\r\n`
			// console.log('检测结果：', ret.ok, reason, ok)
		}else{
			ok = false
			reason += `无法找到处理方案:S${cmd.s}F${cmd.f}`
			console.warn('无法找到处理方案:', `S${cmd.s}F${cmd.f}`)
		}
		// debugger
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