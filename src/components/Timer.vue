<template>
    <div>
        <div class="timer-div dowebok">
            <div class="timer">
                <div class="time-card" data-type="hours" data-max="24">
                    <div class="time-card-count">{{ myHours }}</div>
                    <!--                    <div class="time-card-label">时</div>-->
                </div>
                <span class="colon">:</span>
                <div class="time-card" data-type="minutes" data-max="60">
                    <div class="time-card-count">{{ myMinutes }}</div>
                    <!--                    <div class="time-card-label">分</div>-->
                </div>
                <span class="colon">:</span>
                <div class="time-card" data-type="seconds" data-max="60">
                    <div class="time-card-count">{{ mySeconds }}</div>
                    <!--                    <div class="time-card-label">秒</div>-->
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Timer",
    data() {
        return {
            currentTime: 0,
            timeObj: null, // 时间对象,下方会用到
            myHours: '00', // 我定义来接收计算出来的 小时 的
            myMinutes: '00', // 我定义来接收计算出来的 分钟 的
            mySeconds: '00',// 我定义来接收计算出来的 秒钟 的
            timer: undefined
        }
    },
    mounted() {
        this.testTimer()
        this.$root.$on("resetTimer", () => {
            this.initTimer()
        })
    },
    beforeDestroy() {
        console.log('移除定时器')
        if (this.timer) {
            clearInterval(this.timer)
        }
    },
    methods: {
        initTimer() {
            this.currentTime = 0
            this.timeObj = null // 时间对象,下方会用到
            this.myHours = '00' // 我定义来接收计算出来的 小时 的
            this.myMinutes = '00' // 我定义来接收计算出来的 分钟 的
            this.mySeconds = '00'// 我定义来接收计算出来的 秒钟 的
        },
        testTimer() {
            this.timeFunction();
            this.timer = setInterval(() => {
                this.timeFunction();
            }, 1000)
        },
        timeFunction() {
            // 开始执行倒计时
            this.timeObj = { // 时间对象
                seconds: Math.floor(this.currentTime % 60),
                minutes: Math.floor(this.currentTime / 60) % 60,
                hours: Math.floor(this.currentTime / 60 / 60) % 24
            }
            // 计算出时分秒
            this.myHours = this.timeObj.hours < 10 ? '0' + this.timeObj.hours : this.timeObj.hours;
            this.myMinutes = this.timeObj.minutes < 10 ? '0' + this.timeObj.minutes : this.timeObj.minutes;
            this.mySeconds = this.timeObj.seconds < 10 ? '0' + this.timeObj.seconds : this.timeObj.seconds;
            this.currentTime++;
        }
    }
}
</script>

<style scoped>
.dowebok {
    align-items: center;
}

.timer {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin: 0 0;
    color: #151414;
}

.time-card {
    margin: 0 0.2em;
    text-align: center;
}

.time-card-count {
    font-weight: 500;
    font-size: 14px;
    width: 15px;
    height: 15px;
    line-height: 14px;
    overflow: hidden;
}

.time-card-label {
    font-size: 0.875em;
    text-transform: uppercase;
    opacity: 1.0;
}

.colon {
    font-size: 1em;
}
</style>