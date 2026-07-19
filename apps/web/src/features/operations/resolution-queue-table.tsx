"use client";

import { useEffect, useState } from "react";
import { getResolutionQueue, resolveEntity } from "@/lib/operations-api";
import type { EntityResolutionWorkItem, EntityResolutionStatus } from "@rama/contracts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

export function ResolutionQueueTable() {
  const [items, setItems] = useState<EntityResolutionWorkItem[]>([]);
  const [counts, setCounts] = useState<Record<EntityResolutionStatus, number> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getResolutionQueue();
      setItems(data.items);
      setCounts(data.counts);
    } catch (err: any) {
      setError(err.message || "Failed to load resolution queue");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleResolve = async (
    id: string, 
    decision: "matched" | "rejected", 
    version: number, 
    canonicalSlug?: string
  ) => {
    try {
      await resolveEntity(id, decision, version, canonicalSlug);
      // Refresh queue after successful resolution
      await fetchQueue();
    } catch (err: any) {
      alert(`Resolution failed: ${err.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Entity Resolution Queue</CardTitle>
            <CardDescription>Review and match uploaded properties to canonical records.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchQueue} disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {counts && (
          <div className="flex gap-4 mb-6">
            <Badge variant="secondary" className="px-3 py-1 text-sm">
              Pending: {counts.pending}
            </Badge>
            <Badge variant="default" className="px-3 py-1 text-sm bg-green-600">
              Matched: {counts.matched}
            </Badge>
            <Badge variant="destructive" className="px-3 py-1 text-sm">
              Rejected: {counts.rejected}
            </Badge>
            <Badge variant="outline" className="px-3 py-1 text-sm">
              Conflicts: {counts.conflict}
            </Badge>
          </div>
        )}

        {error ? (
          <div className="flex items-center text-destructive p-4 border border-destructive rounded bg-destructive/10">
            <AlertCircle className="mr-2 h-4 w-4" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="rounded border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>External ID</TableHead>
                  <TableHead>Submitted Slug</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No items in the queue.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.externalEntityId}</TableCell>
                      <TableCell>{item.submittedPropertySlug}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.sourceKey}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={item.status === 'pending' ? 'secondary' : item.status === 'matched' ? 'default' : 'destructive'}
                          className={item.status === 'matched' ? 'bg-green-600' : ''}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
                              onClick={() => handleResolve(item.id, "rejected", item.version)}
                            >
                              <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                            </Button>
                            <Button 
                              size="sm" 
                              className="h-8 bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                // For MVP, we automatically assume the submitted slug IS the canonical slug
                                // In a real scenario, this would open a modal to search/select the canonical property
                                handleResolve(item.id, "matched", item.version, item.submittedPropertySlug);
                              }}
                            >
                              <CheckCircle className="mr-1 h-3.5 w-3.5" /> Match
                            </Button>
                          </div>
                        )}
                        {item.status !== 'pending' && (
                          <span className="text-xs text-muted-foreground">
                            Resolved by {item.assignedTo === 'entity-resolution-queue' ? 'System' : 'Operator'}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
