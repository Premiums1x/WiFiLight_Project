<template>
  <Teleport to="body">
    <Transition name="toast-slide">
      <div v-if="toast.visible" class="hud-toast" :class="toast.type">
        <div class="toast-icon">
          <svg v-if="toast.icon === 'connect'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-linecap="round" />
            <polyline points="22 4 12 14.01 9 11.01" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <svg v-else-if="toast.icon === 'disconnect'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" stroke-linecap="round" />
            <line x1="9" y1="9" x2="15" y2="15" stroke-linecap="round" />
          </svg>
          <svg v-else-if="toast.icon === 'light-on'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m12.72-12.72l-1.41 1.41" stroke-linecap="round" />
          </svg>
          <svg v-else-if="toast.icon === 'light-off'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <svg v-else-if="toast.icon === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-linejoin="round" />
            <line x1="12" y1="9" x2="12" y2="13" stroke-linecap="round" />
            <line x1="12" y1="17" x2="12.01" y2="17" stroke-linecap="round" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" stroke-linecap="round" />
            <line x1="12" y1="16" x2="12.01" y2="16" stroke-linecap="round" />
          </svg>
        </div>
        <span class="toast-text">{{ toast.message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'

const { toast } = useToast()
</script>

<style scoped>
.hud-toast {
  position: fixed;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: min(420px, calc(100vw - 32px));
  max-width: min(460px, calc(100vw - 32px));
  padding: 12px 24px 12px 20px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(30, 33, 40, 0.84);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22);
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
}

.toast-icon svg {
  width: 100%;
  height: 100%;
}

.toast-text {
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.hud-toast.success .toast-icon {
  color: #32d74b;
}

.hud-toast.error .toast-icon {
  color: #ff453a;
}

.hud-toast.warning .toast-icon {
  color: #ffd60a;
}

.hud-toast.default .toast-icon {
  color: #c5cbe1;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -24px);
}

@media (max-width: 640px) {
  .hud-toast {
    top: 18px;
    min-width: calc(100vw - 24px);
    max-width: calc(100vw - 24px);
    padding: 11px 18px 11px 16px;
  }
}
</style>
