'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MoreHorizontal } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
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
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { cn } from '../../../lib/utils';

const mockData = [
  { id: 'T-1006', title: 'Legal Advisory Services', category: 'Consulting', type: 'RFQ', date: '2026-03-15', modified: 'Add score' },
  { id: 'T-1007', title: 'Security System Installation', category: 'Services', type: 'NCB', date: '2026-03-20', modified: '2026-02-10' },
  { id: 'T-1008', title: 'Printing & Stationery Supplies', category: 'Goods', type: 'RFQ', date: '2026-02-25', modified: '2026-02-08' },
];

export default function DraftsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('drafts');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const tabs = [
    { id: 'pending', label: 'Pending', count: 9, href: '/' },
    { id: 'approved', label: 'Approved', count: 3, href: '/tenders/approved' },
    { id: 'rejected', label: 'Rejected', count: 2, href: '/tenders/rejected' },
    { id: 'cancelled', label: 'Cancelled', count: 2, href: '/tenders/cancelled' },
    { id: 'awards', label: 'Recent Awards', count: 3, href: '/tenders/recent-awards' },
    { id: 'drafts', label: 'Drafts', count: 3, href: '/tenders/drafts' },
  ];

  // Filter and paginate data
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
              setCurrentPage(1); // Reset to page 1 on search
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
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Last Modified</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Actions</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-text-muted">
                  <div className="text-[16px] font-semibold text-text-secondary">No tenders found</div>
                  <div className="text-[13px]">Try adjusting your search or filter criteria</div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((tender) => (
                <TableRow key={tender.id} className="hover:bg-[#faf8f6]">
                  <TableCell>
                    <input type="checkbox" className="w-4 h-4 accent-primary" />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-text-primary">Jane Doe</div>
                      <div className="text-[11px] text-text-muted">Senior Designer</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-text-primary">{tender.title}</TableCell>
                  <TableCell className="text-text-secondary">{tender.category} / {tender.type}</TableCell>
                  <TableCell className="text-text-secondary">{tender.date}</TableCell>
                  <TableCell className="text-text-secondary">{tender.modified}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="text-[12px] rounded-full">
                      Continue Editing
                    </Button>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 rounded-full p-0 border border-border">
                          <MoreHorizontal className="h-4 w-4 text-text-muted" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-surface border-border w-[180px]">
                        <DropdownMenuItem className="text-text-primary focus:bg-bg focus:text-text-primary">Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-text-primary focus:bg-bg focus:text-text-primary">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
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