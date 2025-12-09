import { PaymentDatasource } from "../../domain/datasources/payment.datasource";
import { GenerateQRCodeDto } from "../../domain/dtos/payment/generate-qrcode.dto";
import { GetTransactionDto } from "../../domain/dtos/payment/get-transaction.dto";
import { CancelTransactionDto } from "../../domain/dtos/payment/cancel-transaction.dto";
import { SessionRepository } from "../../domain/repositories/session.repository";
import { DeviceDatasource } from "../../domain/datasources/device.datasource";
import { OpenDeviceDto } from "../../domain/dtos/session/open-device.dto";
import { DeviceSessionEntity } from "../../domain/entities/session/session.entity";
import { envs } from '../../config/envs';
/**
 * IMPLEMENTACIÓN CONCRETA - Yappy Payment Datasource
 * 
 * Responsabilidad:
 * - Comunicarse con la API de Yappy para operaciones de pago
 * - Transformar los DTOs del dominio al formato esperado por Yappy
 * - Manejar los headers de autenticación (authorization, api-key, secret-key)
 * - Gestionar tokens de sesión (reutilizar existentes o crear nuevos)
 * 
 * Endpoint utilizado:
 * POST /qr/generate/{qr_type}
 * 
 * Principios aplicados:
 * - Dependency Inversion: Implementa la abstracción definida en el dominio
 * - Single Responsibility: Solo se encarga de la comunicación HTTP con Yappy
 */

interface YappyQRResponse {
    body: {
        hash: string;
        transactionId: string;
        date: string;
    };
    status: {
        code: string;
        message: string;
    };
}

export class YappyPaymentDatasourceImpl implements PaymentDatasource {
    
    private readonly baseUrl: string;
    private readonly apiKey: string;
    private readonly secretKey: string;
    private readonly sessionRepository: SessionRepository;
    private readonly deviceDatasource: DeviceDatasource;

    constructor(
        sessionRepository: SessionRepository,
        deviceDatasource: DeviceDatasource,
        baseUrl: string = envs.YAPPY_SANDBOX 
            ? (envs.YAPPY_SANDBOX_BASE_URL) 
            : (envs.YAPPY_BASE_URL),
        apiKey: string = envs.YAPPY_API_KEY || '',
        secretKey: string = envs.YAPPY_SECRET_KEY || ''
    ) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.secretKey = secretKey;
        this.sessionRepository = sessionRepository;
        this.deviceDatasource = deviceDatasource;
    }

    /**
     * Genera un código QR de pago con Yappy
     * 
     * Flujo:
     * 1. Busca si hay alguna sesión activa en sessions.json
     * 2. Si existe, reutiliza el token
     * 3. Si no existe, abre un nuevo dispositivo y guarda la sesión
     * 4. Transforma el DTO a formato Yappy (AmountDTO)
     * 5. Hace POST a /qr/generate/{qr_type} con el token
     * 6. Retorna los datos del QR generado
     * 
     * @param dto - Datos del pago validados
     * @returns Datos del QR generado
     */
    async generateQRCode(dto: GenerateQRCodeDto): Promise<{
        qrCodeUrl: string;
        transactionId: string;
        amount: number;
        expiresAt?: string;
    }> {
        try {
            // PASO 1: Buscar si hay alguna sesión activa y NO EXPIRADA en sessions.json
            let token: string | null = null;
            const sessions = await this.sessionRepository.findAll();
            
            // Filtrar sesiones no expiradas
            const validSessions = sessions.filter(session => !session.isExpired());
            
            if (validSessions.length > 0) {
                // Usar el token de la última sesión válida
                token = validSessions[validSessions.length - 1].token;
            } else {
                // PASO 2: Si no hay sesión válida, abrir un nuevo dispositivo
                const [errorDto, openDeviceDto] = OpenDeviceDto.create({
                    idDevice: envs.YAPPY_ID_DEVICE,
                    nameDevice: envs.YAPPY_NAME_DEVICE,
                    userDevice: envs.YAPPY_USER_DEVICE,
                    groupId: envs.YAPPY_ID_GROUP
                });

                if (errorDto) {
                    throw new Error(`Failed to create OpenDeviceDto: ${errorDto}`);
                }

                // Abrir dispositivo y obtener token
                token = await this.deviceDatasource.openDevice(openDeviceDto!);
                
                // Guardar la sesión para futuros usos (expira en 6 horas)
                const session = DeviceSessionEntity.createNew(token);
                await this.sessionRepository.save(session);
            }

            // PASO 3: Construir el payload según especificación de Yappy
            const payload = {
                body: {
                    charge_amount: {
                        sub_total: dto.subTotal,
                        tax: dto.tax,
                        tip: dto.tip,
                        discount: dto.discount,
                        total: dto.total
                    },
                    ...(dto.orderId && { order_id: dto.orderId }),
                    ...(dto.description && { description: dto.description })
                }
            };

            // PASO 4: Construir la URL del endpoint
            const url = `${this.baseUrl}/qr/generate/${dto.type}`;

            // PASO 5: Hacer la petición HTTP con el token obtenido
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': token,
                    'api-key': this.apiKey,
                    'secret-key': this.secretKey
                },
                body: JSON.stringify(payload)
            });

            const data: YappyQRResponse = await response.json() as any;

            // Validar respuesta
            if (!response.ok || data.status.code !== 'YP-0000') {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `Yappy API error: ${response.status} - ${JSON.stringify(errorData)}`
                );
            }

            // Validar que la respuesta tenga los datos esperados
            if (!data.body || !data.body.hash || !data.body.transactionId) {
                throw new Error('Invalid response from Yappy API: missing required fields');
            }

            // Retornar en el formato esperado por el use case
            return {
                qrCodeUrl: data.body.hash, // El hash es el código QR en Yappy
                transactionId: data.body.transactionId,
                amount: dto.total,
                expiresAt: data.body.date
            };

        } catch (error: any) {
            throw new Error(`Failed to generate QR code with Yappy: ${error.message}`);
        }
    }

    /**
     * Consulta el estado de una transacción en Yappy
     * 
     * Flujo:
     * 1. Obtiene el token de la sesión activa
     * 2. Hace GET a /qr/status/{transactionId}
     * 3. Retorna el estado de la transacción
     * 
     * @param dto - DTO con el transactionId validado
     * @returns Estado de la transacción
     */
    async getTransaction(dto: GetTransactionDto): Promise<{
        transactionId: string;
        status: string;
    }> {
        try {
            // PASO 1: Obtener token de sesión activa y NO EXPIRADA
            let token: string | null = null;
            const sessions = await this.sessionRepository.findAll();
            
            // Filtrar sesiones no expiradas
            const validSessions = sessions.filter(session => !session.isExpired());
            
            if (validSessions.length > 0) {
                token = validSessions[validSessions.length - 1].token;
            } else {
                throw new Error('No active session found. Please open a device session first.');
            }

            // PASO 2: Construir la URL del endpoint
            const url = `${this.baseUrl}/transaction/${dto.transactionId}`;

            // PASO 3: Hacer la petición HTTP
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': token,
                    'api-key': this.apiKey,
                    'secret-key': this.secretKey
                }
            });

            const data: any = await response.json();

            // Validar respuesta
            if (!response.ok || data.status?.code !== 'YP-0000') {
                throw new Error(
                    `Yappy API error: ${response.status} - ${JSON.stringify(data)}` ||
                    data.status?.description
                );
            }

            // Retornar en el formato esperado
            return {
                transactionId: dto.transactionId,
                status: data.body?.status
            };

        } catch (error: any) {
            throw new Error(`Failed to get transaction from Yappy: ${error.message}`);
        }
    }

    /**
     * Cancela una transacción pendiente en Yappy
     * 
     * Flujo:
     * 1. Obtiene el token de la sesión activa
     * 2. Hace POST/DELETE a /qr/cancel/{transactionId}
     * 3. Retorna confirmación de la cancelación
     * 
     * @param dto - DTO con el transactionId validado
     * @returns Confirmación de la cancelación
     */
    async cancelTransaction(dto: CancelTransactionDto): Promise<{
        transactionId: string;
        status: string;
        message: string;
    }> {
        try {
            // PASO 1: Obtener token de sesión activa y NO EXPIRADA
            let token: string | null = null;
            const sessions = await this.sessionRepository.findAll();
            
            // Filtrar sesiones no expiradas
            const validSessions = sessions.filter(session => !session.isExpired());
            
            if (validSessions.length > 0) {
                token = validSessions[validSessions.length - 1].token;
            } else {
                throw new Error('No active session found. Please open a device session first.');
            }

            // PASO 2: Construir la URL del endpoint
            const url = `${this.baseUrl}/transaction/${dto.transactionId}`;

            // PASO 3: Hacer la petición HTTP
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': token,
                    'api-key': this.apiKey,
                    'secret-key': this.secretKey
                }
            });

            const data: any = await response.json();
            // Validar respuesta
            if (!response.ok || data.status?.code !== 'YP-0000') {
                throw new Error(
                    `Yappy API error: ${response.status} - ${JSON.stringify(data)}` ||
                    data.status?.description
                );
            }

            // Retornar en el formato esperado
            return {
                transactionId: dto.transactionId,
                status: data.body?.status || 'CANCELLED',
                message: data.status?.message || 'Transaction cancelled successfully'
            };

        } catch (error: any) {
            throw new Error(`Failed to cancel transaction with Yappy: ${error.message}`);
        }
    }
}
