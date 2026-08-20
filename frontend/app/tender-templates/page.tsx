"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { templateService } from "@/services/template.service";
import { useTemplateDesignerStore, getDefaultSections } from "@/store/tender-template/template-designer.store";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { Plus, LayoutTemplate, Clock, Archive, FileText, ChevronRight, Eye, Edit2, Trash2, Search, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { TemplatePreviewModal } from "@/components/tender/template/TemplatePreviewModal";

export default function TenderTemplatesDashboard() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hideDrafts, setHideDrafts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await templateService.getAllTemplates();
      // Always show PUBLISHED templates first (newest to oldest), then DRAFT (newest to oldest), then ARCHIVED
      const sortedData = (data || []).sort((a: any, b: any) => {
        const order: Record<string, number> = { 'PUBLISHED': 1, 'DRAFT': 2, 'ARCHIVED': 3 };
        const statusA = order[a.status] || 99;
        const statusB = order[b.status] || 99;
        if (statusA !== statusB) {
          return statusA - statusB;
        }
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      setTemplates(sortedData);
    } catch (error) {
      toast.error("Failed to fetch templates");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (e: React.MouseEvent, template: any) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete the draft "${template.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(template.id);
      await templateService.deleteTemplate(template.id);
      toast.success(`Draft "${template.name}" deleted successfully`);
      setTemplates((prev) => prev.filter((t) => t.id !== template.id));
    } catch (error: any) {
      toast.error(error.message || "Failed to delete template");
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateNew = () => {
    // Reset the designer store to start fresh with default schema
    useTemplateDesignerStore.setState({
      id: null,
      templateCode: null,
      name: 'Standard Procurement Template',
      description: 'Default template containing details, financials, and schedules.',
      version: 1,
      status: 'DRAFT',
      sections: getDefaultSections(),
      selectedFieldId: null,
      selectedSectionId: null
    });
    router.push("/tender-template");
  };

  const handleOpenTemplate = (template: any) => {
    // Populate the store with this template
    useTemplateDesignerStore.setState({
      id: template.id,
      templateCode: template.templateCode,
      name: template.name,
      description: template.description || '',
      version: template.version,
      status: template.status,
      sections: template.schema?.sections || [],
      selectedFieldId: null,
      selectedSectionId: null
    });
    router.push("/tender-template");
  };

  const handlePreviewClick = (e: React.MouseEvent, template: any) => {
    e.stopPropagation();
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleUseTemplate = (e: React.MouseEvent, template: any) => {
    e.stopPropagation();
    router.push(`/tender-creation/dynamic/${template.id}`);
  };

  const draftCount = templates.filter((t) => t.status === "DRAFT").length;
  const query = searchQuery.toLowerCase().trim();

  const filteredTemplates = templates.filter((t) => {
    if (hideDrafts && t.status === "DRAFT") return false;
    if (!query) return true;
    const nameMatch = (t.name || "").toLowerCase().includes(query);
    const descMatch = (t.description || "").toLowerCase().includes(query);
    const statusMatch = (t.status || "").toLowerCase().includes(query);
    return nameMatch || descMatch || statusMatch;
  });

  const showSystemDefault =
    !query || "standard tender creation flow system default procurement".includes(query);

  const totalVisibleCount = filteredTemplates.length + (showSystemDefault ? 1 : 0);

  return (
    <div className="min-h-screen bg-grey-1 relative overflow-hidden">
      <Toaster position="top-right" richColors />
      
      {/* Background Aesthetic Matching Tender Creation */}
      <div className="absolute top-0 left-0 right-0 h-[25vh] bg-gradient-to-br from-[#953002] to-[#FFB401] rounded-b-[30%] opacity-90 -z-10" />

      <div className="max-w-[1200px] mx-auto px-5 pt-12 pb-24">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 text-white">
          <div>
            <h1 className="text-3xl font-bold tracking-tight drop-shadow-sm text-[#953002]">Tender Templates</h1>
            <p className="text-[#953002]/80 mt-1 drop-shadow-sm">Manage dynamic forms and structured data configurations for future tenders.</p>
          </div>
          <Button 
            className="bg-white text-[#953002] hover:bg-white/90 shadow-lg shrink-0 h-11 px-6 font-semibold"
            onClick={handleCreateNew}
          >
            <Plus className="w-4 h-4 mr-2" /> 
            Create New Template
          </Button>
        </div>

        {/* Templates Grid Container */}
        <div className="bg-white rounded-xl shadow-xl border border-grey-2 p-8 min-h-[500px]">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 pb-4 border-b border-grey-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">Template Library</h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-grey-1 text-grey-6 border border-grey-2">
                {totalVisibleCount} {totalVisibleCount === 1 ? "template" : "templates"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Search Bar */}
              <div className="relative min-w-[240px] sm:min-w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-sm bg-grey-1/40 border border-grey-2 rounded-lg text-foreground placeholder:text-grey-4 focus:outline-none focus:ring-2 focus:ring-[#953002]/20 focus:border-[#953002] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-grey-4 hover:text-foreground rounded-full transition-colors"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Hide Drafts Toggle */}
              <label className="flex items-center gap-2 text-sm font-medium text-grey-6 hover:text-foreground cursor-pointer select-none transition-colors shrink-0">
                <input
                  type="checkbox"
                  checked={hideDrafts}
                  onChange={(e) => setHideDrafts(e.target.checked)}
                  className="w-4 h-4 rounded border-grey-3 text-[#953002] focus:ring-[#953002] cursor-pointer accent-[#953002]"
                />
                <span>Hide Drafts</span>
                {draftCount > 0 && (
                  <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    {draftCount}
                  </span>
                )}
              </label>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-grey-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p>Loading templates...</p>
            </div>
          ) : totalVisibleCount === 0 ? (
            <div className="py-20 text-center text-grey-4 flex flex-col items-center justify-center">
              <FileText className="w-12 h-12 mb-3 text-grey-3" />
              <p className="text-base font-semibold text-foreground">No templates found</p>
              <p className="text-sm text-grey-5 mt-1">No templates match &quot;{searchQuery}&quot;</p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-xs font-semibold text-[#953002] hover:underline"
              >
                Clear search filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Pinned Default Template */}
              {showSystemDefault && (
                <div 
                  key="default-standard" 
                  className="group bg-[#FFB401]/5 border-2 border-[#FFB401] rounded-xl p-6 hover:shadow-md transition-all cursor-pointer flex flex-col h-full relative overflow-hidden"
                  onClick={() => router.push('/tender-creation')}
                >
                  <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl text-[10px] font-bold tracking-wider uppercase bg-[#FFB401] text-white shadow-sm">
                    SYSTEM DEFAULT
                  </div>

                  <div className="bg-[#953002] w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-sm">
                    <LayoutTemplate className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-foreground mb-2 pr-20">
                    Standard Tender Creation Flow
                  </h3>
                  
                  <p className="text-sm text-grey-6 font-medium mb-6 line-clamp-2 min-h-[40px]">
                    The standard default 5-step wizard (Details, Financials, Documents, Compliance, Schedule).
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-[#FFB401]/30 flex items-center justify-between text-xs font-bold text-[#953002]">
                    <div className="flex items-center">
                      PINNED TEMPLATE
                    </div>
                    <div className="flex items-center">
                      Use Template <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Database Templates */}
              {filteredTemplates.map((template) => {
                const isPublished = template.status === 'PUBLISHED';
                const isArchived = template.status === 'ARCHIVED';

                const handleCardClick = () => {
                  if (isPublished) handleUseTemplate({ stopPropagation: () => {} } as any, template);
                  else if (!isArchived) handleOpenTemplate(template);
                };

                return (
                  <div
                    key={template.id}
                    onClick={!isArchived ? handleCardClick : undefined}
                    className={`group bg-white border rounded-xl p-6 transition-all flex flex-col h-full relative overflow-hidden
                      ${isArchived
                        ? 'border-grey-2 opacity-60 cursor-not-allowed'
                        : isPublished
                          ? 'border-grey-2 hover:border-primary/60 hover:shadow-lg cursor-pointer'
                          : 'border-grey-2 hover:border-amber-400/60 hover:shadow-md cursor-pointer'
                      }`}
                  >
                    {/* Status Ribbon */}
                    <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl text-[10px] font-bold tracking-wider uppercase ${
                      isPublished ? 'bg-emerald-100 text-emerald-800 border-b border-l border-emerald-200' :
                      isArchived  ? 'bg-grey-2 text-grey-6 border-b border-l border-grey-3' :
                      'bg-amber-100 text-amber-800 border-b border-l border-amber-200'
                    }`}>
                      {template.status}
                    </div>

                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm
                      ${isPublished ? 'bg-primary/10 text-primary' : isArchived ? 'bg-grey-2 text-grey-5' : 'bg-amber-50 text-amber-600'}`}>
                      <FileText className="w-6 h-6" />
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-2 pr-20">
                      {template.name}
                    </h3>

                    <p className="text-sm text-grey-5 mb-6 line-clamp-2 min-h-[40px]">
                      {template.description || 'No description provided for this template.'}
                    </p>

                    {/* Footer */}
                    <div className="mt-auto pt-4 border-t border-grey-2 flex items-center justify-between gap-2">
                      {/* Left: meta + icon actions */}
                      <div className="flex items-center gap-2">
                        <span className="flex items-center text-xs text-grey-5">
                          <Clock className="w-3 h-3 mr-1" />
                          V{template.version} • {new Date(template.updatedAt || template.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenTemplate(template); }}
                          className="p-1 text-grey-4 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                          title="Edit in Designer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePreviewClick(e, template); }}
                          className="p-1 text-grey-4 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          title="Preview Fields"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {template.status === 'DRAFT' && (
                          <button
                            onClick={(e) => handleDeleteTemplate(e, template)}
                            disabled={deletingId === template.id}
                            className="p-1 text-grey-4 hover:text-error hover:bg-error/10 rounded transition-colors disabled:opacity-50"
                            title="Delete Draft"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Right: primary CTA */}
                      {isPublished ? (
                        <div className="flex items-center text-xs font-bold text-primary">
                          Use Template <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      ) : !isArchived ? (
                        <div className="flex items-center text-xs font-semibold text-amber-600">
                          Edit Draft <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      ) : (
                        <div className="flex items-center text-xs text-grey-5">
                          <Archive className="w-3.5 h-3.5 mr-1" /> Archived
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

            </div>
          )}
        </div>
      </div>

      <TemplatePreviewModal 
        template={previewTemplate}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
