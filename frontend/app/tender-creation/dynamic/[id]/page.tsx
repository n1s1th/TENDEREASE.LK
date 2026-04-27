"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { templateService } from "@/services/template.service";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";

export default function DynamicTenderCreationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadTemplate(id);
    }
  }, [id]);

  const loadTemplate = async (templateId: string) => {
    try {
      setLoading(true);
      const data = await templateService.getTemplateById(templateId);
      setTemplate(data);
    } catch (error) {
      console.error("Failed to load template", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-grey-1">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-grey-1 gap-4">
        <h2 className="text-2xl font-bold text-foreground">Template Not Found</h2>
        <button 
          onClick={() => router.push('/tender-templates')}
          className="flex items-center text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Templates
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grey-1 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <button 
          onClick={() => router.push('/tender-templates')}
          className="flex items-center text-sm font-semibold text-grey-5 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Templates
        </button>

        <Card className="border border-grey-2 shadow-sm">
          <CardContent className="p-10 flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl font-bold">🚀</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Creating Dynamic Tender</h1>
            <h2 className="text-xl text-primary font-semibold">{template.name}</h2>
            <p className="text-grey-5 max-w-lg mt-2">
              This route successfully captured the template ID: <strong>{id}</strong>.
              <br/><br/>
              The dynamic tender creation wizard engine will be implemented here, mapping the 
              JSON schema from the selected template into a multi-step submission form.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
