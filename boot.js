(function () {
  var VERSAO = "20";
  var chave = "bilhetagem_cache_limpa";

  if (localStorage.getItem(chave) === VERSAO) return;

  localStorage.setItem(chave, VERSAO);

  function limparCaches() {
    var tarefas = [];

    if (window.caches && caches.keys) {
      tarefas.push(
        caches.keys().then(function (keys) {
          return Promise.all(keys.map(function (k) { return caches.delete(k); }));
        })
      );
    }

    if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
      tarefas.push(
        navigator.serviceWorker.getRegistrations().then(function (regs) {
          return Promise.all(regs.map(function (r) { return r.unregister(); }));
        })
      );
    }

    return Promise.all(tarefas);
  }

  limparCaches().then(function () {
    var flag = "bilhetagem_reload_" + VERSAO;
    if (!sessionStorage.getItem(flag)) {
      sessionStorage.setItem(flag, "1");
      location.reload();
    }
  });
})();
