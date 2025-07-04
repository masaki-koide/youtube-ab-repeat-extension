export function isDarkTheme(): boolean {
  return (
    document.documentElement.hasAttribute('dark') ||
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

export const buttonStyles = {
  base: {
    width: '40px',
    height: '40px',
    padding: '8px',
    marginLeft: '8px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s, border-radius 0.2s',
  },
  hover: 'rgba(255, 255, 255, 0.2)',
}

export const inputStyles = {
  wrapper: 'display: flex; flex-direction: column; gap: 8px; flex: 1;',
  container: 'position: relative; width: 100%;',
  label: (isDark: boolean) => `
    font-size: 12px;
    font-weight: 500;
    color: ${isDark ? '#fff' : '#000'};
  `,
  input: (isDark: boolean) => `
    width: 100%;
    padding: 8px 32px 8px 8px;
    font-size: 14px;
    line-height: 20px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
    border-radius: 4px;
    color: ${isDark ? '#fff' : '#000'};
    outline: none;
    box-sizing: border-box;
  `,
  clearButton: (isDark: boolean, visible: boolean) => `
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    padding: 0;
    background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: ${visible ? 'flex' : 'none'};
    align-items: center;
    justify-content: center;
    color: ${isDark ? '#fff' : '#000'};
    transition: background-color 0.2s;
  `,
}

export const formStyles = {
  container: (isDark: boolean, enabled: boolean) => `
    width: 100%;
    padding: 12px;
    background: ${isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)'};
    border-radius: 8px;
    margin-bottom: 12px;
    display: ${enabled ? 'block' : 'none'};
  `,
  content: 'display: flex; gap: 16px; width: 100%;',
}
