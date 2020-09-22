start(function () {
  $(document).on("click", '[name="sync"]', function () {
    actualizar()
      .then(function () {
        location.assign("main.html");
      });
  });
});
