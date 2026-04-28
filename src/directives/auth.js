// src/directives/auth.js


export default {
    mounted(el, binding) {
      const userInfo =    JSON.parse(localStorage.getItem('userInfo'))
      const hasPermission = userInfo.userInfo.hasQuestionExportAuth
      if (!hasPermission) {
        el.style.display = 'none';
      }
    },
    updated(el, binding) {
      const userPermissions = JSON.parse(localStorage.getItem('userPermissions')) || [];
      const hasPermission = userPermissions.includes(binding.value);
      el.style.display = hasPermission ? '' : 'none';
    }
  };