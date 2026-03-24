import React from 'react';

export function Check({ getValue, row, column, table }) {
    const value = getValue();
    const { updateData } = table.options.meta;

    const onCheckboxChange = (e) => {
        updateData(row.index, column.id, e.target.checked ? 'Y' : 'N');
    };

    return (
        <input
            type="checkbox"
            checked={value === 'Y'}
            onChange={onCheckboxChange}
            className="w-5 h-5"
        />
    );
}