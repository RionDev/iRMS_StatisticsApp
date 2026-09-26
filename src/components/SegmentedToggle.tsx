import { useThemeStore } from '@common/stores/themeStore';

interface SegmentedToggleProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
}

/** 버튼 묶음 전환 — 활성: primary 배경 + primaryText (theme.md 활성 탭 규칙) */
export function SegmentedToggle<T extends string>({ options, value, onChange, ariaLabel }: SegmentedToggleProps<T>) {
  const { theme } = useThemeStore();
  return (
    <div role="group" aria-label={ariaLabel} style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            style={{
              padding: '4px 10px',
              borderRadius: theme.radius.sm,
              border: `1px solid ${active ? theme.colors.primary : theme.colors.border}`,
              backgroundColor: active ? theme.colors.primary : theme.colors.surface,
              color: active ? theme.colors.primaryText : theme.colors.textMuted,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily,
              cursor: 'pointer',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
