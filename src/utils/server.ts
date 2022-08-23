const express = require('express') as typeof import('express');
import { Express } from 'express-serve-static-core';
import { AddressInfo, Socket } from 'net';
import { Server } from 'http';
var fs = require("fs") as typeof import('fs'); //引入fs，fs 是node中一个文件操作模块，包括文件创建，删除，查询，读取，写入。

var bodyParser = require('body-parser'); // 这个模块是获取post请求传过来的数据。
var multer = require('multer'); //multer - node.js 中间件，用于处理 enctype="multipart/form-data"（设置表单的MIME编码）的表单数据。

const FileServer = class {
    private app: Express;
    private server: Server | undefined;
    private sockets = [] as Socket[];
    private _shareDir: string;
    private _uploadDir: string;
    private _port: number;
    constructor(sharePath: string, uploadPath: string, port: number) {
        this._shareDir = sharePath
        this._uploadDir = uploadPath
        this._port = port

        const app_t = express()

        // package extract: resources/app/dist/file-server
        const isDev = process.env.IS_DEV == "true" ? true : false;
        app_t.use(express.static(isDev? 'public/file-server' :(__dirname + '/file-server'))); // 设置静态文件的中间件
        // app_t.use('/public', express.static('public')); // 设置静态文件的中间件
        app_t.use(bodyParser.urlencoded({ extended: false })); // 判断请求体是不是json，不是的话把请求体转化为对象
        app_t.use(multer({ dest: '/tmp/' }).array('file'));

        //设置允许跨域访问该服务.
        app_t.all('*', function (req: any, res: any, next: any) {
            res.header('Access-Control-Allow-Origin', '*');
            //Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
            res.header('Access-Control-Allow-Headers', '*');
            res.header('Access-Control-Allow-Methods', '*');
            // res.header('Content-Type','*');
            if (req.method === "OPTIONS") res.send(200);/*让options请求快速返回*/
            else {
                next();
            }

        });

        // 上传文件api
        app_t.post('/api/upload', (req: any, res: any) => {
            console.log(req.files);  // 上传的文件信息
            const filename = decodeURIComponent(req.files[0].originalname)
            let response = {}as {
                code: number,
                msg?: string,
                data: any
            }
            try {
                
                for (let i = 0; i < req.files.length; i++) {
                    fs.readFile(req.files[i].path, (err: any, data: any) => {
                        let des_file = this._uploadDir + "/" + filename;//存放路径
                        fs.writeFile(des_file, data, function (err: any) {
                            if (err) {
                                console.log(err);
                            } else {
                                response = {
                                    code: 0,
                                    msg: 'File uploaded successfully',
                                    data: filename
                                }
                            }
                            console.log(data);
                            console.log(des_file);
                            res.end(JSON.stringify(response));
                        });
                    });
                }
            } catch (error:any) {
                response.code = 1
                response.msg = error.message
                res.end(JSON.stringify(response));
            }
        })

        // 获取文件列表
        app_t.get('/api/getFileList', (req: any, res: any) => {
            res.header('Content-Type', 'application/json');
            const ret = {
                code: 0,
            } as {
                code: number,
                msg?: string,
                data?: any
            }
            if(this._shareDir){
                console.log(req)
                const targetDir = `${this._shareDir}/${req.query.path || ''}`
                fs.readdir(targetDir, (err: any, data: any) => {
                    let resultArray = [];
                    for (let d of data) {
                        let statSyncRes = fs.statSync(targetDir + '/' + d);
                        // console.log("statSyncRes", statSyncRes)
                        resultArray.push({
                            src: d,
                            size: statSyncRes.size,
                            type: statSyncRes.isDirectory() ? 'dir' : 'file',
                            //mtimeMs: statSyncRes.mtimeMs,  // 我发现有些电脑上的文件没有mtimeMs属性, 所以将mtime转成时间戳发过去
                            mtimeMs: new Date(statSyncRes.mtime).getTime()
                        })
                    }
                    // console.log(resultArray);
                    ret.data = resultArray.sort((a, b)=>a.type > b.type ? 1 : -1)
                    res.end(JSON.stringify(ret))
                })
            }
            else{
                ret.code = 1
                ret.msg = 'shareDir Empty!'
                res.end(JSON.stringify(ret))
            }
        })
        // 下载文件
        app_t.get('/api/downloadFile', (req: any, res: any) => {
            const ret = {
                code: 0,
            } as {
                code: number,
                msg?: string,
                data?: any
            }
            if(this._shareDir){
                // res.header('Content-Type', 'application/octet-stream');
                console.log(req)
                const targetDir = `${this._shareDir}/${req.query.path || ''}`
                console.log(targetDir, fs.existsSync(targetDir))
                res.download(targetDir, {
                    dotfiles: 'allow'
                })
            }
            else{
                ret.code = 1
                ret.msg = 'shareDir Empty!'
                res.end(JSON.stringify(ret))
            }
        })

        this.app = app_t;
    }
    start() {
        return new Promise((resolve, reject) => {
            try {
                this.server = this.app.listen(this._port, () => {
                    resolve(null)
                })
                this.server.on("connection",(socket)=>{
                    this.sockets.push(socket);
                    socket.once("close",()=>{
                        this.sockets.splice(this.sockets.indexOf(socket),1);
                    });
                });
            } catch (error) {
                console.error(error)
                reject(error)
            }
        })

    }

    //关闭之前，我们需要手动清理连接池中得socket对象
    stop() {
        return new Promise((resolve, reject) => {
            this.sockets.forEach(function(socket){
                socket.destroy();
            });
            if (this.server)
                this.server.close((err) => {
                    if (err) reject(err)
                    else {
                        resolve(err)
                        this.server = undefined
                    }
                });
        })
    }
    async restart() {
        await this.stop()

        await this.start()
    }
    get address() {
        if (this.server){
            const addr = this.server.address() as AddressInfo
            return `${addr.address}:${addr.port}`
        }
        return
    }
    set shareDir(v: string){
        this._shareDir = v
    }
    get shareDir(){
        return this._shareDir
    }
    set uploadDir(v: string){
        this._uploadDir = v
    }
    get uploadDir(){
        return this._uploadDir
    }
    set port(v: number){
        this._port = v
    }
    get port(){
        return this._port
    }
}
export {
    FileServer
}