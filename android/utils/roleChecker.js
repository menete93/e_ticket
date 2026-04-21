// utils/roleChecker.js
export const isUserOrganizer = user => {
  if (!user) return false;

  // Verifica pelo array de roles
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.includes('ORGANIZER');
  }

  // Fallback para o campo isOrganizer
  return user.isOrganizer === true;
};

export const isUserAdmin = user => {
  if (!user) return false;
  return user.roles?.includes('ADMIN') || false;
};

export const getUserFullName = user => {
  if (!user) return 'Visitante';
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
};

export const getUserInitials = user => {
  if (!user) return '?';
  const first = user.firstName?.charAt(0) || '';
  const last = user.lastName?.charAt(0) || '';
  return `${first}${last}`.toUpperCase();
};
