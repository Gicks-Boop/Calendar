const isEnvProd = import.meta.env != undefined && import.meta.env.MODE != "development";

const _SITE_CONFIG = {
  DEV: {
    viewPath: isEnvProd ? "/" : "/",
    API_ENDPOINT: "http://localhost:3000/api-v1/",
    assetsPath: isEnvProd ? "/assets/" : "/src/assets/",
    productName: "Calendario",
  },
};
const _CURRENT_SITE = _SITE_CONFIG.DEV;
export const BM_SITE = _CURRENT_SITE;

export const DEFAULT_SESSION_VAR = "SESSION_USER";

/**
 * @param {RequestInfo | URL} endpoint
 * @param {RequestInit} options
 * */
export const apiServerRequest = async (endpoint, options) => {
  options = typeof options !== "undefined" ? options : {};
  const props = {};
  props.headers = {
    "Content-Type": "application/json",
  };
  if (typeof options !== "undefined" && typeof options.headers !== "undefined") {
    options.headers = Object.assign(props.headers, options.headers);
  } else {
    options.headers = props.headers;
  }
  return await fetch(endpoint, options);
};
