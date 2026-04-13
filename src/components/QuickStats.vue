<template>
  <div class="qg" id="quick-stats">
    <!-- 信号强度 -->
    <div class="qc">
      <div class="qi blue">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="1" y="11" width="3" height="6" rx="1.2" fill="#007AFF"/>
          <rect x="5.5" y="7.5" width="3" height="9.5" rx="1.2" fill="#007AFF"/>
          <rect x="10" y="4" width="3" height="13" rx="1.2" fill="#007AFF"/>
          <rect x="14.5" y="1" width="3" height="16" rx="1.2" fill="#007AFF" opacity=".35"/>
        </svg>
      </div>
      <div>
        <div class="qn">信号强度</div>
        <div class="qv" id="stat-signal">{{ signalStrength }}</div>
      </div>
    </div>

    <!-- 运行时长 -->
    <div class="qc">
      <div class="qi green">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7.2" stroke="#34C759" stroke-width="1.5"/>
          <line x1="9" y1="9" x2="9" y2="4.5" stroke="#34C759" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="9" y1="9" x2="12.5" y2="11.5" stroke="#34C759" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="9" cy="9" r="1.2" fill="#34C759"/>
        </svg>
      </div>
      <div>
        <div class="qn">运行时长</div>
        <div class="qv" id="stat-uptime">{{ uptimeFormatted }}</div>
      </div>
    </div>

    <!-- 本地地址 -->
    <div class="qc">
      <div class="qi purple">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7.2" stroke="#7F77DD" stroke-width="1.5"/>
          <circle cx="9" cy="9" r="3.5" stroke="#7F77DD" stroke-width="1.5"/>
          <circle cx="9" cy="9" r="1.2" fill="#7F77DD"/>
          <line x1="9" y1="1.8" x2="9" y2="3.5" stroke="#7F77DD" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="9" y1="14.5" x2="9" y2="16.2" stroke="#7F77DD" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="1.8" y1="9" x2="3.5" y2="9" stroke="#7F77DD" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="14.5" y1="9" x2="16.2" y2="9" stroke="#7F77DD" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <div>
        <div class="qn">本地地址</div>
        <div class="qv" id="stat-ip">{{ localIP }}</div>
      </div>
    </div>

    <!-- 响应延迟 -->
    <div class="qc">
      <div class="qi amber">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <polyline points="1,11 4,11 5.5,5 7.5,14 9.5,8 11,11 13,11"
                    stroke="#FF9F0A" stroke-width="1.5" stroke-linecap="round"
                    stroke-linejoin="round" fill="none"/>
          <line x1="14" y1="9" x2="17" y2="9"
                stroke="#FF9F0A" stroke-width="1.5" stroke-linecap="round" opacity=".4"/>
        </svg>
      </div>
      <div>
        <div class="qn">响应延迟</div>
        <div class="qv" id="stat-ping">{{ pingLatency }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  signalStrength: {
    type: String,
    default: '—'
  },
  uptimeFormatted: {
    type: String,
    default: '—'
  },
  localIP: {
    type: String,
    default: '—'
  },
  pingLatency: {
    type: String,
    default: '—'
  }
})
</script>

<style scoped>
.qg {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
  margin-bottom: 10px;
}

.qc {
  background: #fff;
  border-radius: 16px;
  padding: 14px 14px 13px;
  border: 0.5px solid var(--color-border-tertiary);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.qc:active {
  transform: scale(0.97);
}

.qi {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qi.blue { background: var(--color-blue-bg); }
.qi.green { background: var(--color-green-bg); }
.qi.amber { background: var(--color-amber-bg); }
.qi.purple { background: var(--color-purple-bg); }

.qn {
  font-size: 12px;
  font-weight: 600;
  color: #1c1c1e;
}

.qv {
  font-size: 11px;
  color: #8E8E93;
  min-height: 14px;
  transition: color 0.3s ease;
}
</style>
