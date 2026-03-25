'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MoreHorizontal } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { cn } from '../../../lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';

const mockData = [
  { id: 'T-1001', title: 'Supply of Office Equipment', category: 'Goods', type: 'NCB', date: '2026-02-28', status: 'draft' },
  { id: 'T-1002', title: 'Construction of Community Hall', category: 'Works', type: 'NCB', date: '2026-03-10', status: 'submitted' },
  { id: 'T-1003', title: 'IT Infrastructure Upgrade', category: 'IT & Technology', type: 'ICB', date: '2026-03-05', status: 'under_review' },
  { id: 'T-1004', title: 'Medical Supplies Procurement', category: 'Goods', type: 'RFQ', date: '2026-02-20', status: 'rejected' },
  { id: 'T-1005', title: 'Road Rehabilitation Project', category: 'Works', type: 'ICB', date: '2026-04-01', status: 'rejected' },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-[#f0f0f0] text-[#6b6560]' },
  submitted: { label: 'Submitted', className: 'bg-info-bg text-info' },
  under_review: { label: 'Under Review', className: 'bg-warning-bg text-warning' },
  rejected: { label: 'Rejected', className: 'bg-danger-bg text-danger' },
};

export default function PendingTendersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState(''); // ✅ ADD THIS
  const [currentPage, setCurrentPage] = useState(1); // ✅ ADD THIS
  const itemsPerPage = 9; // ✅ ADD THIS

  const tabs = [
    { id: 'pending', label: 'Pending', count: 9, href: '/' },
    { id: 'approved', label: 'Approved', count: 3, href: '/tenders/approved' },
    { id: 'rejected', label: 'Rejected', count: 2, href: '/tenders/rejected' },
    { id: 'cancelled', label: 'Cancelled', count: 2, href: '/tenders/cancelled' },
    { id: 'awards', label: 'Recent Awards', count: 3, href: '/tenders/recent-awards' },
    { id: 'drafts', label: 'Drafts', count: 3, href: '/tenders/drafts' },
  ];

  // ✅ Filter and paginate data
  const filteredData = mockData.filter(tender =>
    tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tender.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-[26px] font-bold text-text-primary">Tenders Management</h1>
        <p className="text-[13px] text-text-muted mt-1">Sri Lanka Government Procurement — Officer View</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-surface-2 px-5">
        <div className="flex items-center gap-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => router.push(tab.href)}
              className={`px-4 py-3.5 text-[13.5px] font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-primary border-primary font-semibold'
                  : 'text-text-secondary border-transparent hover:text-text-primary'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[18px] inline-block ${
                  activeTab === tab.id ? 'bg-primary text-white' : 'bg-gray-200 text-text-secondary'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select defaultValue="all">
          <SelectTrigger className="w-[200px] bg-bg border-border">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent className="bg-surface border-border">
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="health">Health</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[200px] bg-bg border-border">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-surface border-border">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="goods">Goods</SelectItem>
            <SelectItem value="works">Works</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            placeholder="Search tenders..."
            className="pl-9 w-[260px] bg-bg border-border focus:bg-surface focus:border-primary"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // ✅ Reset to page 1 on search
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-2 border-b-2 border-border">
              <TableHead className="w-[44px]">
                <input type="checkbox" className="w-4 h-4 accent-primary" />
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Tender ID</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Tender Title</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Category / Type</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Closing Date</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Recommendation Status</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-text-muted">
                  <div className="text-[16px] font-semibold text-text-secondary">No tenders found</div>
                  <div className="text-[13px]">Try adjusting your search or filter criteria</div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((tender) => {
                const status = statusConfig[tender.status];
                return (
                  <TableRow key={tender.id} className="hover:bg-[#faf8f6]">
                    <TableCell>
                      <input type="checkbox" className="w-4 h-4 accent-primary" />
                    </TableCell>
                    <TableCell className="font-medium text-text-muted">{tender.id}</TableCell>
                    <TableCell className="font-medium text-text-primary">{tender.title}</TableCell>
                    <TableCell className="text-text-secondary">{tender.category} / {tender.type}</TableCell>
                    <TableCell className="text-text-secondary">
                      {new Date(tender.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${status.className} px-2.5 py-1 font-semibold text-[12px] rounded-full`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 rounded-full p-0 border border-border">
                            <MoreHorizontal className="h-4 w-4 text-text-muted" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-surface border-border w-[180px]">
                          <DropdownMenuItem className="text-text-primary focus:bg-bg focus:text-text-primary">View Details</DropdownMenuItem>
                          <DropdownMenuItem className="text-text-primary focus:bg-bg focus:text-text-primary">Edit</DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem className="text-danger focus:bg-danger-bg focus:text-danger">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* ✅ Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border">
          <div className="text-[13px] text-text-muted">
            Showing <strong className="text-text-primary">{filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–{Math.min(currentPage * itemsPerPage, filteredData.length)}</strong> of <strong className="text-text-primary">{filteredData.length}</strong> results
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1}
              className="w-[34px] h-[34px] rounded-md border-border"
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              ‹
            </Button>
            {[...Array(Math.min(5, totalPages))].map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "w-[34px] h-[34px] rounded-md",
                    currentPage === pageNum 
                      ? "bg-primary border-primary text-white font-bold" 
                      : "border-border"
                  )}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span className="text-text-muted px-2">…</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-[34px] h-[34px] rounded-md border-border"
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === totalPages || totalPages === 0}
              className="w-[34px] h-[34px] rounded-md border-border"
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              ›
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}