<template>
    <div>
        <a-menu theme="dark" mode="inline" :open-keys="openKeys" @openChange="onOpenChange"
                :selectedKeys="selected_key" @click="changeData">
            <a-sub-menu key="sub1">
                <span slot="title">
                    <a-icon type="file-search"/>
                    <span style="width: 80%!important;text-align: center;margin-left: 25px">图像标注</span>
                </span>
                <a-menu-item v-for="(item,index) in this.batch_list" :key="item">
                    {{ item }}
                </a-menu-item>
            </a-sub-menu>
						<a-sub-menu key="sub2">
						    <span slot="title">
						        <a-icon type="file-search"/>
						        <span style="width: 80%!important;text-align: center;margin-left: 25px">视频标注</span>
						    </span>
								<a-menu-item key="视频标注">
									视频标注
								</a-menu-item>
						</a-sub-menu>
        </a-menu>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "SideMenu",
    data() {
        return {
            selected_key: undefined,
            batch_list: [],
						video_list: [],
            rootSubmenuKeys: ['sub1', 'sub2'],
            openKeys: ['sub1', 'sub2'],
            keyPath: [],
        };
    },
    mounted() {
        this.fetchBatchList()
        this.$root.$on('changeSelectedKeys', keyPath => {
						console.log("keyPath", keyPath)
						this.keyPath = keyPath;
            this.selected_key = keyPath;
            this.$root.$emit('current_selection_branch', this.selected_key);
            this.$root.$emit('resetTimer');
        })
				
    },
    methods: {
        onOpenChange(openKeys) {
            const latestOpenKey = openKeys.find(key => this.openKeys.indexOf(key) === -1);
            if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
                this.openKeys = openKeys;
            } else {
                this.openKeys = latestOpenKey ? [latestOpenKey] : [];
            }
        },
        changeData(data) {
            if (JSON.stringify(this.keyPath) != JSON.stringify(data.keyPath)) {
                //this.keyPath = data.keyPath;
								if (data.keyPath[1] === 'sub1') {
									console.log("emit: changeDataOfImage");
									this.$root.$emit('changeDataOfImage', data);
								}
								else if (data.keyPath[1] === 'sub2') {
									console.log("emit: changeDataOfVideo");
									this.$root.$emit('changeDataOfVideo', data);
								}
            }
        },
        async fetchBatchList() {
            await axios.get("/api/batch_list").then((res) => {
                if (res.data["unlabled"] == "") {
                    this.$message.info("所有图像已经被标记完毕！");
                } else {
                    this.batch_list = res.data["unlabled"];
                    this.keyPath = [this.batch_list[0], 'sub1'];
                    this.$root.$emit('current_selection_branch', this.keyPath);
                }
            }).catch((e) => {
                this.$message.error(e);
            });
        },
				async fetchVideoList() {
				    await axios.get("/api/video_list").then((res) => {
				        if (res.data["unlabled"] == "") {
				            this.$message.info("所有视频已经被标记完毕！");
				        } else {
				            this.video_list = res.data["unlabled"];
				            this.keyPath = ['视频标注', 'sub2'];
				            this.$root.$emit('current_selection_branch', this.keyPath);
				        }
				    }).catch((e) => {
				        this.$message.error(e);
				    });
				},
    },
}
</script>

<style scoped>

</style>