import axios from "axios";


const API = "http://127.0.0.1:8000";

export const predictPrice = (data) => axios.post(`${API}/predict`, data);

export const getModelInfo = () => axios.get(`${API}/model-info`);

export const getHistory = () => axios.get(`${API}/history`);