export const COLORS = {
  primary: '#007AFF',      // Ana tema rengi (iOS mavi)
  secondary: '#5856D6',    // İkincil renk
  background: '#F2F2F7',   // Arka plan rengi
  card: '#FFFFFF',         // Kart arka planı
  text: '#000000',        // Ana metin rengi
  border: '#C6C6C8',       // Kenarlık rengi
  notification: '#FF3B30', // Bildirim rengi
  success: '#34C759',     // Başarı rengi
  warning: '#FF9500',      // Uyarı rengi
  error: '#FF3B30',        // Hata rengi
  info: '#5856D6',         // Bilgi rengi
  white: '#FFFFFF',        // Beyaz
  black: '#000000',        // Siyah
  gray: '#8E8E93',         // Gri
  lightGray: '#C7C7CC',    // Açık gri
  inputBackground: '#F2F2F7', // Input arka planı
  inputBorder: '#C6C6C8',     // Input kenarlık
  inputText: '#000000',       // Input metin
  placeholder: '#8E8E93',     // Placeholder rengi
  shadow: '#000000',          // Gölge rengi
  drawerBackground: '#F2F2F7', // Drawer arka plan
  drawerActive: '#007AFF',     // Drawer aktif öğe
  drawerInactive: '#8E8E93',   // Drawer pasif öğe
  tabBarActive: '#007AFF',     // Tab bar aktif
  tabBarInactive: '#8E8E93',   // Tab bar pasif
  tabBarBackground: '#FFFFFF', // Tab bar arka plan
  headerBackground: '#FFFFFF', // Header arka plan
  headerText: '#000000',       // Header metin
  headerTint: '#007AFF',       // Header ikonlar
  modalBackground: '#FFFFFF',  // Modal arka plan
  modalOverlay: 'rgba(0,0,0,0.5)', // Modal overlay
  buttonPrimary: '#007AFF',    // Ana buton
  buttonSecondary: '#5856D6', // İkincil buton
  buttonSuccess: '#34C759',    // Başarı butonu
  buttonWarning: '#FF9500',    // Uyarı butonu
  buttonError: '#FF3B30',      // Hata butonu
  buttonDisabled: '#C7C7CC',   // Devre dışı buton
  buttonText: '#FFFFFF',       // Buton metin
  buttonTextDisabled: '#8E8E93' // Devre dışı buton metin
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  }
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 6,
  },
};

export const BUTTON_STYLES = {
  primary: {
    backgroundColor: COLORS.buttonPrimary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  secondary: {
    backgroundColor: COLORS.buttonSecondary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.buttonPrimary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  text: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
};

export const CARD_STYLES = {
  default: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  elevated: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.medium,
  },
};

export const INPUT_STYLES = {
  default: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...TYPOGRAPHY.input,
  },
  error: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...TYPOGRAPHY.input,
  },
};

export const DRAWER_STYLES = {
  container: {
    backgroundColor: COLORS.drawerBackground,
  },
  header: {
    height: 200,
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
  },
  item: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  itemActive: {
    backgroundColor: COLORS.drawerActive,
  },
  itemText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  itemTextActive: {
    color: COLORS.white,
  },
};

export const TAB_BAR_STYLES = {
  container: {
    backgroundColor: COLORS.tabBarBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 60,
  },
  tab: {
    padding: SPACING.sm,
  },
  label: {
    ...TYPOGRAPHY.caption,
  },
  icon: {
    size: 24,
  },
};

export const ICONS = {
  // Ana menü ikonları
  home: 'home',
  profile: 'person',
  settings: 'settings',
  notifications: 'notifications',
  
  // Form ikonları
  email: 'mail',
  password: 'lock',
  search: 'search',
  filter: 'filter',
  
  // Aksiyon ikonları
  add: 'add',
  edit: 'edit',
  delete: 'delete',
  share: 'share',
  
  // Durum ikonları
  success: 'check-circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
  
  // Navigasyon ikonları
  back: 'arrow-back',
  forward: 'arrow-forward',
  menu: 'menu',
  close: 'close',
};

export const ANIMATIONS = {
  duration: {
    short: 200,
    medium: 300,
    long: 500,
  },
  easing: {
    default: 'ease',
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
};

export const THEME = {
  light: {
    ...COLORS,
    ...TYPOGRAPHY,
    ...SPACING,
    ...BORDER_RADIUS,
    ...SHADOWS,
    ...BUTTON_STYLES,
    ...CARD_STYLES,
    ...INPUT_STYLES,
    ...DRAWER_STYLES,
    ...TAB_BAR_STYLES,
    ...ICONS,
    ...ANIMATIONS,
    ...BREAKPOINTS,
  },
  dark: {
    // Karanlık tema için renk ve stil değişkenleri
  },
}; 