import axios from "axios";

const gasURL =
  "https://script.google.com/macros/s/AKfycbzjeh8Nj8NKH-uH3VLFYtanEIMjmX7DovMDQ6mmR6JMddIcu4LFORlQilGD2iJNyx34/exec";

export const getRecords = async (userId: number) => {
  const res = await axios.post(
    `${gasURL}?action=getRecords`,
    JSON.stringify({ userId })
  );

  return res.data;
};

export const createRecord = async (payload: any) => {
  const res = await axios.post(
    `${gasURL}?action=createRecord`,
    JSON.stringify(payload)
  );
  return res.data;
};
