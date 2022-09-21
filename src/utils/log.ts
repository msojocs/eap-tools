import { FSWatcher } from 'chokidar';
const chokidar = require('chokidar') as typeof import('chokidar');
const fs = require('fs') as typeof import('fs')
const path = require('path') as typeof import('path')

const genEle:{
    [key: string]: Function;
} = {
	L: (data: Array<Array<string>>, ele: Array<string>)=>{
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
	LIST: (data: Array<Array<string>>, ele: Array<string>)=>{
		return genEle.L(data, ele)
	},
	U4: (data: Array<Array<string>>, ele: Array<string>)=>{
		return {
			type: 'U4',
			value:parseInt(ele[2])
		}
	},
	B: (data: Array<Array<string>>, ele: Array<string>)=>{
		return {
			type: 'B',
			value: ele[2]
		}
	},
	BIN: (data: Array<Array<string>>, ele: Array<string>)=>{
		return genEle.B(data, ele)
	},
	A: (data: Array<Array<string>>, ele: Array<string>)=>{
		return {
			type: 'A',
			value: ele[2]
		}
	},
	ASCII: (data: Array<Array<string>>, ele: Array<string>)=>{
		return {
			type: 'A',
			value: ele[2]
		}
	},
	U1: (data: Array<Array<string>>, ele: Array<string>)=>{
		return {
			type: 'U1',
			value: parseInt(ele[2])
		}
	},
	UINT1: (data: Array<Array<string>>, ele: Array<string>)=>{
		return genEle.U1(data, ele)
	},
	U2: (data: Array<Array<string>>, ele: Array<string>)=>{
		return {
			type: 'U2',
			value: parseInt(ele[2])
		}
	},
	UINT2: (data: Array<Array<string>>, ele: Array<string>)=>{
		return genEle.U2(data, ele)
	},
	UINT4: (data: Array<Array<string>>, ele: Array<string>)=>{
		return {
			type: 'U4',
			value: parseInt(ele[2])
		}
	},
}

// 日志解析
function parse(str: string){
	let match
	if(/<([A-Z]+\d?) \[(\d+)][ ]?([^>\n]*)/.test(str))
		match = str.matchAll(/<([A-Z]+\d?) \[(\d+)][ ]?([^>\n]*)/gm)
	else if(/([A-Z]+\d?),[ ]*(\d+),?[ ]?<?([^>\n]*)>?/.test(str))
		match = str.matchAll(/([A-Z]+\d?),[ ]*(\d+),?[ ]?<?([^>\n]*)>?/gm)
    if(!match){
		console.warn('parse failed, original data:', str);
		return;
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
// 日志解析
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

	const send:any[] = []
	const reply:any[] = []
	const other:any[] = []
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
					data: parse(data[7])
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
					data: parse(data[7])
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
				data: parse(data[7]),
				original: log
			})
		}
		
        // console.log(parse(data[7]))
    }

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

// 日志监控
class LogWatcher {
	private watch = false;
	private watcher:FSWatcher|null = null;
	private logLength: any;

	constructor(){

	}

	start(logDir: string, callback: Function){
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

const getAnalyzeStr = (secsData: any, eId: string): string=>{
	let result = `Event ID: ${eId}<br />`
	const {
		eid2rid,
		rid2vid,
		vidData,
	} = secsData

	const rIds = eid2rid[eId]
	if(!rIds)return 'eId未找到'

	// console.log(rIds)
	for(let rId of rIds){
		const vIds = rid2vid[rId]
		result += `Report ID: ${rId}`
		for(let vId of vIds){
			const data = vidData[vId]
			result += `<span style="color:red;">Variables ID: ${vId} </span> - <span style="color:green;"> ${data.desc} </span> - <span style="color:blue;"> 类型：${data.type} </span> - <span style="color: #b7107c;"> 取值：${data.comment}</span><br />`
		}
	}
	return result
}
const analyze = (testItem: any, secsData: any): string=>{
	let result = ''
	if(testItem.result === 'NA')return result;

	// console.log('item:', testItem)
	const logData = parseLog(testItem.log)
	// console.log('secsData:', secsData)
	const s6f11 = logData.filter(e=>e.s == '6' && e.f == '11')
	if(s6f11.length > 0){
		for(let sf of s6f11){
			const sfData = sf.data
			// console.log('sf:', sfData)
			const eData = sfData.value;
			const eId = eData[1].value
			result += getAnalyzeStr(secsData, eId)
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

export {
	parseLog,
	analyze,
	LogWatcher,
}