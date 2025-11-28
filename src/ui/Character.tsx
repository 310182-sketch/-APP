import React, { useEffect, useRef, useState, useMemo } from 'react'

// ===== Types & Interfaces =====
export type MoodState = 'focus' | 'flow' | 'tired' | 'zen'

export interface CharacterAppearance {
  gender: 'male' | 'female'
  skinTone: 'light' | 'medium' | 'tan' | 'dark'
  hairStyle: 'short' | 'long' | 'ponytail' | 'bun' | 'curly'
  hairColor: 'black' | 'brown' | 'blonde' | 'red' | 'pink' | 'white'
  outfit: 'casual' | 'formal' | 'sport' | 'cozy' | 'school' | 'punk' | 'street'
}

export interface CharacterProps {
  appearance: CharacterAppearance
  mood: MoodState
  isWorking: boolean
  isResting: boolean
  size?: number
}

export const DEFAULT_APPEARANCE: CharacterAppearance = {
  gender: 'female',
  skinTone: 'light',
  hairStyle: 'long',
  hairColor: 'brown',
  outfit: 'punk' // Default to Nano style
}

export const DEFAULT_NPC_APPEARANCES: CharacterAppearance[] = [
  { gender: 'male', skinTone: 'medium', hairStyle: 'short', hairColor: 'blonde', outfit: 'street' }, // Ash style
  { gender: 'female', skinTone: 'light', hairStyle: 'ponytail', hairColor: 'black', outfit: 'punk' }, // Nana style
  { gender: 'male', skinTone: 'tan', hairStyle: 'curly', hairColor: 'brown', outfit: 'casual' },
  { gender: 'female', skinTone: 'dark', hairStyle: 'bun', hairColor: 'pink', outfit: 'formal' }
]

// ===== Helper Functions =====
export function getMoodFromXP(xp: number): MoodState {
  if (xp > 2000) return 'zen'
  if (xp > 1000) return 'flow'
  if (xp > 500) return 'focus'
  return 'tired'
}

export function getMoodEmoji(mood: MoodState): string {
  switch (mood) {
    case 'zen': return '🎸'
    case 'flow': return '🎹'
    case 'focus': return '🎤'
    case 'tired': return '🚬' // Nana vibe
  }
}

export function getMoodLabel(mood: MoodState): string {
  switch (mood) {
    case 'zen': return '靈魂共鳴'
    case 'flow': return '極致演奏'
    case 'focus': return '專注練習'
    case 'tired': return '需要休息'
  }
}

// ===== Color Palettes (Nano Banana Style) =====
const PALETTE = {
  skin: {
    light: '#FFF0E0', medium: '#F5D0B0', tan: '#E0B080', dark: '#8D5524',
    shadow: 'rgba(0,0,0,0.15)'
  },
  hair: {
    black: '#1a1a1a', brown: '#4a3b32', blonde: '#e6c96e', 
    red: '#8a1c1c', pink: '#d46a84', white: '#f0f0f0'
  },
  outfit: {
    punk: { main: '#1a1a1a', accent: '#c41e3a', detail: '#silver' }, // Nana
    street: { main: '#2c3e50', accent: '#f1c40f', detail: '#fff' }, // Banana Fish
    casual: { main: '#42A5F5', accent: '#90CAF9', detail: '#fff' },
    formal: { main: '#263238', accent: '#78909C', detail: '#000' },
    sport: { main: '#FF7043', accent: '#FFAB91', detail: '#fff' },
    cozy: { main: '#AB47BC', accent: '#E1BEE7', detail: '#fff' },
    school: { main: '#26A69A', accent: '#80CBC4', detail: '#fff' }
  }
}

// ===== Main Component (Canvas Based) =====
export function Character({ appearance, mood, isWorking, isResting, size = 200 }: CharacterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [frame, setFrame] = useState(0)

  // Animation Loop
  useEffect(() => {
    let animationFrameId: number
    const render = () => {
      setFrame(f => f + 1)
      animationFrameId = requestAnimationFrame(render)
    }
    animationFrameId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  // Drawing Logic
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas Settings
    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)
    ctx.imageSmoothingEnabled = false // Pixel Art Look

    // --- Drawing Helper ---
    const drawRect = (x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = color
      ctx.fillRect(x, y, w, h)
    }

    const drawCircle = (x: number, y: number, r: number, color: string) => {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }

    // --- Animation State ---
    const breathe = Math.sin(frame * 0.05) * 2
    const blink = Math.random() > 0.98 || (frame % 200 < 5)
    const bounce = isWorking ? Math.abs(Math.sin(frame * 0.1)) * 3 : 0

    // --- Colors ---
    const skinColor = PALETTE.skin[appearance.skinTone]
    const hairColor = PALETTE.hair[appearance.hairColor]
    const outfitColors = (PALETTE.outfit as any)[appearance.outfit] || PALETTE.outfit.casual

    ctx.save()
    ctx.translate(0, breathe + bounce)

    // 1. Back Hair (Long)
    if (['long', 'ponytail'].includes(appearance.hairStyle)) {
      drawRect(80, 100, 140, 200, hairColor)
    }

    // 2. Body / Outfit
    // Shoulders
    drawRect(70, 220, 160, 180, outfitColors.main)
    // Collar / Detail
    if (appearance.outfit === 'punk') {
      // Choker
      drawRect(120, 205, 60, 10, '#000')
      drawCircle(150, 210, 3, 'silver')
      // Jacket collar
      drawRect(70, 220, 40, 60, '#333')
      drawRect(190, 220, 40, 60, '#333')
    } else if (appearance.outfit === 'street') {
      // Hoodie strings
      drawRect(130, 230, 5, 60, '#fff')
      drawRect(165, 230, 5, 60, '#fff')
    } else {
      // Generic collar
      drawRect(120, 220, 60, 20, outfitColors.accent)
    }

    // 3. Neck
    drawRect(120, 180, 60, 40, skinColor)
    // Neck Shadow
    drawRect(120, 180, 60, 10, PALETTE.skin.shadow)

    // 4. Head
    // Face Shape (Sharp Anime Style)
    ctx.fillStyle = skinColor
    ctx.beginPath()
    ctx.moveTo(90, 80)
    ctx.lineTo(210, 80)
    ctx.lineTo(210, 160)
    ctx.lineTo(150, 210) // Chin
    ctx.lineTo(90, 160)
    ctx.closePath()
    ctx.fill()

    // Blush
    ctx.globalAlpha = 0.3
    drawCircle(110, 160, 10, '#ff0000')
    drawCircle(190, 160, 10, '#ff0000')
    ctx.globalAlpha = 1.0

    // 5. Face Features
    // Eyes
    const eyeY = 140
    const eyeOpen = isResting ? 2 : (blink ? 2 : 12)
    
    // Left Eye
    drawRect(105, eyeY, 30, eyeOpen, '#fff') // Sclera
    if (!blink && !isResting) {
      drawRect(112, eyeY, 16, 12, appearance.outfit === 'punk' ? '#700' : '#2c3e50') // Iris
      drawRect(116, eyeY + 3, 8, 6, '#000') // Pupil
    }
    // Eyeliner (Punk style)
    drawRect(103, eyeY - 2, 34, 3, '#000')
    if (appearance.outfit === 'punk') drawRect(103, eyeY + eyeOpen, 34, 2, '#000')

    // Right Eye
    drawRect(165, eyeY, 30, eyeOpen, '#fff')
    if (!blink && !isResting) {
      drawRect(172, eyeY, 16, 12, appearance.outfit === 'punk' ? '#700' : '#2c3e50')
      drawRect(176, eyeY + 3, 8, 6, '#000')
    }
    drawRect(163, eyeY - 2, 34, 3, '#000')
    if (appearance.outfit === 'punk') drawRect(163, eyeY + eyeOpen, 34, 2, '#000')

    // Nose
    drawRect(148, 165, 4, 4, PALETTE.skin.shadow)

    // Mouth
    const mouthY = 185
    if (isWorking) {
      drawRect(140, mouthY, 20, 2, '#8a6655')
    } else {
      drawRect(140, mouthY, 20, 4, '#8a6655')
    }

    // 6. Front Hair (Bangs)
    ctx.fillStyle = hairColor
    if (appearance.hairStyle === 'short') {
      ctx.beginPath()
      ctx.moveTo(80, 80)
      ctx.lineTo(220, 80)
      ctx.lineTo(220, 130)
      ctx.lineTo(180, 100)
      ctx.lineTo(150, 130)
      ctx.lineTo(120, 100)
      ctx.lineTo(80, 130)
      ctx.closePath()
      ctx.fill()
    } else if (appearance.hairStyle === 'bun') {
      drawCircle(150, 60, 40, hairColor)
      // Bangs
      drawRect(90, 80, 120, 40, hairColor)
    } else {
      // Long / Ponytail / Curly bangs
      ctx.beginPath()
      ctx.moveTo(80, 60)
      ctx.lineTo(220, 60)
      ctx.lineTo(225, 150)
      ctx.lineTo(180, 110)
      ctx.lineTo(150, 150)
      ctx.lineTo(120, 110)
      ctx.lineTo(75, 150)
      ctx.closePath()
      ctx.fill()
    }

    // 7. Accessories
    if (appearance.outfit === 'punk') {
      // Piercings?
      drawCircle(145, 188, 1, 'silver')
    }

    ctx.restore()

  }, [appearance, mood, isWorking, isResting, frame])

  return (
    <div 
      className={`character-container ${isWorking ? 'working' : ''} ${isResting ? 'resting' : ''}`}
      style={{ width: size, height: size * 1.5, position: 'relative' }}
    >
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={450}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}

// ===== NPC Component =====
interface NPCProps {
  appearance: CharacterAppearance
  mood: MoodState
  position: number
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

// ===== Customizer Component =====
interface CharacterCustomizerProps {
  appearance: CharacterAppearance
  onChange: (newAppearance: CharacterAppearance) => void
}

export function CharacterCustomizer({ appearance, onChange }: CharacterCustomizerProps) {
  const update = (key: keyof CharacterAppearance, value: string) => {
    onChange({ ...appearance, [key]: value })
  }

  return (
    <div className="character-customizer glass-card">
      <h3>🎨 角色外觀設定 (Nano Style)</h3>
      
      <div className="customizer-row">
        <label>風格</label>
        <div className="options-grid">
          {['punk', 'street', 'casual', 'formal', 'school'].map(s => (
            <button 
              key={s}
              className={`option-btn ${appearance.outfit === s ? 'active' : ''}`}
              onClick={() => update('outfit', s)}
            >
              {s === 'punk' ? '龐克 (Nana)' : s === 'street' ? '街頭 (Ash)' : s === 'casual' ? '休閒' : s === 'formal' ? '正式' : '制服'}
            </button>
          ))}
        </div>
      </div>

      <div className="customizer-row">
        <label>髮型</label>
        <div className="options-grid">
          {['short', 'long', 'ponytail', 'bun', 'curly'].map(s => (
            <button 
              key={s}
              className={`option-btn ${appearance.hairStyle === s ? 'active' : ''}`}
              onClick={() => update('hairStyle', s)}
            >
              {s === 'short' ? '短髮' : s === 'long' ? '長髮' : s === 'ponytail' ? '馬尾' : s === 'bun' ? '丸子' : '捲髮'}
            </button>
          ))}
        </div>
      </div>

      <div className="customizer-row">
        <label>髮色</label>
        <div className="color-options">
          {Object.entries(PALETTE.hair).map(([key, color]) => (
            <button
              key={key}
              className={`color-btn ${appearance.hairColor === key ? 'active' : ''}`}
              style={{ background: color }}
              onClick={() => update('hairColor', key)}
              title={key}
            />
          ))}
        </div>
      </div>

      <div className="customizer-row">
        <label>膚色</label>
        <div className="color-options">
          {Object.entries(PALETTE.skin).filter(([k]) => k !== 'shadow').map(([key, color]) => (
            <button
              key={key}
              className={`color-btn ${appearance.skinTone === key ? 'active' : ''}`}
              style={{ background: color }}
              onClick={() => update('skinTone', key)}
              title={key}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
