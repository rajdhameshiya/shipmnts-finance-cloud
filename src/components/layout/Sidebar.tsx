import { useEffect, useState } from 'react';
import { AlertTriangle, BarChart3, ChevronDown, FileCheck2, Inbox, PanelLeftClose, ShipWheel, UserRound } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import type { Role } from '../../types';
import { cn } from '../../lib/format';

const roles: Role[] = ['AP Executive', 'Ops Executive', 'Finance Head'];

const defaultPath: Record<Role, string> = {
  'AP Executive': '/inbox',
  'Ops Executive': '/exceptions',
  'Finance Head': '/dashboard',
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const { role, setRole } = useAppStore();
  const [hovered, setHovered] = useState(false);
  const [narrowViewport, setNarrowViewport] = useState(false);
  const compact = narrowViewport || (collapsed && !hovered);
  const userName = 'Suresh Menon';
  const initials = userName
    .split(' ')
    .map((part) => part[0])
    .join('');
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center rounded-md py-2 text-[13px] font-medium transition',
      compact ? 'justify-center px-2' : 'gap-2 px-3',
      isActive ? 'bg-orange text-white' : 'text-slate-200 hover:bg-white/10',
    );

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => {
      setNarrowViewport(media.matches);
      if (media.matches) setHovered(false);
    };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return (
    <aside
      className={cn('flex h-full shrink-0 flex-col bg-navy text-white transition-[width] duration-200', compact ? 'w-[68px]' : 'w-[200px]')}
      onMouseEnter={() => setHovered(window.matchMedia('(hover: hover)').matches)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={cn('border-b border-white/10 py-4', compact ? 'px-3' : 'px-4')}>
        <div className={cn('flex min-w-0 items-center gap-2 text-[17px] font-semibold', compact ? 'justify-center' : 'justify-between')}>
          <div className={cn('flex min-w-0 items-center gap-2', compact && 'justify-center')}>
            <ShipWheel size={24} className="shrink-0" />
            {!compact && <span className="truncate">Shipmnts</span>}
          </div>
          {!compact && !collapsed && !narrowViewport && (
            <button
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-300 transition hover:bg-white/10 hover:text-white"
              onClick={onToggle}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={17} />
            </button>
          )}
        </div>
        {!compact && <div className="pl-8 text-[12px] text-slate-300">Finance Cloud</div>}
      </div>
      <nav className={cn('space-y-1 py-4', compact ? 'px-2' : 'px-3')}>
        <NavLink to="/inbox" className={linkClass} title="AP Inbox">
          <Inbox size={17} className="shrink-0" /> {!compact && <span>AP Inbox</span>}
        </NavLink>
        <NavLink to="/exceptions" className={linkClass} title="Exceptions">
          <AlertTriangle size={17} className="shrink-0" /> {!compact && <span>Exceptions</span>}
        </NavLink>
        <NavLink to="/drafts" className={linkClass} title="Drafts">
          <FileCheck2 size={17} className="shrink-0" /> {!compact && <span>Drafts</span>}
        </NavLink>
        <NavLink to="/dashboard" className={linkClass} title="Dashboard">
          <BarChart3 size={17} className="shrink-0" /> {!compact && <span>Dashboard</span>}
        </NavLink>
      </nav>
      <div className={cn('mt-auto border-t border-white/10', compact ? 'space-y-2 p-2' : 'space-y-3 p-4')}>
        {!compact && (
          <>
            <div className="text-[11px] font-medium uppercase tracking-[0.05em] text-slate-400">Role</div>
            <div className="text-[13px] font-semibold">{userName}</div>
          </>
        )}
        {compact ? (
          <div
            className="flex h-10 w-full items-center justify-center rounded-md border border-white/10 bg-white/5 text-[12px] font-semibold text-slate-100"
            title={`${userName} - ${role}`}
          >
            {initials || <UserRound size={16} />}
          </div>
        ) : (
          <label className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-2 text-[12px]" title={`Role: ${role}`}>
            <UserRound size={15} className="shrink-0 text-slate-300" />
            <select
              className="w-full appearance-none bg-transparent text-white outline-none"
              value={role}
              onChange={(event) => {
                const next = event.target.value as Role;
                setRole(next);
                navigate(defaultPath[next]);
              }}
            >
              {roles.map((item) => (
                <option key={item} className="text-slate-900">
                  {item}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="pointer-events-none shrink-0 text-slate-300" />
          </label>
        )}
      </div>
    </aside>
  );
}
