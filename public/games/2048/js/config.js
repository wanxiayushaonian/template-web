// ============ 游戏配置 ============
const GRID_SIZE = 4;

// ============ 成就列表 ============
const achievementList = [
  { id: 'first_merge', name: 'FIRST BLOOD', desc: '首次合并方块', icon: 'fa-handshake', color: '#7FD858' },
  { id: 'reach_128', name: 'TRIPLE DIGIT', desc: '合成128', icon: 'fa-medal', color: '#4D9DE0' },
  { id: 'reach_256', name: 'DOUBLE TROUBLE', desc: '合成256', icon: 'fa-star', color: '#9B5DE5' },
  { id: 'reach_512', name: 'HALF WAY', desc: '合成512', icon: 'fa-fire', color: '#FF8C42' },
  { id: 'reach_1024', name: 'ALMOST THERE', desc: '合成1024', icon: 'fa-bolt', color: '#FF4757' },
  { id: 'reach_2048', name: 'CHAMPION', desc: '合成2048！', icon: 'fa-crown', color: '#FFE600' },
  { id: 'combo_5', name: 'COMBO MASTER', desc: '5连击！', icon: 'fa-link', color: '#FF6B9D' },
  { id: 'score_10000', name: 'HIGH SCORER', desc: '得分破万', icon: 'fa-trophy', color: '#00BBF9' }
];

// ============ 关卡数据 ============
const levelList = [
  {
    id: 1,
    name: '初学者',
    desc: '合成128',
    goal: 128,
    board: [
      [0, 0, 0, 0],
      [0, 2, 0, 0],
      [0, 0, 2, 0],
      [0, 0, 0, 0]
    ],
    moves: 20
  },
  {
    id: 2,
    name: '进阶者',
    desc: '合成256',
    goal: 256,
    board: [
      [0, 0, 0, 0],
      [0, 4, 2, 0],
      [0, 2, 4, 0],
      [0, 0, 0, 0]
    ],
    moves: 30
  },
  {
    id: 3,
    name: '挑战者',
    desc: '合成512',
    goal: 512,
    board: [
      [2, 0, 0, 2],
      [0, 4, 4, 0],
      [0, 4, 4, 0],
      [2, 0, 0, 2]
    ],
    moves: 40
  },
  {
    id: 4,
    name: '专家',
    desc: '合成1024',
    goal: 1024,
    board: [
      [4, 2, 2, 4],
      [2, 0, 0, 2],
      [2, 0, 0, 2],
      [4, 2, 2, 4]
    ],
    moves: 50
  },
  {
    id: 5,
    name: '大师',
    desc: '合成2048',
    goal: 2048,
    board: [
      [4, 4, 4, 4],
      [4, 2, 2, 4],
      [4, 2, 2, 4],
      [4, 4, 4, 4]
    ],
    moves: 60
  },
  {
    id: 6,
    name: '极限',
    desc: '得分5000',
    goalScore: 5000,
    board: [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2]
    ],
    moves: 40
  },
  {
    id: 7,
    name: '速通',
    desc: '15步内合成512',
    goal: 512,
    board: [
      [8, 4, 2, 4],
      [4, 8, 4, 2],
      [2, 4, 8, 4],
      [4, 2, 4, 8]
    ],
    moves: 15
  },
  {
    id: 8,
    name: '终极',
    desc: '得分10000',
    goalScore: 10000,
    board: [
      [16, 8, 4, 2],
      [8, 16, 8, 4],
      [4, 8, 16, 8],
      [2, 4, 8, 16]
    ],
    moves: 80
  }
];

// ============ 主题配置 ============
const themeList = [
  {
    id: 'neo-brutal',
    name: 'Neo-Brutal',
    colors: {
      bg: '#F0F0E8',
      dark: '#1A1A1A',
      yellow: '#FFE600',
      red: '#FF4757',
      green: '#7FD858',
      blue: '#4D9DE0',
      purple: '#9B5DE5',
      orange: '#FF8C42',
      pink: '#FF6B9D',
      cyan: '#00BBF9'
    }
  },
  {
    id: 'dark',
    name: 'Dark',
    colors: {
      bg: '#1A1A1A',
      dark: '#FFFFFF',
      yellow: '#FFE600',
      red: '#FF4757',
      green: '#7FD858',
      blue: '#4D9DE0',
      purple: '#9B5DE5',
      orange: '#FF8C42',
      pink: '#FF6B9D',
      cyan: '#00BBF9'
    }
  },
  {
    id: 'light',
    name: 'Light',
    colors: {
      bg: '#FFFFFF',
      dark: '#333333',
      yellow: '#FFD700',
      red: '#E74C3C',
      green: '#2ECC71',
      blue: '#3498DB',
      purple: '#9B59B6',
      orange: '#F39C12',
      pink: '#E91E63',
      cyan: '#00BCD4'
    }
  },
  {
    id: 'retro',
    name: 'Retro',
    colors: {
      bg: '#2D2D2D',
      dark: '#00FF00',
      yellow: '#FFFF00',
      red: '#FF0000',
      green: '#00FF00',
      blue: '#0000FF',
      purple: '#FF00FF',
      orange: '#FF8800',
      pink: '#FF0088',
      cyan: '#00FFFF'
    }
  },
  {
    id: 'pastel',
    name: 'Pastel',
    colors: {
      bg: '#FFF5E6',
      dark: '#5D4E37',
      yellow: '#FFE066',
      red: '#FF8A80',
      green: '#B9F6CA',
      blue: '#82B1FF',
      purple: '#EA80FC',
      orange: '#FFD180',
      pink: '#F48FB1',
      cyan: '#84FFFF'
    }
  }
];

// ============ Tailwind 配置 ============
const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        'brutal-yellow': '#FFE600',
        'brutal-pink': '#FF6B9D',
        'brutal-blue': '#4D9DE0',
        'brutal-green': '#7FD858',
        'brutal-orange': '#FF8C42',
        'brutal-purple': '#9B5DE5',
        'brutal-red': '#FF4757',
        'brutal-cyan': '#00BBF9',
        'brutal-bg': '#F0F0E8',
        'brutal-dark': '#1A1A1A',
        'brutal-gray': '#E0E0D8',
      },
      fontFamily: {
        'display': ['"Archivo Black"', 'sans-serif'],
        'mono': ['"Space Mono"', 'monospace'],
        'body': ['"Space Grotesk"', 'sans-serif']
      }
    }
  }
};
