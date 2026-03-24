import React, { useMemo, useState, useEffect } from 'react';

export function TextArea({ getValue, row, column, table }) {

const initialValue = getValue() || "";
    const [value, setValue] = useState(initialValue);

    // 포커스를 잃었을 때 전체 데이터(setData) 업데이트
    const onBlur = () => {
      table.options.meta?.updateData(row.index, column.id, value);
    };

    return (
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
        rows={2} // 기본 노출 줄 수
        style={{
          width: '100%',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          resize: 'none',
          display: 'block'
        }}
      />
    );
}