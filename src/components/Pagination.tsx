'use client';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  const startRange = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRange = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 bg-white border-t border-border-ios gap-4">
      <div className="flex items-center gap-4 order-2 sm:order-1">
        <label className="text-[11px] font-black text-foreground-muted uppercase tracking-widest whitespace-nowrap">
          จำนวนรายการต่อหน้า:
        </label>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
          className="bg-muted px-4 py-2 rounded-full border border-border-ios text-[12px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 appearance-none cursor-pointer pr-10 relative bg-[url('data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIyIiBkPSJNMTkgOWwtNyA3LTctNyIvPjwvc3ZnPg==')] bg-[length:1.2em_1.2em] bg-[right_0.75rem_center] bg-no-repeat"
        >
          {[5, 10, 25, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-6 order-1 sm:order-2">
        <span className="text-[12px] font-medium text-foreground-muted">
          <span className="font-bold text-foreground">{startRange} - {endRange}</span> จาก <span className="font-bold text-foreground">{total}</span> รายการ
        </span>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-full bg-muted border border-border-ios text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface transition-all active:scale-95"
            title="หน้าก่อนหน้า"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-full bg-muted border border-border-ios text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface transition-all active:scale-95"
            title="หน้าถัดไป"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
