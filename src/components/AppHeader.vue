<template>
  <header class="app-header">
    <div class="header-inner">
      <div class="header-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z" fill="url(#headerBulbGrad)"/>
          <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1z" fill="rgba(255,255,255,0.5)"/>
          <defs>
            <linearGradient id="headerBulbGrad" x1="5" y1="2" x2="19" y2="17">
              <stop offset="0%" stop-color="#fbbf24"/>
              <stop offset="100%" stop-color="#f59e0b"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div class="header-text">
        <h1>WiFi 智能灯控制面板</h1>
        <p class="header-subtitle">Smart Light Control Panel</p>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  padding: 24px 20px 16px;
  text-align: center;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.header-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.header-icon svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.4));
}

.header-text {
  text-align: left;
}

h1 {
  font-size: 20px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
  letter-spacing: 0.5px;
}

.header-subtitle {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.7);
  margin: 2px 0 0 0;
  font-weight: 400;
  letter-spacing: 1px;
  text-transform: uppercase;
}
</style>
