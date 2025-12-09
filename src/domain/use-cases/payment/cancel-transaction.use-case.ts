import { CancelTransactionDto } from "../../dtos/payment/cancel-transaction.dto";
import { PaymentDatasource } from "../../datasources/payment.datasource";

/**
 * CANCEL TRANSACTION USE CASE
 * 
 * Responsabilidad:
 * - Orquestar la cancelación de una transacción pendiente
 * - Llamar al datasource de pagos para cancelar en Yappy
 * 
 * Reglas de negocio:
 * - Solo se pueden cancelar transacciones en estado PENDING
 * - El transactionId debe existir
 */

interface CancelTransactionResponse {
    transactionId: string;
    status: string;
    message: string;
}

export class CancelTransaction {
    
    /**
     * Dependency Injection
     * El use case depende del datasource (interfaz abstracta)
     */
    constructor(
        private readonly paymentDatasource: PaymentDatasource
    ) {}

    /**
     * Ejecutar caso de uso
     * 
     * @param dto - DTO validado con el transactionId
     * @returns Confirmación de la cancelación
     */
    async execute(dto: CancelTransactionDto): Promise<CancelTransactionResponse> {
        
        // Llamar al datasource para cancelar la transacción
        const result = await this.paymentDatasource.cancelTransaction(dto);

        return {
            transactionId: result.transactionId,
            status: result.status,
            message: result.message
        };
    }
}
