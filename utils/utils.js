import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt'
import nodemailer from "nodemailer";
import config from '../src/config.js';
import ticketModel from '../src/dao/models/tickets.js';
import { faker } from '@faker-js/faker';
import ProductDTO from '../src/dao/DTOs/products.dto.js';

// Obtiene la ruta del archivo actual
const __filename = fileURLToPath(import.meta.url);
// Obtiene el directorio del archivo actual
const __dirname = dirname(__filename)

/**
 * Exporta la ruta del directorio del archivo actual.
 */
export default __dirname

/**
 * Crea un hash a partir de una contraseña utilizando bcrypt.
 * @param {string} password - Contraseña a hashear.
 * @returns {string} - Hash de la contraseña.
 */
export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10))

/**
 * Valida si una contraseña es válida para un usuario utilizando bcrypt.
 * @param {Object} user - Usuario con la contraseña a validar.
 * @param {string} password - Contraseña a verificar.
 * @returns {boolean} - true si la contraseña es válida, false si no lo es.
 */
export const isValidPassword = (user, password) => {
  console.log(
    `Datos a validar: user-password: ${user.password}, password: ${password}`
  );
  return bcrypt.compareSync(password, user.password);
};

/**
 * Genera un código único basado en el ID del carrito y la fecha de compra.
 * @param {string} cartId - ID del carrito.
 * @param {Date} purchaseDatetime - Fecha de compra.
 * @returns {string} Código único generado.
 */
export function generateUniqueCode(cartId, purchaseDatetime) {
  // Combinar el ID del carrito y la fecha de compra en una cadena
  const combinedString = cartId.toString() + purchaseDatetime.toISOString();

  // Generar un hash único a partir de la cadena combinada
  function generateHash(data) {
      const saltRounds = 10; 
      const hash = bcrypt.hashSync(data, saltRounds);
      return hash;
  }

  // Generar el hash único a partir de la cadena combinada
  const hashCode = generateHash(combinedString);

  // Devolver un código único basado en el hash generado
  return hashCode;
}

/**
 * Calcula el monto total de una lista de productos.
 * @param {Array} products - Lista de productos con precio.
 * @returns {number} Monto total calculado.
 */
export function calculateTotalAmount(products) {

  // Verificar si la lista de productos está vacía
  if (products.length === 0) {
      return 0;
  }

  // Calcular el monto total sumando los precios de los productos
  const totalAmount = products.reduce((total, product) => total + product.product.price*product.quantity, 0);



  return totalAmount;
}

const mailOptions = {
  service: "gmail",
  host: "smtp.gmail.com",
  secure: false,
  port: 587,
  auth: {
    user: config.mail_username,
    pass: config.mail_password,
  },
};


export async function sendMail(ticket) {

              const transport = nodemailer.createTransport(mailOptions);
             
  try {
 const res = await ticketModel.findOne({code : ticket.code}).populate('productsToPurchase.product').lean().exec();
 let productsList = '';

 if (res && res.productsToPurchase) {
  const products = res.productsToPurchase.map(element => ({
      title: element.product.title,
      quantity: element.quantity
  }));

  products.forEach(product => {
      productsList += `<li>${product.title} - Cantidad: ${product.quantity}</li>`;
  });
}

      
    const result = await transport.sendMail({
    from: `Correo de prueba <${ticket.purchaser}>`,
    to: ticket.purchaser,
    subject: "Detalle de la compra",
    html: `<div>
                <h1>CORREO TEST</h1>
                <h2>N° de Ticket: ${ticket.code}</h2>
                <p>Fecha de Compra: ${ticket.purchase_datetime}</p>
                <p>productos comprados:</p>
                <ul>
                    ${productsList}
                </ul>
                <h3>Total a Pagar: ${ticket.amount}</h3>
            </div>`,
});

return "Correo enviado";
  } catch (error) {
    // Maneja cualquier error que pueda ocurrir durante el envío del correo
    console.error("Error al enviar el correo:", error);
    throw error; // O maneja el error de alguna otra manera que consideres adecuada
  }
}

export const generateProducts =(numOfProducts)=>{
  let products=[];
  for (let i = 0 ; i < numOfProducts; i++){
      products.push(createProduct())
  }

  return {
      products,
  };
};

const createProduct = () => {
  return {
      _id:faker.database.mongodbObjectId(),
      title: faker.commerce.productName(),
      description: faker.lorem.sentences(),
      price: parseFloat(faker.commerce.price()),
      code: faker.string.numeric({length: 8}),
      stock: parseInt(faker.string.numeric({length: 3})),
      status: faker.datatype.boolean(),
      category: faker.commerce.department(),
      thumbnails: [faker.image.url()]
  };
};

88711
