import axios from 'axios';
import config from './config';

const getRequest = async (url: string, params?: any) => {
  const { data } = await axios.get(
    `${config.serverUrl}/api/${url}`,
    {
      params,
      withCredentials: true,
    },
  );

  return data;
};

const postRequest = async (url: string, params?: any) => {
  const { data } = await axios.post(
    `${config.serverUrl}/api/${url}`,
    params,
    { withCredentials: true },
  );

  return data;
};

export {
  getRequest,
  postRequest,
};
