import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/config';
import axios from '../../lib/axios';
import { IoCloudUploadOutline, IoFileTrayFullOutline } from 'react-icons/io5';

export default function Viewer() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);

    // 파일 선택 핸들러 (ZIP 파일만 허용)
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.name.toLowerCase().endsWith('.zip')) {
                setFile(selectedFile);
            } else {
                alert('CSDB 설정을 위해 ZIP 파일만 업로드 가능합니다.');
                e.target.value = null;
            }
        }
    };

    // 드래그 오버 핸들러 (기본 동작 방지 필수)
    const handleDragOver = (e) => {
        e.preventDefault();
        //e.stopPropagation();
    };

    // 드롭 핸들러
    const handleDrop = (e) => {
        e.preventDefault();
       // e.stopPropagation();
        
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.name.toLowerCase().endsWith('.zip')) {
            console.log(droppedFile);
            setFile(droppedFile);
        } else if (droppedFile) {
            alert('CSDB 설정을 위해 ZIP 파일만 업로드 가능합니다.');
        }
    };

    // 업로드 실행
    const handleUpload = async () => {
        if (!file) {
            alert('업로드할 CSDB ZIP 파일을 선택해주세요.');
            return;
        }

        setUploading(true);
        setProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // 백엔드 API 엔드포인트는 /s1000d/upload-csdb 로 가정
            await axios.post(`${API_BASE_URL}/s1000d/upload-csdb`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                }
            });
            alert('CSDB 설정이 완료되었습니다.');
            setFile(null);
        } catch (error) {
            console.error('CSDB 업로드 오류:', error);
            alert('CSDB 데이터 처리 중 오류가 발생했습니다.');
        } finally {
            setUploading(false);
            setTimeout(() => setProgress(0), 1000); // 전송 완료 후 잠시 유지 후 초기화
        }
    };

    return (
        <div className="p-6 h-full flex items-center justify-center bg-slate-50">
            <Card className="w-full max-w-md shadow-lg border-slate-200">
                <CardHeader className="text-center border-b bg-white rounded-t-lg">
                    <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
                        <IoFileTrayFullOutline className="text-blue-600" />
                        S1000D CSDB 설정
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div 
                        className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-10 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <IoCloudUploadOutline size={48} className="text-slate-400 group-hover:text-blue-500 mb-4 transition-colors" />
                        <p className="text-sm text-slate-600 font-medium">CSDB ZIP 파일을 선택하세요</p>
                        <p className="text-xs text-slate-400 mt-1">Data Modules & Graphics Package</p>
                        
                        {file && (
                            <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-xs font-semibold animate-in fade-in zoom-in duration-300">
                                선택됨: {file.name}
                            </div>
                        )}
                    </div>

                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".zip" 
                        onChange={handleFileChange} 
                    />

                    {(uploading || progress > 0) && (
                        <div className="space-y-2 animate-in fade-in duration-300">
                            <div className="flex justify-between text-[10px] font-semibold text-slate-500 px-1">
                                <span>{progress === 100 ? '데이터 처리 중...' : '파일 전송 중...'}</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                                <div 
                                    className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out" 
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold shadow-sm"
                            onClick={handleUpload}
                            disabled={uploading || !file}
                        >
                            {uploading ? '데이터 처리 중...' : 'CSDB 구성 시작'}
                        </Button>
                        <p className="text-[11px] text-center text-slate-500 leading-relaxed">
                            업로드된 패키지는 서버에서 자동으로 압축이 해제되며,<br />
                            S1000D 표준에 따라 데이터베이스가 구성됩니다.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}