
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
        <el-collapse-item title="状态指示器" name="2">
            <div>
                <audio v-show="false" controls ref="playingAudioPlayer" class="aud">
                    <source src="../assets/audio/beep.mp3" />
                </audio>
                <audio v-show="false" controls ref="messengerAudioPlayer" class="aud">
                    <source src="../assets/audio/messenger.mp3" />
                </audio>
                <audio v-show="false" controls ref="completedAudioPlayer" class="aud">
                    <source src="../assets/audio/completed.mp3" />
                </audio>
                <audio v-show="false" controls ref="changeToPlayAudioPlayer" class="aud">
                    <source src="../assets/audio/切换播放1次.mp3" />
                </audio>
                <audio v-show="false" controls ref="previewAudioPlayer" class="aud">
                    <source src="../assets/audio/预览中2秒一次.mp3" />
                </audio>
                <!-- <el-button @click="playPlayingAudio()">playing音频</el-button>
                <el-button @click="playChangeToPreviewAudio()">changeToPreview音频</el-button>
                <el-button @click="playCompletedAudio()">Completed音频</el-button>
                <el-button @click="playChangeToPlayAudio()">ChangeToiPlayAudio音频</el-button>
                <el-button @click="playPreviewAudio()">Preview音频</el-button>

                <el-button @click="stopPlayingPlayingAudio()">playing音频</el-button>
                <el-button @click="stopPlayingChangeToPreviewAudio()">changeToPreview音频</el-button>
                <el-button @click="stopPlayingCompletedAudio()">Completed音频</el-button>
                <el-button @click="stopPlayingChangeToPlayAudio()">ChangeToPlay音频</el-button>
                <el-button @click="stopPlayingPreviewAudio()">Preview音频</el-button> -->
                <div v-show="isShowText">
                    <el-text>说明：</el-text>
                    <el-text>当左侧亮起时，表明您的OBS画面正在被预览。</el-text>
                    <el-text>当右侧亮起时，表明您的OBS画面正在被播放。</el-text>
                    <el-button @click="hideText()">隐藏说明</el-button>
                </div>
                <div>
                    <el-text>当前监听从机ID：{{ websocketInfo.sid }}</el-text>
                </div>
                <el-button v-show="isHideText" @click="showText()">显示说明</el-button>
                <el-row>
                    <el-col :span="12">
                        <div class="statusDiv">
                            <el-text v-show="isPreview">管理员正在预览你的画面</el-text>
                            <div v-show="isPreview" class="colorAlert preview">

                            </div>
                        </div>
                    </el-col>
                    <el-col :span="12">
                        <div class="statusDiv">
                            <el-text v-show="isPlaying">管理员正在播放你的画面</el-text>
                            <div v-show="isPlaying" class="colorAlert playing">

                            </div>
                        </div>
                    </el-col>
                </el-row>
            </div>
        </el-collapse-item>
    </el-collapse>
</template>
<style scoped lang="stylus">
.statusDiv
    height 10rem
    text-align center
    .colorAlert
        height 9rem
        margin .2rem
        border 1px solid black
    .preview 
        background yellow
    .playing
        background  red 

</style>
<script>

import { ElMessage } from 'element-plus'
import { ref } from 'vue'
export default {
    destroyed() {
        if (this.websocketClient != null) {
            this.websocketClient.onclose = null
            this.websocketClient.close()
        }
    },
    data() {
        return {
            playingTimer: null,
            previewingTimer: null,
            isActiveCloseWebsocketConnection: false,
            isHideText: false,
            activeNames: ref(['1']),
            isPlaying: false,
            isPreview: false,
            websocketInfo: {
                ip: "127.0.0.1",
                port: "8080",
                sid: "ob2",
                secret: "123456"
            },
            websocketClient: null

        }
    },
    computed: {
        isShowText: function () {
            return !(this.isHideText);
        }
    },
    methods: {
        playPlayingAudio() {
            if(this.playingTimer!=null){
                return
            }
            let that = this
            this.playingTimer = setInterval(function () {

                that.$refs.playingAudioPlayer.load()
                that.$refs.playingAudioPlayer.play()
            }, 2000)
            // this.$refs.playingAudioPlayer.play()
        }, playChangeToPreviewAudio() {
            this.$refs.messengerAudioPlayer.load()
            this.$refs.messengerAudioPlayer.play()
        }, playCompletedAudio() {
            this.$refs.completedAudioPlayer.load()
            this.$refs.completedAudioPlayer.play()
        }, playChangeToPlayAudio() {
            this.$refs.changeToPlayAudioPlayer.load()
            this.$refs.changeToPlayAudioPlayer.play()
        }, playPreviewAudio() {
            if (this.previewingTimer!=null){
                return;
            }
            let that = this
            this.previewingTimer = setInterval(function () {
                that.$refs.previewAudioPlayer.load()
                that.$refs.previewAudioPlayer.play()
            }, 2000)
        }, stopPlayingPlayingAudio() {
            let that = this
            if (that.playingTimer != null) {
                clearInterval(that.playingTimer);
                that.playingTimer = null;
            }

            this.$refs.playingAudioPlayer.pause();
        }, stopPlayingChangeToPreviewAudio() {
            this.$refs.messengerAudioPlayer.pause()
        }, stopPlayingCompletedAudio() {
            this.$refs.completedAudioPlayer.pause()
        }, stopPlayingChangeToPlayAudio() {
            this.$refs.changeToPlayAudioPlayer.pause()
        }, stopPlayingPreviewAudio() {
            let that = this
            if (this.previewingTimer != null) {
                clearInterval(that.previewingTimer);
                that.previewingTimer = null;
            }

            this.$refs.previewAudioPlayer.pause();
        },
        hideText() { this.isHideText = true },
        showText() { this.isHideText = false },
        createWebsocket() {
            console.log("bruh")
            if (this.websocketClient != null) {
                this.websocketClient.close()
            }
            let url = this.buildWebsocketUrl()
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
                + this.websocketInfo.secret
            return url;
        },
        onOpen(event) {
            console.log("on open:");
            this.activeNames = ref(['2']);
            ElMessage({
                message: '连接成功',
                type: 'success'
            })
        },
        onClose(event) {
            console.log("on close:");
            ElMessage({
                message: '连接关闭',
                type: 'warning'
            })
            this.createWebsocket()
        },
        onMessage(event) {
            console.log("on message:" + event.data);
            this.handleMessage(event.data)
        },
        onError(event) {
            console.log("on error:" + even.data);
            ElMessage({
                message: '发生错误',
                type: 'error'
            })
        },
        doSend(message) {
            console.log("send mesage:" + message)
            this.websocketClient.send(message)
        },
        handleMessage(message) {
            let parsedMessage = JSON.parse(message);
            console.log(parsedMessage)
            switch (parsedMessage["command"]) {
                case "SLAVE_START_RECORDING":
                    console.log("START RECORDING!!!");
                    break
                case "SLAVE_STOP_RECORDING":
                    console.log("STOP RECORDING!!!");
                    break;
                case "OBSERVER_STATUS_PLAYING":
                    console.log("OBSERVER Playing!!!")
                    if(this.isPlaying==false){
                        this.playChangeToPlayAudio()
                    }
                    this.isPlaying = true
                    this.playPlayingAudio()
                    break;
                case "OBSERVER_STATUS_PLAYING_CLEAR":
                    console.log("OBSERVER Playing CLEAR!!!")
                    if(this.isPlaying){
                        this.playCompletedAudio()
                    }
                    this.isPlaying = false
                    this.stopPlayingPlayingAudio()
                    break;
                case "OBSERVER_STATUS_PREVIEW":
                    console.log("OBSERVER Preview !!!")
                    if(this.isPreview ==false){
                        this.playChangeToPreviewAudio()
                    }
                    this.isPreview = true
                    this.playPreviewAudio()
                    break;
                case "OBSERVER_STATUS_PREVIEW_CLEAR":
                    console.log("OBSERVER Preview CLEAR!!!")
                    
                    this.isPreview = false
                    this.stopPlayingPreviewAudio()
                    break;
            }
        }
    }

}
</script>