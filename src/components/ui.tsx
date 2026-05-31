import React from "react";
import { Loader2, AlertTriangle } from "lucide-react";

// ==========================================
// 1. BUTTON COMPONENT
// ==========================================
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--org-primary)] text-xs md:text-sm cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[var(--org-primary)] hover:bg-[var(--org-primary-d)] text-white shadow-sm",
    secondary: "bg-[var(--brand-amber)] hover:bg-amber-600 text-white shadow-sm",
    outline: "border border-gray-300 hover:bg-gray-50 text-gray-700 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800",
    ghost: "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500"
  };

  const sizes = {
    sm: "px-3 py-1.5 gap-1 text-xs",
    md: "px-4  py-2 gap-2",
    lg: "px-5 py-2.5 gap-2 text-base"
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
};

// ==========================================
// 2. INPUT COMPONENT
// ==========================================
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

export const ImageUploadInput: React.FC<{
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => {
  const [dragOver, setDragOver] = React.useState(false);
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) onChange(ev.target.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) onChange(ev.target.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 select-none">{label}</label>}
      <div 
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`w-full rounded-lg border-2 border-dashed transition-all p-3 flex flex-col gap-3 ${
          dragOver ? "border-[var(--org-primary)] bg-[var(--org-primary-l)]" : "border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
        }`}
      >
        <div className="flex items-center gap-3">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 text-sm bg-transparent border-none outline-none focus:ring-0 dark:text-white p-1"
            placeholder={placeholder || "https://..."}
          />
          <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-1" />
          <label className="shrink-0 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded cursor-pointer transition text-gray-700 dark:text-slate-300">
            Upload File
            <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          </label>
        </div>
        {value && (
          <div className="h-24 w-auto rounded overflow-hidden flex justify-center bg-gray-50/50 dark:bg-slate-800/50">
            <img 
              src={value} 
              alt="Preview" 
              className="h-full object-contain" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=150";
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const Input: React.FC<InputProps> = ({
  label,
  error,
  prefixIcon,
  suffixIcon,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5 self-start">
      {label && (
        <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {prefixIcon && (
          <div className="absolute left-3 text-gray-400 pointer-events-none">
            {prefixIcon}
          </div>
        )}
        <input
          className={`w-full text-sm rounded-lg border bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 px-3.5 py-2 text-gray-900 dark:text-slate-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--org-primary)] focus:border-transparent transition-all ${
            prefixIcon ? "pl-10" : ""
          } ${suffixIcon ? "pr-10" : ""} ${
            error ? "border-red-500 focus:ring-red-500" : ""
          } ${className}`}
          onKeyDown={(e) => {
            if (props.type === "number") {
              if (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
              }
            }
            if (props.onKeyDown) {
              props.onKeyDown(e);
            }
          }}
          {...props}
        />
        {suffixIcon && (
          <div className="absolute right-3 text-gray-400">
            {suffixIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-0.5">{error}</p>
      )}
    </div>
  );
};

// ==========================================
// 3. CARD COMPONENT
// ==========================================
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  action?: React.ReactNode;
  padding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  action,
  padding = true,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          {title && (
            <h3 className="font-display font-semibold text-sm md:text-base text-gray-900 dark:text-slate-100">
              {title}
            </h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={padding ? "p-6" : ""}>{children}</div>
    </div>
  );
};

// ==========================================
// 4. MODAL COMPONENT
// ==========================================
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  size = "md"
}) => {
  if (!open) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-5xl"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      {/* Content wrapper */}
      <div
        className={`relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl backdrop-saturate-150 rounded-3xl w-full ${sizes[size]} shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-[0.98] duration-300 border border-black/5 dark:border-white/10`}
      >
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 dark:border-slate-700 shrink-0">
          <h3 className="font-display font-semibold text-base md:text-lg text-gray-900 dark:text-slate-100">
            {title || "Modal"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
          >
            &#x2715;
          </button>
        </div>
        <div className="p-6 overflow-y-auto w-full">{children}</div>
      </div>
    </div>
  );
};

// ==========================================
// 5. BADGE COMPONENT
// ==========================================
export interface BadgeProps {
  children: React.ReactNode;
  color?: "green" | "amber" | "blue" | "red" | "gray" | "purple";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  color = "gray",
  dot = false
}) => {
  const styles = {
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30",
    red: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/30",
    gray: "bg-gray-100 text-gray-700 dark:bg-slate-700/50 dark:text-slate-300 border border-gray-200 dark:border-slate-700",
    purple: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30"
  };

  const dots = {
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    blue: "bg-blue-500",
    red: "bg-red-500",
    gray: "bg-gray-400",
    purple: "bg-purple-500"
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full select-none ${styles[color]}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dots[color]}`} />}
      {children}
    </span>
  );
};

// ==========================================
// 6. AVATAR COMPONENT
// ==========================================
export interface AvatarProps {
  src?: string;
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = "md"
}) => {
  const sizes = {
    xs: "h-6 w-6 text-[9px]",
    sm: "h-8 w-8 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-14 w-14 text-base"
  };

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={`overflow-hidden rounded-full font-bold font-display inline-flex items-center justify-center shrink-0 border border-gray-200 dark:border-slate-700 ${sizes[size]} bg-gradient-to-tr from-[var(--org-primary)] to-[var(--org-secondary)] text-white`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span>{initials || "I"}</span>
      )}
    </div>
  );
};

import { motion, AnimatePresence } from "motion/react";

// ==========================================
// 7. TABLE COMPONENT
// ==========================================
export interface TableProps {
  columns: { header: string; accessor: string; cell?: (row: any) => React.ReactNode }[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
}

export const Table: React.FC<TableProps> = ({
  columns,
  data = [],
  loading = false,
  emptyMessage = "No records found"
}) => {
  return (
    <div className="w-full overflow-x-auto border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-4.5">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <motion.tbody layout className="divide-y divide-gray-100 dark:divide-slate-700 text-sm">
          <AnimatePresence mode="popLayout" initial={false}>
          {loading ? (
            Array.from({ length: 3 }).map((_, rIdx) => (
              <motion.tr key={`loading-${rIdx}`} layout className="animate-pulse">
                {columns.map((_, cIdx) => (
                  <td key={cIdx} className="px-6 py-5">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24" />
                  </td>
                ))}
              </motion.tr>
            ))
          ) : data.length === 0 ? (
            <motion.tr layout key="empty-state">
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </motion.tr>
          ) : (
            data.map((row, rIdx) => (
              <motion.tr
                key={row.id || rIdx}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, type: "spring", bounce: 0.2 }}
                className="hover:bg-gray-50/50 dark:hover:bg-slate-750 transition"
              >
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className="px-6 py-4 text-gray-700 dark:text-slate-200">
                    {col.cell ? col.cell(row) : row[col.accessor]}
                  </td>
                ))}
              </motion.tr>
            ))
          )}
          </AnimatePresence>
        </motion.tbody>
      </table>
    </div>
  );
};

// ==========================================
// 8. PAGE HEADER COMPONENT
// ==========================================
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-display text-gray-900 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">{actions}</div>
      )}
    </div>
  );
};

// ==========================================
// 9. STAT CARD COMPONENT
// ==========================================
export interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  progress?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  icon,
  progress
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm flex flex-col">
      <div className="flex items-start justify-between w-full">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest leading-none">
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mt-1">
            {value}
          </p>
        </div>
        {icon && (
          <div className="p-3 rounded-lg bg-[var(--org-primary-l)] text-[var(--org-primary)]">
            {icon}
          </div>
        )}
      </div>
      {change && (
        <div className="text-xs font-semibold mt-4 text-emerald-600 dark:text-emerald-400">
          {change}
        </div>
      )}
      {progress !== undefined && (
        <div className="mt-4 w-full">
          <ProgressBar value={progress} />
        </div>
      )}
    </div>
  );
};

// ==========================================
// 10. EMPTY STATE COMPONENT
// ==========================================
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50/50 dark:bg-slate-800/20 rounded-3xl border border-gray-100 dark:border-slate-800 select-none">
      {icon ? (
        <div className="p-4 bg-white/50 dark:bg-slate-700/50 shadow-sm rounded-full text-gray-400 mb-4.5">
          {icon}
        </div>
      ) : (
        <div className="p-4 bg-orange-50/50 dark:bg-orange-950/20 text-brand-amber rounded-full mb-4.5">
          <AlertTriangle className="h-8 w-8" />
        </div>
      )}
      <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md mt-2 mb-6">
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

// ==========================================
// 11. PROGRESS BAR COMPONENT
// ==========================================
export interface ProgressBarProps {
  value: number;
  max?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100
}) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1 text-[10px] md:text-xs text-gray-500 font-semibold uppercase">
        <span>Progress</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
        <div
          className="bg-[var(--org-primary)] h-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ==========================================
// 12. UNDERLINE TABS
// ==========================================
export interface TabsProps {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  active,
  onChange
}) => {
  return (
    <div className="flex items-center gap-6 border-b border-gray-200 dark:border-slate-700 w-full overflow-x-auto scrollbar-none shrink-0 mb-6 font-display">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`pb-3.5 text-xs md:text-sm font-semibold tracking-wide border-b-2 hover:text-gray-900 transition-all cursor-pointer ${
              isActive
                ? "border-[var(--org-primary)] text-[var(--org-primary)] font-bold"
                : "border-transparent text-gray-500 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

// ==========================================
// 13. CONFIRM DIALOG COMPONENT
// ==========================================
export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  danger = false
}) => {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-500">{message}</p>
        <div className="flex items-center justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
};
