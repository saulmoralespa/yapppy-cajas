import { GenerateQRCodeDto } from "../../dtos/payment/generate-qrcode.dto";
import { PaymentDatasource } from "../../datasources/payment.datasource";

/**
 * CASO DE USO: Generar Código QR para Pago
 * 
 * Responsabilidad:
 * - Orquestar la generación de un código QR de pago
 * - Delegar la comunicación con la API externa al datasource
 * - Retornar los datos del QR generado
 * 
 * Principios aplicados:
 * - Single Responsibility: Solo se encarga de orquestar la generación de QR
 * - Dependency Inversion: Depende de la abstracción (PaymentDatasource), no de la implementación
 * - Open/Closed: Abierto a extensión (nuevos datasources) pero cerrado a modificación
 */

interface GenerateQRCodeUseCaseResponse {
    qrCodeUrl: string;
    transactionId: string;
    amount: number;
    expiresAt?: string;
}

interface GenerateQRCodeUseCase {
    execute(dto: GenerateQRCodeDto): Promise<GenerateQRCodeUseCaseResponse>;
}

export class GenerateQRCode implements GenerateQRCodeUseCase {
    
    /**
     * Inyección de dependencias:
     * El use case recibe el datasource abstracto, no la implementación concreta.
     * Esto permite cambiar de proveedor de pago sin modificar el caso de uso.
     */
    constructor(
        private readonly paymentDatasource: PaymentDatasource
    ) {}

    /**
     * Ejecuta la generación del código QR
     * 
     * Flujo:
     * 1. Recibe el DTO ya validado desde el controller
     * 2. Delega al datasource la generación del QR (llamada a API externa)
     * 3. Retorna la respuesta con los datos del QR generado
     * 
     * @param dto - Datos validados del pago
     * @returns Información del QR generado
     */
    async execute(dto: GenerateQRCodeDto): Promise<GenerateQRCodeUseCaseResponse> {
        try {
            // Delegamos al datasource la comunicación con la API de Yappy
            const qrData = await this.paymentDatasource.generateQRCode(dto);

            // Retornamos los datos del QR generado
            return {
                qrCodeUrl: qrData.qrCodeUrl,
                transactionId: qrData.transactionId,
                amount: qrData.amount,
                expiresAt: qrData.expiresAt
            };

        } catch (error: any) {
            // Re-lanzamos el error para que el controller lo maneje
            throw new Error(`Failed to generate QR code: ${error.message}`);
        }
    }
}
