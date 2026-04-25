import { ref, onMounted } from 'vue';

const THEME_KEY = 'medb_theme';
export const theme = ref('auto'); // 'dark' | 'light' | 'auto'

// 应用主题到 DOM
function applyTheme(mode) {
  const html = document.documentElement;
  
  if (mode === 'dark') {
    html.setAttribute('data-theme', 'dark');
    html.classList.add('dark');
  } else if (mode === 'light') {
    html.setAttribute('data-theme', 'light');
    html.classList.remove('dark');
  } else {
    // auto: 移除属性,让 CSS @media 处理
    html.removeAttribute('data-theme');
    // 根据系统主题决定是否添加 dark 类
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
}

// 初始化主题
function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme && ['dark', 'light', 'auto'].includes(savedTheme)) {
    theme.value = savedTheme;
  }
  applyTheme(theme.value);
}

// 立即执行初始化
initTheme();

export function useTheme() {
  const setTheme = (newTheme) => {
    console.log('[Theme] Setting theme to:', newTheme);
    theme.value = newTheme;
    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
    console.log('[Theme] Theme applied, current value:', theme.value);
  };

  const toggleTheme = () => {
    const themes = ['auto', 'dark', 'light'];
    const currentIndex = themes.indexOf(theme.value);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeIcon = () => {
    // 返回 SVG 图标字符串
    switch (theme.value) {
      case 'dark':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
      case 'light':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
      case 'auto':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a7 7 0 1 0 10 10"/></svg>';
      default:
        return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a7 7 0 1 0 10 10"/></svg>';
    }
  };

  const getThemeText = () => {
    switch (theme.value) {
      case 'dark': return '深色';
      case 'light': return '浅色';
      case 'auto': return '自动';
      default: return '自动';
    }
  };

  // 监听系统主题变化
  const setupSystemThemeListener = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme.value === 'auto') {
        applyTheme('auto');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  };

  onMounted(() => {
    // 设置系统主题监听
    const cleanup = setupSystemThemeListener();
    
    // 组件卸载时清理
    return cleanup;
  });

  return {
    theme,
    setTheme,
    toggleTheme,
    getThemeIcon,
    getThemeText,
  };
}
