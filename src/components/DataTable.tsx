'use client';

import React from 'react';

export interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  sortable?: boolean;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  emptyMessage?: string;
}

export default function DataTable<T extends { id: string | number }>({
  columns,
  data,
  loading = false,
  sortKey,
  sortOrder,
  onSort,
  emptyMessage = 'ไม่พบข้อมูล',
}: DataTableProps<T>) {
  return (
    <div className="card-luxury p-0 overflow-hidden border-border-ios/60">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-ios">
          <thead className="bg-[#FDFCFB]">
            <tr>
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className={`px-8 py-5 text-left text-[11px] font-black text-foreground-muted uppercase tracking-[0.2em] select-none ${
                    column.sortable ? 'cursor-pointer hover:text-accent transition-colors group' : ''
                  } ${column.className || ''}`}
                  onClick={() => column.sortable && onSort?.(column.accessorKey as string)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <span className="flex flex-col -space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg 
                          className={`w-2 h-2 ${sortKey === column.accessorKey && sortOrder === 'asc' ? 'text-accent opacity-100' : 'text-foreground-muted opacity-30'}`} 
                          fill="currentColor" viewBox="0 0 24 24"
                        >
                          <path d="M12 4l-8 8h16z" />
                        </svg>
                        <svg 
                          className={`w-2 h-2 ${sortKey === column.accessorKey && sortOrder === 'desc' ? 'text-accent opacity-100' : 'text-foreground-muted opacity-30'}`} 
                          fill="currentColor" viewBox="0 0 24 24"
                        >
                          <path d="M12 20l8-8H4z" />
                        </svg>
                      </span>
                    )}
                    {/* Fixed visual for active sort when not hovering */}
                    {column.sortable && sortKey === column.accessorKey && (
                      <div className="flex flex-col -space-y-1">
                         <svg 
                          className={`w-2 h-2 ${sortOrder === 'asc' ? 'text-accent' : 'hidden'}`} 
                          fill="currentColor" viewBox="0 0 24 24"
                        >
                          <path d="M12 4l-8 8h16z" />
                        </svg>
                        <svg 
                          className={`w-2 h-2 ${sortOrder === 'desc' ? 'text-accent' : 'hidden'}`} 
                          fill="currentColor" viewBox="0 0 24 24"
                        >
                          <path d="M12 20l8-8H4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-border-ios/40">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-4"></div>
                    <span className="text-[13px] font-medium text-foreground-muted tracking-wide">กำลังโหลดข้อมูล...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-foreground-muted/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-[14px] font-semibold text-foreground-muted/60">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr 
                  key={item.id} 
                  className="group hover:bg-[#FDFCFB]/50 transition-colors duration-300"
                >
                  {columns.map((column, colIndex) => (
                    <td 
                      key={colIndex} 
                      className={`px-8 py-6 text-[13px] font-medium text-foreground transition-all ${column.className || ''}`}
                    >
                      {column.cell ? column.cell(item) : (item[column.accessorKey as keyof T] as unknown as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
