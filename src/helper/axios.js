import axios from "axios";
import Cookies from 'js-cookie';


// export const BaseURL = "http://localhost:3000/api/v2/giriraj";
export const BaseURL = "https://server.grafizen.in/api/v2/giriraj";
// 
const defaultHeaders = {
  isAuth: true,
  AdditionalParams: {}, 
  isJsonRequest: true,
};

export const ApiGet = (type) => { 
  return new Promise((resolve, reject) => {
    axios
      .get(BaseURL + type, getHttpOptions(defaultHeaders))
      .then((responseJson) => {
        resolve(responseJson.data);
      })
      .catch((error) => {
        reject({
          code: error?.response?.status,
          error: error?.response?.data?.error,
          message: error?.response?.data?.message,
        });
      });
  });
};

export const ApiDelete = (type) => {
  return new Promise((resolve, reject) => {
    axios
      .delete(BaseURL + type, getHttpOptions(defaultHeaders))
      .then((responseJson) => {
        resolve(responseJson.data);
      })
      .catch((error) => {
        reject({
          code: error?.response?.status,
          error: error?.response?.data?.error,
        });
      });
  });
};

export const ApiPut = (type, data) => {
  return new Promise((resolve, reject) => {
    axios
      .put(BaseURL + type, data, getHttpOptions())
      .then((responseJson) => {
        resolve(responseJson.data);
      })
      .catch((error) => {
        reject({
          code: error?.response?.status,
          error: error?.response?.data?.error,
        });
      });
  });
};
export const ApiPutWithId = (type, data) => {
  console.log("33333333333333333333",type,data)
  return new Promise((resolve, reject) => {
    axios
      .put(`${BaseURL}${type}`, data, getHttpOptions()) 
      .then((responseJson) => {
        resolve(responseJson.data);
      })
      .catch((error) => {
        reject({
          code: error?.response?.status,
          error: error?.response?.data?.error,
        });
      });
  });
};

export const ApiPatch = (type, data) => {
  return new Promise((resolve, reject) => {
    axios
      .patch(BaseURL + type, data, getHttpOptions())
      .then((responseJson) => {
        resolve(responseJson.data);
      })
      .catch((error) => {
        reject({
          code: error?.response?.status,
          error: error?.response?.data?.error,
        });
      });
  });
};

export const ApiGetNoAuth = (type) => {
  return new Promise((resolve, reject) => {
    axios
      .get(BaseURL + type, getHttpOptions({ ...defaultHeaders, isAuth: false }))
      .then((responseJson) => {
        resolve(responseJson.data);
      })
      .catch((error) => {
        reject({
          code: error?.response?.status,
          error: error?.response?.data?.error,
        });
      });
  });
};

export const ApiPost = async (type, userData) => {
  const res = await axios.post(BaseURL + type, userData, getHttpOptions())
  return res;
};

export const ApiPostData = async (type, userData) => {
  try {
    const res = await axios.post(BaseURL + type, userData, getHttpOptions());
    return res.data;
  } catch (error) {
    throw {
      code: error?.response?.status || 500, 
      error: error?.response?.data?.error || 'Unknown Error',
      message: error?.response?.data?.message || 'An error occurred while processing the request.',
    };
  }
};

export const ApiPostNoAuth = (type, userData) => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        BaseURL + type,
        userData,
        getHttpOptions({ ...defaultHeaders, isAuth: false })
      )
      .then((responseJson) => {
        resolve(responseJson.data);
        if (
          responseJson.data &&
          responseJson.data.data &&
          responseJson.data.data.token
        ) {
        }
      })
      .catch((error) => {
        reject({
          code: error?.response?.status,
          error: error?.response?.data?.error,
          message: error?.response?.data?.message,
        });
      });
  });
};

export const getHttpOptions = (options = defaultHeaders) => {
  let headers = {
    Authorization: "",
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-credentials": true,
  };
 
  if (options.hasOwnProperty("isAuth") && options.isAuth) {
    const token = Cookies.get('token');
    headers["Authorization"] = token ? `Bearer ${token}` : "";
  }

  if (options.hasOwnProperty("isJsonRequest") && options.isJsonRequest) {
    headers["Content-Type"] = "application/json";
  }

  if (options.hasOwnProperty("AdditionalParams") && options.AdditionalParams) {
    headers = { ...headers, ...options.AdditionalParams };
  }

  return { headers };
};


