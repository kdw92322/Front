import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/Textarea';
import GridTable from '@/components/layout/GridTable';
import { FaFileArchive, FaFileCode, FaFileImage, FaRegFile } from 'react-icons/fa';
import axios from '@/lib/axios';
import { API_BASE_URL } from '@/lib/config';

const CSDB = () => {
  const [csdbList, setCsdbList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ name: '' });

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [previewContent, setPreviewContent] = useState('');
  const [previewType, setPreviewType] = useState('text'); // 'text' 또는 'list'
  const [zipFiles, setZipFiles] = useState([]); // ZIP 내부 파일 목록
  const [uploadProgress, setUploadProgress] = useState(0); // 업로드 진행률 상태 추가

  // 목록 조회 함수
  const fetchCsdbList = async () => {
    setLoading(true);
    setSelectedId(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/s1000d/csdb/select`, { params: filter });
      setCsdbList(response.data || []);
    } catch (error) {
      console.error('CSDB 목록 조회 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드 시 목록 조회
  useEffect(() => {
    fetchCsdbList();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setSelectedId(null);
      if (file.name.toLowerCase().endsWith('.xml')) {
        setPreviewType('text');
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreviewContent(event.target.result);
        };
        reader.readAsText(file);
      } else if (file.name.toLowerCase().endsWith('.zip')) {
        setPreviewType('list');
        // 실제로는 jszip 라이브러리 등을 사용하여 클라이언트에서 읽을 수 있으나, 
        // 여기서는 업로드 대기 상태임을 표시합니다.
        setZipFiles([{ name: file.name, type: 'archive', size: `${(file.size / 1024).toFixed(1)}KB` }]);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('업로드할 파일을 선택해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploadProgress(0); // 진행률 초기화

    try {
      const response = await axios.post(`${API_BASE_URL}/s1000d/upload-csdb`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      alert('CSDB 데이터 모듈이 성공적으로 업로드되었습니다.');
      setSelectedFile(null);
      setUploadProgress(0); // 완료 후 바 숨김
      fetchCsdbList(); // 업로드 성공 후 목록 새로고침
    } catch (error) {
      console.error('CSDB 업로드 중 오류 발생:', error);
      alert(error.response?.data?.message || '업로드 중 오류가 발생했습니다.');
      setUploadProgress(0);
    }
  };

  const handleRowClick = async (rowData) => {
    setSelectedId(rowData.id);

    if (rowData.name.toLowerCase().endsWith('.zip')) {
      setPreviewType('list');
      try {
        // 서버로부터 ZIP 파일의 내부 목록을 조회합니다.
        const response = await axios.get(`${API_BASE_URL}/s1000d/csdb/zip-contents`, {
          params: { id: rowData.id }
        });
        setZipFiles(response.data || []);
      } catch (error) {
        console.error("ZIP 파일 목록 조회 오류:", error);
        setZipFiles([]);
      }
    } else {
      setPreviewType('text');
      try {
        // XML 파일의 내용을 조회합니다.
        const response = await axios.get(`${API_BASE_URL}/s1000d/csdb/xml-content`, {
          params: { id: rowData.id }
        });
        setPreviewContent(response.data || '');
      } catch (error) {
        console.error("XML 내용 조회 오류:", error);
        setPreviewContent('내용을 불러오는 중 오류가 발생했습니다.');
      }
    }
  };

  // ZIP 내부의 특정 파일을 클릭했을 때의 동작
  const handleZipFileClick = async (file) => {
    if (file.type === 'xml') {
      setPreviewType('text');
      try {
        // ZIP 내부에 있는 특정 XML 파일의 내용을 조회합니다.
        const response = await axios.get(`${API_BASE_URL}/s1000d/csdb/zip-file-content`, {
          params: { 
            id: selectedId, 
            fileName: file.name 
          }
        });
        setPreviewContent(response.data || '');
      } catch (error) {
        console.error("ZIP 내부 파일 내용 조회 오류:", error);
        setPreviewContent('내용을 불러오는 중 오류가 발생했습니다.');
      }
    }
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
          <Button variant="outline" size="sm" className="h-8 px-6" onClick={fetchCsdbList}>조회</Button>
          <Button variant="default" size="sm" className="h-8 px-6" onClick={handleUpload}>저장</Button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* 좌측: 조회 조건 및 CSDB 리스트 영역 */}
        <div className="w-1/2 flex flex-col gap-4 overflow-hidden">
          {/* 조회 조건 */}
          <Card className="shrink-0">
            <CardContent className="p-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label className="text-xs mb-1">파일명 검색</Label>
                  <Input 
                    placeholder="검색할 파일명을 입력하세요" 
                    value={filter.name}
                    onChange={(e) => setFilter({ ...filter, name: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && fetchCsdbList()}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 px-4" 
                  onClick={() => { setFilter({ name: '' }); fetchCsdbList(); }}
                >
                  초기화
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 목록 카드 */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="py-3 px-4 border-b bg-slate-50">
              <CardTitle className="text-sm font-semibold">업로드된 CSDB 파일 목록</CardTitle>
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
        </div>

        {/* 우측: 업로드 및 뷰어 영역 */}
        <div className="w-1/2 flex flex-col gap-4 overflow-hidden">
          {/* 상단: 업로드 기능 */}
          <Card className="shrink-0">
            <CardHeader className="py-3 px-4 border-b bg-slate-50">
              <CardTitle className="text-sm font-semibold">CSDB 업로드</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Label className="text-xs">S1000D XML 또는 ZIP 파일 선택</Label>
                <div className="flex gap-2">
                  <Input 
                    type="file" 
                    accept=".xml,.zip"
                    onChange={handleFileChange} 
                    className="flex-1"
                  />
                  <Button variant="secondary" onClick={handleUpload}>업로드</Button>
                </div>
                {selectedFile && <p className="text-xs text-blue-600 font-medium">대기 중: {selectedFile.name}</p>}
                
                {/* 업로드 진행률 표시 바 */}
                {uploadProgress > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                      <div 
                        className="bg-blue-600 h-full transition-all duration-300 ease-out" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 하단: XML 뷰어 */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="py-3 px-4 border-b bg-slate-50">
              <CardTitle className="text-sm font-semibold flex justify-between items-center">
                <span>{previewType === 'text' ? '내용 미리보기' : '패키지 내부 파일 목록'}</span>
                {previewType === 'text' && zipFiles.length > 0 && (
                  <Button 
                    variant="ghost" 
                    className="h-6 px-2 text-[10px] font-bold text-blue-600 hover:bg-blue-50 border border-blue-200"
                    onClick={() => setPreviewType('list')}
                  >
                    목록으로 돌아가기
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              {previewType === 'text' ? (
                <Textarea 
                  className="h-full w-full p-4 font-mono text-[11px] bg-slate-900 text-green-400 resize-none border-none leading-relaxed"
                  value={previewContent}
                  readOnly
                  placeholder="목록에서 항목을 선택하거나 파일을 선택하면 이곳에 XML 구조가 표시됩니다."
                />
              ) : (
                <div className="h-full overflow-y-auto bg-slate-50 p-2">
                  <ul className="space-y-1">
                    {zipFiles.map((file, idx) => (
                      <li 
                        key={idx} 
                        className={`flex items-center gap-3 p-2 bg-white border border-slate-200 rounded transition-colors ${file.type === 'xml' ? 'cursor-pointer hover:border-blue-500 hover:bg-blue-50' : ''}`}
                        onClick={() => handleZipFileClick(file)}
                      >
                        <span className="text-slate-400">
                          {file.type === 'xml' && <FaFileCode className="text-amber-500" />}
                          {file.type === 'image' && <FaFileImage className="text-blue-500" />}
                          {file.type === 'archive' && <FaFileArchive className="text-slate-500" />}
                          {!['xml', 'image', 'archive'].includes(file.type) && <FaRegFile />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-700 truncate">{file.name}</p>
                          {file.size && <p className="text-[10px] text-slate-400">{file.size}</p>}
                        </div>
                      </li>
                    ))}
                    {zipFiles.length === 0 && (
                      <p className="text-center text-xs text-slate-400 mt-10">내부 데이터 정보가 없습니다.</p>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default CSDB;