'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { formatDisplayDate } from '@/lib/utils';
import type { EnergyReading } from '@/types';
import { Pencil, Trash2 } from 'lucide-react';

interface RecentEntriesProps {
  readings: EnergyReading[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Recent Entries List - shows last 5 entries with edit/delete actions
 */
export function RecentEntries({ readings, onEdit, onDelete }: RecentEntriesProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const recent = [...readings]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  if (recent.length === 0) {
    return null;
  }

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = (id: string) => {
    onDelete(id);
    setDeleteConfirmId(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Letzte Einträge</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recent.map(reading => (
            <div
              key={reading.id}
              className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium text-text">
                  {reading.kwh.toFixed(2)} kWh
                </p>
                <p className="text-sm text-text-secondary">
                  {formatDisplayDate(reading.timestamp)}
                </p>
                {reading.photoBase64 && (
                  <span className="text-xs text-text-secondary">📷 Foto</span>
                )}
              </div>

              <div className="flex gap-2">
                {deleteConfirmId === reading.id ? (
                  <>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => confirmDelete(reading.id)}
                    >
                      Bestätigen
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmId(null)}
                    >
                      Abbrechen
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(reading.id)}
                      aria-label="Bearbeiten"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(reading.id)}
                      aria-label="Löschen"
                    >
                      <Trash2 className="w-4 h-4 text-critical" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
