import { Request, Response } from "express";
import { OpenDeviceDto, OpenDevice, CloseDeviceDto, CloseDevice, GenerateQRCodeDto, GenerateQRCode, GetTransactionDto, GetTransaction, CancelTransactionDto, CancelTransaction } from "../../domain";
import { YappyDeviceDatasourceImpl } from "../../infrastructure/datasources/yappy-device.datasource.impl";
import { YappyPaymentDatasourceImpl } from "../../infrastructure/datasources/yappy-payment.datasource.impl";
import { JsonSessionRepositoryImpl } from "../../infrastructure/repositories/json-session.repository.impl";

/**
 * API Controller (Capa de presentación)
 * 
 * Responsabilidades:
 * - Recibir requests HTTP
 * - Validar datos con DTOs
 * - Ejecutar Use Cases
 * - Retornar responses HTTP
 * 
 * NO debe contener lógica de negocio
 */
export class ApiController {
    
    /**
     * Dependency Injection
     * 
     * El controller ensambla todas las dependencias:
     * - Datasource (para Yappy API)
     * - Repository (para persistencia)
     * - Use Cases (orquestan la lógica)
     */
    private readonly repository: JsonSessionRepositoryImpl;
    private readonly openDeviceUseCase: OpenDevice;
    private readonly closeDeviceUseCase: CloseDevice;
    private readonly generateQRCodeUseCase: GenerateQRCode;
    private readonly getTransactionUseCase: GetTransaction;
    private readonly cancelTransactionUseCase: CancelTransaction;

    constructor() {
        // Ensamblar dependencias (Dependency Injection manual)
        // En producción usarías un contenedor DI como InversifyJS
        const datasource = new YappyDeviceDatasourceImpl();
        this.repository = new JsonSessionRepositoryImpl('./data');
        const paymentDatasource = new YappyPaymentDatasourceImpl(this.repository, datasource);
        
        this.openDeviceUseCase = new OpenDevice(datasource, this.repository);
        this.closeDeviceUseCase = new CloseDevice(datasource, this.repository);
        this.generateQRCodeUseCase = new GenerateQRCode(paymentDatasource);
        this.getTransactionUseCase = new GetTransaction(paymentDatasource);
        this.cancelTransactionUseCase = new CancelTransaction(paymentDatasource);
    }

    /**
     * POST /open-device
     * 
     * Flujo:
     * 1. Recibe request HTTP
     * 2. Valida con DTO
     * 3. Ejecuta use case (obtiene token de Yappy + guarda en JSON)
     * 4. Retorna sessionId al cliente
     */
    openDevice = async (req: Request, res: Response) => {
        try {
            const [error, openDeviceDto] = OpenDeviceDto.create(req.body);
            
            if (error) {
                return res.status(400).json({ 
                    ok: false,
                    error 
                });
            }

            const session = await this.openDeviceUseCase.execute(openDeviceDto!);

            return res.status(200).json({
                ok: true,
                data: session.toJSON()
            });

        } catch (error: any) {            
            return res.status(500).json({
                ok: false,
                error: error.message || 'Internal server error'
            });
        }
    }

    /**
     * DELETE /close-device
     * 
     * Flujo:
     * 1. Si no hay sessionId en body, obtiene la última sesión disponible
     * 2. Valida con DTO
     * 3. Ejecuta use case (busca token + cierra en Yappy + elimina de JSON)
     * 4. Retorna confirmación con resumen (transactions, amount)
     */
    closeDevice = async (req: Request, res: Response) => {
        try {            
            // PASO 1: Obtener sessionId (del body o última sesión)
            let sessionId = req.body.sessionId;
            
            // Si no se proporciona sessionId, usar la última sesión disponible
            if (!sessionId) {
                const sessions = await this.repository.findAll();
                
                if (sessions.length === 0) {
                    return res.status(404).json({
                        ok: false,
                        error: 'No hay sesiones activas para cerrar'
                    });
                }
                
                // Usar la última sesión
                const lastSession = sessions[sessions.length - 1];
                sessionId = lastSession.sessionId;
            }
            
            // PASO 2: Validar datos con DTO
            const [error, closeDeviceDto] = CloseDeviceDto.create({ sessionId });
            
            if (error) {
                return res.status(400).json({ 
                    ok: false,
                    error 
                });
            }

            // PASO 3: Ejecutar use case
            const summary = await this.closeDeviceUseCase.execute(closeDeviceDto!);

            // PASO 4: Retornar response HTTP con resumen
            return res.status(200).json({
                ok: true,
                data: summary
            });

        } catch (error: any) {
            // Si la sesión no existe, retorna 404
            if (error.message.includes('not found')) {
                return res.status(404).json({
                    ok: false,
                    error: error.message
                });
            }
            
            return res.status(500).json({
                ok: false,
                error: error.message || 'Internal server error'
            });
        }
    }

    /**
     * POST /generate-qrcode/:type
     * 
     * Flujo:
     * 1. Valida el tipo desde la URL (DYN o HYB)
     * 2. Valida el body con DTO (sub_total, tax, tip, discount, total)
     * 3. Genera QR code según el tipo
     */
    generateQRCode = async (req: Request, res: Response) => {
        try {
            // PASO 1: Validar el tipo desde la URL
            const typeFromUrl = req.params.type;
            
            if (!typeFromUrl) {
                return res.status(400).json({ 
                    ok: false,
                    error: 'Device type is required in URL path' 
                });
            }

            // Validar que el tipo sea DYN o HYB
            const upperType = typeFromUrl.toUpperCase();
            if (upperType !== 'DYN' && upperType !== 'HYB') {
                return res.status(400).json({ 
                    ok: false,
                    error: 'Device type must be either "DYN" or "HYB"' 
                });
            }

            // PASO 2: Validar body con DTO
            const bodyWithType = {
                ...req.body,
                type: upperType
            };

            const [error, generateQRCodeDto] = GenerateQRCodeDto.create(bodyWithType);
            
            if (error) {
                return res.status(400).json({ 
                    ok: false,
                    error 
                });
            }

            // PASO 3: Ejecutar use case para generar QR
            const qrData = await this.generateQRCodeUseCase.execute(generateQRCodeDto!);

            return res.status(200).json({ 
                ok: true,
                message: 'QR Code generated successfully',
                data: {
                    qrCodeUrl: qrData.qrCodeUrl,
                    transactionId: qrData.transactionId,
                    amount: qrData.amount,
                    expiresAt: qrData.expiresAt,
                    // Datos adicionales del request
                    type: generateQRCodeDto!.type,
                    orderId: generateQRCodeDto!.orderId,
                    description: generateQRCodeDto!.description
                }
            });

        } catch (error: any) {
            return res.status(500).json({
                ok: false,
                error: error.message || 'Internal server error'
            });
        }
    }

    /**
     * GET /transaction/:transactionId
     * 
     * Flujo:
     * 1. Valida el transactionId con DTO
     * 2. Ejecuta use case para consultar estado
     * 3. Retorna información de la transacción
     */
    getTransaction = async (req: Request, res: Response) => {
        try {
            // PASO 1: Validar transactionId desde params
            const transactionId = req.params.transactionId;
            
            const [error, getTransactionDto] = GetTransactionDto.create({ transactionId });
            
            if (error) {
                return res.status(400).json({ 
                    ok: false,
                    error 
                });
            }

            // PASO 2: Ejecutar use case
            const transaction = await this.getTransactionUseCase.execute(getTransactionDto!);

            // PASO 3: Retornar response HTTP
            return res.status(200).json({
                ok: true,
                data: transaction
            });

        } catch (error: any) {
            return res.status(500).json({
                ok: false,
                error: error.message || 'Internal server error'
            });
        }
    }

    /**
     * PUT /transaction/:transactionId
     * 
     * Flujo:
     * 1. Valida el transactionId con DTO
     * 2. Ejecuta use case para cancelar transacción
     * 3. Retorna confirmación de cancelación
     */
    cancelTransaction = async (req: Request, res: Response) => {
        try {
            // PASO 1: Validar transactionId desde params
            const transactionId = req.params.transactionId;
            
            const [error, cancelTransactionDto] = CancelTransactionDto.create({ transactionId });
            
            if (error) {
                return res.status(400).json({ 
                    ok: false,
                    error 
                });
            }

            // PASO 2: Ejecutar use case
            const result = await this.cancelTransactionUseCase.execute(cancelTransactionDto!);

            // PASO 3: Retornar response HTTP
            return res.status(200).json({
                ok: true,
                message: result.message,
                data: {
                    transactionId: result.transactionId,
                    status: result.status
                }
            });

        } catch (error: any) {
            return res.status(500).json({
                ok: false,
                error: error.message || 'Internal server error'
            });
        }
    }
}