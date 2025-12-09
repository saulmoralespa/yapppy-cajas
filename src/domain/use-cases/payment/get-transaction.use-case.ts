import { GetTransactionDto } from "../../dtos/payment/get-transaction.dto";
import { PaymentDatasource } from "../../datasources/payment.datasource";

/**
 * GET TRANSACTION USE CASE
 * 
 * Responsabilidad:
 * - Orquestar la consulta de estado de una transacción
 * - Llamar al datasource de pagos para obtener información
 * 
 * Reglas de negocio:
 * - El transactionId debe existir
 * - Retorna el estado actual de la transacción
 */

interface GetTransactionResponse {
    transactionId: string;
    status: string;
}

export class GetTransaction {
    
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
     * @returns Información de la transacción
     */
    async execute(dto: GetTransactionDto): Promise<GetTransactionResponse> {
        
        // Llamar al datasource para consultar la transacción
        const transaction = await this.paymentDatasource.getTransaction(dto);

        return {
            transactionId: transaction.transactionId,
            status: transaction.status
        };
    }
}
