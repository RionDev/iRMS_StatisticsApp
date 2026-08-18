import type { CSSProperties, ReactNode } from 'react';
import { useThemeStore } from '@common/stores/themeStore';

interface ChartCardProps {
  title: string;
  /** 우측 컨트롤 (기간 버튼, 벤더 셀렉트 등) */
  controls?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
}

export function ChartCard({ title, controls, children, style }: ChartCardProps) {
  const { theme } = useThemeStore();
  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.md,
        boxShadow: theme.shadow.card,
        padding: '16px 20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '8px',
        }}
      >
        <span
          style={{
            fontSize: theme.fontSize.base,
            fontWeight: 700,
            color: theme.colors.text,
          }}
        >
          {title}
        </span>
        {controls}
      </div>
      {children}
    </div>
  );
}

/** 차트 로딩/실패 표시 — 차트와 같은 높이를 유지한다 */
export function ChartState({ height, children }: { height: number; children: ReactNode }) {
  const { theme } = useThemeStore();
  return (
    <div
      style={{
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.colors.textMuted,
        fontSize: theme.fontSize.base,
      }}
    >
      {children}
    </div>
  );
}
