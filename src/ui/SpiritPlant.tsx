import React from 'react'

interface SpiritPlantProps {
  progress: number // 0 to 1
  isCompleted: boolean
  type?: 'tree' | 'flower' | 'pumpkin' // Future expansion
}

export function SpiritPlant({ progress, isCompleted, type = 'tree' }: SpiritPlantProps) {
  // Determine stage based on progress
  let stage = 0
  let content = ''
  let scale = 1
  let filter = ''

  if (isCompleted) {
    stage = 4
    content = '🌳' // Mature tree with fruit
    // Add some fruit overlays or effects
  } else if (progress < 0.1) {
    stage = 0
    content = '🌰' // Seed
    scale = 0.8
  } else if (progress < 0.3) {
    stage = 1
    content = '🌱' // Sprout
    scale = 0.9
  } else if (progress < 0.6) {
    stage = 2
    content = '🌿' // Sapling
    scale = 1.0
  } else if (progress < 0.9) {
    stage = 3
    content = '🌳' // Young tree
    scale = 1.1
    filter = 'brightness(0.9)' // Slightly darker/smaller look
  } else {
    stage = 3
    content = '🌳' // Full tree
    scale = 1.2
  }

  return (
    <div className={`spirit-plant stage-${stage} ${isCompleted ? 'completed' : ''}`}>
      {/* Aura Effect */}
      <div className="spirit-aura" style={{ opacity: Math.min(progress * 0.8, 0.6) }}></div>
      
      {/* Floating Particles */}
      {progress > 0.2 && (
        <div className="spirit-particles">
           <span className="p1">✨</span>
           <span className="p2">✨</span>
           <span className="p3">✨</span>
        </div>
      )}

      <div className="plant-container">
         {/* Ground Shadow */}
         <div className="plant-shadow"></div>
         {/* Main Plant */}
         <div 
            className="plant-emoji"
            style={{ 
              transform: `scale(${scale})`,
              filter: filter,
              transition: 'all 1s ease-in-out'
            }}
         >
            {content}
         </div>
      </div>

      {isCompleted && (
        <div className="fruits-overlay">
          <span className="fruit f1">🍎</span>
          <span className="fruit f2">🍎</span>
          <span className="fruit f3">🍎</span>
        </div>
      )}
      {/* Kodama (Spirits) appearing at later stages */}
      {progress > 0.5 && !isCompleted && (
        <div className="kodama k1">👻</div>
      )}
      {progress > 0.8 && !isCompleted && (
        <div className="kodama k2">👻</div>
      )}
      {isCompleted && (
        <>
          <div className="kodama k1 happy">👻</div>
          <div className="kodama k2 happy">👻</div>
          <div className="kodama k3 happy">👻</div>
        </>
      )}
    </div>
  )
}
