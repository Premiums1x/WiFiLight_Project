<template>
  <Transition name="overlay-fade">
    <div v-if="visible" class="loading-overlay">
      <div class="loading-panel">
        <div class="loading-ring"></div>
        <p class="loading-title">SYSTEM SYNC</p>
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
    default: '正在同步控制面板...'
  }
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 1500;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 13, 18, 0.72);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.loading-panel {
  width: min(320px, calc(100vw - 40px));
  padding: 28px 24px;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(34, 38, 47, 0.96), rgba(16, 18, 24, 0.96));
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
  text-align: center;
}

.loading-ring {
  width: 54px;
  height: 54px;
  margin: 0 auto 18px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.08);
  border-top-color: #ffcc00;
  animation: spin 0.9s linear infinite;
}

.loading-title {
  margin: 0;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
}

.loading-text {
  margin: 10px 0 0;
  color: #c5cbe1;
  font-size: 13px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.28s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
</style>
