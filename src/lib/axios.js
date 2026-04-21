import axios from 'axios';
import { getToken, removeToken } from './auth';

/**
 * 유틸리티: 객체의 키를 SnakeCase에서 CamelCase로, 또는 그 반대로 변환
 */
const toCamel = (str) => str.replace(/([-_][a-z])/ig, ($1) => $1.toUpperCase().replace('-', '').replace('_', ''));
const toSnake = (str) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const transformKeys = (obj, transformer) => {
  if (Array.isArray(obj)) return obj.map(v => transformKeys(v, transformer));
  if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => ({
      ...acc,
      [transformer(key)]: transformKeys(obj[key], transformer)
    }), {});
  }
  return obj;
};

const apiClient = axios.create({
  baseURL: 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. [요청 인터셉터] 서버로 보내기 직전에 실행
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken(); // 공통 함수를 사용하여 키 이름 불일치 방지
    
    // 1. 요청 데이터를 SnakeCase로 변환하여 서버로 전송
    if (config.data && !(config.data instanceof FormData)) {
      config.data = transformKeys(config.data, toSnake);
    }
    if (config.params) {
      config.params = transformKeys(config.params, toSnake);
    }

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
  (response) => {
    // 2. 응답 데이터를 CamelCase로 변환하여 컴포넌트에서 사용
    if (response.data) {
      response.data = transformKeys(response.data, toCamel);
    }
    return response;
  },
  (error) => {
    console.log(error.response);
    // 만약 토큰이 만료되었거나 인증 실패(401)가 뜨면
    if (error.response && error.response.status === 401) {
      /*
      removeToken();
      alert("세션이 만료되었습니다. 다시 로그인해주세요.");
      window.location.href = '/login'; // 로그인 페이지로 강제 이동
      */
    }
    return Promise.reject(error);
  }
);

export default apiClient;