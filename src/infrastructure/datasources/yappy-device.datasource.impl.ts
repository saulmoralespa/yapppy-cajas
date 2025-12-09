import { OpenDeviceDto } from '../../domain/dtos/session/open-device.dto';
import { DeviceDatasource } from '../../domain/datasources/device.datasource';
import { envs } from '../../config/envs';

/**
 * Implementación concreta del DeviceDatasource para Yappy
 * 
 * ¿Por qué esta clase vive en infrastructure?
 * - Conoce detalles de implementación (HTTP, headers, endpoints)
 * - Usa librerías externas (fetch)
 * - Puede cambiar sin afectar el dominio
 * 
 * Esta es la ÚNICA clase que conoce cómo comunicarse con Yappy
 * 
 * IMPORTANTE: Solo retorna el TOKEN, no crea entities ni persiste datos
 */
export class YappyDeviceDatasourceImpl implements DeviceDatasource {
    
    /**
     * Configuración específica de Yappy
     */
    private readonly config = {
        apiKey: envs.YAPPY_API_KEY,
        secretKey: envs.YAPPY_SECRET_KEY,
        baseUrl: envs.YAPPY_SANDBOX 
            ? envs.YAPPY_SANDBOX_BASE_URL 
            : envs.YAPPY_BASE_URL,
        timeout: 30000 // 30 segundos
    };

    /**
     * Abre un dispositivo en Yappy y retorna el token
     * 
     * Flujo:
     * 1. Construye el payload para Yappy
     * 2. Hace la petición HTTP POST
     * 3. Parsea la respuesta
     * 4. Retorna SOLO el token (string)
     */
    async openDevice(dto: OpenDeviceDto): Promise<string> {
        try {
            // 1. Construir payload específico de Yappy
            const payload = {
                body: {
                    device: {
                        id: dto.idDevice,
                        name: dto.nameDevice,
                        user: dto.userDevice
                    },
                    group_id: dto.groupId
                }
            };

            // 2. Hacer petición HTTP POST
            const response = await fetch(`${this.config.baseUrl}/session/device`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': this.config.apiKey,
                    'secret-key': this.config.secretKey
                },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(this.config.timeout)
            });

            // 3. Parsear respuesta
            const data = await response.json() as any;

            // 4. Verificar si fue exitoso
            if (!response.ok || data.status?.code !== 'YP-0000') {
                throw new Error(
                    data.message ||
                    data.error ||
                    data.status?.description || 
                    `Yappy API error: ${response.status}`
                );
            }

            // 5. Extraer y retornar SOLO el token
            const token = data.body?.token;
            
            if (!token) {
                throw new Error('Yappy API did not return a token');
            }
            
            return token;

        } catch (error: any) {
            console.error('❌ [Datasource] Error:', error.message);

            if (error.name === 'AbortError') {
                throw new Error('Request timeout - Yappy API did not respond in time');
            }

            if (error.message.includes('fetch')) {
                throw new Error('Network error - Could not connect to Yappy API');
            }

            throw new Error(`Yappy API error: ${error.message}`);
        }
    }

    /**
     * Cierra la sesión de dispositivo en Yappy
     */
    async closeDevice(token: string): Promise<{
        transactions: number;
        amount: number;
    }> {
        try {            
            const response = await fetch(`${this.config.baseUrl}/session/device`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': this.config.apiKey,
                    'secret-key': this.config.secretKey,
                    'authorization': token
                },
                signal: AbortSignal.timeout(this.config.timeout)
            });


            const data = await response.json() as any;

            if (!response.ok || data.status?.code !== 'YP-0000') {
                throw new Error(
                    data.message || 
                    data.status?.description ||
                    'Failed to close device session'
                );
            }

            return {
                transactions: data.body?.summary?.transactions || 0,
                amount: data.body?.summary?.amount || 0,
            }

        } catch (error: any) {
            console.error('❌ [Datasource] Error closing device:', error);
            throw new Error(`Failed to close device: ${error.message}`);
        }
    }
}
