"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DataTable({
  rows,
  title,
  dense,
  actions,
}: {
  rows: any[];
  title?: string;
  dense?: boolean;
  actions?: (row: any) => React.ReactNode;
}) {
  const columns = React.useMemo(() => {
    const cols = new Set<string>();
    rows?.forEach((r) => Object.keys(r || {}).forEach((k) => cols.add(k)));
    return Array.from(cols);
  }, [rows]);

  return (
    <Card className="w-full overflow-hidden">
      {title && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {title}
            <span className="text-xs font-normal text-muted-foreground">
              ({rows?.length ?? 0})
            </span>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="overflow-auto">
        <table className={`min-w-full ${dense ? "text-sm" : "text-base"}`}>
          <thead>
            <tr className="text-left border-b">
              {columns.map((c) => (
                <th key={c} className="py-2 pr-6 font-medium whitespace-nowrap">
                  {c}
                </th>
              ))}
              {actions && <th className="py-2 pr-6 font-medium">actions</th>}
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r, i) => (
              <tr key={i} className="border-b hover:bg-muted/40">
                {columns.map((c) => (
                  <td key={c} className="py-2 pr-6 align-top max-w-[28rem]">
                    <span className="break-words">
                      {typeof r?.[c] === "object"
                        ? JSON.stringify(r[c])
                        : String(r?.[c] ?? "").slice(0, 1000)}
                    </span>
                  </td>
                ))}
                {actions && (
                  <td className="py-2 pr-6 align-top">{actions(r)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
