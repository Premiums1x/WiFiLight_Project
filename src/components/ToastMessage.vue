<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast-item', `toast-${toast.type}`, { 'toast-leaving': !toast.visible }]"
        >
          <span class="toast-icon">
            <template v-if="toast.type === 'success'">✓</template>
            <template v-else-if="toast.type === 'error'">✕</template>
            <template v-else>ℹ</template>
          </span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'

const { toasts } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  pointer-events: none;
  width: 90%;
  max-width: 340px;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 500;
  pointer-events: auto;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04);
  width: 100%;
  box-sizing: border-box;
}

.toast-success {
  background: rgba(255, 255, 255, 0.92);
  border: 0.5px solid rgba(52, 199, 89, 0.3);
  color: #1c1c1e;
}

.toast-error {
  background: rgba(255, 255, 255, 0.92);
  border: 0.5px solid rgba(255, 59, 48, 0.3);
  color: #1c1c1e;
}

.toast-info {
  background: rgba(255, 255, 255, 0.92);
  border: 0.5px solid rgba(0, 122, 255, 0.3);
  color: #1c1c1e;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.toast-success .toast-icon {
  background: #E8F7EE;
  color: #34C759;
}

.toast-error .toast-icon {
  background: #FEF0F0;
  color: #FF3B30;
}

.toast-info .toast-icon {
  background: #EAF3FF;
  color: #007AFF;
}

.toast-message {
  flex: 1;
  line-height: 1.4;
}

/* 过渡动画 */
.toast-enter-active {
  transition: all 0.35s cubic-bezier(0.21, 1.02, 0.73, 1);
}

.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.06, 0.71, 0.55, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>
