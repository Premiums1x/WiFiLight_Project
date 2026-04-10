<template>
  <div class="info-section">
    <!-- 最后更新时间 -->
    <div class="info-row" v-if="updatedAt">
      <span class="info-label">⏱ 最后更新</span>
      <span class="info-value">{{ updatedAt }}</span>
    </div>

    <!-- 最近操作结果 -->
    <div class="info-row" v-if="lastAction">
      <span class="info-label">📋 最近操作</span>
      <span class="info-value">{{ lastAction }}</span>
    </div>

    <!-- 错误信息 -->
    <div class="info-row info-error" v-if="error">
      <span class="info-label">⚠️ 异常信息</span>
      <span class="info-value">{{ error }}</span>
    </div>

    <!-- 刷新按钮 -->
    <button
      class="refresh-btn"
      :disabled="loading"
      @click="$emit('refresh')"
    >
      <svg
        :class="['refresh-icon', { 'spinning': loading }]"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
          fill="currentColor"
        />
      </svg>
      <span>{{ loading ? '刷新中...' : '刷新状态' }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  updatedAt: {
    type: String,
    default: ''
  },
  lastAction: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['refresh'])
</script>

<style scoped>
.info-section {
  padding: 0 20px;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 8px;
}

.info-error {
  border-color: rgba(239, 68, 68, 0.15);
  background: rgba(239, 68, 68, 0.04);
}

.info-label {
  font-size: 13px;
  color: #64748b;
  flex-shrink: 0;
}

.info-value {
  font-size: 13px;
  color: #cbd5e1;
  text-align: right;
  font-weight: 500;
}

.info-error .info-value {
  color: #fca5a5;
}

.refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  margin-top: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: #e2e8f0;
}

.refresh-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>
