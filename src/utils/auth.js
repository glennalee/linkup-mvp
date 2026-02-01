export function getCurrentUser() {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
}

export const logout = () => {
  localStorage.removeItem("currentUser");
};
