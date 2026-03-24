import axios from './axios';
import { API_BASE_URL } from './config';

/**
 * 코드 그룹 목록을 조회합니다.
 * @param {object} params - 조회 조건 (e.g., { mst_cd, mst_nm })
 * @returns {Promise<Array>} 코드 그룹 목록
 */
export const getCodeGroups = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/code/select`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching code groups:', error);
    return []; 
  }
};

/**
 * 특정 코드 그룹의 상세 코드 목록을 조회합니다.
 * @param {string} mst_cd - 조회할 마스터 코드
 * @returns {Promise<Array>} 상세 코드 목록
 */
export const getCodeDetails = async (mst_cd) => {
  if (!mst_cd) return [];
  try {
    const response = await axios.get(`${API_BASE_URL}/code/selectDtl`, { params: { mst_cd } });
    return response.data;
  } catch (error) {
    console.error(`Error fetching code details for ${mst_cd}:`, error);
    return [];
  }
};
