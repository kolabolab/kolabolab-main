// Emergency dropdown fix - run this in browser console if needed
function fixDropdownZIndex() {
  console.log('🔧 Applying emergency dropdown fix...');
  
  // Add CSS directly to page
  const style = document.createElement('style');
  style.innerHTML = `
    /* EMERGENCY FIX: Force dropdown above everything */
    .chakra-portal,
    .chakra-portal *,
    [role="menu"],
    [data-popper-placement],
    .chakra-menu__menu-list,
    .user-dropdown-menu {
      z-index: 2147483647 !important;
      position: fixed !important;
      background: white !important;
      border: 2px solid #007bff !important;
      box-shadow: 0 25px 50px rgba(0,0,0,0.4) !important;
    }
    
    /* Lower main content */
    main, .chakra-container, .chakra-box:not(.chakra-menu__menu-list) {
      z-index: 1 !important;
    }
  `;
  document.head.appendChild(style);
  
  // Also apply directly to any existing menus
  setTimeout(() => {
    const menus = document.querySelectorAll('[role="menu"], .chakra-menu__menu-list, .user-dropdown-menu');
    menus.forEach(menu => {
      menu.style.zIndex = '2147483647';
      menu.style.position = 'fixed';
      menu.style.background = 'white';
      menu.style.border = '2px solid #007bff';
    });
    console.log(`✅ Applied fix to ${menus.length} menu elements`);
  }, 100);
}

// Auto-run fix
fixDropdownZIndex();

// Also run when clicking on menu buttons
document.addEventListener('click', (e) => {
  if (e.target.closest('.chakra-menu__menu-button')) {
    setTimeout(fixDropdownZIndex, 50);
  }
});

console.log('🔧 Dropdown fix script loaded. Menu should now appear on top!');