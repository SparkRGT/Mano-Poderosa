import { useAuth } from '../../context';
import { getInitials } from '../../utils/helpers';

interface NavbarProps {
  onMenuClick: () => void;
  title?: string;
}

export function Navbar({ onMenuClick, title }: NavbarProps) {
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-sky-100 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Menu button (mobile) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-sky-50 hover:text-sky-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Title */}
        <h1 className="text-xl font-semibold text-slate-800 lg:ml-0">
          {title}
        </h1>

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-slate-800">{profile?.name}</p>
            <p className="text-xs text-slate-500">{profile?.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {profile ? getInitials(profile.name) : '?'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
