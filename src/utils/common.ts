
const remote = require('@electron/remote') as typeof import('@electron/remote')

export const getTextValue = (value: any): string=>{
    let result = ''
    if(!value)return result
    
    try{

        switch(typeof value){
            case 'string':
                result += value
                break
            case 'object':
                if(value?.richText){
                    for(let str of value.richText){
                        result += str.text
                    }
                }else if (value?.result){
                    result += value.result
                }else if (value?.text){
                    result += value.text
                }
                // TODO: 单项选择
                break
            case 'number':
                result = `${value}`
                break
            default:
                console.warn('原样返回，unknown type:', typeof value, value)
                return `${value}`
                break;
        }
    }catch(err){
        console.log('value:', value)
        console.error(err)
        return 'error'
    }
    return result
}

/**
 * 全角转半角
 * @param str 
 * @returns 
 */
export const toCDB = (str: string) => {
    var tmp = "";
    for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 65248 && str.charCodeAt(i) < 65375) {
            tmp += String.fromCharCode(str.charCodeAt(i) - 65248);
        }
        else {
            tmp += String.fromCharCode(str.charCodeAt(i));
        }
    }
    return tmp
}

export const getIPs = ()=>{
    const os = require('os');
    const interfaces = os.networkInterfaces();
    let ips = [];
    for (let dev in interfaces) {
        for (let addr of interfaces[dev]) {
            if (!addr.internal && addr.family === 'IPv4') {
                ips.push({
                    name: dev,
                    ip: addr.address,
                });
                break;
            }
        }
    }
    return ips;
}


export const selectFolder = ()=>{
    
    return remote.dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory']
    })
}