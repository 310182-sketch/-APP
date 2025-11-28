export const HOLIDAY_SLOTS = [
  // 上午
  { start: '06:00', end: '07:00', label: '早上6點~早上7點' },
  { start: '07:00', end: '08:00', label: '早上7點~早上8點' },
  { start: '08:00', end: '09:00', label: '早上8點~早上9點' },
  { start: '09:00', end: '10:00', label: '早上9點~早上10點' },
  { start: '10:00', end: '11:00', label: '早上10點~早上11點' },
  { start: '11:00', end: '12:00', label: '早上11點~早上12點' },
  // 下午
  { start: '14:00', end: '15:00', label: '下午2點~下午3點' },
  { start: '15:00', end: '16:00', label: '下午3點~下午4點' },
  { start: '16:00', end: '17:00', label: '下午4點~下午5點' },
  { start: '17:00', end: '18:00', label: '下午5點~下午6點' },
  // 晚上
  { start: '20:30', end: '22:10', label: '晚上8點半~晚上10點10分' },
  { start: '22:30', end: '24:00', label: '晚上10點半~晚上12點' },
  // 午夜
  { start: '00:30', end: '00:45', label: '午夜12點半~午夜12點45分' },
  { start: '01:00', end: '01:30', label: '午夜1點~午夜1點半' },
  { start: '01:45', end: '02:15', label: '午夜1點45分~午夜2點15分' }
]

export const WEEKDAY_SLOTS = [
  // 晚上
  { start: '17:00', end: '18:00', label: '晚上5點~晚上6點' },
  { start: '19:00', end: '20:00', label: '晚上7點~晚上8點' },
  { start: '20:30', end: '22:10', label: '晚上8點半~晚上10點10分' },
  { start: '22:30', end: '23:30', label: '晚上10點半~晚上11點半' },
  // 午夜
  { start: '00:30', end: '00:45', label: '午夜12點半~午夜12點45分' },
  { start: '01:00', end: '01:30', label: '午夜1點~午夜1點半' },
  { start: '01:45', end: '02:15', label: '午夜1點45分~午夜2點15分' }
]

export const TIME_PERIODS = [
  { key: 'morning', label: '清晨', color: 'linear-gradient(#ffecd2, #fcb69f)' },
  { key: 'noon', label: '正午', color: 'linear-gradient(#2980b9, #6dd5fa, #ffffff)' },
  { key: 'afternoon', label: '下午', color: 'linear-gradient(#f12711, #f5af19)' },
  { key: 'dusk', label: '黃昏', color: 'linear-gradient(#833ab4, #fd1d1d, #fcb045)' },
  { key: 'night', label: '深夜', color: 'linear-gradient(#0f2027, #203a43, #2c5364)' }
]
