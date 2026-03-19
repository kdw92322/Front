import axios from 'axios';
import { removeToken } from '@/lib/auth'

const apiClient = axios.create({
  baseURL: 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. [요청 인터셉터] 서버로 보내기 직전에 실행
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // 저장된 토큰 가져오기
    if (token) {
      //console.log('요청 인터셉터에서 토큰:', `Bearer ${token}`); // 토큰 확인용 로그
      // 헤더에 토큰 추가 (공백 주의: 'Bearer ' 뒤에 토큰)
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. [응답 인터셉터] 서버 응답이 도착한 직후 실행
apiClient.interceptors.response.use(
  (response) => response, // 성공(200번대) 시 그대로 반환
  (error) => {
    console.log(error.response);
    // 만약 토큰이 만료되었거나 인증 실패(401)가 뜨면
    if (error.response && error.response.status === 401) {
      //alert("세션이 만료되었습니다. 다시 로그인해주세요.");
      removeToken();
      //window.location.href = '/login'; // 로그인 페이지로 강제 이동
    }
    return Promise.reject(error);
  }
);

export default apiClient;