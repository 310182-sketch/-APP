import React, { useState, useEffect } from 'react'

// 角色外觀選項
export interface CharacterAppearance {
  gender: 'male' | 'female'
  skinTone: 'light' | 'medium' | 'tan' | 'dark'
  hairStyle: 'short' | 'long' | 'curly' | 'ponytail' | 'bun'
  hairColor: 'black' | 'brown' | 'blonde' | 'red' | 'blue' | 'pink'
  outfit: 'casual' | 'school' | 'formal' | 'cozy'
}

// 角色狀態（受心情指數影響）
export type MoodState = 'anxious' | 'calm' | 'happy' | 'excited'

export function getMoodFromXP(xp: number): MoodState {
  if (xp < 500) return 'anxious'
  if (xp < 1200) return 'calm'
  if (xp < 2100) return 'happy'
  return 'excited'
}

export function getMoodEmoji(mood: MoodState): string {
  switch (mood) {
    case 'anxious': return '😰'
    case 'calm': return '😌'
    case 'happy': return '😊'
    case 'excited': return '🤩'
  }
}

export function getMoodLabel(mood: MoodState): string {
  switch (mood) {
    case 'anxious': return '焦慮、憂鬱'
    case 'calm': return '平靜、悠閒'
    case 'happy': return '開心、滿足'
    case 'excited': return '亢奮、精力充沛'
  }
}

// 更真實的膚色 - 帶有自然色調變化
const SKIN_COLORS: Record<string, { 
  main: string; shadow: string; blush: string; highlight: string; 
  lip: string; eyeArea: string 
}> = {
  light: { 
    main: '#FAE3D0', shadow: '#E8C9B4', blush: '#F5A9A9', 
    highlight: '#FFF5ED', lip: '#E8888A', eyeArea: '#F5DCD0' 
  },
  medium: { 
    main: '#E8C4A0', shadow: '#D4A882', blush: '#E89090', 
    highlight: '#F5DCC8', lip: '#D07070', eyeArea: '#DDB89A' 
  },
  tan: { 
    main: '#C99E6C', shadow: '#A87E50', blush: '#C87070', 
    highlight: '#DDB890', lip: '#B86060', eyeArea: '#B88E60' 
  },
  dark: { 
    main: '#8B6240', shadow: '#6B4828', blush: '#A06060', 
    highlight: '#A87858', lip: '#904848', eyeArea: '#7A5535' 
  }
}

// 更真實的髮色 - 帶有多層次光澤
const HAIR_COLORS: Record<string, { 
  main: string; highlight: string; shadow: string; 
  strand: string; shine: string 
}> = {
  black: { 
    main: '#1A1A1A', highlight: '#3A3A3A', shadow: '#0A0A0A', 
    strand: '#2A2A2A', shine: '#5A5A5A' 
  },
  brown: { 
    main: '#5A3A20', highlight: '#7A5030', shadow: '#3A2210', 
    strand: '#6A4428', shine: '#9A7050' 
  },
  blonde: { 
    main: '#D4A850', highlight: '#E8C878', shadow: '#B89038', 
    strand: '#C8B060', shine: '#F5E0A0' 
  },
  red: { 
    main: '#8B3020', highlight: '#B04030', shadow: '#6A2018', 
    strand: '#9A3828', shine: '#C85040' 
  },
  blue: { 
    main: '#3A6080', highlight: '#5080A0', shadow: '#284060', 
    strand: '#4A7090', shine: '#70A0C0' 
  },
  pink: { 
    main: '#C07088', highlight: '#E090A8', shadow: '#A05070', 
    strand: '#D08098', shine: '#F0B0C8' 
  }
}

// 更精緻的服裝配色
const OUTFIT_COLORS: Record<string, { 
  primary: string; secondary: string; accent: string; 
  shadow: string; fold: string; button: string 
}> = {
  casual: { 
    primary: '#6EB5D0', secondary: '#4A9AB8', accent: '#FFFFFF', 
    shadow: '#3A8098', fold: '#5AA5C0', button: '#E0E0E0' 
  },
  school: { 
    primary: '#2C3E50', secondary: '#1A2530', accent: '#C0392B', 
    shadow: '#1A2838', fold: '#3A5060', button: '#D4AF37' 
  },
  formal: { 
    primary: '#5A4A68', secondary: '#3A2A48', accent: '#D4AF37', 
    shadow: '#2A1A38', fold: '#6A5A78', button: '#FFD700' 
  },
  cozy: { 
    primary: '#E8A830', secondary: '#C88820', accent: '#FFF8E8', 
    shadow: '#B07818', fold: '#D09028', button: '#8B4513' 
  }
}

interface CharacterProps {
  appearance: CharacterAppearance
  mood: MoodState
  isWorking: boolean
  isResting: boolean
  size?: number
}

export function Character({ appearance, mood, isWorking, isResting, size = 120 }: CharacterProps) {
  const [bounce, setBounce] = useState(false)
  const [blink, setBlink] = useState(false)
  const [breathe, setBreathe] = useState(0)
  const [eyeDir, setEyeDir] = useState({ x: 0, y: 0 })

  // 呼吸動畫
  useEffect(() => {
    const breatheInterval = setInterval(() => {
      setBreathe(prev => (prev + 1) % 60)
    }, 50)
    return () => clearInterval(breatheInterval)
  }, [])

  // 隨機眨眼 - 更自然的頻率
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 120)
      // 有時候連續眨兩次
      if (Math.random() > 0.7) {
        setTimeout(() => {
          setBlink(true)
          setTimeout(() => setBlink(false), 100)
        }, 250)
      }
    }, 2500 + Math.random() * 3000)
    return () => clearInterval(blinkInterval)
  }, [])

  // 眼睛隨機看向不同方向
  useEffect(() => {
    const lookInterval = setInterval(() => {
      if (Math.random() > 0.5) {
        setEyeDir({ 
          x: (Math.random() - 0.5) * 3, 
          y: (Math.random() - 0.5) * 2 
        })
        setTimeout(() => setEyeDir({ x: 0, y: 0 }), 1000 + Math.random() * 2000)
      }
    }, 3000 + Math.random() * 2000)
    return () => clearInterval(lookInterval)
  }, [])

  // 工作時偶爾點頭
  useEffect(() => {
    if (isWorking) {
      const bounceInterval = setInterval(() => {
        setBounce(true)
        setTimeout(() => setBounce(false), 300)
      }, 2000 + Math.random() * 3000)
      return () => clearInterval(bounceInterval)
    }
  }, [isWorking])

  const skin = SKIN_COLORS[appearance.skinTone]
  const hair = HAIR_COLORS[appearance.hairColor]
  const outfit = OUTFIT_COLORS[appearance.outfit]
  
  // 呼吸效果
  const breatheScale = 1 + Math.sin(breathe * 0.1) * 0.008
  const shoulderOffset = Math.sin(breathe * 0.1) * 0.5

  // 根據心情調整表情
  const getEyeExpression = () => {
    if (blink) return { scaleY: 0.08, happy: false }
    switch (mood) {
      case 'anxious': return { scaleY: 0.75, happy: false, worried: true }
      case 'calm': return { scaleY: 0.9, happy: false }
      case 'happy': return { scaleY: 0.85, happy: true }
      case 'excited': return { scaleY: 1, happy: true, sparkle: true }
      default: return { scaleY: 1, happy: false }
    }
  }

  const eye = getEyeExpression()
  const isMale = appearance.gender === 'male'
  const uniqueId = `char-${appearance.skinTone}-${appearance.hairColor}`

  return (
    <div 
      className={`character-container ${isWorking ? 'working' : ''} ${isResting ? 'resting' : ''}`}
      style={{ 
        width: size, 
        height: size * 1.5,
        animation: bounce ? 'characterBounce 0.3s ease' : undefined
      }}
    >
      <svg 
        viewBox="0 0 100 150" 
        width={size} 
        height={size * 1.5}
        className="character-svg"
      >
        <defs>
          {/* 更精細的漸層定義 */}
          <radialGradient id={`skinGrad-${uniqueId}`} cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor={skin.highlight} />
            <stop offset="40%" stopColor={skin.main} />
            <stop offset="100%" stopColor={skin.shadow} />
          </radialGradient>
          
          <radialGradient id={`skinGrad2-${uniqueId}`} cx="55%" cy="40%" r="60%">
            <stop offset="0%" stopColor={skin.main} />
            <stop offset="100%" stopColor={skin.shadow} />
          </radialGradient>
          
          <radialGradient id={`hairGrad-${uniqueId}`} cx="35%" cy="25%" r="75%">
            <stop offset="0%" stopColor={hair.shine} />
            <stop offset="30%" stopColor={hair.highlight} />
            <stop offset="60%" stopColor={hair.main} />
            <stop offset="100%" stopColor={hair.shadow} />
          </radialGradient>
          
          <linearGradient id={`hairGrad2-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={hair.highlight} />
            <stop offset="50%" stopColor={hair.main} />
            <stop offset="100%" stopColor={hair.shadow} />
          </linearGradient>
          
          <linearGradient id={`outfitGrad-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={outfit.primary} />
            <stop offset="60%" stopColor={outfit.secondary} />
            <stop offset="100%" stopColor={outfit.shadow} />
          </linearGradient>
          
          {/* 眼睛漸層 */}
          <radialGradient id={`eyeWhite-${uniqueId}`} cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F0F0F0" />
          </radialGradient>
          
          <radialGradient id={`iris-${uniqueId}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#6B5040" />
            <stop offset="60%" stopColor="#4A3525" />
            <stop offset="100%" stopColor="#2A1A10" />
          </radialGradient>
          
          {/* 嘴唇漸層 */}
          <linearGradient id={`lipGrad-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={skin.lip} />
            <stop offset="100%" stopColor={skin.shadow} />
          </linearGradient>
          
          {/* 濾鏡效果 */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15"/>
          </filter>
          
          <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feComponentTransfer in="SourceAlpha">
              <feFuncA type="table" tableValues="1 0" />
            </feComponentTransfer>
            <feGaussianBlur stdDeviation="1" />
            <feOffset dx="0" dy="1" result="offsetblur" />
            <feFlood floodColor="#000" floodOpacity="0.2" result="color" />
            <feComposite in2="offsetblur" operator="in" />
            <feComposite in2="SourceAlpha" operator="in" />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode />
            </feMerge>
          </filter>
        </defs>

        {/* 地面陰影 */}
        <ellipse cx="50" cy="147" rx="25" ry="3" fill="rgba(0,0,0,0.12)" />
        
        {/* ===== 身體（帶呼吸動畫）===== */}
        <g transform={`translate(0, ${-shoulderOffset * 0.5})`}>
          {/* 頸部 */}
          <path 
            d={`M 42 82 Q 42 90 44 95 L 56 95 Q 58 90 58 82`}
            fill={`url(#skinGrad2-${uniqueId})`}
          />
          
          {/* 肩膀與軀幹 */}
          <path 
            d={`M 22 105 
                Q 20 95 35 92 
                L 44 95 
                Q 50 98 56 95 
                L 65 92 
                Q 80 95 78 105 
                L 80 130 
                Q 80 145 50 145 
                Q 20 145 20 130 
                Z`}
            fill={`url(#outfitGrad-${uniqueId})`}
            filter="url(#softShadow)"
          />
          
          {/* 衣服褶皺細節 */}
          <path d="M 35 100 Q 40 110 38 125" fill="none" stroke={outfit.fold} strokeWidth="1" opacity="0.4" />
          <path d="M 65 100 Q 60 110 62 125" fill="none" stroke={outfit.fold} strokeWidth="1" opacity="0.4" />
          <path d="M 45 105 Q 50 115 55 105" fill="none" stroke={outfit.shadow} strokeWidth="0.8" opacity="0.3" />
          
          {/* 領口細節 */}
          {appearance.outfit === 'casual' && (
            <g>
              <path d="M 44 95 Q 50 100 56 95" fill={skin.main} />
              <ellipse cx="50" cy="94" rx="8" ry="3" fill={outfit.secondary} />
            </g>
          )}
          {appearance.outfit === 'school' && (
            <g>
              <path d="M 42 94 L 50 106 L 58 94" fill={outfit.accent} />
              <path d="M 44 95 Q 50 100 56 95" fill="white" />
              <path d="M 46 96 L 50 104 L 54 96" fill={outfit.accent} opacity="0.7" />
            </g>
          )}
          {appearance.outfit === 'formal' && (
            <g>
              <path d="M 44 95 Q 50 100 56 95" fill="white" />
              <rect x="48" y="98" width="4" height="20" rx="1" fill={outfit.accent} />
            </g>
          )}
          {appearance.outfit === 'cozy' && (
            <g>
              <ellipse cx="50" cy="94" rx="12" ry="4" fill={outfit.fold} />
              <path d="M 38 94 Q 50 98 62 94" fill="none" stroke={outfit.shadow} strokeWidth="1.5" />
            </g>
          )}
          
          {/* 手臂 */}
          <g transform={`translate(0, ${shoulderOffset})`}>
            {/* 左手臂 */}
            <path 
              d={`M 22 102 Q 15 108 18 125 Q 20 135 24 138`}
              fill="none"
              stroke={outfit.primary}
              strokeWidth="14"
              strokeLinecap="round"
            />
            <ellipse cx="24" cy="138" rx="6" ry="5" fill={skin.main} />
            {/* 手指提示 */}
            <path d="M 20 140 Q 22 143 24 140" fill="none" stroke={skin.shadow} strokeWidth="0.8" opacity="0.4" />
            
            {/* 右手臂 */}
            <path 
              d={`M 78 102 Q 85 108 82 125 Q 80 135 76 138`}
              fill="none"
              stroke={outfit.primary}
              strokeWidth="14"
              strokeLinecap="round"
            />
            <ellipse cx="76" cy="138" rx="6" ry="5" fill={skin.main} />
            <path d="M 74 140 Q 76 143 78 140" fill="none" stroke={skin.shadow} strokeWidth="0.8" opacity="0.4" />
          </g>
        </g>

        {/* ===== 頭部 ===== */}
        <g transform={`scale(${breatheScale}) translate(${(1 - breatheScale) * 50}, ${(1 - breatheScale) * 40})`}>
          {/* 後層頭髮（長髮/馬尾時） */}
          {(appearance.hairStyle === 'long' || appearance.hairStyle === 'ponytail') && (
            <path 
              d={`M 18 50 Q 8 75 20 100 Q 25 108 35 108 L 65 108 Q 75 108 80 100 Q 92 75 82 50`}
              fill={hair.shadow}
              opacity="0.9"
            />
          )}
          
          {/* 耳朵 */}
          <g>
            <ellipse cx="18" cy="52" rx="4" ry="6" fill={skin.main} />
            <ellipse cx="18" cy="52" rx="2.5" ry="4" fill={skin.shadow} opacity="0.3" />
            <ellipse cx="82" cy="52" rx="4" ry="6" fill={skin.main} />
            <ellipse cx="82" cy="52" rx="2.5" ry="4" fill={skin.shadow} opacity="0.3" />
          </g>
          
          {/* 臉部基底 */}
          <ellipse 
            cx="50" cy="50" 
            rx={isMale ? 28 : 30} 
            ry={isMale ? 30 : 32} 
            fill={`url(#skinGrad-${uniqueId})`}
            filter="url(#innerShadow)"
          />
          
          {/* 臉部高光 */}
          <ellipse cx="42" cy="42" rx="12" ry="8" fill={skin.highlight} opacity="0.3" />
          
          {/* 下巴陰影 */}
          <ellipse cx="50" cy="78" rx="15" ry="4" fill={skin.shadow} opacity="0.2" />

          {/* ===== 頭髮（更細緻的層次）===== */}
          <g>
            {/* 主要頭髮形狀 */}
            <path 
              d={(() => {
                switch (appearance.hairStyle) {
                  case 'short':
                    return `M 20 52 
                            Q 18 25 35 15 
                            Q 50 8 65 15 
                            Q 82 25 80 52
                            Q 82 40 75 38 
                            L 25 38 
                            Q 18 40 20 52`
                  case 'long':
                    return `M 16 55 
                            Q 12 20 50 10 
                            Q 88 20 84 55
                            Q 88 35 75 32 
                            L 25 32 
                            Q 12 35 16 55`
                  case 'curly':
                    return `M 14 58 
                            Q 8 25 50 8 
                            Q 92 25 86 58 
                            Q 92 45 80 38 
                            Q 88 28 72 22 
                            Q 78 12 55 10 
                            Q 45 10 28 22 
                            Q 12 28 20 38 
                            Q 8 45 14 58`
                  case 'ponytail':
                    return `M 16 55 
                            Q 12 20 50 10 
                            Q 88 20 84 55
                            Q 88 35 75 32 
                            L 25 32 
                            Q 12 35 16 55`
                  case 'bun':
                    return `M 18 52 
                            Q 16 22 50 12 
                            Q 84 22 82 52
                            Q 84 38 74 35 
                            L 26 35 
                            Q 16 38 18 52`
                  default:
                    return `M 20 52 Q 18 20 50 12 Q 82 20 80 52`
                }
              })()}
              fill={`url(#hairGrad-${uniqueId})`}
            />
            
            {/* 頭髮光澤線條 */}
            <path 
              d="M 30 22 Q 40 18 55 20" 
              fill="none" 
              stroke={hair.shine} 
              strokeWidth="2" 
              opacity="0.5" 
              strokeLinecap="round"
            />
            <path 
              d="M 35 28 Q 45 25 58 27" 
              fill="none" 
              stroke={hair.shine} 
              strokeWidth="1.5" 
              opacity="0.3" 
              strokeLinecap="round"
            />
            
            {/* 髮絲細節 */}
            <path d="M 22 45 Q 25 40 28 45" fill="none" stroke={hair.strand} strokeWidth="1" opacity="0.6" />
            <path d="M 72 45 Q 75 40 78 45" fill="none" stroke={hair.strand} strokeWidth="1" opacity="0.6" />
            
            {/* 瀏海 - 更自然的分層 */}
            <g>
              <path 
                d="M 25 38 Q 32 48 40 38 Q 45 44 50 38 Q 55 44 60 38 Q 68 48 75 38"
                fill={hair.main}
              />
              <path 
                d="M 28 40 Q 35 46 42 40"
                fill={hair.highlight}
                opacity="0.4"
              />
              <path 
                d="M 58 40 Q 65 46 72 40"
                fill={hair.highlight}
                opacity="0.4"
              />
            </g>
            
            {/* 髮飾 */}
            {appearance.hairStyle === 'ponytail' && (
              <g>
                {/* 馬尾 */}
                <ellipse cx="82" cy="28" rx="10" ry="22" fill={hair.main} />
                <ellipse cx="82" cy="22" rx="6" ry="14" fill={hair.highlight} opacity="0.4" />
                <path d="M 78 35 Q 82 30 86 35" fill="none" stroke={hair.shadow} strokeWidth="1" opacity="0.5" />
                {/* 髮圈 */}
                <ellipse cx="74" cy="32" rx="4" ry="5" fill="#FF6B9D" />
                <ellipse cx="74" cy="30" rx="2" ry="3" fill="#FF9BC0" opacity="0.6" />
              </g>
            )}
            {appearance.hairStyle === 'bun' && (
              <g>
                {/* 丸子 */}
                <circle cx="50" cy="6" r="10" fill={hair.main} />
                <circle cx="48" cy="3" r="5" fill={hair.highlight} opacity="0.4" />
                {/* 裝飾 */}
                <circle cx="58" cy="8" r="2" fill="#FFD700" />
              </g>
            )}
            {appearance.hairStyle === 'curly' && (
              <g>
                {/* 捲髮裝飾線 */}
                <path d="M 18 50 Q 12 55 16 60" fill="none" stroke={hair.shadow} strokeWidth="2" opacity="0.6" />
                <path d="M 82 50 Q 88 55 84 60" fill="none" stroke={hair.shadow} strokeWidth="2" opacity="0.6" />
              </g>
            )}
          </g>

          {/* ===== 眉毛 ===== */}
          <g>
            {eye.worried ? (
              <>
                <path d="M 32 40 Q 38 44 44 42" fill="none" stroke={hair.shadow} strokeWidth="1.8" strokeLinecap="round" />
                <path d="M 56 42 Q 62 44 68 40" fill="none" stroke={hair.shadow} strokeWidth="1.8" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M 32 42 Q 38 40 44 42" fill="none" stroke={hair.shadow} strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
                <path d="M 56 42 Q 62 40 68 42" fill="none" stroke={hair.shadow} strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
              </>
            )}
          </g>

          {/* ===== 眼睛（更真實的層次）===== */}
          <g>
            {/* 眼窩陰影 */}
            <ellipse cx="38" cy="52" rx="10" ry="8" fill={skin.eyeArea} opacity="0.5" />
            <ellipse cx="62" cy="52" rx="10" ry="8" fill={skin.eyeArea} opacity="0.5" />
            
            {/* 左眼 */}
            <g transform={`translate(38, 52) scale(1, ${eye.scaleY})`}>
              {eye.happy ? (
                <path d="M -8 0 Q 0 -10 8 0" fill="none" stroke="#3D3D3D" strokeWidth="2.5" strokeLinecap="round" />
              ) : (
                <>
                  {/* 眼白 */}
                  <ellipse cx="0" cy="0" rx="8" ry="9" fill={`url(#eyeWhite-${uniqueId})`} />
                  {/* 上眼瞼陰影 */}
                  <ellipse cx="0" cy="-4" rx="7" ry="4" fill={skin.shadow} opacity="0.15" />
                  {/* 虹膜 */}
                  <ellipse cx={eyeDir.x} cy={eyeDir.y} rx="5" ry="6" fill={`url(#iris-${uniqueId})`} />
                  {/* 瞳孔 */}
                  <ellipse cx={eyeDir.x} cy={eyeDir.y + 0.5} rx="2.5" ry="3" fill="#0A0A0A" />
                  {/* 高光 */}
                  <circle cx={eyeDir.x - 2} cy={eyeDir.y - 2} r="2" fill="#FFF" />
                  <circle cx={eyeDir.x + 1.5} cy={eyeDir.y + 1} r="1" fill="#FFF" opacity="0.6" />
                  {/* 眼線 */}
                  <path d="M -8 -3 Q 0 -8 8 -3" fill="none" stroke={hair.shadow} strokeWidth="1.2" opacity="0.4" />
                </>
              )}
            </g>
            
            {/* 右眼 */}
            <g transform={`translate(62, 52) scale(1, ${eye.scaleY})`}>
              {eye.happy ? (
                <path d="M -8 0 Q 0 -10 8 0" fill="none" stroke="#3D3D3D" strokeWidth="2.5" strokeLinecap="round" />
              ) : (
                <>
                  <ellipse cx="0" cy="0" rx="8" ry="9" fill={`url(#eyeWhite-${uniqueId})`} />
                  <ellipse cx="0" cy="-4" rx="7" ry="4" fill={skin.shadow} opacity="0.15" />
                  <ellipse cx={eyeDir.x} cy={eyeDir.y} rx="5" ry="6" fill={`url(#iris-${uniqueId})`} />
                  <ellipse cx={eyeDir.x} cy={eyeDir.y + 0.5} rx="2.5" ry="3" fill="#0A0A0A" />
                  <circle cx={eyeDir.x - 2} cy={eyeDir.y - 2} r="2" fill="#FFF" />
                  <circle cx={eyeDir.x + 1.5} cy={eyeDir.y + 1} r="1" fill="#FFF" opacity="0.6" />
                  <path d="M -8 -3 Q 0 -8 8 -3" fill="none" stroke={hair.shadow} strokeWidth="1.2" opacity="0.4" />
                </>
              )}
            </g>

            {/* 睫毛（女性） */}
            {!isMale && !blink && (
              <>
                <path d="M 30 48 L 28 45" stroke={hair.shadow} strokeWidth="1" opacity="0.6" />
                <path d="M 33 46 L 32 43" stroke={hair.shadow} strokeWidth="1" opacity="0.6" />
                <path d="M 67 46 L 68 43" stroke={hair.shadow} strokeWidth="1" opacity="0.6" />
                <path d="M 70 48 L 72 45" stroke={hair.shadow} strokeWidth="1" opacity="0.6" />
              </>
            )}

            {/* 興奮時的星星 */}
            {eye.sparkle && (
              <>
                <text x="28" y="48" fontSize="6" fill="#FFD700">✦</text>
                <text x="68" y="48" fontSize="6" fill="#FFD700">✦</text>
              </>
            )}
          </g>

          {/* ===== 鼻子 ===== */}
          <g>
            <ellipse cx="50" cy="62" rx="2" ry="1.5" fill={skin.shadow} opacity="0.35" />
            <path d="M 48 58 Q 50 62 52 58" fill="none" stroke={skin.shadow} strokeWidth="0.8" opacity="0.2" />
          </g>

          {/* ===== 腮紅 ===== */}
          <ellipse 
            cx="28" cy="62" rx="7" ry="4" 
            fill={skin.blush} 
            opacity={mood === 'happy' || mood === 'excited' ? 0.5 : 0.25} 
          />
          <ellipse 
            cx="72" cy="62" rx="7" ry="4" 
            fill={skin.blush} 
            opacity={mood === 'happy' || mood === 'excited' ? 0.5 : 0.25} 
          />

          {/* ===== 嘴巴（更真實的形狀）===== */}
          <g>
            {(() => {
              switch (mood) {
                case 'anxious':
                  return (
                    <g>
                      <path d="M 44 72 Q 50 68 56 72" fill="none" stroke={skin.lip} strokeWidth="2" strokeLinecap="round" />
                    </g>
                  )
                case 'calm':
                  return (
                    <g>
                      <path d="M 44 72 Q 50 74 56 72" fill="none" stroke={skin.lip} strokeWidth="2" strokeLinecap="round" />
                    </g>
                  )
                case 'happy':
                  return (
                    <g>
                      {/* 上唇 */}
                      <path d="M 42 70 Q 47 68 50 70 Q 53 68 58 70" fill={skin.lip} />
                      {/* 下唇 */}
                      <path d="M 42 70 Q 50 80 58 70" fill={`url(#lipGrad-${uniqueId})`} />
                      {/* 牙齒 */}
                      <path d="M 44 71 Q 50 70 56 71" fill="#FFF" opacity="0.9" />
                      {/* 唇部高光 */}
                      <ellipse cx="50" cy="74" rx="4" ry="2" fill="#FFF" opacity="0.25" />
                    </g>
                  )
                case 'excited':
                  return (
                    <g>
                      {/* 大張的嘴 */}
                      <ellipse cx="50" cy="73" rx="9" ry="7" fill={`url(#lipGrad-${uniqueId})`} />
                      {/* 牙齒 */}
                      <path d="M 42 71 L 58 71 L 56 73 L 44 73 Z" fill="#FFF" />
                      {/* 舌頭 */}
                      <ellipse cx="50" cy="76" rx="5" ry="3" fill="#E07070" opacity="0.7" />
                      {/* 高光 */}
                      <ellipse cx="50" cy="70" rx="6" ry="2" fill="#FFF" opacity="0.2" />
                    </g>
                  )
                default:
                  return <path d="M 44 72 L 56 72" stroke={skin.lip} strokeWidth="2" strokeLinecap="round" />
              }
            })()}
          </g>
        </g>

        {/* ===== 工作中的物品 ===== */}
        {isWorking && (
          <g className="work-item" transform="translate(0, 5)">
            <rect x="32" y="128" width="36" height="22" rx="2" fill="#F8F8F8" stroke="#DDD" strokeWidth="1" />
            <rect x="35" y="132" width="30" height="2" rx="1" fill="#BBB" />
            <rect x="35" y="136" width="24" height="2" rx="1" fill="#CCC" />
            <rect x="35" y="140" width="28" height="2" rx="1" fill="#BBB" />
            <rect x="35" y="144" width="18" height="2" rx="1" fill="#CCC" />
          </g>
        )}

        {/* ===== 休息中的 Zzz ===== */}
        {isResting && (
          <g className="sleep-z">
            <text x="74" y="30" fontSize="14" fill="#7090B0" fontWeight="bold" opacity="0.8">Z</text>
            <text x="82" y="22" fontSize="10" fill="#7090B0" fontWeight="bold" opacity="0.6">z</text>
            <text x="88" y="16" fontSize="7" fill="#7090B0" fontWeight="bold" opacity="0.4">z</text>
          </g>
        )}
      </svg>
    </div>
  )
}

// NPC 角色組件
interface NPCProps {
  appearance: CharacterAppearance
  mood: MoodState
  position: number // 0-3 的位置
  size?: number
}

export function NPC({ appearance, mood, position, size = 80 }: NPCProps) {
  const positions = [
    { x: -60, y: 20 },
    { x: 60, y: 25 },
    { x: -40, y: 40 },
    { x: 50, y: 35 }
  ]
  const pos = positions[position] || positions[0]

  return (
    <div 
      className="npc-character"
      style={{
        position: 'absolute',
        left: `calc(50% + ${pos.x}px)`,
        bottom: `${pos.y}px`,
        transform: 'translateX(-50%)',
        opacity: 0.9,
        zIndex: position + 1
      }}
    >
      <Character 
        appearance={appearance} 
        mood={mood} 
        isWorking={true} 
        isResting={false}
        size={size}
      />
    </div>
  )
}

// 角色自訂面板
interface CharacterCustomizerProps {
  appearance: CharacterAppearance
  onChange: (appearance: CharacterAppearance) => void
}

export function CharacterCustomizer({ appearance, onChange }: CharacterCustomizerProps) {
  const update = (key: keyof CharacterAppearance, value: string) => {
    onChange({ ...appearance, [key]: value })
  }

  return (
    <div className="character-customizer">
      <h4>🎨 角色自訂</h4>
      
      <div className="customizer-row">
        <label>性別：</label>
        <select value={appearance.gender} onChange={e => update('gender', e.target.value)}>
          <option value="male">男生</option>
          <option value="female">女生</option>
        </select>
      </div>

      <div className="customizer-row">
        <label>膚色：</label>
        <div className="color-options">
          {Object.entries(SKIN_COLORS).map(([key, color]) => (
            <button
              key={key}
              className={`color-btn ${appearance.skinTone === key ? 'active' : ''}`}
              style={{ background: color.main }}
              onClick={() => update('skinTone', key)}
              title={key}
            />
          ))}
        </div>
      </div>

      <div className="customizer-row">
        <label>髮型：</label>
        <select value={appearance.hairStyle} onChange={e => update('hairStyle', e.target.value)}>
          <option value="short">短髮</option>
          <option value="long">長髮</option>
          <option value="curly">捲髮</option>
          <option value="ponytail">馬尾</option>
          <option value="bun">丸子頭</option>
        </select>
      </div>

      <div className="customizer-row">
        <label>髮色：</label>
        <div className="color-options">
          {Object.entries(HAIR_COLORS).map(([key, color]) => (
            <button
              key={key}
              className={`color-btn ${appearance.hairColor === key ? 'active' : ''}`}
              style={{ background: color.main }}
              onClick={() => update('hairColor', key)}
              title={key}
            />
          ))}
        </div>
      </div>

      <div className="customizer-row">
        <label>服裝：</label>
        <select value={appearance.outfit} onChange={e => update('outfit', e.target.value)}>
          <option value="casual">休閒</option>
          <option value="school">學院風</option>
          <option value="formal">正式</option>
          <option value="cozy">舒適居家</option>
        </select>
      </div>
    </div>
  )
}

// 預設外觀
export const DEFAULT_APPEARANCE: CharacterAppearance = {
  gender: 'female',
  skinTone: 'light',
  hairStyle: 'long',
  hairColor: 'brown',
  outfit: 'casual'
}

export const DEFAULT_NPC_APPEARANCES: CharacterAppearance[] = [
  { gender: 'male', skinTone: 'medium', hairStyle: 'short', hairColor: 'black', outfit: 'school' },
  { gender: 'female', skinTone: 'light', hairStyle: 'ponytail', hairColor: 'blonde', outfit: 'cozy' },
  { gender: 'male', skinTone: 'tan', hairStyle: 'curly', hairColor: 'brown', outfit: 'casual' },
  { gender: 'female', skinTone: 'dark', hairStyle: 'bun', hairColor: 'pink', outfit: 'formal' }
]
