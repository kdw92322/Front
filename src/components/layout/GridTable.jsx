import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';

const GridTable = ({ columns, data, onRowClick, selectedRowId }) => {
  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // 컬럼 정의에서 size(숫자)가 있으면 fr로, 없으면 기본 1fr로 설정
  // 고정 너비(px)가 필요하면 컬럼 정의에 width: '100px' 형태로 넣을 수 있도록 확장
  const gridTemplate = columns
    .map((c) => (c.width ? c.width : `${c.size || 1}fr`))
    .join(' ');

  return (
    <div className="w-full border border-slate-200 rounded-md overflow-hidden shadow-sm bg-white">
      {/* Header */}
      {table.getHeaderGroups().map((headerGroup) => (
        <div
          key={headerGroup.id}
          style={{ display: 'grid', gridTemplateColumns: gridTemplate }}
          className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold"
        >
          {headerGroup.headers.map((header) => (
            <div 
              key={header.id} 
              className="p-3 text-sm border-r last:border-0 border-slate-200 flex items-center justify-center"
            >
              {header.isPlaceholder
                ? null
                : flexRender(header.column.columnDef.header, header.getContext())}
            </div>
          ))}
        </div>
      ))}

      {/* Body */}
      <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100">
        {table.getRowModel().rows.map((row) => {
          // 현재 행이 선택되었는지 확인 (보통 id나 특정 키값 비교)
          const isSelected = selectedRowId === row.original.id;
          return (
            <div
              key={row.id}
              onClick={() => {
                    if(onRowClick) onRowClick(row.original);
                }
              }
              style={{ display: 'grid', gridTemplateColumns: gridTemplate }}
              className={`
                cursor-pointer transition-colors text-slate-600
                ${isSelected ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50'} 
              `}
            >
              {row.getVisibleCells().map((cell) => (
                <div key={cell.id} className="p-3 text-sm border-r last:border-0 truncate flex items-center justify-center">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </div>
          );
        })}
        {/* 로딩/데이터 없음 처리 생략 */}
      </div>
    </div>
  );
};

export default GridTable;