// Run before styles are painted to keep the saved theme consistent on navigation.
(()=>{let saved;try{saved=localStorage.getItem('asif-theme');}catch{}const theme=saved==='light'||saved==='dark'?saved:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;})();
