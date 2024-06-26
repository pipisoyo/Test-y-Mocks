import { io } from '../config/server.js';
import responses from "../config/responses.js";
import { productsService} from "../repositories/index.js";
import { CustomError } from "../utils/customError.js";
import { errorTypes } from "../utils/errorTypes.js"
import { validarProducto } from "../utils/producstErros.js";


/**
 * Controlador para la gestión de productos.
 */
const productController = {
    
    /**
     * Recupera todos los productos con opciones de filtrado y paginación.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    getAll: async (req, res) => {
        try {
            const result = await productsService.getAll()
            
            res.status(200).send({ status: "success", payload: result });
            return result
        } catch (error) {
            res.status(500).send({ status: "error", message: "Error al recuperar los productos" });
        }
    },

    
    /**
     * Recupera un producto por su ID.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    getById: async (req, res) => {
        try {
            const id = req.params._id;
            const result = await productsService.getById(id);
            if (!result) {
                res.status(404).send({ status: "error", message: "Producto no encontrado" });
                return;
            }

            res.status(200).send({ status: "success", payload: result });
        } catch (error) {
            res.status(500).send({ status: "error", message: "Error al recuperar el producto" });
        }
    },
    
    /**
     * Agrega un nuevo producto.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    addProduct:  (req, res) => {
            let product = Object.keys(req.body)
            console.log("🚀 ~ product:", product)
            let productKeys = ["title", "description", "price", "code", "stock", "status", "category", "thumbnails"]
            let invalidKeys = productKeys.filter(key => !product.includes(key)).map(key => ({
                key,
                index: productKeys.indexOf(key),
                value: product[productKeys.indexOf(key)] || 'No ingresado'
            }));
            console.log("🚀 ~ invalidKeys:", invalidKeys)
            let { title, description, price, code, stock, status, category, thumbnails } = req.body;
                if (invalidKeys.length > 0) {
                    console.log("🚀 ~ invalidKeys:", invalidKeys)
                        throw CustomError.CustomError(
                            "Missing Data",
                            `Enter the property ${invalidKeys[0].key}`,
                            errorTypes.ERROR_ARGUMENTOS_INVALIDOS,
                            validarProducto(invalidKeys[0])
                        )
                }

            const result =  productsService.addProduct({ title, description, price, code, stock, status, category, thumbnails });

            if (!result) {
                res.status(500).send({ status: "error", message: "Error al agregar el producto" });
                return;
            }

            res.setHeader("Content-Type", "application/json");
            return res.status(201).json({ payload: result });
    
    },

    
    /**
     * Inserta un nuevo documento de producto.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    insertDocument: async (req, res) => {
        try {
            const product = req.body;
            let result = await productsService.insertDocument(product);
            res.json({ result });
            let data = await productsService.getAll();
            responses.successResponse(res, 201, "Documentos insertados exitosamente", result);
            io.emit('products', data.result);
        } catch (error) {
            console.error("Error al insertar el documento:", error);
            responses.errorResponse(res, 500, "Error al instertar el documento");
        }
    },
    
    /**
     * Actualiza un producto de forma sincrónica.
     * @param {Object} req - Objeto de solicitud HTTP.
     * @param {Object} res - Objeto de respuesta HTTP.
     */
    updateProduct: async (req, res) => {
        try {
            const id = req.params._id;
            const productData = req.body;
            const result = await productsService.updateProduct(id, productData);
            let data = await productsService.getAll();
            if (result) { 
                io.emit('products', data.result);
                res.status(201).send({ status: "success", payload: result });
              
            } else {
                res.status(404).send({ error: "Product not found" });
            }
        } catch (error) {
            res.status(500).send({ error: "An error occurred while updating the product" });
        }
    },
    
    /**
     * Elimina un producto de forma sincrónica.
     * @param {Object} req - Objeto de solicitud HTTP.
     * @param {Object} res - Objeto de respuesta HTTP.
     */
    deleteProduct: async (req, res) => {
        try {
            const id = req.params._id;
            const result = await productsService.deleteProduct(id);
            const data = await productsService.getAll();
            if (result) {
                res.status(201).send({ status: "success", payload: result });
                io.emit('products', data.result);
            } else {
                res.status(404).send({ error: "Product not found" });
            }
        } catch (error) {
            res.status(500).send({ error: "An error occurred while deleting the product" });
        }
    },

    /**
     * Vista en tiempo real.
     * @param {Object} req - Objeto de solicitud HTTP.
     * @param {Object} res - Objeto de respuesta HTTP.
     */
    realTime : async (req, res) => {
        try {
            const products = await productsService.getAll();
            res.render('realTimeProducts', { products: products.result });
        } catch (error) {
            console.error('Error al obtener la lista de productos:', error);
            res.status(500).send('Error al obtener la lista de productos');
        }
    },

};

export default productController;