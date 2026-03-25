'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Bell, 
  FileText,
  TrendingUp,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

const menuItems = [
  {
    category: 'OVERVIEW',
    items: [
      { label: 'Tenders', icon: LayoutDashboard, href: '/' },
      { label: 'Procurements', icon: Package, href: '/procurements' },
      { label: 'Notification Center', icon: Bell, href: '/notifications'}, 
    ]
  },
  {
    category: 'TENDERS',
    items: [
      { label: 'Pending', icon: FileText, href: '/'}, 
      { label: 'Approved', icon: FileText, href: '/tenders/approved' },
      { label: 'Rejected', icon: FileText, href: '/tenders/rejected' },
      { label: 'Cancelled', icon: FileText, href: '/tenders/cancelled' },
      { label: 'Recent Awards', icon: FileText, href: '/tenders/recent-awards' },
      { label: 'Drafts', icon: FileText, href: '/tenders/drafts' },
    ]
  },
  {
    category: 'ANALYTICS',
    items: [
      { label: 'KPI Reports', icon: TrendingUp, href: '/reports' },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>(['OVERVIEW', 'TENDERS']);

  const toggleSection = (category: string) => {
    setExpandedSections(prev => 
      prev.includes(category) 
        ? prev.filter(s => s !== category)
        : [...prev, category]
    );
  };

  const checkIsActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <aside className="w-[220px] bg-surface border-r border-border py-6 flex-shrink-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
      <nav className="px-3 space-y-6">
        {menuItems.map((section) => (
          <div key={section.category}>
            <button
              onClick={() => toggleSection(section.category)}
              className="flex items-center justify-between w-full px-2 py-1.5 text-[10px] font-bold tracking-widest uppercase text-text-muted hover:text-text-primary transition-colors"
            >
              {section.category}
              {expandedSections.includes(section.category) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {expandedSections.includes(section.category) && (
              <div className="mt-1.5 space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = checkIsActive(item.href); 
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13.5px] font-medium transition-all relative',
                        active
                          ? 'bg-[#f0e8e4] text-primary font-semibold'
                          : 'text-text-secondary hover:bg-bg hover:text-text-primary'
                      )}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r" />
                      )}
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}