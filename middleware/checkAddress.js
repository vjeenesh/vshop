module.exports = (req, res, next) => {
  if (
    req.body.shipping_street &&
    req.body.shipping_city &&
    req.body.shipping_state &&
    req.body.shipping_country &&
    req.body.shipping_zipcode
  ) {
    next();
  } else {
    res.redirect("/cart");
  }
};
