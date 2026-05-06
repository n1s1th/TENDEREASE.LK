"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { templateService } from "@/services/template.service";
import { useTemplateDesignerStore, getDefaultSections } from "@/store/tender-template/template-designer.store";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { Plus, LayoutTemplate, Clock, Archive, FileText, ChevronRight, Eye, Play, Edit2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { TemplatePreviewModal } from "@/components/tender/template/TemplatePreviewModal";

export default function TenderTemplatesDashboard() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await templateService.getAllTemplates();
      const sortedData = (data || []).sort((a: any, b: any) => {
        const order: Record<string, number> = { 'PUBLISHED': 1, 'DRAFT': 2, 'ARCHIVED': 3 };
        const statusA = order[a.status] || 99;
        const statusB = order[b.status] || 99;
        return statusA - statusB;
      });
      setTemplates(sortedData);
    } catch (error) {
      toast.error("Failed to fetch templates");
      console.error(error);
    } finally {
      setLoading(false);
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
          
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-grey-2">
            <h2 className="text-xl font-bold text-foreground">Template Library</h2>
            <div className="text-sm text-grey-5">
              {templates.length} templates configured
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-grey-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p>Loading templates...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Pinned Default Template */}
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
                
                <h3 className="text-lg font-bold text-foreground mb-2 pr-20 line-clamp-1">
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

              {/* Dynamic Database Templates */}
              {templates.map((template) => (
                <div 
                  key={template.id} 
                  className="group bg-white border border-grey-2 rounded-xl p-6 hover:border-primary/50 hover:shadow-md transition-all flex flex-col h-full relative overflow-hidden"
                >
                  {/* Status Ribbon */}
                  <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl text-[10px] font-bold tracking-wider uppercase ${
                    template.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800 border-b border-l border-emerald-200' :
                    template.status === 'ARCHIVED' ? 'bg-grey-2 text-grey-6 border-b border-l border-grey-3' :
                    'bg-amber-100 text-amber-800 border-b border-l border-amber-200'
                  }`}>
                    {template.status}
                  </div>

                  <div className="bg-primary/5 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-foreground mb-2 pr-20 line-clamp-1">
                    {template.name}
                  </h3>
                  
                  <p className="text-sm text-grey-5 mb-6 line-clamp-2 min-h-[40px]">
                    {template.description || "No description provided format for this template."}
                  </p>
                  
                  {/* Action Buttons Row */}
                  <div className="mt-auto pt-4 border-t border-grey-2 flex items-center justify-between gap-2">
                    <div className="flex items-center text-xs text-grey-5">
                      <Clock className="w-3 h-3 mr-1" />
                      V{template.version} • {new Date(template.updatedAt || template.createdAt).toLocaleDateString()}
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenTemplate(template); }}
                        className="p-1.5 text-grey-5 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                        title="Edit Template"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => handlePreviewClick(e, template)}
                        className="p-1.5 text-grey-5 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                        title="Preview Template"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {template.status === 'PUBLISHED' && (
                        <button 
                          onClick={(e) => handleUseTemplate(e, template)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-md shadow-sm transition-colors"
                          title="Use Template"
                        >
                          <Play className="w-3 h-3 fill-current" /> Use
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
