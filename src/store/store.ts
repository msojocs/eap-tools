const remote = require('@electron/remote') as typeof import('@electron/remote');

// console.log(remote.app.getPath('userData'))
// remote.shell.showItemInFolder(remote.app.getPath('userData'))
const dataLoc = `${remote.app.getPath('userData')}/eap-log-store`


export {
    dataLoc
}