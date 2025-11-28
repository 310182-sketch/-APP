import React, { useState, useEffect, useRef } from 'react'

interface Note {
  id: string
  title: string
  content: string
  color: string
  tags: string[]
  createdAt: string
  updatedAt: string
  pinned: boolean
  checklist?: ChecklistItem[]
}

interface ChecklistItem {
  id: string
  text: string
  checked: boolean
}

const NOTE_COLORS = [
  { name: '白色', value: '#ffffff', dark: '#e2e8f0' },
  { name: '黃色', value: '#fef9c3', dark: '#fde047' },
  { name: '綠色', value: '#dcfce7', dark: '#86efac' },
  { name: '藍色', value: '#dbeafe', dark: '#93c5fd' },
  { name: '紫色', value: '#f3e8ff', dark: '#c4b5fd' },
  { name: '粉色', value: '#fce7f3', dark: '#f9a8d4' },
  { name: '橘色', value: '#ffedd5', dark: '#fdba74' },
]

const QUICK_TAGS = ['工作', '學習', '生活', '重要', '想法', '待辦']

export function NotesView() {
  const [notes, setNotes] = useState<Note[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickInput, setQuickInput] = useState('')
  const [isChecklistMode, setIsChecklistMode] = useState(false)
  const quickInputRef = useRef<HTMLTextAreaElement>(null)

  // 從 localStorage 載入
  useEffect(() => {
    const saved = localStorage.getItem('focusBuddyNotes')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // 確保舊資料有 tags 欄位
        const migrated = parsed.map((n: any) => ({
          ...n,
          tags: n.tags || []
        }))
        setNotes(migrated)
      } catch (e) {
        console.error('載入備忘錄失敗', e)
      }
    }
  }, [])

  // 儲存
  const saveNotes = (notesToSave: Note[]) => {
    localStorage.setItem('focusBuddyNotes', JSON.stringify(notesToSave))
    setNotes(notesToSave)
  }

  // 快速新增（支援 Ctrl+Enter）
  const handleQuickAdd = () => {
    if (!quickInput.trim()) return

    const lines = quickInput.trim().split('\n')
    const title = lines[0]
    const content = lines.slice(1).join('\n')

    // 檢測是否有待辦清單格式
    let checklist: ChecklistItem[] | undefined
    if (isChecklistMode || content.includes('[ ]') || content.includes('[x]')) {
      checklist = content.split('\n')
        .filter(line => line.trim())
        .map((line, i) => ({
          id: `item-${Date.now()}-${i}`,
          text: line.replace(/^\[[ x]\]\s*/, '').trim(),
          checked: line.includes('[x]')
        }))
    }

    const note: Note = {
      id: Date.now().toString(),
      title: title || '快速筆記',
      content: checklist ? '' : content,
      color: '#ffffff',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false,
      checklist
    }

    saveNotes([note, ...notes])
    setQuickInput('')
    setShowQuickAdd(false)
    setIsChecklistMode(false)
  }

  // 快速更新單個欄位
  const updateNote = (id: string, updates: Partial<Note>) => {
    const updated = notes.map(n =>
      n.id === id
        ? { ...n, ...updates, updatedAt: new Date().toISOString() }
        : n
    )
    saveNotes(updated)
  }

  // 刪除
  const deleteNote = (id: string) => {
    if (!confirm('確定刪除？')) return
    saveNotes(notes.filter(n => n.id !== id))
    if (editingId === id) setEditingId(null)
  }

  // 複製
  const copyNote = (note: Note) => {
    const text = note.checklist
      ? `${note.title}\n${note.checklist.map(i => `${i.checked ? '[x]' : '[ ]'} ${i.text}`).join('\n')}`
      : `${note.title}\n${note.content}`
    navigator.clipboard.writeText(text)
  }

  // 切換清單項目
  const toggleChecklistItem = (noteId: string, itemId: string) => {
    const note = notes.find(n => n.id === noteId)
    if (!note?.checklist) return

    const updatedChecklist = note.checklist.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    )
    updateNote(noteId, { checklist: updatedChecklist })
  }

  // 新增清單項目
  const addChecklistItem = (noteId: string, text: string) => {
    const note = notes.find(n => n.id === noteId)
    if (!note) return

    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      text,
      checked: false
    }
    updateNote(noteId, {
      checklist: [...(note.checklist || []), newItem]
    })
  }

  // 刪除清單項目
  const deleteChecklistItem = (noteId: string, itemId: string) => {
    const note = notes.find(n => n.id === noteId)
    if (!note?.checklist) return

    updateNote(noteId, {
      checklist: note.checklist.filter(item => item.id !== itemId)
    })
  }

  // 新增標籤
  const addTag = (noteId: string, tag: string) => {
    const note = notes.find(n => n.id === noteId)
    if (!note || note.tags.includes(tag)) return
    updateNote(noteId, { tags: [...note.tags, tag] })
  }

  // 移除標籤
  const removeTag = (noteId: string, tag: string) => {
    const note = notes.find(n => n.id === noteId)
    if (!note) return
    updateNote(noteId, { tags: note.tags.filter(t => t !== tag) })
  }

  // 取得所有使用的標籤
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)))

  // 過濾和排序
  const filteredNotes = notes
    .filter(note => {
      const matchSearch = !searchQuery ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchTag = !selectedTag || note.tags.includes(selectedTag)
      return matchSearch && matchTag
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return '剛剛'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分鐘前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小時前`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
    
    return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
  }

  // 快捷鍵
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N 開啟快速新增
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        setShowQuickAdd(true)
        setTimeout(() => quickInputRef.current?.focus(), 100)
      }
      // Escape 關閉編輯
      if (e.key === 'Escape') {
        setShowQuickAdd(false)
        setEditingId(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <section className="notes-view-v2">
      {/* 頂部工具列 */}
      <div className="notes-header-v2">
        <h2>📝 備忘錄</h2>
        <div className="notes-controls">
          <div className="search-box-v2">
            <span>🔍</span>
            <input
              type="text"
              placeholder="搜尋... (Ctrl+N 快速新增)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>
          <div className="view-toggle">
            <button 
              className={viewMode === 'grid' ? 'active' : ''} 
              onClick={() => setViewMode('grid')}
              title="卡片檢視"
            >
              ▦
            </button>
            <button 
              className={viewMode === 'list' ? 'active' : ''} 
              onClick={() => setViewMode('list')}
              title="列表檢視"
            >
              ☰
            </button>
          </div>
          <button 
            className="quick-add-btn"
            onClick={() => {
              setShowQuickAdd(true)
              setTimeout(() => quickInputRef.current?.focus(), 100)
            }}
          >
            ＋ 新增
          </button>
        </div>
      </div>

      {/* 標籤篩選 */}
      {allTags.length > 0 && (
        <div className="tags-filter">
          <button 
            className={`tag-chip ${!selectedTag ? 'active' : ''}`}
            onClick={() => setSelectedTag(null)}
          >
            全部
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`tag-chip ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* 快速新增面板 */}
      {showQuickAdd && (
        <div className="quick-add-panel">
          <div className="quick-add-header">
            <span>✨ 快速筆記</span>
            <div className="quick-add-options">
              <button 
                className={`checklist-toggle ${isChecklistMode ? 'active' : ''}`}
                onClick={() => setIsChecklistMode(!isChecklistMode)}
                title="待辦清單模式"
              >
                ☑️ 清單
              </button>
              <button onClick={() => setShowQuickAdd(false)}>✕</button>
            </div>
          </div>
          <textarea
            ref={quickInputRef}
            placeholder={isChecklistMode 
              ? "第一行為標題\n之後每一行為一個待辦項目..."
              : "第一行為標題，其餘為內容...\n\n(Ctrl+Enter 儲存)"
            }
            value={quickInput}
            onChange={e => setQuickInput(e.target.value)}
            onKeyDown={e => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                handleQuickAdd()
              }
            }}
            rows={5}
          />
          <div className="quick-add-footer">
            <span className="hint">Ctrl+Enter 儲存 · Esc 取消</span>
            <button className="save-btn" onClick={handleQuickAdd}>
              儲存
            </button>
          </div>
        </div>
      )}

      {/* 備忘錄列表 */}
      {filteredNotes.length === 0 ? (
        <div className="notes-empty-v2">
          <div className="empty-icon">📋</div>
          <h3>{searchQuery || selectedTag ? '找不到符合的備忘錄' : '還沒有備忘錄'}</h3>
          <p>按 Ctrl+N 或點擊右上角「新增」開始記錄</p>
        </div>
      ) : (
        <div className={`notes-container ${viewMode}`}>
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className={`note-card-v2 ${note.pinned ? 'pinned' : ''} ${editingId === note.id ? 'editing' : ''}`}
              style={{ 
                backgroundColor: note.color,
                borderColor: NOTE_COLORS.find(c => c.value === note.color)?.dark || '#e2e8f0'
              }}
            >
              {/* 釘選標記 */}
              {note.pinned && <div className="pin-icon">📌</div>}

              {/* 標題區 */}
              <div className="note-title-row">
                {editingId === note.id ? (
                  <input
                    type="text"
                    value={note.title}
                    onChange={e => updateNote(note.id, { title: e.target.value })}
                    className="inline-edit-title"
                    autoFocus
                  />
                ) : (
                  <h4 onClick={() => setEditingId(note.id)}>{note.title}</h4>
                )}
                <div className="note-quick-actions">
                  <button onClick={() => updateNote(note.id, { pinned: !note.pinned })} title="釘選">
                    {note.pinned ? '📌' : '📍'}
                  </button>
                  <button onClick={() => copyNote(note)} title="複製">📋</button>
                  <button onClick={() => deleteNote(note.id)} className="delete" title="刪除">🗑️</button>
                </div>
              </div>

              {/* 內容區 - 清單模式 */}
              {note.checklist && note.checklist.length > 0 ? (
                <div className="note-checklist">
                  {note.checklist.map(item => (
                    <div key={item.id} className={`checklist-item ${item.checked ? 'checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleChecklistItem(note.id, item.id)}
                      />
                      <span>{item.text}</span>
                      <button 
                        className="delete-item"
                        onClick={() => deleteChecklistItem(note.id, item.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    placeholder="+ 新增項目"
                    className="add-checklist-input"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                        addChecklistItem(note.id, (e.target as HTMLInputElement).value.trim())
                        ;(e.target as HTMLInputElement).value = ''
                      }
                    }}
                  />
                  <div className="checklist-progress">
                    <div 
                      className="progress-bar"
                      style={{ 
                        width: `${(note.checklist.filter(i => i.checked).length / note.checklist.length) * 100}%` 
                      }}
                    />
                    <span>{note.checklist.filter(i => i.checked).length}/{note.checklist.length}</span>
                  </div>
                </div>
              ) : (
                /* 內容區 - 一般模式 */
                <div className="note-content-v2">
                  {editingId === note.id ? (
                    <textarea
                      value={note.content}
                      onChange={e => updateNote(note.id, { content: e.target.value })}
                      className="inline-edit-content"
                      rows={4}
                    />
                  ) : (
                    <p onClick={() => setEditingId(note.id)}>
                      {note.content || <span className="placeholder">點擊新增內容...</span>}
                    </p>
                  )}
                </div>
              )}

              {/* 標籤區 */}
              <div className="note-tags">
                {note.tags.map(tag => (
                  <span key={tag} className="note-tag">
                    #{tag}
                    <button onClick={() => removeTag(note.id, tag)}>✕</button>
                  </span>
                ))}
                <div className="add-tag-dropdown">
                  <button className="add-tag-btn">+ 標籤</button>
                  <div className="tag-dropdown-content">
                    {QUICK_TAGS.filter(t => !note.tags.includes(t)).map(tag => (
                      <button key={tag} onClick={() => addTag(note.id, tag)}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 顏色選擇 (編輯模式) */}
              {editingId === note.id && (
                <div className="color-picker-v2">
                  {NOTE_COLORS.map(color => (
                    <button
                      key={color.value}
                      className={`color-dot ${note.color === color.value ? 'active' : ''}`}
                      style={{ backgroundColor: color.value, borderColor: color.dark }}
                      onClick={() => updateNote(note.id, { color: color.value })}
                      title={color.name}
                    />
                  ))}
                  <button 
                    className="done-editing"
                    onClick={() => setEditingId(null)}
                  >
                    ✓ 完成
                  </button>
                </div>
              )}

              {/* 時間戳記 */}
              <div className="note-meta-v2">
                <span>{formatDate(note.updatedAt)}</span>
                {!note.checklist && (
                  <button 
                    className="convert-to-checklist"
                    onClick={() => {
                      const items = note.content.split('\n').filter(l => l.trim()).map((text, i) => ({
                        id: `item-${Date.now()}-${i}`,
                        text: text.trim(),
                        checked: false
                      }))
                      if (items.length > 0) {
                        updateNote(note.id, { checklist: items, content: '' })
                      }
                    }}
                    title="轉換為清單"
                  >
                    ☑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 統計資訊 */}
      <div className="notes-footer-v2">
        <span>{notes.length} 則備忘錄</span>
        {notes.filter(n => n.pinned).length > 0 && (
          <span>· {notes.filter(n => n.pinned).length} 釘選</span>
        )}
        {notes.filter(n => n.checklist).length > 0 && (
          <span>· {notes.filter(n => n.checklist).length} 清單</span>
        )}
      </div>
    </section>
  )
}
