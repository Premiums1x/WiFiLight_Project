<template>
  <Transition name="fade">
    <div class="loading-overlay" v-if="visible">
      <div class="loading-content">
        <div class="loading-spinner">
          <svg viewBox="0 0 50 50">
            <circle
              cx="25" cy="25" r="20"
              fill="none"
              stroke="url(#spinnerGrad)"
              stroke-width="3"
              stroke-linecap="round"
              stroke-dasharray="80, 200"
            />
            <defs>
              <linearGradient id="spinnerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#3b82f6"/>
                <stop offset="100%" stop-color="#8b5cf6"/>
              </linearGradient>
            </defs>
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
  background: rgba(10, 14, 26, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
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
  width: 56px;
  height: 56px;
}

.loading-spinner svg {
  width: 100%;
  height: 100%;
  animation: spin 1.2s linear infinite;
}

.loading-text {
  font-size: 15px;
  color: #94a3b8;
  font-weight: 500;
  letter-spacing: 0.5px;
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
