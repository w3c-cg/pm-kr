import('./app.js').then(({ start }) => start()).catch(error => {
  const notice = document.querySelector('#notice');
  notice.dataset.outcome = 'error';
  notice.textContent = 'The hall could not start. ' + (error.message || error);
});
