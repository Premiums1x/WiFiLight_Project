<template>
  <Transition name="fade">
    <div class="loading-overlay" v-if="visible">
      <div class="loading-content">
        <div class="loading-spinner">
          <svg viewBox="0 0 50 50">
            <circle
              cx="25" cy="25" r="20"
              fill="none"
              stroke="#007AFF"
              stroke-width="3"
              stroke-linecap="round"
              stroke-dasharray="80, 200"
            />
          </svg>
        </div>
        <p class="loading-text">{{ text }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: '正在连接设备...'
  }
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(242, 242, 247, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
}

.loading-spinner svg {
  width: 100%;
  height: 100%;
  animation: spin 1.2s linear infinite;
}

.loading-text {
  font-size: 15px;
  color: #8E8E93;
  font-weight: 500;
  letter-spacing: -0.2px;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
