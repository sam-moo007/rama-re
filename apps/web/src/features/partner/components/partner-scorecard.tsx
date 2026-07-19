"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import type { IngestionSource, IngestionRecordListResponse } from "@rama/contracts";
import { Badge } from "@/components/ui/badge";

type PartnerScorecardProps = {
  source: IngestionSource | undefined;
  records: IngestionRecordListResponse["items"];
};

export function PartnerScorecard({ source, records }: PartnerScorecardProps) {
  // If no source is provided (e.g. they haven't uploaded anything or it's a fresh account)
  if (!source) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Freshness & Quality</CardTitle>
          <CardDescription>Upload a feed to see your performance scorecard.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-slate-500 border-2 border-dashed rounded">
            <Clock className="h-8 w-8 mb-2 opacity-20" />
            <p>No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate acceptance rate
  const accepted = records.filter(r => r.status === "accepted").length;
  const total = records.length;
  const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

  // Evaluate freshness (SLA is typically 72 hours for active feed sources in RAMA)
  const isFresh = source.active;
  const lastSync = source.updatedAt ? new Date(source.updatedAt) : null;
  const daysSinceSync = lastSync ? Math.floor((Date.now() - lastSync.getTime()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Partner Scorecard</CardTitle>
            <CardDescription>Your current feed compliance and data quality</CardDescription>
          </div>
          <Badge variant={isFresh ? "default" : "destructive"} className={isFresh ? "bg-green-600" : ""}>
            {isFresh ? "Compliant" : "Needs Attention"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Data Freshness */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center font-medium">
              <Clock className="w-4 h-4 mr-2 text-slate-500" />
              Feed Freshness
            </div>
            <span className="font-medium">
              {daysSinceSync !== null ? (daysSinceSync === 0 ? "Updated today" : `${daysSinceSync} days ago`) : "Never"}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {isFresh 
              ? "Your data feed is within the required 72-hour SLA."
              : "Your data feed is stale. Please upload a new feed to avoid demotion in search rankings."}
          </p>
        </div>

        {/* Quality Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center font-medium">
              {acceptanceRate >= 90 ? (
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
              )}
              Acceptance Rate
            </div>
            <span className="font-bold">{acceptanceRate}%</span>
          </div>
          <Progress value={acceptanceRate} className="h-2" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>{total - accepted} items quarantined or pending</span>
            <span>{accepted} items accepted</span>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
