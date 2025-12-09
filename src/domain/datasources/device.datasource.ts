import { OpenDeviceDto } from "../dtos/session/open-device.dto";

/**
 * Datasource Interface (Puerto en Arquitectura Hexagonal)
 * 
 * ¿Por qué una interface abstracta?
 * - Define el CONTRATO de lo que necesita el dominio
 * - El dominio NO conoce la implementación (HTTP, Mock, DB, etc)
 * - Permite cambiar implementaciones sin tocar el dominio
 * - Facilita testing (puedes crear MockDeviceDatasource)
 * 
 * Esta interface vive en el DOMINIO, pero las implementaciones
 * viven en INFRASTRUCTURE
 * 
 * IMPORTANTE: El datasource solo se encarga de comunicarse con Yappy
 * NO persiste datos, solo retorna el token obtenido
 */
export abstract class DeviceDatasource {
    
    /**
     * Abre una sesión de dispositivo con el medio de pago (Yappy)
     * 
     * @param dto - Datos validados del dispositivo
     * @returns Token retornado por Yappy (string)
     * @throws Error si falla la comunicación con el API
     */
    abstract openDevice(dto: OpenDeviceDto): Promise<string>;

    /**
     * Cierra una sesión de dispositivo
     * 
     * @param token - Token de la sesión a cerrar
     * @returns Objeto con resumen de la sesión cerrada
     */
    abstract closeDevice(token: string): Promise<{
        transactions: number;
        amount: number;
    }>;
}
