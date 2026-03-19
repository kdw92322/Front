import React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react'; // 아이콘 라이브러리

export const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    checked={checked} // 파라미터로 받은 상태 적용
    onCheckedChange={onCheckedChange} // 변경 함수 연결
    className="peer h-4 w-4 shrink-0 rounded-sm border border-primary ..."
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center">
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))

Checkbox.displayName = "Checkbox"