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
export {
    getTextValue
}