<template>
    <el-collapse v-model="activeNames">
        <el-collapse-item title="websocket 设置" name="1">

            <div>
                <span>服务器地址: </span><el-input v-model="websocketInfo.ip" />
                <span>端口: </span><el-input v-model="websocketInfo.port" />
                <span>从机ID: </span><el-input v-model="websocketInfo.sid" />
                <span>密钥: </span><el-input v-model="websocketInfo.secret" type="password" />
                <el-button @click="createWebsocket()">连接</el-button>
            </div>

        </el-collapse-item>
        <el-collapse-item title="OBS操作面板" name="2">
            <div>
                <div id="viewConfAddContainer">
                    <el-input v-model="viewName" placeholder="对象名" />
                    <el-input v-model="obsSourceName" placeholder="OBS内视频源名" />
                    <el-input v-model="obsSourceUri" placeholder="视频流地址" />
                    <el-button @click="addviewConfig()">添加视频源配置</el-button>
                    <el-upload class="upload-demo" :auto-upload="false" :on-change="handleViewConfigFile">
                        <el-button>点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">blyatman</div>
                    </el-upload>
                </div>
                <div>
                    <div v-for="(value, key) in OBSConfig">
                        {{ key }}:{{ value.obsObjectName }}:{{ value.streamUri }}
                    </div>
                </div>
            </div>
        </el-collapse-item>
        <el-collapse-item title="视频源选择">
            <div class="ObsConfigContainer">
                <div class="buttonContainer"> 
                <el-button @click="deleteObsMiniView" size="large" type="warning">关闭小窗</el-button>
                
                <el-switch v-model="keepMiniview" size="large" active-text="始终添加" inactive-text="手动控制"></el-switch>
                </div>
                <div v-for="(obsObjectName, name) in OBSConfig">
                    <ScreenController :name="name" :obs-info="obsObjectName"
                        @click="activateObsMiniView(name, obsObjectName)"></ScreenController>
                </div>
            </div>
            <div>
                <p>测试浏览器源用的东西</p>
                <div>
                    <el-input v-model="browserSourceSuffixName" placeholder="浏览器源后缀"></el-input>
                    <el-button @click="addBrowserSourceSuffixName">添加浏览器源</el-button>
                </div>
                <div v-for="(metadata,name) in browserSourceConfig">
                <p>{{ name }}</p>
                <el-button @click="testShowBrowserSource(name)" size="large" type="warning">测试显示一个浏览器源</el-button>
                <el-button @click="testHideBrowserSource(name)" size="large" type="warning">测试隐藏一个浏览器源</el-button>
                </div>
            </div>

        </el-collapse-item>
    </el-collapse>
</template>
<style scoped lang="stylus">
.ObsConfigContainer
    display flex
    flex-direction row
    .buttonContainer
        display flex
        flex-direction column 
        align-item center
    
</style>
<script>

import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import ScreenController from './ScreenController.vue'
export default {
    components: { ScreenController },
    destroyed() {
        if (this.websocketClient != null) {
            this.websocketClient.onclose = null;
            this.websocketClient.close();
        }
    },
    data() {
        return {
            keepMiniview: false,
            viewName: null,
            obsSourceName: null,
            obsSourceUri: null,
            browserSourceSuffixName:null,
            activeNames: ref(["1"]),
            OBSConfig: {
            },
            browserSourceConfig:{

            },
            websocketInfo: {
                ip: "127.0.0.1",
                port: "8080",
                sid: "admin",
                secret: "6657"
            },
            websocketClient: null
        };
    },
    methods: {
        addviewConfig: function () {
            if (this.viewName == null || this.obsSourceName == null || this.obsSourceUri == null) {
                ElMessage({
                    message: "参数不能为空",
                    type: "warning"
                });
            }
            else {
                this.OBSConfig[this.viewName] = {
                    obsObjectName: this.obsSourceName,
                    streamUri: this.obsSourceUri
                };
                this.viewName = null;
                this.obsSourceName = null;
                this.obsSourceUri = null;
                ElMessage({
                    message: "添加成功",
                    type: "success"
                });
            }
        },
        addBrowserSourceSuffixName(){
            if (this.browserSourceSuffixName == null) {
                ElMessage({
                    message: "参数不能为空",
                    type: "warning"
                });
            } else{
                this.browserSourceConfig[this.browserSourceSuffixName] = {};
                this.browserSourceSuffixName = null;
            }
        },
        importViewConfig: function () {

        },
        createWebsocket() {
            console.log("bruh");
            if (this.websocketClient != null) {
                this.websocketClient.close();
            }
            let url = this.buildWebsocketUrl();
            this.websocketClient = new WebSocket(url);
            this.websocketClient.onopen = this.onOpen;
            this.websocketClient.onclose = this.onClose;
            this.websocketClient.onerror = this.onError;
            this.websocketClient.onmessage = this.onMessage;
        },
        buildWebsocketUrl() {
            let url = "ws://"
                + this.websocketInfo.ip + ":"
                + this.websocketInfo.port + "/websocket/"
                + this.websocketInfo.sid + "/"
                + this.websocketInfo.secret;
            return url;
        },
        onOpen(event) {
            console.log("on open:");
            this.activeNames = ref(["2"]);
            ElMessage({
                message: "连接成功",
                type: "success"
            });
        },
        onClose(event) {
            console.log("on close:");
            ElMessage({
                message: "连接关闭",
                type: "warning"
            });
            this.createWebsocket();
        },
        onMessage(event) {
            console.log("on message:" + event.data);
            this.handleMessage(event.data);
        },
        onError(event) {
            console.log("on error:" + even.data);
            ElMessage({
                message: "发生错误",
                type: "error"
            });
        },
        doSend(message) {
            console.log("send mesage:" + message);
            this.websocketClient.send(message);
        },
        handleMessage(message) {
            let parsedMessage = JSON.parse(message);
            console.log(parsedMessage);
            switch (parsedMessage["command"]) {
                case "SLAVE_START_RECORDING":
                    console.log("START RECORDING!!!");
                    break;
                case "SLAVE_STOP_RECORDING":
                    console.log("STOP RECORDING!!!");
                    break;
                case "OBSERVER_STATUS_PLAYING":
                    console.log("OBSERVER Playing!!!");
                    if (this.isPlaying == false) {
                        this.playChangeToPlayAudio();
                    }
                    this.isPlaying = true;
                    this.playPlayingAudio();
                    break;
                case "OBSERVER_STATUS_PLAYING_CLEAR":
                    console.log("OBSERVER Playing CLEAR!!!");
                    if (this.isPlaying) {
                        this.playCompletedAudio();
                    }
                    this.isPlaying = false;
                    this.stopPlayingPlayingAudio();
                    break;
                case "OBSERVER_STATUS_PREVIEW":
                    console.log("OBSERVER Preview !!!");
                    if (this.isPreview == false) {
                        this.playChangeToPreviewAudio();
                    }
                    this.isPreview = true;
                    this.playPreviewAudio();
                    break;
                case "OBSERVER_STATUS_PREVIEW_CLEAR":
                    console.log("OBSERVER Preview CLEAR!!!");
                    this.isPreview = false;
                    this.stopPlayingPreviewAudio();
                    break;
            }
        },
        handleViewConfigFile(file) {
            var reader = new FileReader();
            let that = this
            reader.onload = function () {
                if (reader.result) {
                    console.log("reader.result = " + reader.result);
                    let rowRawString = reader.result.split("\n");
                    let newConfig = {}
                    for (let rowItem of rowRawString) {
                        console.log("rowItem is" + rowItem)
                        let data = rowItem.split("|")
                        if (data.length == 3) {
                            console.log(data[0] + " is " + data[1] + " | " + data[2])
                            newConfig[data[0]] = {
                                obsObjectName: data[1].trim(),
                                streamUri: data[2].trim()
                            }

                        }

                    }

                    that.OBSConfig = newConfig;
                    ElMessage({
                        type: "success",
                        message: "导入成功"
                    })
                }
            }
            let rawString = reader.readAsText(file.raw);

        },
        activateObsMiniView(name, obsInfo) {
            let message = this.websocketInfo.sid + " 请求添加小窗：" + name + " - " + obsInfo.obsObjectName
            let metadata = {
                name: name,
                obsObjectName: obsInfo.obsObjectName,
                streamUri:obsInfo.streamUri,
                msg: message,
                keepMiniview: this.keepMiniview
            }
            let commandStr = this.buildCommand("MINI_VIEW_ADD", null, message, metadata)
            console.log("commandStr: " + commandStr)

            this.doSend(commandStr)

        },
        deleteObsMiniView() {
            let message = this.websocketInfo.sid + " 请求关闭小窗"
            let commandStr = this.buildCommand("MINI_VIEW_CLEAR", null, message, null)
            console.log("commandStr: " + commandStr)
            this.doSend(commandStr)
        },
        buildCommand(command, sidList, message, metadata) {
            let commandResult = {
                sid: this.websocketInfo.sid,
                secret: this.websocketInfo.secret,
                command: command,
                sidList: sidList,
                metadata: metadata,
                timestamp: new Date().getTime()

            }

            return JSON.stringify(commandResult)
        }, 
        
        testShowBrowserSource(name) {
            let message = this.websocketInfo.sid + " 请求显示浏览器源"
            let metadata = {
                "name":name
            }
            let commandStr = this.buildCommand("BROWSER_SOURCE_SHOW", null, message, metadata)
            console.log("commandStr: " + commandStr)
            this.doSend(commandStr)
        },
        
        testHideBrowserSource(name) {
            let message = this.websocketInfo.sid + " 请求隐藏浏览器源"
            let metadata = {
                "name":name
            }
            let commandStr = this.buildCommand("BROWSER_SOURCE_HIDE", null, message, metadata)
            console.log("commandStr: " + commandStr)
            this.doSend(commandStr)
        },
    }
}
</script>