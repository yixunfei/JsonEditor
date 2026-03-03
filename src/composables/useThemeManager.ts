import { ref, watch } from 'vue';

/**
 * 主题管理组合函数
 * 提供深色/浅色主题切换及相关配色管理
 */
export function useThemeManager() {
  // 当前主题模式, 默认深色主题
  const themeMode = ref<'dark' | 'light'>('dark');
  
  // 各主题下的颜色配置
  const keyColorDark = ref('#7dd3fc');      // 深色主题下的键名颜色
  const keyColorLight = ref('#0369a1');     // 浅色主题下的键名颜色
  const valueColorDark = ref('#94a3b8');    // 深色主题下的值颜色
  const valueColorLight = ref('#475569');   // 浅色主题下的值颜色
  
  // 背景和面板颜色  
  const bgColor = ref('#1e1e1e');        // 背景色
  const panelOpacity = ref(0.8);         // 面板透明度
  
  // 监听主题变化，同步更新背景颜色
  watch(themeMode, (newTheme) => {
    if (newTheme === 'dark') {
      bgColor.value = '#1e1e1e'; // 深色主题背景色
    } else {
      bgColor.value = '#f8fafc'; // 浅色主题背景色
    }
  });

  // 主题切换方法
  const switchToDarkTheme = () => {
    themeMode.value = 'dark';
  };
  
  const switchToLightTheme = () => {
    themeMode.value = 'light';
  };

  // 获取当前主题下的键颜色
  const getKeyColor = () => themeMode.value === 'light' ? keyColorLight.value : keyColorDark.value;
  
  // 获取当前主题下的值颜色
  const getValueColor = () => themeMode.value === 'light' ? valueColorLight.value : valueColorDark.value;

  return {
    themeMode,
    keyColorDark,
    keyColorLight,
    valueColorDark,
    valueColorLight,
    bgColor,
    panelOpacity,
    switchToDarkTheme,
    switchToLightTheme,
    getKeyColor,
    getValueColor
  };
}