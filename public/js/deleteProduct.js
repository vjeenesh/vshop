function deleteProduct(btn) {
  const productId = btn.previousElementSibling.value;
  fetch("/admin/delete-product/" + productId, {
    method: "DELETE",
  })
    .then((results) => {
      btn.closest(".card").remove();
      let alertHtml =
        '<div class="mt-3 alert alert-success alert-dismissible" role="alert"><div>Product Deleted Successfully</div><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
      document
        .querySelector(".row")
        .insertAdjacentHTML("beforebegin", alertHtml);
    })
    .catch((err) => {
      console.log(err);
    });
}
