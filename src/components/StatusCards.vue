<template>
  <div class="status-cards">
    <!-- 设备状态卡片 -->
    <div :class="['status-card', deviceOnline ? 'card-online' : 'card-offline']">
      <div class="card-header">
        <span class="card-dot" :class="deviceOnline ? 'dot-online' : 'dot-offline'"></span>
        <span class="card-label">设备状态</span>
      </div>
      <div class="card-value">{{ deviceOnline ? '在线' : '离线' }}</div>
    </div>

    <!-- 灯状态卡片 -->
    <div :class="['status-card', lightOn ? 'card-light-on' : 'card-light-off']">
      <div class="card-header">
        <span class="card-icon">{{ lightOn ? '💡' : '🔌' }}</span>
        <span class="card-label">灯光状态</span>
      </div>
      <div class="card-value">{{ lightOn ? '已开启' : '已关闭' }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  deviceOnline: {
    type: Boolean,
    default: false
  },
  lightOn: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.status-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  padding: 0 20px;
  margin-bottom: 24px;
}

.status-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 16px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.4s ease;
}

.card-online {
  border-color: rgba(16, 185, 129, 0.2);
  background: rgba(16, 185, 129, 0.05);
}

.card-offline {
  border-color: rgba(239, 68, 68, 0.15);
  background: rgba(239, 68, 68, 0.04);
}

.card-light-on {
  border-color: rgba(251, 191, 36, 0.2);
  background: rgba(251, 191, 36, 0.05);
}

.card-light-off {
  border-color: rgba(148, 163, 184, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.card-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-online {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
  animation: pulse-green 2s infinite;
}

.dot-offline {
  background: #ef4444;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.4);
}

.card-icon {
  font-size: 14px;
  line-height: 1;
}

.card-label {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.card-value {
  font-size: 20px;
  font-weight: 700;
  color: #f1f5f9;
}

.card-online .card-value {
  color: #6ee7b7;
}

.card-offline .card-value {
  color: #fca5a5;
}

.card-light-on .card-value {
  color: #fbbf24;
}

@keyframes pulse-green {
  0%, 100% {
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
  }
  50% {
    box-shadow: 0 0 16px rgba(16, 185, 129, 0.9);
  }
}
</style>
