window.onload = () => {

  const logoutBtn = document.querySelector('#logout-btn');

  logoutBtn.addEventListener('click', ev => {
    window.localStorage.clear();
    location.replace('/login');
  });

}
