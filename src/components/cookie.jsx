// common/Cookie.js
export function setCookie(name, value, options = {}) {
  let cookieStr = `${name}=${value};`;
  if (options.maxAge) cookieStr += `max-age=${options.maxAge};`;
  if (options.path) cookieStr += `path=${options.path};`;
  if (options.secure) cookieStr += `secure;`;
  if (options.sameSite) cookieStr += `samesite=${options.sameSite};`;
  document.cookie = cookieStr;
}

export function getCookie(name) {
  const value = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
  return value ? value.pop() : "";
}

export function removeCookie(name, options = {}) {
  setCookie(name, "", { ...options, maxAge: 0 });
}
