import React, { useState, useEffect, useCallback } from 'react'

// 寵物類型
export type PetType = 'cat' | 'dog' | 'rabbit' | 'hamster' | 'bird'

// 寵物成長階段
export type GrowthStage = 'egg' | 'baby' | 'child' | 'teen' | 'adult'

// 寵物心情
export type PetMood = 'ecstatic' | 'happy' | 'content' | 'hungry' | 'sad' | 'sick'

// 寵物狀態介面
export interface PetStats {
  hunger: number      // 飽食度 0-100
  happiness: number   // 快樂度 0-100
  health: number      // 健康度 0-100
  energy: number      // 精力 0-100
  cleanliness: number // 清潔度 0-100
}

// 寵物資料
export interface PetData {
  id: string
  name: string
  type: PetType
  stage: GrowthStage
  stats: PetStats
  xp: number
  level: number
  birthDate: string
  lastFed: string
  lastPlayed: string
  lastCleaned: string
  lastSlept: string
  isAsleep: boolean
  accessories: string[]
}

// 寵物類型資訊
export const PET_TYPES: Record<PetType, { emoji: string; name: string; color: string }> = {
  cat: { emoji: '🐱', name: '小貓咪', color: '#FFB74D' },
  dog: { emoji: '🐕', name: '小狗狗', color: '#8D6E63' },
  rabbit: { emoji: '🐰', name: '小兔兔', color: '#F8BBD9' },
  hamster: { emoji: '🐹', name: '小倉鼠', color: '#FFCC80' },
  bird: { emoji: '🐦', name: '小鳥兒', color: '#81D4FA' }
}

// 成長階段資訊
export const GROWTH_STAGES: Record<GrowthStage, { name: string; xpRequired: number; sizeMultiplier: number }> = {
  egg: { name: '蛋', xpRequired: 0, sizeMultiplier: 0.5 },
  baby: { name: '寶寶', xpRequired: 100, sizeMultiplier: 0.6 },
  child: { name: '幼年', xpRequired: 500, sizeMultiplier: 0.75 },
  teen: { name: '少年', xpRequired: 1500, sizeMultiplier: 0.9 },
  adult: { name: '成年', xpRequired: 4000, sizeMultiplier: 1.0 }
}

// 根據數值計算心情
export function getPetMood(stats: PetStats): PetMood {
  const avg = (stats.hunger + stats.happiness + stats.health) / 3
  
  if (stats.health < 20) return 'sick'
  if (stats.hunger < 20) return 'hungry'
  if (stats.happiness < 30) return 'sad'
  if (avg >= 90) return 'ecstatic'
  if (avg >= 70) return 'happy'
  return 'content'
}

// 心情表情
export const MOOD_EXPRESSIONS: Record<PetMood, { emoji: string; label: string }> = {
  ecstatic: { emoji: '🤩', label: '超開心' },
  happy: { emoji: '😊', label: '開心' },
  content: { emoji: '😌', label: '滿足' },
  hungry: { emoji: '😫', label: '好餓' },
  sad: { emoji: '😢', label: '難過' },
  sick: { emoji: '🤒', label: '生病了' }
}

// 根據 XP 計算成長階段
export function getGrowthStage(xp: number): GrowthStage {
  if (xp >= GROWTH_STAGES.adult.xpRequired) return 'adult'
  if (xp >= GROWTH_STAGES.teen.xpRequired) return 'teen'
  if (xp >= GROWTH_STAGES.child.xpRequired) return 'child'
  if (xp >= GROWTH_STAGES.baby.xpRequired) return 'baby'
  return 'egg'
}

// 計算等級
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 10)) + 1
}

// 預設寵物
export function createDefaultPet(name: string, type: PetType): PetData {
  const now = new Date().toISOString()
  return {
    id: `pet-${Date.now()}`,
    name,
    type,
    stage: 'egg',
    stats: {
      hunger: 80,
      happiness: 80,
      health: 100,
      energy: 100,
      cleanliness: 100
    },
    xp: 0,
    level: 1,
    birthDate: now,
    lastFed: now,
    lastPlayed: now,
    lastCleaned: now,
    lastSlept: now,
    isAsleep: false,
    accessories: []
  }
}

// ===== 寵物元件 =====

interface PetDisplayProps {
  pet: PetData
  isAnimating?: boolean
  animation?: 'idle' | 'eating' | 'playing' | 'sleeping' | 'happy' | 'sad'
  onClick?: () => void
  size?: number
}

export function PetDisplay({ pet, isAnimating = true, animation = 'idle', onClick, size = 120 }: PetDisplayProps) {
  const typeInfo = PET_TYPES[pet.type]
  const stageInfo = GROWTH_STAGES[pet.stage]
  const mood = getPetMood(pet.stats)
  const actualSize = size * stageInfo.sizeMultiplier
  const accessoryIcon = (id: string) => {
    switch (id) {
      case 'bow': return '🎀'
      case 'hat': return '🎩'
      case 'scarf': return '🧣'
      case 'ball': return '⚽'
      case 'bell': return '🔔'
      default: return '🎁'
    }
  }
  
  // 蛋的特殊顯示
  if (pet.stage === 'egg') {
    return (
      <div 
        className={`pet-display pet-egg ${isAnimating ? 'wobble' : ''}`}
        onClick={onClick}
        style={{ 
          width: actualSize, 
          height: actualSize * 1.2,
          cursor: onClick ? 'pointer' : 'default'
        }}
      >
        <div className="egg-shell">
          🥚
          <div className="egg-crack"></div>
        </div>
        <div className="egg-progress">
          <div className="egg-progress-fill" style={{ width: `${(pet.xp / GROWTH_STAGES.baby.xpRequired) * 100}%` }} />
        </div>
      </div>
    )
  }
  
  return (
    <div 
      className={`pet-display pet-${pet.type} pet-${animation} ${pet.isAsleep ? 'sleeping' : ''}`}
      onClick={onClick}
      style={{ 
        width: actualSize, 
        height: actualSize,
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <div className="pet-body" style={{ fontSize: actualSize * 0.6 }}>
        {typeInfo.emoji}
      </div>
      
      {/* 心情泡泡 */}
      <div className="pet-mood-bubble">
        {pet.isAsleep ? '💤' : MOOD_EXPRESSIONS[mood].emoji}
      </div>
      
      {/* 配件圖示（最多2個以免擁擠） */}
      {pet.accessories && pet.accessories.length > 0 && (
        <div className="pet-accessories" style={{ position: 'absolute', top: -8, right: -8, display: 'flex', gap: 4 }}>
          {pet.accessories.slice(0,2).map((a) => (
            <span key={a} className="pet-acc-icon" title={a} style={{ fontSize: actualSize * 0.2 }}>{accessoryIcon(a)}</span>
          ))}
        </div>
      )}

      {/* 等級標籤 */}
      <div className="pet-level">Lv.{pet.level}</div>
      
      {/* 特效 */}
      {animation === 'eating' && <div className="pet-effect">🍖✨</div>}
      {animation === 'playing' && <div className="pet-effect">⚽🎾</div>}
      {animation === 'happy' && <div className="pet-effect hearts">💕💖💕</div>}
    </div>
  )
}

// ===== 狀態條元件 =====

interface StatBarProps {
  label: string
  value: number
  icon: string
  color: string
}

export function StatBar({ label, value, icon, color }: StatBarProps) {
  const getStatus = () => {
    if (value >= 80) return 'excellent'
    if (value >= 50) return 'good'
    if (value >= 30) return 'warning'
    return 'danger'
  }
  
  return (
    <div className={`stat-bar stat-${getStatus()}`}>
      <div className="stat-label">
        <span className="stat-icon">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="stat-track">
        <div 
          className="stat-fill"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <div className="stat-value">{Math.round(value)}%</div>
    </div>
  )
}

// ===== 互動按鈕 =====

interface ActionButtonProps {
  icon: string
  label: string
  onClick: () => void
  disabled?: boolean
  cooldown?: number
}

export function ActionButton({ icon, label, onClick, disabled, cooldown }: ActionButtonProps) {
  return (
    <button 
      className={`pet-action-btn ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="action-icon">{icon}</span>
      <span className="action-label">{label}</span>
      {cooldown && cooldown > 0 && (
        <span className="action-cooldown">{cooldown}s</span>
      )}
    </button>
  )
}

// ===== 寵物選擇器 =====

interface PetSelectorProps {
  onSelect: (type: PetType, name: string) => void
}

export function PetSelector({ onSelect }: PetSelectorProps) {
  const [selectedType, setSelectedType] = useState<PetType>('cat')
  const [name, setName] = useState('')
  
  const handleConfirm = () => {
    if (name.trim()) {
      onSelect(selectedType, name.trim())
    }
  }
  
  return (
    <div className="pet-selector">
      <h3>🎉 領養你的寵物夥伴</h3>
      
      <div className="pet-type-grid">
        {(Object.keys(PET_TYPES) as PetType[]).map(type => (
          <div 
            key={type}
            className={`pet-type-option ${selectedType === type ? 'selected' : ''}`}
            onClick={() => setSelectedType(type)}
          >
            <span className="pet-type-emoji">{PET_TYPES[type].emoji}</span>
            <span className="pet-type-name">{PET_TYPES[type].name}</span>
          </div>
        ))}
      </div>
      
      <div className="pet-name-input">
        <label>幫牠取個名字：</label>
        <input 
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：小花、Lucky..."
          maxLength={10}
        />
      </div>
      
      <button 
        className="confirm-adopt-btn"
        onClick={handleConfirm}
        disabled={!name.trim()}
      >
        🏠 領養 {PET_TYPES[selectedType].name}
      </button>
    </div>
  )
}

// ===== 主寵物面板 =====

interface PetPanelProps {
  focusXpEarned?: number
  onFocusComplete?: () => void
}

export function PetPanel({ focusXpEarned = 0 }: PetPanelProps) {
  const [pet, setPet] = useState<PetData | null>(() => {
    const saved = localStorage.getItem('myPet')
    return saved ? JSON.parse(saved) : null
  })
  const [animation, setAnimation] = useState<'idle' | 'eating' | 'playing' | 'sleeping' | 'happy' | 'sad'>('idle')
  const [feedCooldown, setFeedCooldown] = useState(0)
  const [playCooldown, setPlayCooldown] = useState(0)
  const [showShop, setShowShop] = useState(false)
  
  // 儲存寵物資料
  useEffect(() => {
    if (pet) {
      localStorage.setItem('myPet', JSON.stringify(pet))
    }
  }, [pet])
  
  // 處理專注獲得的 XP
  useEffect(() => {
    if (focusXpEarned > 0 && pet) {
      feedPet(focusXpEarned)
    }
  }, [focusXpEarned])
  
  // 時間流逝效果
  useEffect(() => {
    if (!pet) return
    
    const interval = setInterval(() => {
      setPet(prev => {
        if (!prev) return prev
        
        const now = Date.now()
        const lastUpdate = new Date(prev.lastFed).getTime()
        const hoursPassed = (now - lastUpdate) / (1000 * 60 * 60)
        
        // 每小時降低數值
        const hungerDrop = Math.min(hoursPassed * 5, 50)
        const happinessDrop = Math.min(hoursPassed * 3, 30)
        const cleanlinessDrop = Math.min(hoursPassed * 2, 20)
        
        const newStats = {
          ...prev.stats,
          hunger: Math.max(0, prev.stats.hunger - hungerDrop * 0.01),
          happiness: Math.max(0, prev.stats.happiness - happinessDrop * 0.01),
          cleanliness: Math.max(0, prev.stats.cleanliness - cleanlinessDrop * 0.01)
        }
        
        // 如果數值太低，健康下降
        if (newStats.hunger < 20 || newStats.cleanliness < 20) {
          newStats.health = Math.max(0, newStats.health - 0.1)
        }
        
        return { ...prev, stats: newStats }
      })
    }, 60000) // 每分鐘更新
    
    return () => clearInterval(interval)
  }, [pet])
  
  // 冷卻計時器
  useEffect(() => {
    const interval = setInterval(() => {
      setFeedCooldown(prev => Math.max(0, prev - 1))
      setPlayCooldown(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  
  // 領養寵物
  const adoptPet = (type: PetType, name: string) => {
    const newPet = createDefaultPet(name, type)
    setPet(newPet)
  }
  
  // 餵食
  const feedPet = useCallback((xpAmount: number = 30) => {
    if (!pet || feedCooldown > 0) return
    
    setAnimation('eating')
    setFeedCooldown(10)
    
    setTimeout(() => {
      setPet(prev => {
        if (!prev) return prev
        
        const newXp = prev.xp + xpAmount
        const newStage = getGrowthStage(newXp)
        const newLevel = calculateLevel(newXp)
        
        return {
          ...prev,
          xp: newXp,
          level: newLevel,
          stage: newStage,
          stats: {
            ...prev.stats,
            hunger: Math.min(100, prev.stats.hunger + 25),
            health: Math.min(100, prev.stats.health + 5)
          },
          lastFed: new Date().toISOString()
        }
      })
      setAnimation('happy')
      setTimeout(() => setAnimation('idle'), 1500)
    }, 1500)
  }, [pet, feedCooldown])
  
  // 玩耍
  const playWithPet = useCallback(() => {
    if (!pet || playCooldown > 0 || pet.stats.energy < 20) return
    
    setAnimation('playing')
    setPlayCooldown(30)
    
    setTimeout(() => {
      setPet(prev => {
        if (!prev) return prev
        
        return {
          ...prev,
          xp: prev.xp + 10,
          stats: {
            ...prev.stats,
            happiness: Math.min(100, prev.stats.happiness + 20),
            energy: Math.max(0, prev.stats.energy - 15),
            hunger: Math.max(0, prev.stats.hunger - 10)
          },
          lastPlayed: new Date().toISOString()
        }
      })
      setAnimation('happy')
      setTimeout(() => setAnimation('idle'), 1500)
    }, 2000)
  }, [pet, playCooldown])
  
  // 清潔
  const cleanPet = useCallback(() => {
    if (!pet) return
    
    setPet(prev => {
      if (!prev) return prev
      
      return {
        ...prev,
        xp: prev.xp + 5,
        stats: {
          ...prev.stats,
          cleanliness: 100,
          happiness: Math.min(100, prev.stats.happiness + 10)
        },
        lastCleaned: new Date().toISOString()
      }
    })
    setAnimation('happy')
    setTimeout(() => setAnimation('idle'), 1000)
  }, [pet])
  
  // 睡覺/喚醒
  const toggleSleep = useCallback(() => {
    if (!pet) return
    
    setPet(prev => {
      if (!prev) return prev
      
      if (prev.isAsleep) {
        // 喚醒
        return {
          ...prev,
          isAsleep: false,
          stats: {
            ...prev.stats,
            energy: 100
          }
        }
      } else {
        // 睡覺
        return {
          ...prev,
          isAsleep: true,
          lastSlept: new Date().toISOString()
        }
      }
    })
    setAnimation(pet.isAsleep ? 'idle' : 'sleeping')
  }, [pet])
  
  // 撫摸
  const petThePet = useCallback(() => {
    if (!pet || pet.isAsleep) return
    
    setAnimation('happy')
    setPet(prev => {
      if (!prev) return prev
      return {
        ...prev,
        stats: {
          ...prev.stats,
          happiness: Math.min(100, prev.stats.happiness + 5)
        }
      }
    })
    setTimeout(() => setAnimation('idle'), 1000)
  }, [pet])
  
  // 尚未領養
  if (!pet) {
    return (
      <div className="pet-panel no-pet">
        <PetSelector onSelect={adoptPet} />
      </div>
    )
  }
  
  const mood = getPetMood(pet.stats)
  const stageInfo = GROWTH_STAGES[pet.stage]
  const nextStage = pet.stage === 'adult' ? null : 
    (Object.entries(GROWTH_STAGES).find(([_, info]) => info.xpRequired > pet.xp)?.[0] as GrowthStage)
  const xpToNext = nextStage ? GROWTH_STAGES[nextStage].xpRequired - pet.xp : 0
  
  return (
    <div className="pet-panel">
      <div className="pet-header">
        <div className="pet-info">
          <h3>{pet.name}</h3>
          <div className="pet-badges">
            <span className="badge stage">{stageInfo.name}</span>
            <span className="badge level">Lv.{pet.level}</span>
            <span className="badge mood">{MOOD_EXPRESSIONS[mood].emoji} {MOOD_EXPRESSIONS[mood].label}</span>
          </div>
        </div>
        <button className="shop-btn" onClick={() => setShowShop(!showShop)}>
          🛒 商店
        </button>
      </div>
      
      {/* 寵物顯示區 */}
      <div className="pet-stage">
        <PetDisplay 
          pet={pet} 
          animation={animation}
          onClick={petThePet}
          size={150}
        />
        
        {/* XP 進度 */}
        {nextStage && (
          <div className="growth-progress">
            <div className="growth-label">
              距離 {GROWTH_STAGES[nextStage].name} 還需 {xpToNext} XP
            </div>
            <div className="growth-bar">
              <div 
                className="growth-fill"
                style={{ 
                  width: `${((pet.xp - stageInfo.xpRequired) / (GROWTH_STAGES[nextStage].xpRequired - stageInfo.xpRequired)) * 100}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* 狀態條 */}
      <div className="pet-stats">
        <StatBar label="飽食度" value={pet.stats.hunger} icon="🍖" color="#FF9800" />
        <StatBar label="快樂度" value={pet.stats.happiness} icon="💖" color="#E91E63" />
        <StatBar label="健康度" value={pet.stats.health} icon="💚" color="#4CAF50" />
        <StatBar label="精力" value={pet.stats.energy} icon="⚡" color="#FFC107" />
        <StatBar label="清潔度" value={pet.stats.cleanliness} icon="✨" color="#03A9F4" />
      </div>
      
      {/* 互動按鈕 */}
      <div className="pet-actions">
        <ActionButton 
          icon="🍖" 
          label="餵食" 
          onClick={() => feedPet(30)}
          disabled={feedCooldown > 0 || pet.isAsleep}
          cooldown={feedCooldown}
        />
        <ActionButton 
          icon="🎾" 
          label="玩耍" 
          onClick={playWithPet}
          disabled={playCooldown > 0 || pet.isAsleep || pet.stats.energy < 20}
          cooldown={playCooldown}
        />
        <ActionButton 
          icon="🛁" 
          label="清潔" 
          onClick={cleanPet}
          disabled={pet.isAsleep || pet.stats.cleanliness >= 95}
        />
        <ActionButton 
          icon={pet.isAsleep ? "☀️" : "💤"} 
          label={pet.isAsleep ? "喚醒" : "睡覺"} 
          onClick={toggleSleep}
        />
        <ActionButton 
          icon="🤗" 
          label="撫摸" 
          onClick={petThePet}
          disabled={pet.isAsleep}
        />
      </div>
      
      {/* 提示訊息 */}
      <div className="pet-tips">
        {pet.stats.hunger < 30 && <div className="tip warning">🍖 {pet.name} 餓了，快餵食牠！</div>}
        {pet.stats.happiness < 30 && <div className="tip warning">💔 {pet.name} 不開心，陪牠玩一下吧！</div>}
        {pet.stats.cleanliness < 30 && <div className="tip warning">🛁 {pet.name} 髒髒的，幫牠洗澡吧！</div>}
        {pet.stats.energy < 20 && !pet.isAsleep && <div className="tip info">💤 {pet.name} 累了，讓牠休息一下吧</div>}
        <div className="tip success">💡 專注學習可以餵養 {pet.name}，完成專注任務獲得食物！</div>
      </div>
      
      {/* 商店 (簡化版) */}
      {showShop && (
        <div className="pet-shop">
          <h4>🛒 寵物商店</h4>
          <p className="coming-soon">更多商品開發中...</p>
          <div className="shop-items">
            <div className="shop-item">
              <span>🎀 蝴蝶結</span>
              <span>100 XP</span>
            </div>
            <div className="shop-item">
              <span>🎩 小帽子</span>
              <span>200 XP</span>
            </div>
            <div className="shop-item">
              <span>🧣 圍巾</span>
              <span>150 XP</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
