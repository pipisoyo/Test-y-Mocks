const errorDictionary = {
    ERROR_AL_CREAR_EL_PRODUCTO : "" ,
    ERROR_AL_GUARDAR_EL_PRODUCTO : "" ,
    ERROR_FALTAN_DATOS_REQUERIDOS : 
}

const customizeError = (errorCode) => {
    return errorDictionary[errorCode] || "Ocurrió un error inesperado. Por favor, intenta nuevamente.";
};

const errorCode = "PRODUCT_CREATION_ERROR";
const errorMessage = customizeError(errorCode);
console.log(errorMessage); // 