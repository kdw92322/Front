import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/Textarea';
import GridTable from '@/components/layout/GridTable';

const CSDB = () => {
  // 샘플 데이터: 실제 환경에서는 API를 통해 가져옵니다.
  const [csdbList, setCsdbList] = useState([
    { id: 1, name: 'DMC-AIRCRAFT-A-00-00-00-01A-040A-D.xml', date: '2024-05-20', size: '15KB' },
    { id: 2, name: 'DMC-ENGINE-B-10-20-00-02A-040A-D.xml', date: '2024-05-21', size: '22KB' },
  ]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [previewContent, setPreviewContent] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // 파일 내용을 읽어 미리보기 창에 표시
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewContent(event.target.result);
      };
      reader.readAsText(file);
      if (file.name.toLowerCase().endsWith('.xml')) {
        // XML 파일인 경우 내용을 읽어 미리보기 창에 표시
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreviewContent(event.target.result);
        };
        reader.readAsText(file);
      } else {
        setPreviewContent(`[${file.name}] 파일이 선택되었습니다.\n용량: ${(file.size / 1024).toFixed(1)}KB\n\nZIP 파일은 내용 미리보기를 지원하지 않습니다.`);
      }
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert('업로드할 파일을 선택해주세요.');
      return;
    }

    const newFile = {
      id: csdbList.length + 1,
      name: selectedFile.name,
      date: new Date().toISOString().split('T')[0],
      size: `${(selectedFile.size / 1024).toFixed(1)}KB`,
    };

    setCsdbList([...csdbList, newFile]);
    setSelectedFile(null);
    alert('CSDB 데이터 모듈이 성공적으로 업로드되었습니다.');
  };

  const handleRowClick = (rowData) => {
    setSelectedId(rowData.id);

    // ZIP 파일인 경우 안내 메시지 표시
    if (rowData.name.toLowerCase().endsWith('.zip')) {
      setPreviewContent(`파일명: ${rowData.name}\n용량: ${rowData.size}\n등록일: ${rowData.date}\n\n상태: 압축 파일 데이터 모듈 세트입니다.`);
      return;
    }

    // 실제 구현 시에는 서버에서 파일 내용을 fetch 해옵니다.
    // 여기서는 샘플 XML 구조를 보여줍니다.
    setPreviewContent(`<?xml version="1.0" encoding="UTF-8"?>
<dmodule xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.s1000d.org/S1000D_4-1/xml_schema_flat/descript.xsd">
  <idstatus>
    <dmaddres>
      <dmcode modelIdentCode="S1000D" systemDiffCode="A" systemCode="00" subSystemCode="0" subSubSystemCode="0" assyCode="00" disassyCode="01" disassyCodeVariant="A" infoCode="040" infoCodeVariant="A" itemLocationCode="D"/>
    </dmaddres>
  </idstatus>
  <content>
    <description>
      <title>Preview for ${rowData.name}</title>
      <p>This is a simulated preview of the S1000D Data Module content.</p>
    </description>
  </content>
</dmodule>`);
  };

  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'ID', size: 1 },
    { accessorKey: 'name', header: '파일명', size: 5 },
    { accessorKey: 'date', header: '등록일', size: 2 },
    { accessorKey: 'size', header: '크기', size: 1 },
  ], []);

  return (
    <main className="h-full flex flex-col p-3 overflow-hidden">
      {/* 헤더 버튼 툴바 */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <CardTitle className="text-lg">CSDB 관리</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 px-6">조회</Button>
          <Button variant="default" size="sm" className="h-8 px-6" onClick={handleUpload}>저장</Button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* 좌측: CSDB 리스트 영역 */}
        <Card className="w-1/2 flex flex-col overflow-hidden">
          <CardHeader className="py-3 px-4 border-b bg-slate-50">
            <CardTitle className="text-sm font-semibold">데이터 모듈 목록</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              <GridTable 
                columns={columns} 
                data={csdbList} 
                onRowClick={handleRowClick}
                selectedRowId={selectedId}
                rowKey="id"
              />
            </div>
          </CardContent>
        </Card>

        {/* 우측: 업로드 및 뷰어 영역 */}
        <div className="w-1/2 flex flex-col gap-4 overflow-hidden">
          {/* 상단: 업로드 기능 */}
          <Card className="shrink-0">
            <CardHeader className="py-3 px-4 border-b bg-slate-50">
              <CardTitle className="text-sm font-semibold">CSDB 업로드</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Label className="text-xs">S1000D XML 파일 선택</Label>
                <div className="flex gap-2">
                  <Input 
                    type="file" 
                    accept=".xml"
                    accept=".xml,.zip"
                    onChange={handleFileChange} 
                    className="flex-1"
                  />
                  <Button variant="secondary" onClick={handleUpload}>업로드</Button>
                </div>
                {selectedFile && <p className="text-xs text-blue-600 font-medium">대기 중: {selectedFile.name}</p>}
              </div>
            </CardContent>
          </Card>

          {/* 하단: XML 뷰어 */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="py-3 px-4 border-b bg-slate-50">
              <CardTitle className="text-sm font-semibold">XML 내용 미리보기</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <Textarea 
                className="h-full w-full p-4 font-mono text-[11px] bg-slate-900 text-green-400 resize-none border-none leading-relaxed"
                value={previewContent}
                readOnly
                placeholder="목록에서 항목을 선택하거나 파일을 선택하면 이곳에 XML 구조가 표시됩니다."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default CSDB;