const getTextValue = (value: any)=>{
    let result = ''
    switch(typeof value){
        case 'string':
            result += value
            break
        case 'object':
            for(let str of value.richText){
                result += str.text
            }
            break
        default:
            console.warn('unknown type:', typeof value, value)
            break;
    }
    return result
}

/**
 * 全角转半角
 * @param str 
 * @returns 
 */
const toCDB = (str: string) => {
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

const getIPs = ()=>{
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
export {
    getTextValue,
    toCDB,
    getIPs,
}