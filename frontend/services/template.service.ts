const API_URL = process.env.NEXT_PUBLIC_TENDER_SERVICE_URL || 'http://localhost:8082';

export const templateService = {
  async createTemplate(data: any) {
    const res = await fetch(`${API_URL}/api/v1/tender-templates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create template");
    return res.json();
  },

  async updateTemplate(id: string, data: any) {
    const res = await fetch(`${API_URL}/api/v1/tender-templates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update template");
    return res.json();
  },

  async publishTemplate(id: string) {
    const res = await fetch(`${API_URL}/api/v1/tender-templates/${id}/publish`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to publish template");
    return res.json();
  }
};
