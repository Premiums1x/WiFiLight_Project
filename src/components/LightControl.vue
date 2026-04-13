<template>
  <div class="lc" id="light-control">
    <div class="bz">
      <!-- 灯泡 SVG 插图 -->
      <svg width="88" height="100" viewBox="0 0 88 100" fill="none" id="bulb-svg">
        <!-- 背景光晕 -->
        <ellipse cx="44" cy="42" rx="30" ry="30"
                 :fill="lightOn ? '#FFF8E1' : '#F2F2F7'"
                 :opacity="lightOn ? '0.5' : '0'"
                 class="bulb-glow"
        />
        <!-- 灯泡主体 -->
        <path d="M44 10C28 10 15 23 15 39c0 10.5 5.5 19.7 13.8 24.9L31 74h26l2.2-10.1C67.5 58.7 73 49.5 73 39c0-16-13-29-29-29z"
              :fill="lightOn ? '#FFD60A' : '#E5E5EA'"
              class="bulb-body"
        />
        <!-- 高光 -->
        <path d="M27 33c2-9 10-14 17-14"
              stroke="#fff" stroke-width="2.5" stroke-linecap="round"
              :opacity="lightOn ? '0.9' : '0.7'"
        />
        <!-- 灯座 -->
        <rect x="31" y="74" width="26" height="7" rx="3.5"
              :fill="lightOn ? '#8E8E93' : '#C7C7CC'"
              class="bulb-cap"
        />
        <rect x="33" y="82" width="22" height="7" rx="3.5"
              :fill="lightOn ? '#8E8E93' : '#C7C7CC'"
              class="bulb-cap"
        />
        <rect x="35" y="90" width="18" height="6" rx="3"
              :fill="lightOn ? '#6E6E73' : '#AEAEB2'"
              class="bulb-cap"
        />
        <!-- 灯丝 -->
        <line x1="44" y1="30" x2="40" y2="38"
              :stroke="lightOn ? '#FF9F0A' : '#C7C7CC'"
              stroke-width="2" stroke-linecap="round"
              class="filament"
        />
        <line x1="40" y1="38" x2="48" y2="44"
              :stroke="lightOn ? '#FF9F0A' : '#C7C7CC'"
              stroke-width="2" stroke-linecap="round"
              class="filament"
        />
        <line x1="48" y1="44" x2="44" y2="52"
              :stroke="lightOn ? '#FF9F0A' : '#C7C7CC'"
              stroke-width="2" stroke-linecap="round"
              class="filament"
        />
      </svg>

      <!-- 状态文本 -->
      <div class="lt" id="light-title">{{ lightOn ? '灯光已开启' : '灯光已关闭' }}</div>
      <div class="ls" id="light-subtitle" :style="{ color: lightOn ? '#FF9F0A' : '#8E8E93' }">
        {{ lightOn ? '运行正常 · 亮度 100%' : '点击下方开关以控制灯光' }}
      </div>
    </div>

    <!-- Toggle 开关行 -->
    <div class="tr">
      <span class="tl">灯光开关</span>
      <label class="tw" id="light-toggle">
        <input
          type="checkbox"
          :checked="lightOn"
          :disabled="disabled || loading"
          @change="handleToggle"
        />
        <div class="tt"></div>
        <div class="th"></div>
      </label>
    </div>

    <!-- Loading 指示 -->
    <div v-if="loading" class="light-loading">
      <div class="light-loading-bar"></div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  lightOn: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle'])

function handleToggle() {
  if (!props.disabled && !props.loading) {
    emit('toggle')
  }
}
</script>

<style scoped>
.lc {
  background: #fff;
  border-radius: 22px;
  padding: 22px 20px;
  border: 0.5px solid var(--color-border-tertiary);
  margin-bottom: 10px;
  position: relative;
  overflow: hidden;
}

.bz {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 18px;
}

/* 灯泡 SVG 动画 */
.bulb-body {
  transition: fill 0.5s ease;
}

.bulb-glow {
  transition: fill 0.5s ease, opacity 0.5s ease;
}

.bulb-cap {
  transition: fill 0.4s ease;
}

.filament {
  transition: stroke 0.4s ease;
}

/* 状态文本 */
.lt {
  font-size: 18px;
  font-weight: 700;
  color: #1c1c1e;
  margin-top: 12px;
  letter-spacing: -0.3px;
  transition: color 0.3s ease;
}

.ls {
  font-size: 12px;
  margin-top: 3px;
  transition: color 0.3s ease;
}

/* Toggle 开关行 */
.tr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
}

.tl {
  font-size: 15px;
  font-weight: 500;
  color: #1c1c1e;
}

/* iOS Toggle 开关 */
.tw {
  position: relative;
  width: 51px;
  height: 31px;
  cursor: pointer;
  display: block;
}

.tw input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.tt {
  position: absolute;
  inset: 0;
  border-radius: 31px;
  background: #E5E5EA;
  transition: background 0.3s ease;
}

.th {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 27px;
  height: 27px;
  border-radius: 50%;
  background: #fff;
  border: 0.5px solid #ddd;
  transition: left 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input:checked + .tt {
  background: #34C759;
}

input:checked ~ .th {
  left: 22px;
}

input:disabled + .tt {
  opacity: 0.5;
}

input:disabled ~ .th {
  opacity: 0.5;
}

/* Loading 条 */
.light-loading {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(0, 122, 255, 0.1);
  overflow: hidden;
}

.light-loading-bar {
  width: 40%;
  height: 100%;
  background: var(--color-blue);
  border-radius: 2px;
  animation: loading-slide 1.2s ease-in-out infinite;
}

@keyframes loading-slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(350%); }
}
</style>
