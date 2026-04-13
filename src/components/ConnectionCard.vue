<template>
  <div class="conn-card" id="connection-card">
    <div :class="['pls', isConnected ? 'on' : 'off']" id="conn-pulse">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" id="conn-icon">
        <circle cx="10" cy="10" r="3" :fill="dotColor"/>
        <path d="M4.2 15.8a8.5 8.5 0 0 1 0-11.6"
              :stroke="waveColor" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M15.8 4.2a8.5 8.5 0 0 1 0 11.6"
              :stroke="waveColor" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M6.5 13.5a5 5 0 0 1 0-7"
              :stroke="waveInnerColor" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M13.5 6.5a5 5 0 0 1 0 7"
              :stroke="waveInnerColor" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
    </div>
    <div class="ci">
      <div class="cl" id="conn-label">{{ statusLabel }}</div>
      <div class="cs" id="conn-sub">{{ statusSub }}</div>
    </div>
    <button
      :class="['mb', isConnected ? 'deact' : 'act']"
      id="conn-btn"
      @click="$emit('toggle')"
    >
      {{ isConnected ? '断开' : '连接' }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isConnected: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle'])

const statusLabel = computed(() =>
  props.isConnected ? '控制器已在线' : '控制器已断开'
)

const statusSub = computed(() =>
  props.isConnected ? '连接正常 · 已加密' : '请检查网络连接'
)

const dotColor = computed(() =>
  props.isConnected ? '#34C759' : '#FF3B30'
)

const waveColor = computed(() =>
  props.isConnected ? '#34C759' : '#FFB3AF'
)

const waveInnerColor = computed(() =>
  props.isConnected ? '#5CDB6B' : '#FFB3AF'
)
</script>

<style scoped>
.conn-card {
  background: #fff;
  border-radius: 18px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  border: 0.5px solid var(--color-border-tertiary);
  transition: box-shadow 0.3s ease;
}

.pls {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.4s ease;
}

.pls.on {
  background: var(--color-green-bg);
}

.pls.off {
  background: var(--color-red-bg);
}

.ci {
  flex: 1;
  min-width: 0;
}

.cl {
  font-size: 13px;
  font-weight: 600;
  color: #1c1c1e;
  transition: color 0.3s ease;
}

.cs {
  font-size: 11px;
  color: #8E8E93;
  margin-top: 2px;
  transition: color 0.3s ease;
}

.mb {
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.1s ease, background 0.3s ease;
  flex-shrink: 0;
}

.mb:active {
  transform: scale(0.95);
}

.mb.act {
  background: #007AFF;
  color: #fff;
}

.mb.deact {
  background: #FF3B30;
  color: #fff;
}
</style>
