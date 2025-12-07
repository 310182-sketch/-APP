import React from 'react'
import { getMoodEmoji } from './Character'

export function FeatureGuide() {
  return (
    <div className="feature-guide-container" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px', borderBottom: '2px solid var(--md-sys-color-outline)', paddingBottom: '12px' }}>
        📖 FocusBuddy 功能說明
      </h2>

      <section className="guide-section glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3>🎮 專注模式 (Focus Mode)</h3>
        <p>這是您的核心生產力工具。結合了番茄鐘與遊戲化元素。</p>
        <ul>
          <li><strong>計時器</strong>：設定專注時間（預設 25 分鐘），開始專注。</li>
          <li><strong>天氣系統</strong>：背景與白噪音會隨天氣變化（晴天、雨天、雷雨等）。</li>
          <li><strong>角色陪伴</strong>：您的虛擬角色與 NPC 會陪伴您一起工作。</li>
          <li><strong>靈魂之樹</strong>：專注時會種植靈魂之樹，完成後結出果實。</li>
        </ul>
      </section>

      <section className="guide-section glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3>📊 心情與 XP 機制</h3>
        <p>您的生產力直接影響角色的心情狀態。透過累積 XP 來改善心情。</p>
        <div className="mood-table" style={{ marginTop: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '8px', fontWeight: 'bold', padding: '8px', background: 'var(--md-sys-color-surface-container)' }}>
            <div>XP 範圍</div>
            <div>心情</div>
            <div>狀態描述</div>
          </div>
          {[
            { range: '0 - 500', mood: 'anxious', label: '焦慮不安', emoji: '🚬' },
            { range: '500 - 1200', mood: 'calm', label: '平靜安穩', emoji: '☕' },
            { range: '1200 - 2100', mood: 'happy', label: '心情愉悅', emoji: '🎹' },
            { range: '2100+', mood: 'excited', label: '熱血沸騰', emoji: '🎸' }
          ].map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '8px', padding: '8px', borderBottom: '1px solid var(--md-sys-color-outline)' }}>
              <div>{item.range}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{item.emoji}</span>
                <span className={`xp-text-${item.mood}`}>{item.mood}</span>
              </div>
              <div>{item.label}</div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: '12px', fontSize: '0.9em', opacity: 0.8 }}>
          * 每完成一個時間格 +30 XP，連續完成有額外獎勵。
        </p>
      </section>

      <section className="guide-section glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3>🐾 寵物系統</h3>
        <p>領養並照顧您的虛擬寵物。</p>
        <ul>
          <li><strong>餵食</strong>：專注完成後獲得的 XP 會自動轉換為寵物食物。</li>
          <li><strong>成長</strong>：寵物升級後可解鎖成就。</li>
          <li><strong>裝扮</strong>：在商店購買飾品（帽子、圍巾等）幫寵物打扮。</li>
        </ul>
      </section>

      <section className="guide-section glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3>📅 日曆與代辦</h3>
        <ul>
          <li><strong>日曆</strong>：查看每日行程，支援拖拉建立行程。</li>
          <li><strong>代辦事項</strong>：管理您的待辦清單，可設定優先級與標籤。</li>
          <li><strong>備忘錄</strong>：隨手記錄靈感與筆記。</li>
        </ul>
      </section>

      <section className="guide-section glass-card" style={{ padding: '20px' }}>
        <h3>🎨 個人化設定</h3>
        <ul>
          <li><strong>角色外觀</strong>：自訂髮型、髮色、膚色與服裝風格（龐克、街頭等）。</li>
          <li><strong>NPC 夥伴</strong>：設定陪伴您的 NPC 數量與外觀。</li>
          <li><strong>主題</strong>：目前採用 Material Design 3 風格，支援高對比模式。</li>
        </ul>
      </section>
    </div>
  )
}
