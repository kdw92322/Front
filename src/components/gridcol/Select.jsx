import React, { useMemo, useState, useEffect } from 'react';

export function Select({ getValue, row, column, table }) {
    const initialValue = getValue();
    const [value, setValue] = useState(initialValue);      
    // 포커스가 나갈 때(onBlur)나 엔터 칠 때 실제 데이터 업데이트
    const onBlur = () => {
        table.options.meta?.updateData(row.index, column.id, value);
    };

    return (
        <select value={getValue()} onChange={(e) => table.options.meta?.updateData(row.index, column.id, e.target.value)} onBlur={onBlur} style={{ width: '100%', padding: '4px' }}>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
        </select>
    );
}