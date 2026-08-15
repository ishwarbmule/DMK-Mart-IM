import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown, CheckCircle2 } from 'lucide-react';
import { ExportOptions, exportToCSV, exportToExcel } from '../../utils/exportUtils';

interface ExportDropdownProps<T = any> {
  options: ExportOptions<T>;
  buttonLabel?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  options,
  buttonLabel = 'Export Data',
  className = 'btn-secondary',
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastExported, setLastExported] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (format: 'excel' | 'csv') => {
    if (format === 'excel') {
      exportToExcel(options);
      setLastExported('Excel (.xls)');
    } else {
      exportToCSV(options);
      setLastExported('CSV (.csv)');
    }
    setIsOpen(false);

    setTimeout(() => {
      setLastExported(null);
    }, 3000);
  };

  const isSmall = size === 'sm';

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={className}
        style={{
          padding: isSmall ? '5px 10px' : '7px 14px',
          fontSize: isSmall ? '11px' : '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer'
        }}
      >
        {lastExported ? (
          <CheckCircle2 size={isSmall ? 13 : 15} color="#10B981" />
        ) : (
          <Download size={isSmall ? 13 : 15} />
        )}
        <span>{lastExported ? `Exported ${lastExported}` : buttonLabel}</span>
        <ChevronDown size={isSmall ? 11 : 13} style={{ opacity: 0.7 }} />
      </button>

      {isOpen && (
        <div
          className="glass-panel"
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            zIndex: 9999,
            minWidth: '220px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.8)',
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleExport('excel');
            }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '8px 10px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: '#FFF',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.15)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ color: '#10B981', marginTop: '2px' }}>
              <FileSpreadsheet size={16} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFF' }}>
                Microsoft Excel (.xls)
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                Styled layout with headers & totals
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleExport('csv');
            }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '8px 10px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: '#FFF',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0, 229, 255, 0.15)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ color: '#00E5FF', marginTop: '2px' }}>
              <FileText size={16} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFF' }}>
                Standard CSV (.csv)
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                Universal UTF-8 comma-separated
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
