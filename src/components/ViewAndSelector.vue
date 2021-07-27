<template>
    <div>
        <div>
            <a-row type="flex" align="middle" justyfy="space-between">
                <!--   图片列表   -->
                <a-col :sm="5" :md="5" :lg="5" :xl="5" :xxl="5" style="display: flex;flex-flow: column;justify-content: center;align-items: center">
                    <p align="end" style="margin: 0 0 0.5rem 0">当前已标记 {{ this.$store.state.current_count }}/{{ received_data.pic_name.length }}</p>
                    <vue-scroll>
                        <div style="height: 550px;display:flex;align-items: center;flex-flow: column">
                            <div v-for="(item,index) in this.received_data.pic_name" :key="item" style="width: 80%">
                                <div :class="currentPictureIdx === index ? 'left-col-items-selected':'left-col-items'" @click="changeImageIdx(index)">
                                    {{ item }}
                                    <div>
                                        <!-- 控制√的颜色 -->
                                        <a-icon v-if="!received_data.is_classified[index]" type="check-circle" theme="filled"/>
                                        <a-icon v-else type="check-circle" theme="twoTone" two-tone-color="#52c41a"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </vue-scroll>
                </a-col>
                <!--   图片展示   -->
                <a-col :sm="14" :md="14" :lg="14" :xl="14" :xxl="14">
                    <a-row type="flex" justify="space-around" align="middle" style="margin-bottom: 0.625rem">
                        <a-col :span="5">
                            <div style="display:flex;justify-content: center;align-items: center">
                                <p style="margin: 0">当前计时</p>
                                <Timer></Timer>
                            </div>
                        </a-col>
                        <a-col :span="14">
                            <h3 align="center" style="margin: 0">当前选择图片: <span style="color: #006E00;">{{ received_data.pic_name[currentPictureIdx] }}</span>
                            </h3>
                        </a-col>
                        <a-col :span="5"></a-col>
                    </a-row>
                    <a-row type="flex" justify="space-around" align="middle" v-viewer="{}">
                        <a-col style="width: 768px;height: 432px;display:flex;justify-content:center;align-content: center">
                            <img v-if="image_status === 0" :src="img_src" alt="" style="max-height: 100%;max-width: 100%">
                            <img v-else-if="image_status === 1" src="../../public/loading.gif" alt="" style="max-height: 100%;max-width: 100%">
                            <img v-else src="../../public/error.png" alt="" style="max-height: 100%;max-width: 100%">
                        </a-col>
                    </a-row>
                    <a-button-group style="display:flex;justify-content:space-around;margin-top:30px;">
                        <a-button type="primary" @click="prevImageIdx">
                            <a-icon type="left"/>
                            上一张
                        </a-button>
                        <a-button type="primary" @click="nextImageIdx">
                            下一张
                            <a-icon type="right"/>
                        </a-button>
                    </a-button-group>
                    <div style="display:flex;justify-content:space-around;margin-top:30px;">
                        <a-button type="primary" size="large" @click="() => (this.modalVisible = true)"
                                  :disabled="this.$store.state.current_count !== received_data.pic_name.length">
                            提交上传
                            <a-icon type="upload"/>
                        </a-button>
                    </div>
                </a-col>
                <!--   类别判断   -->
                <a-col :sm="5" :md="5" :lg="5" :xl="5" :xxl="5">
                    <div style="display: flex;justify-content: center;align-items: center;margin-top: 10px;">
                        <a-space direction="vertical">
                            <div v-for="(subClass) in classes" :key="subClass">
                                <div class="right-col-items-selected" v-if="current_class===subClass" @click="updateClassInfo(subClass)">
                                    {{ subClass }}
                                </div>
                                <div class="right-col-items" v-else @click="updateClassInfo(subClass)">
                                    {{ subClass }}
                                </div>
                            </div>
                        </a-space>
                    </div>
                </a-col>
            </a-row>
        </div>
        <a-modal v-model="modalVisible" title="确定要上传吗" centered @ok="generatePostData"
                 :okText="upload_status===2 ?'重试':'确认'" cancelText="取消" :destroyOnClose=true :okButtonProps="upload_status===1?{props:{disabled:true}}:{}">
            <p v-if="upload_status===0">请检查是否有标记错误</p>
            <p v-if="uploading">正在上传。。。</p>
            <a-spin v-if="uploading" size="large"/>
            <a-result v-if="upload_status===1" status="success" title="上传成功" sub-title="即将刷新界面开始新的标记"></a-result>
            <a-result v-else-if="upload_status===2" status="error" title="上传失败" sub-title="请检查网络连接或者联系你的管理员"></a-result>
        </a-modal>
    </div>
</template>

<script>
import 'viewerjs/dist/viewer.css'
import {directive as viewer} from "v-viewer"
import axios from "axios";
import Timer from "@/components/Timer"

export default {
    name: "ViewAndSelector",
    components: {
        Timer
    },
    directives: {
        viewer: viewer({
            debug: true,
            loading: true
        }),
    },
    mounted() {
        let _this = this
        this.$root.$on('changeDataOfImage', data => {
					console.log("on: changeDataOfImage");
            if (_this.$store.state.current_count !== 0)
                _this.$confirm({
                    content: '检测到您有未上传的数据，现在切换页面会导致数据丢失。确定要切换吗？',
                    okText: '确认',
                    centered: true,
                    onOk() {
                        _this.clearData()
                        _this.fetchData(data.item.index)
                        _this.$root.$emit('changeSelectedKeys', data.keyPath)
                        _this.$destroyAll()
                    },
                    cancelText: '取消',
                    onCancel() {
                        _this.$destroyAll()
                    }
                })
            else {
                _this.clearData()
                _this.fetchData(data.item.index)
                // 将数据再发回给side menu
                _this.$root.$emit('changeSelectedKeys', data.keyPath)
            }
        })
        this.url = this.$store.state.server_url
        this.fetchClasses()
        this.fetchData()
        //设置起始时间
        this.post_data.start_time = new Date().getTime();
    },
    data() {
        return {
            modalVisible: false,
            uploading: false,
            upload_status: 0, // 0 = 还未开始上传， 1 = 上传完毕切成功， 2 = 上传失败
            image_status: 1, // 0 = 未在拉取， 1 = 拉取中， 2 = 拉取失败
            currentPictureIdx: -1,
            is_classified: [],
            // 接收数据
            received_data: {
                pic_url: [],
                pic_name: [],
                s_class: [],
                is_classified: []
            },
            // 上传数据
            post_data: {
                batch_id: "",
                start_time: "",
                end_time: "",
                results: []
            },
            current_class: "",
            // 分类类别
            classes: [],
            url: "",
            img_src: ""
        };
    },
    methods: {
        async fetchClasses() {
            await axios.get("/api/class_list").then((res) => {
                this.classes = res.data["classes"]
            }).catch((e) => {
                this.$message.error(e);
            });
        },
        async fetchBatchList() {
            let data = undefined
            await axios.get("/api/batch_list").then((res) => {
                if (res.data["unlabled"] == "") {
                    this.$message.info("所有图像已经被标记完毕！");
                } else
                    data = res.data["unlabled"]
            }).catch((e) => {
                this.$message.error(e);
            });
            return data;
        },
        async fetchData(ids = 0) {
            let unlabeledList = await this.fetchBatchList();
            //随机获得一个unlabeled的batch
            // let ids = Math.floor(Math.random() * unlabeledList.length);
            //填写batch_id
            this.post_data.batch_id = unlabeledList[ids]
            await axios.get("/api/img_list/" + unlabeledList[ids]).then((res) => {
                //将获得的图像列表付给received_data
                // this.received_data.pic_name = res.data["img_list"].slice(0, 5) // 测试前5组样例
                this.received_data.pic_name = res.data["img_list"]
                this.generateImgUrl()
            }).catch((e) => {
                this.$message.error(e);
            });
        },
        // 上传数据
        async postData() {
            // 填入完成时间戳
            this.post_data.end_time = new Date().getTime()
            await axios.post("/api/post_info", this.post_data).then((res) => {
                this.uploading = false
                this.upload_status = 1
                let _this = this
                setTimeout(() => {
                    // _this.$router.go(0);//注释掉
                    window.location.reload()
                }, 1000)
            }).catch((e) => {
                this.uploading = false
                this.upload_status = 2
                this.$message.error(e);
            });
        },
        clearData() {
            this.image_status = 1; // 0 = 未在拉取， 1 = 拉取中， 2 = 拉取失败
            this.currentPictureIdx = -1;
            this.is_classified = [];
            // 接收数据
            this.received_data = {
                pic_url: [],
                pic_name: [],
                s_class: [],
                is_classified: []
            }
						this.$store.commit('$_setCurrentCount', 0);
            this.current_class = "";
            this.img_src = "";
        }
        ,
        generatePostData() {
            for (let i = 0; i < this.received_data.pic_name.length; i++) {
                let obj = {
                    img_name: this.received_data.pic_name[i],
                    img_class: this.received_data.s_class[i]
                }
                this.post_data.results.push(obj)
            }
            this.postData();
        },
        // 生成图像对应链接以及将isClassified置为false
        generateImgUrl() {
            let img_base_url = "http://120.55.48.190:8000/api/img/";
            for (let i = 0; i < this.received_data.pic_name.length; i++) {
                let str = img_base_url + this.received_data.pic_name[i]
                this.received_data.pic_url.push(str)
                this.received_data.is_classified.push(false)
                this.received_data.s_class.push("")
            }
            //默认初始图像下标为0
            this.currentPictureIdx = 0;
        },
        updateClassInfo(value) {
            // this.received_data.s_class[this.currentPictureIdx] = e.target.value
            this.$set(this.received_data.s_class, this.currentPictureIdx, value)
            if (!this.received_data.is_classified[this.currentPictureIdx])
                // this.$store.state.current_count++
								this.$store.commit('$_setCurrentCount', this.$store.state.current_count + 1)
            this.$set(this.received_data.is_classified, this.currentPictureIdx, true)
            this.refreshSelection()
        },
        changeImageIdx(idx) {
            if (idx === this.currentPictureIdx)
                return
            this.currentPictureIdx = idx
            this.image_status = 1 // 切换为拉取模式
            this.refreshSelection()
        },
        refreshSelection() {
            this.current_class = this.received_data.s_class[this.currentPictureIdx]
            let temp = this.classes
            this.classes = undefined
            this.classes = temp
        },
        prevImageIdx() {
            if (this.currentPictureIdx === 0) {
                this.$message.warning("这已经是第一张图!")
            } else {
                this.currentPictureIdx--;
                this.image_status = 1 // 切换为拉取模式
                this.refreshSelection()
            }
        },
        nextImageIdx() {
            if (this.currentPictureIdx === this.received_data.pic_name.length - 1) {
                this.$message.warning("这已经是最后一张图!")
            } else {
                this.currentPictureIdx++;
                this.image_status = 1 // 切换为拉取模式
                this.refreshSelection()
            }
        }
    },
    watch: {
        currentPictureIdx() {
            axios.get('/api/img/' + this.received_data.pic_name[this.currentPictureIdx], {
                responseType: "arraybuffer"
            }).then((res) => {
                this.image_status = 1
                return 'data:image/png;base64,' + btoa(
                    new Uint8Array(res.data)
                        .reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
            }).then((data) => {
                this.img_src = data;
                this.image_status = 0
            }).catch((e) => {
                console.log(e)
                this.image_status = 2
            });
        }
    }
}
</script>

<style scoped>
.ban-mouse {
    pointer-events: none;
}

.left-col-items {
    display: flex;
    justify-content: space-between;
    align-content: center;
    line-height: 30px;
    height: 30px;
    padding: 0 10px;
    border-radius: 1rem;
}

.left-col-items-selected {
    display: flex;
    justify-content: space-between;
    align-content: center;
    line-height: 30px;
    height: 30px;
    padding: 0 10px;
    border-radius: 1rem;
    background-color: gray;
    color: white;
    cursor: pointer;
}

.left-col-items:hover {
    background-color: gray;
    color: white;
    cursor: pointer;
}

.right-col-items {
    display: flex;
    justify-content: space-between;
    align-content: center;
    line-height: 30px;
    height: 30px;
    padding: 0 10px;
    border-radius: 1rem;
    /*border-color: #40A9FF;*/
}

.right-col-items-selected {
    display: flex;
    justify-content: space-between;
    align-content: center;
    line-height: 30px;
    height: 30px;
    padding: 0 10px;
    border-radius: 1rem;
    border-color: #40A9FF;
    background-color: gray;
    color: white;
    cursor: pointer;
}

.right-col-items:hover {
    background-color: gray;
    color: white;
    cursor: pointer;
}

</style>

<style>
/*.ant-radio-button-checked:nth-child(2) {
    color: #2c3e50 !important;
}

.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
    color: #2c3e50 !important;
}

.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
    border-color: #d9d9d9 !important;
}*/
</style>