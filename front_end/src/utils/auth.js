export const getStoredUser = () => {
  const raw = localStorage.getItem("user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getUserId = (user = getStoredUser()) => {
  if (!user) return "";
  return user.id || user._id || "";
};

export const isLoggedIn = () => Boolean(localStorage.getItem("token"));
