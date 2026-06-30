"use client";

import { useTenderCreationStore } from "@/store/tender-creation/tender-creation.store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export function ScheduleStep() {
  const { formData, updateFormData } = useTenderCreationStore();

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
            <CalendarDays className="h-4 w-4 text-primary" />
          </div>
          <CardTitle>Schedule & Key Dates</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
          {/* Advertisement Start Date */}
          <div className="space-y-1.5">
            <Label htmlFor="tc-ad-date">Advertisement Start Date</Label>
            <Input
              id="tc-ad-date"
              type="date"
              value={formData.advertisementStartDate}
              onChange={(e) =>
                updateFormData({ advertisementStartDate: e.target.value })
              }
            />
          </div>

          {/* Bid Submission Deadline */}
          <div className="space-y-1.5">
            <Label htmlFor="tc-deadline">Bid Submission Deadline</Label>
            <Input
              id="tc-deadline"
              type="date"
              value={formData.bidSubmissionDeadline}
              onChange={(e) =>
                updateFormData({ bidSubmissionDeadline: e.target.value })
              }
            />
          </div>
        </div>

        {/* Pre-Bid Meeting */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={formData.preBidMeetingEnabled}
                onChange={(e) =>
                  updateFormData({ preBidMeetingEnabled: e.target.checked })
                }
                className="peer sr-only"
              />
              <div className="h-5 w-5 rounded border-2 border-grey-3 peer-checked:border-primary peer-checked:bg-primary transition-colors flex items-center justify-center">
                {formData.preBidMeetingEnabled && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm font-medium text-foreground">
              Schedule a pre-bid meeting
            </span>
          </label>

          {formData.preBidMeetingEnabled && (
            <div className="space-y-1.5 max-w-xs ml-8">
              <Label htmlFor="tc-prebid">Pre-Bid Meeting Date</Label>
              <Input
                id="tc-prebid"
                type="date"
                value={formData.preBidMeetingDate}
                onChange={(e) =>
                  updateFormData({ preBidMeetingDate: e.target.value })
                }
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
