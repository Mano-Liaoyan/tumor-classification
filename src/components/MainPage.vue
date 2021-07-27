<template>
    <a-layout id="components-layout-demo-custom-trigger">
        <a-layout-sider v-model="collapsed" :trigger="null" collapsible>
            <div class="logo" style="display:flex;justify-content:center;align-items: center">
                <span v-if="!collapsed" style="color: white;font-size: 1.2rem">标注平台</span>
                <a-icon v-else type="dot-chart" style="color: white;font-size: 1.5rem;"/>
            </div>
            <vue-scroll style="height: 90%">
                <SideMenu></SideMenu>
            </vue-scroll>
        </a-layout-sider>
        <a-layout>
            <a-layout-header class="header" style="background: #fff; padding: 0">
                <div style="display:flex;justify-content: space-between;align-items: center">
                    <a-icon class="trigger" :type="collapsed ? 'menu-unfold' : 'menu-fold'" @click="() => (collapsed = !collapsed)"/>
                    <p style="margin: 0 1.5rem 0 0;">当前分支: {{ current_selection }}</p>
                    <p style="margin: 0 1.5rem 0 0;">当前用户: {{ this.$store.state.username }}</p>
                </div>
            </a-layout-header>
            <a-layout-content :style="{ margin: '16px 16px', padding: '24px', background: '#fff', minHeight: '280px' }">
                <!-- 病理诊断界面 -->
                <vue-scroll>
                    <ViewAndSelector v-show="current_content == 'sub1'"></ViewAndSelector>
                    <VideoSelector v-show="current_content == 'sub2'"></VideoSelector>
                </vue-scroll>
            </a-layout-content>
        </a-layout>
    </a-layout>
</template>
<script>
import VideoSelector from '@/components/VideoSelector'
import ViewAndSelector from '@/components/ViewAndSelector'
import SideMenu from "@/components/SideMenu"

export default {
    name: "MainPage",
    components: {
        ViewAndSelector, VideoSelector, SideMenu
    },
    mounted() {
        this.$root.$on('current_selection_branch', (data) => {
            this.current_selection = data[0]
            this.current_content = data[1]
        })
    },
    data() {
        return {
            collapsed: false,
            current_selection: undefined,
            current_content: "sub1"
        };
    },
    beforeDestroy() {
        // 清除事件
        this.$root.$off()
    }
};
</script>
<style>
#components-layout-demo-custom-trigger .trigger {
    font-size: 18px;
    line-height: 64px;
    padding: 0 24px;
    cursor: pointer;
    transition: color 0.3s;
    height: 100% !important;
}

#components-layout-demo-custom-trigger .trigger:hover {
    color: #1890ff;
}

#components-layout-demo-custom-trigger .logo {
    height: 32px;
    background: rgba(255, 255, 255, 0.2);
    margin: 16px;
}
</style>
