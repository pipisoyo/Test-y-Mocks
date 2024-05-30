const elError = (product) => {
  let err = [];
  if (!product.title) {
      err = [product.title, "title",0];
  } else if (!product.description) {
      err = [product.description, "description",1];
  } else if (!product.price) {
      err = [product.price,"price",2];
  } else if (!product.code) {
      err = [product.code,"code",3];
  } else if (!product.stock) {
      err = [product.stock,"stock",4];
  } else if (!product.status) {
      err = [product.status,"status",5];
  } else if (!product.category) {
      err = [product.category,"category",6];
  } else if (!product.thumbnails) {
      err = [product.thumbnails,"thumbnails",7];
  }
  return err;
};
export const validarProducto = (products) => {
  const err = elError(products)
  const prod = Object.keys(products)
  const prodName= prod[err[2]]
  console.log("🚀 ~ validarProducto ~ prodName:", prodName)
  
  const {...others } = products;

    return `Error al registrar el producto. Argumentos esperados:
    ${err[1]}: de tipo String - se recivio "${prodName}" --> ${err[0]} - fue recibidoArgumentos opcionales:
    - ${JSON.stringify(others)} `;
};