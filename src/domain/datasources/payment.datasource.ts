import { GenerateQRCodeDto } from "../dtos/payment/generate-qrcode.dto";
import { GetTransactionDto } from "../dtos/payment/get-transaction.dto";
import { CancelTransactionDto } from "../dtos/payment/cancel-transaction.dto";

/**
 * CONTRATO ABSTRACTO - Payment Datasource
 * 
 * Define las operaciones que debe implementar cualquier datasource de pagos.
 * Esto permite cambiar de proveedor (Yappy, Stripe, etc.) sin afectar la lógica de negocio.
 * 
 * Principio de Inversión de Dependencias:
 * - El dominio define el "qué" (interfaz)
 * - La infraestructura define el "cómo" (implementación)
 */
export abstract class PaymentDatasource {
    
    /**
     * Genera un código QR para pago
     * 
     * @param dto - Datos validados del pago (monto, impuestos, etc.)
     * @returns Objeto con la URL del QR y datos relacionados
     */
    abstract generateQRCode(dto: GenerateQRCodeDto): Promise<{
        qrCodeUrl: string;
        transactionId: string;
        amount: number;
        expiresAt?: string;
    }>;

    /**
     * Consulta el estado de una transacción
     * 
     * @param dto - DTO con el transactionId validado
     * @returns Objeto con los datos de la transacción
     */
    abstract getTransaction(dto: GetTransactionDto): Promise<{
        transactionId: string;
        status: string;
    }>;

    /**
     * Cancela una transacción pendiente
     * 
     * @param dto - DTO con el transactionId validado
     * @returns Objeto con confirmación de la cancelación
     */
    abstract cancelTransaction(dto: CancelTransactionDto): Promise<{
        transactionId: string;
        status: string;
        message: string;
    }>;
}
