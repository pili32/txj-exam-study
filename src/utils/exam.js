import storage from "./storage"

const EXAM_DATA_KEY = 'exam_data';
const EXAM_STATE_KEY = 'exam_state';

export const saveExamData = (data) => {
  storage.set(EXAM_DATA_KEY,JSON.stringify(data))
};

export const getExamData = () => {

  const data = storage.get(EXAM_DATA_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveExamState = (state) => {
  storage.set(EXAM_STATE_KEY,JSON.stringify(state))
};

export const getExamState = () => {
  const state = storage.get(EXAM_STATE_KEY);
  return state ? JSON.parse(state) : null;
};

export const clearExamData = () => {
  localStorage.removeItem(EXAM_DATA_KEY);
  localStorage.removeItem(EXAM_STATE_KEY);
};